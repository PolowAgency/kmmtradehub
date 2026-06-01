import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuizClient } from "@/components/app/QuizClient";
import { canAccessQuiz } from "@/lib/learning";

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await canAccessQuiz(user.id, id))) notFound();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, lesson_id, title, description, passing_score, quiz_questions(id, question, order_index, explanation, quiz_answers(id, answer, order_index))")
    .eq("id", id)
    .maybeSingle();

  if (!quiz) notFound();

  const questions = (quiz.quiz_questions as Array<{
    id: string;
    question: string;
    order_index: number;
    explanation: string | null;
    quiz_answers: Array<{ id: string; answer: string; order_index: number }>;
  }>)
    ?.sort((a, b) => a.order_index - b.order_index)
    .map((q) => ({
      ...q,
      quiz_answers: q.quiz_answers.sort((a, b) => a.order_index - b.order_index),
    })) ?? [];

  return (
    <QuizClient
      quizId={quiz.id}
      title={quiz.title}
      description={quiz.description}
      passingScore={quiz.passing_score}
      questions={questions}
    />
  );
}
