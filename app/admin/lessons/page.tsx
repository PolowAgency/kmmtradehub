import { createClient } from "@/lib/supabase/server";
import { AdminLessonsClient } from "@/components/admin/AdminLessonsClient";

export default async function AdminLessonsPage() {
  const supabase = await createClient();
  const [{ data: lessons }, { data: modules }] = await Promise.all([
    supabase
      .from("lessons")
      .select("*, modules(title)")
      .order("order_index"),
    supabase.from("modules").select("id, title").order("order_index"),
  ]);

  return <AdminLessonsClient initialLessons={lessons ?? []} modules={modules ?? []} />;
}
