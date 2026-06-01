import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Trophy, Flame, BookOpen, Users } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: "Membres" };

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profiles }, { data: progress }, { data: badges }, { data: streaks }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, created_at").eq("role", "student"),
    supabase.from("student_progress").select("student_id").eq("completed", true),
    supabase.from("student_badges").select("student_id"),
    supabase.from("streaks").select("student_id, current_streak"),
  ]);

  const progressByUser: Record<string, number> = {};
  progress?.forEach((p) => { progressByUser[p.student_id] = (progressByUser[p.student_id] ?? 0) + 1; });

  const badgesByUser: Record<string, number> = {};
  badges?.forEach((b) => { badgesByUser[b.student_id] = (badgesByUser[b.student_id] ?? 0) + 1; });

  const streakByUser: Record<string, number> = {};
  streaks?.forEach((s) => { streakByUser[s.student_id] = s.current_streak ?? 0; });

  const members = (profiles ?? [])
    .map((p) => ({
      ...p,
      lessons: progressByUser[p.id] ?? 0,
      badges: badgesByUser[p.id] ?? 0,
      streak: streakByUser[p.id] ?? 0,
      isMe: p.id === user.id,
      joinedDaysAgo: Math.floor((Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    }))
    .sort((a, b) => b.lessons - a.lessons);

  const newMembers = members.filter((m) => m.joinedDaysAgo <= 7);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-cream text-2xl font-bold">Membres</h1>
          <p className="text-muted text-sm mt-0.5">{members.length} trader{members.length > 1 ? "s" : ""} dans la communauté</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 border border-white/[0.07]">
          <Users size={14} className="text-gold" />
          <span className="text-cream font-bold text-sm">{members.length}</span>
        </div>
      </div>

      {/* Nouveaux membres (7 derniers jours) */}
      {newMembers.length > 0 && (
        <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-4">
          <p className="text-xs text-gold/70 uppercase tracking-widest font-semibold mb-3">🎉 Nouveaux cette semaine</p>
          <div className="flex flex-wrap gap-2">
            {newMembers.map((m) => (
              <div key={m.id} className="flex items-center gap-2 bg-surface-3 border border-white/[0.05] rounded-full px-3 py-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                  m.isMe ? "bg-gold/20 text-gold border border-gold/30" : "bg-surface text-muted"
                }`}>
                  {m.full_name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <span className={`text-xs font-medium ${m.isMe ? "text-gold" : "text-cream"}`}>
                  {m.full_name ?? "Trader"}{m.isMe ? " (toi)" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grille membres */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
          <Users size={36} className="text-muted/30" />
          <p className="text-cream font-medium">Aucun membre pour l'instant</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {members.map((m, idx) => (
            <div
              key={m.id}
              className={`relative flex flex-col items-center text-center rounded-2xl p-4 border transition-all ${
                m.isMe
                  ? "bg-gold/5 border-gold/20"
                  : "bg-surface-2 border-white/[0.06] hover:border-gold/15"
              }`}
            >
              {/* Rang top 3 */}
              {idx < 3 && (
                <div className="absolute top-2.5 left-2.5 text-base">
                  {["🥇", "🥈", "🥉"][idx]}
                </div>
              )}

              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-black mb-2 border-2 ${
                m.isMe
                  ? "bg-gold/20 text-gold border-gold/40"
                  : "bg-surface-3 text-cream/60 border-white/[0.06]"
              }`}>
                {m.full_name?.[0]?.toUpperCase() ?? "?"}
              </div>

              {/* Nom */}
              <p className={`text-xs font-semibold leading-tight mb-1 ${m.isMe ? "text-gold" : "text-cream"}`}>
                {m.full_name ?? "Trader"}
                {m.isMe && <span className="block text-gold/50 text-[9px] font-normal">toi</span>}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-center gap-2.5 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-[10px] text-muted">
                  <BookOpen size={9} className="text-gold/70" /> {m.lessons}
                </span>
                {m.badges > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-muted">
                    <Trophy size={9} className="text-gold/70" /> {m.badges}
                  </span>
                )}
                {m.streak > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-orange-400">
                    <Flame size={9} /> {m.streak}j
                  </span>
                )}
              </div>

              {/* Membre depuis */}
              <p className="text-muted/40 text-[9px] mt-2">
                {m.joinedDaysAgo === 0 ? "Aujourd'hui" : m.joinedDaysAgo === 1 ? "Hier" : `Il y a ${m.joinedDaysAgo}j`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
