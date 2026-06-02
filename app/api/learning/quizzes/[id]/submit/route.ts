import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { awardStudentBadges, canAccessQuiz } from "@/lib/learning";
import { createServiceClient } from "@/lib/supabase/service";
import { sendBadgeEmail } from "@/lib/email";

type SubmitPayload = {
  answers?: Record<string, string>;
};

type QuizQuestionPayload = Pick<
  Database["public"]["Tables"]["quiz_questions"]["Row"],
  "id" | "explanation" | "order_index"
> & {
  quiz_answers: Array<
    Pick<Database["public"]["Tables"]["quiz_answers"]["Row"], "id" | "answer" | "is_correct" | "order_index">
  >;
};

type QuizPayload = Pick<
  Database["public"]["Tables"]["quizzes"]["Row"],
  "id" | "title" | "lesson_id" | "passing_score"
> & {
  quiz_questions: QuizQuestionPayload[];
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const canAccess = await canAccessQuiz(user.id, id);
  if (!canAccess) {
    return NextResponse.json({ error: "Quiz locked" }, { status: 403 });
  }

  const body = (await request.json()) as SubmitPayload;
  const submittedAnswers = body.answers ?? {};
  const service = createServiceClient();

  const { data: quiz, error: quizError } = await service
    .from("quizzes")
    .select("id, title, lesson_id, passing_score, quiz_questions(id, explanation, order_index, quiz_answers(id, answer, is_correct, order_index))")
    .eq("id", id)
    .maybeSingle<QuizPayload>();

  if (quizError) {
    return NextResponse.json({ error: quizError.message }, { status: 500 });
  }

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const questions = (quiz.quiz_questions ?? [])
    .sort((a, b) => a.order_index - b.order_index)
    .map((question) => ({
      ...question,
      quiz_answers: [...(question.quiz_answers ?? [])].sort((a, b) => a.order_index - b.order_index),
    }));

  if (questions.length === 0) {
    return NextResponse.json({ error: "Quiz has no questions" }, { status: 400 });
  }

  let correctCount = 0;
  const review = questions.map((question) => {
    const submittedAnswerId = submittedAnswers[question.id];
    const correctAnswer = question.quiz_answers.find((answer) => answer.is_correct);
    const isCorrect = !!correctAnswer && submittedAnswerId === correctAnswer.id;

    if (isCorrect) correctCount += 1;

    return {
      questionId: question.id,
      explanation: question.explanation,
      selectedAnswerId: submittedAnswerId ?? null,
      correctAnswerId: correctAnswer?.id ?? null,
      isCorrect,
    };
  });

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= quiz.passing_score;

  const resultPayload: Database["public"]["Tables"]["quiz_results"]["Insert"] = {
    student_id: user.id,
    quiz_id: quiz.id,
    score,
    passed,
  };

  const { error: resultError } = await service.from("quiz_results").insert(resultPayload);

  if (resultError) {
    return NextResponse.json({ error: resultError.message }, { status: 500 });
  }

  if (passed && quiz.lesson_id) {
    const timestamp = new Date().toISOString();
    const progressPayload: Database["public"]["Tables"]["student_progress"]["Insert"] = {
      student_id: user.id,
      lesson_id: quiz.lesson_id,
      completed: true,
      completed_at: timestamp,
      last_accessed_at: timestamp,
    };

    const { error: progressError } = await service.from("student_progress").upsert(
      [progressPayload],
      { onConflict: "student_id,lesson_id" }
    );

    if (progressError) {
      return NextResponse.json({ error: progressError.message }, { status: 500 });
    }
  }

  const badges = passed ? await awardStudentBadges(user.id) : [];

  if (badges.length > 0) {
    const { data: profile } = await service.from("profiles").select("email, full_name").eq("id", user.id).single();
    if (profile?.email) {
      for (const badge of badges) {
        sendBadgeEmail(profile.email, profile.full_name?.split(" ")[0] ?? "Trader", badge.name, badge.icon).catch(() => {});
      }
    }
  }

  return NextResponse.json({
    success: true,
    score,
    passed,
    passingScore: quiz.passing_score,
    correctCount,
    totalQuestions: questions.length,
    review,
    badges,
  });
}
