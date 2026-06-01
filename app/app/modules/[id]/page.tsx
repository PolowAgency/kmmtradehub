import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, BookOpen, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { canAccessModule } from "@/lib/learning";

const LEVEL_LABELS: Record<string, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

export default async function ModuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await canAccessModule(user.id, id))) notFound();

  const [{ data: mod }, { data: progress }, { data: quizzes }] = await Promise.all([
    supabase
      .from("modules")
      .select("*, lessons(id, title, duration_minutes, order_index, is_published)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("student_progress").select("lesson_id, completed").eq("student_id", user.id),
    supabase.from("quizzes").select("id, title, lesson_id").eq("module_id", id),
  ]);

  if (!mod) notFound();

  const lessons = (mod.lessons as Array<{
    id: string; title: string; duration_minutes: number;
    order_index: number; is_published: boolean;
  }>)
    ?.filter((l) => l.is_published)
    .sort((a, b) => a.order_index - b.order_index) ?? [];

  const completed = progress?.filter((p) => p.completed && lessons.some((l) => l.id === p.lesson_id)).length ?? 0;
  const pct = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/app/modules" className="flex items-center gap-2 text-muted hover:text-cream text-sm transition-colors w-fit">
        <ArrowLeft size={15} />
        Tous les modules
      </Link>

      {/* Header card */}
      <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-6">
        {mod.level && (
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold uppercase tracking-widest">
            {LEVEL_LABELS[mod.level] ?? mod.level}
          </span>
        )}
        <h1 className="text-cream text-xl font-semibold mt-3 mb-2">{mod.title}</h1>
        <p className="text-muted text-sm leading-relaxed mb-4">{mod.description}</p>

        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-muted text-xs">
            <BookOpen size={13} />{lessons.length} leçon{lessons.length > 1 ? "s" : ""}
          </span>
          {mod.duration_minutes > 0 && (
            <span className="flex items-center gap-1.5 text-muted text-xs">
              <Clock size={13} />{mod.duration_minutes} min
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-dim to-gold rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-gold font-semibold text-sm shrink-0">{pct}%</span>
        </div>
      </div>

      {/* Lessons list */}
      <div>
        <h2 className="text-cream font-semibold mb-3">Leçons</h2>
        <div className="space-y-2">
          {lessons.map((lesson, idx) => {
            const isDone = progress?.some((p) => p.lesson_id === lesson.id && p.completed);
            const isActive = !isDone && idx === lessons.findIndex((l) => !progress?.some((p) => p.lesson_id === l.id && p.completed));

            return (
              <Link
                key={lesson.id}
                href={`/app/lessons/${lesson.id}`}
                className={`flex items-center gap-4 rounded-xl p-4 border transition-all duration-200 group ${
                  isDone
                    ? "bg-surface-2 border-gold/10"
                    : isActive
                    ? "bg-gold/5 border-gold/25 hover:bg-gold/10"
                    : "bg-surface-2 border-white/[0.06] hover:border-white/[0.12]"
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                  isDone ? "bg-gold/20" : isActive ? "bg-gold/15" : "bg-surface-3"
                }`}>
                  {isDone ? (
                    <CheckCircle2 size={16} className="text-gold" />
                  ) : (
                    <PlayCircle size={16} className={isActive ? "text-gold" : "text-muted"} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDone ? "text-muted" : "text-cream"}`}>
                    {lesson.title}
                  </p>
                  {lesson.duration_minutes > 0 && (
                    <p className="text-muted text-[10px] mt-0.5">{lesson.duration_minutes} min</p>
                  )}
                </div>
                {isActive && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/20 shrink-0">
                    Continuer
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Module quiz */}
      {quizzes && quizzes.length > 0 && (
        <div>
          <h2 className="text-cream font-semibold mb-3">Quiz du module</h2>
          {quizzes.filter((quiz) => !quiz.lesson_id).map((quiz) => (
            <Link
              key={quiz.id}
              href={`/app/quiz/${quiz.id}`}
              className="flex items-center justify-between gap-4 bg-surface-2 border border-white/[0.06] rounded-xl p-4 hover:border-gold/20 transition-all duration-200 group"
            >
              <div>
                <p className="text-cream text-sm font-medium">{quiz.title}</p>
                <p className="text-muted text-xs mt-0.5">Testez vos connaissances</p>
              </div>
              <span className="text-[10px] px-3 py-1.5 rounded-full bg-gold text-[#0A0A0A] font-semibold">
                Démarrer
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
