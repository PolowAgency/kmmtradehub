import { createClient } from "@/lib/supabase/server";
import { AdminLiveClient } from "@/components/admin/AdminLiveClient";

export default async function AdminLivePage() {
  const supabase = await createClient();
  const { data: lives } = await supabase
    .from("lives")
    .select("*, live_replays(id)")
    .order("scheduled_at", { ascending: false })
    .limit(50);

  return <AdminLiveClient initialLives={(lives ?? []) as any} />;
}
