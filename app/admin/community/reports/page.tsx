import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminReportsClient } from "@/components/admin/AdminReportsClient";

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/app/dashboard");

  const { data: reports } = await supabase
    .from("comment_reports")
    .select("*, community_comments(id, content, post_id, author_id, profiles:author_id(full_name, email)), profiles:reporter_id(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-cream text-2xl font-bold">Signalements</h1>
          <p className="text-muted text-sm mt-0.5">{reports?.length ?? 0} commentaire{(reports?.length ?? 0) !== 1 ? "s" : ""} signalé{(reports?.length ?? 0) !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/community" className="text-muted text-sm hover:text-cream transition-colors">
          ← Communauté
        </Link>
      </div>

      <AdminReportsClient initialReports={(reports ?? []) as any} />
    </div>
  );
}
