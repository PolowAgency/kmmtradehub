import { createClient } from "@/lib/supabase/server";
import { AdminUploadsClient } from "@/components/admin/AdminUploadsClient";

export default async function AdminUploadsPage() {
  const supabase = await createClient();
  const [{ data: resources }, { data: lessons }] = await Promise.all([
    supabase
      .from("lesson_resources")
      .select("*, lessons(title)")
      .order("created_at", { ascending: false }),
    supabase.from("lessons").select("id, title, module_id, modules(title)").order("order_index"),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <AdminUploadsClient initialResources={resources ?? []} lessons={(lessons ?? []) as any} />;
}
