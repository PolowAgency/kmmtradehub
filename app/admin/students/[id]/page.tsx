import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Trophy, TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const EMOTION_EMOJI: Record<string, string> = {
  confident: "💪", fearful: "😰", greedy: "🤑", neutral: "😐", frustrated: "😤",
};

export default async function AdminStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: profile }, { data: progress }, { data: badges }, { data: streak }, { data: journal }, { data: quizResults }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("student_progress").select("*, lessons(title, modules(title))").eq("student_id", id).eq("completed", true).order("completed_at", { ascending: false }),
    supabase.from("student_badges").select("*, badges(name, icon, description)").eq("student_id", id).order("earned_at", { ascending: false }),
    supabase.from("streaks").select("*").eq("student_id", id).maybeSingle(),
    supabase.from("trading_journal").select("*").eq("user_id", id).order("traded_at", { ascending: false }).limit(50),
    supabase.from("quiz_results").select("*, quizzes(title, passing_score)").eq("student_id", id).order("completed_at", { ascending: false }).limit(20),
  ]);

  if (!profile) notFound();

  const wins = journal?.filter((e) => e.result === "win").length ?? 0;
  const total = journal?.length ?? 0;
  const winrate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const totalPnl = journal?.reduce((s, e) => s + (e.pnl ?? 0), 0) ?? 0;

  return (
    <div className="space-y-8">
      {/* Back + Header */}
      <div>
        <Link href="/admin/students" className="flex items-center gap-2 text-muted text-sm hover:text-cream transition-colors mb-4">
          <ArrowLeft size={15} /> Retour aux élèves
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-black text-xl shrink-0">
            {profile.full_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <h1 className="text-cream text-2xl font-bold">{profile.full_name ?? "Élève"}</h1>
            <p className="text-muted text-sm">{profile.email} · Inscrit le {new Date(profile.created_at).toLocaleDateString("fr-FR")}</p>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Leçons",  value: progress?.length ?? 0,  icon: BookOpen, color: "text-gold" },
          { label: "Badges",  value: badges?.length ?? 0,    icon: Trophy,   color: "text-purple-400" },
          { label: "Streak",  value: `${streak?.current_streak ?? 0}j`, icon: null, color: "text-orange-400", emoji: "🔥" },
          { label: "Trades",  value: total,                  icon: null,     color: "text-blue-400", emoji: "📒" },
        ].map(({ label, value, icon: Icon, color, emoji }) => (
          <div key={label} className="bg-surface-2 border border-white/[0.06] rounded-2xl p-4">
            <p className="text-muted text-xs mb-1">{label}</p>
            <div className="flex items-center gap-2">
              {Icon ? <Icon size={16} className={color} /> : <span>{emoji}</span>}
              <p className={`text-2xl font-black ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Journal de trading */}
        <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-cream font-semibold text-sm">Journal de trading</h2>
            {total > 0 && (
              <div className="flex items-center gap-3 text-xs text-muted">
                <span className="text-emerald-400 font-semibold">{winrate}% WR</span>
                <span className={totalPnl >= 0 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                  {totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(0)}$
                </span>
              </div>
            )}
          </div>
          {!journal || journal.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">Aucun trade enregistré.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {journal.map((entry) => {
                const isWin  = entry.result === "win";
                const isLoss = entry.result === "loss";
                return (
                  <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isWin ? "bg-emerald-400/10" : isLoss ? "bg-red-400/10" : "bg-amber-400/10"
                    }`}>
                      {entry.direction === "long"
                        ? <TrendingUp size={13} className={isWin ? "text-emerald-400" : isLoss ? "text-red-400" : "text-amber-400"} />
                        : <TrendingDown size={13} className={isWin ? "text-emerald-400" : isLoss ? "text-red-400" : "text-amber-400"} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-xs font-semibold">{entry.pair} <span className="text-muted font-normal">· {new Date(entry.traded_at).toLocaleDateString("fr-FR")}</span></p>
                      {entry.rr && <p className="text-muted/60 text-[10px]">R:R {entry.rr}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      {entry.pnl != null && (
                        <p className={`text-xs font-bold ${entry.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {entry.pnl >= 0 ? "+" : ""}{entry.pnl}$
                        </p>
                      )}
                      {entry.emotion && <span className="text-sm">{EMOTION_EMOJI[entry.emotion] ?? ""}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quiz results */}
        <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-cream font-semibold text-sm mb-4">Résultats quiz</h2>
          {!quizResults || quizResults.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">Aucun quiz effectué.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {quizResults.map((r) => {
                const quiz = r.quizzes as { title: string; passing_score: number } | null;
                return (
                  <div key={r.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                    {r.passed
                      ? <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      : <XCircle size={15} className="text-red-400 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-xs truncate">{quiz?.title ?? "Quiz"}</p>
                      <p className="text-muted text-[10px]">{new Date(r.completed_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <p className={`text-sm font-black shrink-0 ${r.passed ? "text-emerald-400" : "text-red-400"}`}>{r.score}%</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Leçons complétées */}
      <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5">
        <h2 className="text-cream font-semibold text-sm mb-4">Leçons complétées ({progress?.length ?? 0})</h2>
        {!progress || progress.length === 0 ? (
          <p className="text-muted text-sm">Aucune leçon complétée.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {progress.map((p) => {
              const lesson = p.lessons as { title: string; modules?: { title: string } | null } | null;
              return (
                <div key={p.id} className="flex items-center gap-2 py-1.5">
                  <CheckCircle2 size={13} className="text-gold shrink-0" />
                  <div className="min-w-0">
                    <p className="text-cream text-xs truncate">{lesson?.title ?? "Leçon"}</p>
                    {lesson?.modules && <p className="text-muted/60 text-[10px]">{(lesson.modules as { title: string }).title}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Badges */}
      {badges && badges.length > 0 && (
        <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-cream font-semibold text-sm mb-4">Badges gagnés ({badges.length})</h2>
          <div className="flex flex-wrap gap-3">
            {badges.map((sb) => {
              const badge = sb.badges as { name: string; icon: string | null; description: string | null } | null;
              return (
                <div key={sb.id} className="flex items-center gap-2 bg-surface-3 border border-white/[0.06] rounded-xl px-3 py-2">
                  <span className="text-xl">{badge?.icon ?? "🏆"}</span>
                  <div>
                    <p className="text-cream text-xs font-semibold">{badge?.name ?? ""}</p>
                    <p className="text-muted/60 text-[10px]">{new Date(sb.earned_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
