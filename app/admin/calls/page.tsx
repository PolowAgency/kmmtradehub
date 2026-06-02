import { createClient } from "@/lib/supabase/server";
import { AdminCallsClient } from "@/components/admin/AdminCallsClient";

export const dynamic = 'force-dynamic';

export default async function AdminCallsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("call_requests")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false });

  return <AdminCallsClient initialRequests={(requests ?? []) as never} />;
}
