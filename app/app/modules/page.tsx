import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, Clock, ArrowRight, CheckCircle2, Lock } from "lucide-react";

const LEVEL_LABELS: Record<string, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

const LEVEL_COLORS: Record<string, string> = {
  debutant: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  intermediaire: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  avance: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default async function ModulesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: modules }, { data: progress }] = await Promise.all([
    supabase
      .from("modules")
      .select("*, lessons(id, is_published)")
      .eq("is_published", true)
      .order("order_index"),
    supabase.from("student_progress").select("lesson_id, completed").eq("student_id", user.id),
  ]);

  const completedLessonIds = new Set(progress?.filter((p) => p.completed).map((p) => p.lesson_id) ?? []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-cream text-2xl font-semibold">Modules</h1>
        <p className="text-muted text-sm mt-1">Progresse module par module, à ton rythme.</p>
      </div>

      <div className="space-y-4">
        {modules?.map((mod, idx) => {
          const lessons = mod.lessons?.filter((l: { is_published: boolean }) => l.is_published) ?? [];
          const completed = lessons.filter((l: { id: string }) => completedLessonIds.has(l.id)).length;
          const pct = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

          // Module is locked if previous module exists and isn't 100% complete
          let isLocked = false;
          if (idx > 0 && modules) {
            const prevMod = modules[idx - 1];
            const prevLessons = prevMod.lessons?.filter((l: { is_published: boolean }) => l.is_published) ?? [];
            const prevCompleted = prevLessons.filter((l: { id: string }) => completedLessonIds.has(l.id)).length;
            isLocked = prevLessons.length > 0 && prevCompleted < prevLessons.length;
          }

          const levelColor = LEVEL_COLORS[mod.level ?? "debutant"] ?? LEVEL_COLORS.debutant;

          const cardContent = (
            <div className="flex items-start gap-4">
              {/* Number / lock */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl border text-sm shrink-0 transition-all ${
                isLocked
                  ? "bg-surface-3 border-white/[0.05] text-muted/40"
                  : "bg-surface-3 border-white/[0.08] text-muted font-bold group-hover:border-gold/20 group-hover:text-gold"
              }`}>
                {isLocked
                  ? <Lock size={15} className="text-muted/40" />
                  : pct === 100
                    ? <CheckCircle2 size={18} className="text-gold" />
                    : String(idx + 1).padStart(2, "0")}
              </div>

              <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className={`font-semibold text-sm ${isLocked ? "text-muted/50" : "text-cream"}`}>{mod.title}</h2>
                  {mod.level && !isLocked && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${levelColor}`}>
                      {LEVEL_LABELS[mod.level]}
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.06] text-muted/40">
                      Verrouillé
                    </span>
                  )}
                </div>
                <p className={`text-xs leading-relaxed mb-3 line-clamp-2 ${isLocked ? "text-muted/30" : "text-muted"}`}>{mod.description}</p>

                {/* Meta */}
                <div className="flex items-center gap-4 mb-3">
                  <span className={`flex items-center gap-1.5 text-xs ${isLocked ? "text-muted/30" : "text-muted"}`}>
                    <BookOpen size={12} />
                    {lessons.length} leçon{lessons.length > 1 ? "s" : ""}
                  </span>
                  {mod.duration_minutes > 0 && (
                    <span className={`flex items-center gap-1.5 text-xs ${isLocked ? "text-muted/30" : "text-muted"}`}>
                      <Clock size={12} />
                      {mod.duration_minutes} min
                    </span>
                  )}
                </div>

                {/* Progress */}
                {!isLocked && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold-dim to-gold rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-muted text-[10px] shrink-0">{completed}/{lessons.length}</span>
                  </div>
                )}
              </div>

              {isLocked ? (
                <Lock size={14} className="text-muted/20 shrink-0 mt-1" />
              ) : (
                <ArrowRight
                  size={16}
                  className="text-muted group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
                />
              )}
            </div>
          );

          if (isLocked) {
            return (
              <div
                key={mod.id}
                className="block bg-surface-2 border border-white/[0.04] rounded-2xl p-5 opacity-60 cursor-not-allowed"
              >
                {cardContent}
              </div>
            );
          }

          return (
            <Link
              key={mod.id}
              href={`/app/modules/${mod.id}`}
              className="block bg-surface-2 border border-white/[0.06] rounded-2xl p-5 hover:border-gold/20 transition-all duration-200 group"
            >
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
