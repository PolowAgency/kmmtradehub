import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { canAccessQuiz } from "@/lib/learning";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const canAccess = await canAccessQuiz(user.id, id);
  if (!canAccess) {
    return NextResponse.json({ error: "Quiz locked" }, { status: 403 });
  }

  const body = await request.json() as { questionId?: string; answerId?: string };
  const { questionId, answerId } = body;

  if (!questionId || !answerId) {
    return NextResponse.json({ error: "Missing questionId or answerId" }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: question, error } = await service
    .from("quiz_questions")
    .select("id, explanation, quiz_answers(id, is_correct)")
    .eq("id", questionId)
    .eq("quiz_id", id)
    .maybeSingle();

  if (error || !question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const answers = (question.quiz_answers ?? []) as Array<{ id: string; is_correct: boolean }>;
  const correctAnswer = answers.find((a) => a.is_correct);
  const isCorrect = !!correctAnswer && answerId === correctAnswer.id;

  return NextResponse.json({
    isCorrect,
    correctAnswerId: correctAnswer?.id ?? null,
    explanation: question.explanation,
  });
}
