import { createClient } from "@/lib/supabase/server";
import { AdminModulesClient } from "@/components/admin/AdminModulesClient";

export default async function AdminModulesPage() {
  const supabase = await createClient();
  const { data: modules } = await supabase
    .from("modules")
    .select("*, lessons(id)")
    .order("order_index");

  return <AdminModulesClient initialModules={modules ?? []} />;
}
