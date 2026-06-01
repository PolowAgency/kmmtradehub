import { createClient } from "@/lib/supabase/server";
import { AdminQuizzesClient } from "@/components/admin/AdminQuizzesClient";

export const dynamic = 'force-dynamic';

export default async function AdminQuizzesPage() {
  const supabase = await createClient();
  const [{ data: quizzes }, { data: modules }, { data: lessons }, { data: quizResults }] = await Promise.all([
    supabase
      .from("quizzes")
      .select("*, quiz_questions(id, question, order_index, explanation, quiz_answers(id, answer, is_correct, order_index))")
      .order("created_at", { ascending: false }),
    supabase.from("modules").select("id, title").order("order_index"),
    supabase.from("lessons").select("id, title, module_id").order("order_index"),
    supabase.from("quiz_results").select("quiz_id, score, passed, student_id").order("completed_at", { ascending: false }),
  ]);

  return <AdminQuizzesClient initialQuizzes={quizzes ?? []} modules={modules ?? []} lessons={lessons ?? []} quizResults={quizResults ?? []} />;
}
