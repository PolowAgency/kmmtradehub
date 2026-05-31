import { createClient } from "@/lib/supabase/server";
import { BarChart3, Users, BookOpen, TrendingUp, Activity, AlertCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: studentsCount },
    { count: completedCount },
    { data: quizResults },
    { data: topStudents },
    { data: moduleCompletions },
    { data: recentActivity },
    { data: lessons },
    { data: lessonProgress },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("student_progress").select("*", { count: "exact", head: true }).eq("completed", true),
    supabase.from("quiz_results").select("score, passed, completed_at").order("completed_at", { ascending: false }).limit(200),
    supabase.from("profiles").select("id, full_name, student_progress(completed)").eq("role", "student").limit(20),
    supabase.from("modules").select("id, title, lessons(id, student_progress(completed))").eq("is_published", true).order("order_index"),
    supabase.from("student_progress").select("student_id, updated_at").gte("updated_at", sevenDaysAgo),
    supabase.from("lessons").select("id, title, order_index, module_id").eq("is_published", true).order("order_index"),
    supabase.from("student_progress").select("lesson_id, completed").eq("completed", true),
  ]);

  const avgScore = quizResults?.length ? Math.round(quizResults.reduce((s, r) => s + r.score, 0) / quizResults.length) : 0;
  const passRate = quizResults?.length ? Math.round((quizResults.filter((r) => r.passed).length / quizResults.length) * 100) : 0;
  const activeStudents = new Set(recentActivity?.map((a) => a.student_id)).size;

  const studentStats = topStudents?.map((s) => {
    const st = s as { id: string; full_name: string | null; student_progress?: Array<{ completed: boolean }> };
    return { id: st.id, name: st.full_name ?? "", completed: st.student_progress?.filter((p) => p.completed).length ?? 0 };
  }).sort((a, b) => b.completed - a.completed).slice(0, 5);

  // Completion rate par leçon (drop-off analysis)
  const progressByLesson: Record<string, number> = {};
  lessonProgress?.forEach((p) => { progressByLesson[p.lesson_id] = (progressByLesson[p.lesson_id] ?? 0) + 1; });

  const lessonDropoff = lessons?.map((l) => ({
    id: l.id,
    title: l.title,
    completed: progressByLesson[l.id] ?? 0,
    rate: studentsCount ? Math.round(((progressByLesson[l.id] ?? 0) / studentsCount) * 100) : 0,
  })).sort((a, b) => a.rate - b.rate).slice(0, 5); // Les 5 leçons avec le plus faible taux

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-cream text-2xl font-semibold">Analytics</h1>
        <p className="text-muted text-sm mt-1">Vue d'ensemble des performances de la plateforme.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Étudiants",          value: studentsCount ?? 0,   icon: Users,      color: "text-blue-400",    bg: "bg-blue-400/10" },
          { label: "Leçons complétées",  value: completedCount ?? 0,  icon: BookOpen,   color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Score moyen",        value: `${avgScore}%`,        icon: BarChart3,  color: "text-gold",        bg: "bg-gold/10" },
          { label: "Actifs (7 jours)",   value: activeStudents,        icon: Activity,   color: "text-purple-400",  bg: "bg-purple-400/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${bg} mb-4`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-cream font-bold text-3xl">{value}</p>
            <p className="text-muted text-sm mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top students */}
        <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-cream font-semibold text-sm mb-4">Top étudiants</h2>
          <div className="space-y-3">
            {studentStats?.length === 0 && <p className="text-muted text-sm">Aucune donnée.</p>}
            {studentStats?.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="text-muted text-xs w-4 shrink-0">#{idx + 1}</span>
                <div className="w-7 h-7 rounded-full bg-surface-3 text-muted text-xs font-semibold shrink-0 flex items-center justify-center">
                  {s.name[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-cream text-xs truncate">{s.name}</p>
                </div>
                <span className="flex items-center gap-1 text-gold text-xs font-semibold shrink-0">
                  <BookOpen size={11} />{s.completed}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Module completions */}
        <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-cream font-semibold text-sm mb-4">Complétion par module</h2>
          <div className="space-y-3">
            {moduleCompletions?.map((mod) => {
              const m = mod as { id: string; title: string; lessons?: Array<{ id: string; student_progress?: Array<{ completed: boolean }> }> };
              const total = m.lessons?.reduce((s, l) => s + (l.student_progress?.filter((p) => p.completed).length ?? 0), 0) ?? 0;
              const lessonCount = m.lessons?.length ?? 0;
              const pct = lessonCount > 0 && studentsCount ? Math.min(100, Math.round((total / (lessonCount * studentsCount)) * 100)) : 0;
              return (
                <div key={m.id}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-cream text-xs truncate flex-1 mr-2">{m.title}</p>
                    <span className="text-muted text-[10px] shrink-0">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drop-off leçons les moins complétées */}
      {lessonDropoff && lessonDropoff.length > 0 && (
        <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={15} className="text-amber-400" />
            <h2 className="text-cream font-semibold text-sm">Leçons avec le plus faible taux de complétion</h2>
          </div>
          <div className="space-y-3">
            {lessonDropoff.map((l) => (
              <div key={l.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-cream text-xs truncate">{l.title}</p>
                    <span className={`text-xs font-semibold shrink-0 ml-2 ${l.rate < 30 ? "text-red-400" : l.rate < 60 ? "text-amber-400" : "text-emerald-400"}`}>
                      {l.rate}% ({l.completed}/{studentsCount ?? 0})
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${l.rate < 30 ? "bg-red-400" : l.rate < 60 ? "bg-amber-400" : "bg-emerald-400"}`}
                      style={{ width: `${l.rate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-muted/50 text-[10px] mt-3">Ces leçons méritent peut-être plus de contenu ou de clarté.</p>
        </div>
      )}

      {/* Distribution scores quiz */}
      {quizResults && quizResults.length > 0 && (
        <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-cream font-semibold text-sm">Distribution des scores quiz</h2>
            <span className="text-muted text-xs">Taux de réussite : <span className="text-gold font-semibold">{passRate}%</span></span>
          </div>
          <div className="flex items-end gap-1 h-24">
            {[0,10,20,30,40,50,60,70,80,90].map((bucket) => {
              const count = quizResults.filter((r) => r.score >= bucket && r.score < bucket + 10).length;
              const max = Math.max(...[0,10,20,30,40,50,60,70,80,90].map((b) => quizResults.filter((r) => r.score >= b && r.score < b + 10).length), 1);
              const h = Math.round((count / max) * 100);
              return (
                <div key={bucket} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full rounded-sm ${bucket >= 70 ? "bg-gold" : "bg-white/[0.1]"}`} style={{ height: `${h}%` }} />
                  <span className="text-muted text-[9px]">{bucket}</span>
                </div>
              );
            })}
          </div>
          <p className="text-muted text-xs mt-2">Score en %. Or = score ≥ 70 (réussi) · {quizResults.length} tentatives totales</p>
        </div>
      )}
    </div>
  );
}
