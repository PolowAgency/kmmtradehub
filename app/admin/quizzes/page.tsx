import { createClient } from "@/lib/supabase/server";
import { AdminQuizzesClient } from "@/components/admin/AdminQuizzesClient";

export default async function AdminQuizzesPage() {
  const supabase = await createClient();
  const [{ data: quizzes }, { data: modules }, { data: lessons }] = await Promise.all([
    supabase
      .from("quizzes")
      .select("*, quiz_questions(id)")
      .order("created_at", { ascending: false }),
    supabase.from("modules").select("id, title").order("order_index"),
    supabase.from("lessons").select("id, title, module_id").order("order_index"),
  ]);

  return <AdminQuizzesClient initialQuizzes={quizzes ?? []} modules={modules ?? []} lessons={lessons ?? []} />;
}
