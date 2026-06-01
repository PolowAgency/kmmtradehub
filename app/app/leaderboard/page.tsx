import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Trophy, Flame, Award } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: "Classement" };

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Leçons complétées par étudiant
  const { data: progress } = await supabase
    .from("student_progress")
    .select("student_id, lesson_id")
    .eq("completed", true);

  // Badges par étudiant
  const { data: badges } = await supabase
    .from("student_badges")
    .select("student_id");

  // Streaks + profils
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("role", "student");

  const { data: streaks } = await supabase
    .from("streaks")
    .select("student_id, current_streak, longest_streak");

  // Construire le classement
  const progressByUser: Record<string, number> = {};
  progress?.forEach((p) => {
    progressByUser[p.student_id] = (progressByUser[p.student_id] ?? 0) + 1;
  });

  const badgesByUser: Record<string, number> = {};
  badges?.forEach((b) => {
    badgesByUser[b.student_id] = (badgesByUser[b.student_id] ?? 0) + 1;
  });

  const streakByUser: Record<string, number> = {};
  streaks?.forEach((s) => {
    streakByUser[s.student_id] = s.current_streak ?? 0;
  });

  const ranked = (profiles ?? [])
    .map((p) => ({
      ...p,
      lessons:  progressByUser[p.id] ?? 0,
      badges:   badgesByUser[p.id] ?? 0,
      streak:   streakByUser[p.id] ?? 0,
      // Score = leçons × 10 + badges × 50 + streak × 5
      score:    (progressByUser[p.id] ?? 0) * 10 + (badgesByUser[p.id] ?? 0) * 50 + (streakByUser[p.id] ?? 0) * 5,
    }))
    .sort((a, b) => b.score - a.score);

  const myRank = ranked.findIndex((p) => p.id === user.id) + 1;
  const me = ranked.find((p) => p.id === user.id);

  function label(p: { full_name: string | null }) {
    return p.full_name ?? "Trader";
  }

  const MEDAL = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-cream text-2xl font-bold">Classement</h1>
        <p className="text-muted text-sm mt-0.5">Score = leçons × 10 + badges × 50 + streak × 5</p>
      </div>

      {/* Ma position */}
      {me && (
        <div className="bg-gold/8 border border-gold/20 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-black text-sm">
            #{myRank}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-cream font-semibold text-sm">Ta position</p>
            <p className="text-muted text-xs">{me.lessons} leçons · {me.badges} badges · {me.streak} jours</p>
          </div>
          <p className="text-gold font-black text-lg">{me.score} pts</p>
        </div>
      )}

      {/* Top liste */}
      {ranked.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
          <Trophy size={36} className="text-muted/30" />
          <p className="text-cream font-medium">Classement en cours de chargement</p>
          <p className="text-muted text-sm">Les scores apparaîtront ici dès que des élèves complètent des leçons.</p>
        </div>
      )}
      <div className="space-y-2">
        {ranked.map((p, idx) => {
          const isMe = p.id === user.id;
          const rank = idx + 1;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-4 rounded-2xl p-4 border transition-all ${
                isMe
                  ? "bg-gold/5 border-gold/15"
                  : "bg-surface-2 border-white/[0.06]"
              }`}
            >
              {/* Rank */}
              <div className="w-8 shrink-0 text-center">
                {rank <= 3
                  ? <span className="text-xl">{MEDAL[rank - 1]}</span>
                  : <span className="text-muted text-sm font-semibold">#{rank}</span>
                }
              </div>

              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isMe ? "bg-gold/20 text-gold border border-gold/30" : "bg-surface-3 text-muted border border-white/[0.08]"
              }`}>
                {label(p)[0]?.toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isMe ? "text-gold" : "text-cream"}`}>
                  {label(p)}{isMe ? " (toi)" : ""}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-[10px] text-muted">
                    <Trophy size={9} /> {p.lessons}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted">
                    <Award size={9} /> {p.badges}
                  </span>
                  {p.streak > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-orange-400">
                      <Flame size={9} /> {p.streak}j
                    </span>
                  )}
                </div>
              </div>

              {/* Score */}
              <p className={`text-sm font-black shrink-0 ${isMe ? "text-gold" : "text-cream/60"}`}>
                {p.score} pts
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
