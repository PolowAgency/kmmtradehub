import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LiveCard } from "@/components/app/LiveCard";
import { Radio } from "lucide-react";

export default async function LivePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";

  const { data: lives } = await supabase
    .from("lives")
    .select("*, live_replays(id)")
    .order("scheduled_at", { ascending: false })
    .limit(30);

  const live = lives?.filter((l) => l.status === "live") ?? [];
  const upcoming = lives?.filter((l) => l.status === "scheduled") ?? [];
  const past = lives?.filter((l) => l.status === "ended") ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-cream text-2xl font-bold">Lives</h1>
          <p className="text-muted text-sm mt-0.5">Sessions en direct et replays</p>
        </div>
        {isAdmin && (
          <Link
            href="/admin/live/new"
            className="flex items-center gap-2 bg-gold text-[#0A0A0A] font-semibold text-sm px-4 py-2 rounded-xl hover:bg-gold-light transition-colors"
          >
            + Live
          </Link>
        )}
      </div>

      {/* En direct */}
      {live.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-cream font-bold text-sm uppercase tracking-widest">En direct maintenant</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {live.map((l) => <LiveCard key={l.id} live={l as any} />)}
          </div>
        </div>
      )}

      {/* À venir */}
      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-cream font-bold text-sm uppercase tracking-widest text-muted">À venir</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcoming.map((l) => <LiveCard key={l.id} live={l as any} />)}
          </div>
        </div>
      )}

      {/* Replays */}
      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-cream font-bold text-sm uppercase tracking-widest text-muted">Replays</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {past.map((l) => <LiveCard key={l.id} live={l as any} />)}
          </div>
        </div>
      )}

      {/* Empty */}
      {!lives?.length && (
        <div className="flex flex-col items-center py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-2 border border-white/[0.07] flex items-center justify-center">
            <Radio size={28} className="text-muted/30" />
          </div>
          <div>
            <p className="text-cream font-medium">Aucun live programmé</p>
            <p className="text-muted text-sm mt-1">Les prochains lives apparaîtront ici.</p>
          </div>
        </div>
      )}
    </div>
  );
}
