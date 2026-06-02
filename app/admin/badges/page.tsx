import { createClient } from "@/lib/supabase/server";
import { AdminBadgesClient } from "@/components/admin/AdminBadgesClient";

export const dynamic = 'force-dynamic';

export default async function AdminBadgesPage() {
  const supabase = await createClient();
  const { data: badges } = await supabase.from("badges").select("*").order("condition_value");
  return <AdminBadgesClient initialBadges={badges ?? []} />;
}
