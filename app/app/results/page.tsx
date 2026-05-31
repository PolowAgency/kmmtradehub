import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, XCircle, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ResultsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: results } = await supabase
    .from("quiz_results")
    .select("*, quizzes(title, passing_score)")
    .eq("student_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(50);

  const totalPassed = results?.filter((r) => r.passed).length ?? 0;
  const totalAttempts = results?.length ?? 0;
  const avgScore = totalAttempts > 0
    ? Math.round((results ?? []).reduce((acc, r) => acc + r.score, 0) / totalAttempts)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/app/dashboard" className="text-muted hover:text-cream transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-cream text-2xl font-semibold">Résultats quiz</h1>
          <p className="text-muted text-sm mt-0.5">Historique de tes quiz</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-2 border border-white/[0.07] rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-cream">{totalAttempts}</p>
          <p className="text-muted text-xs mt-0.5 uppercase tracking-wide">Tentatives</p>
        </div>
        <div className="bg-surface-2 border border-white/[0.07] rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-gold">{totalPassed}</p>
          <p className="text-muted text-xs mt-0.5 uppercase tracking-wide">Réussis</p>
        </div>
        <div className="bg-surface-2 border border-white/[0.07] rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-cream">{avgScore}<span className="text-base text-muted">%</span></p>
          <p className="text-muted text-xs mt-0.5 uppercase tracking-wide">Moy.</p>
        </div>
      </div>

      {/* Results list */}
      {!results || results.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-2 border border-white/[0.07]">
            <Trophy size={28} className="text-muted/40" />
          </div>
          <div>
            <p className="text-cream font-medium">Aucun quiz effectué</p>
            <p className="text-muted text-sm mt-1">Lance-toi sur un quiz pour voir tes résultats ici !</p>
          </div>
          <Link
            href="/app/modules"
            className="mt-2 px-5 py-2.5 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors"
          >
            Voir les modules
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((res) => {
            const quiz = res.quizzes as { title: string; passing_score: number } | null;
            return (
              <div
                key={res.id}
                className={`flex items-center gap-4 rounded-xl px-4 py-4 border ${
                  res.passed
                    ? "border-emerald-400/15 bg-emerald-400/5"
                    : "border-red-400/15 bg-red-400/5"
                }`}
              >
                <div className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
                  res.passed ? "bg-emerald-400/10" : "bg-red-400/10"
                }`}>
                  {res.passed
                    ? <CheckCircle2 size={17} className="text-emerald-400" />
                    : <XCircle size={17} className="text-red-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-cream text-sm font-medium truncate">
                    {quiz?.title ?? "Quiz"}
                  </p>
                  <p className="text-muted text-xs mt-0.5">
                    {new Date(res.completed_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {quiz && (
                      <span className="ml-2 text-muted/60">· min {quiz.passing_score}%</span>
                    )}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className={`font-black text-lg leading-none ${res.passed ? "text-emerald-400" : "text-red-400"}`}>
                    {res.score}%
                  </p>
                  <p className={`text-[10px] mt-1 ${res.passed ? "text-emerald-400/60" : "text-red-400/60"}`}>
                    {res.passed ? "Réussi" : "Échoué"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
