import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MarkLessonComplete } from "@/components/app/MarkLessonComplete";
import { LessonNotes } from "@/components/app/LessonNotes";
import { ArrowLeft, FileText, Headphones, Video, ExternalLink, Clock } from "lucide-react";
import { canAccessLesson, listLessonResources, sanitizeLessonHtml } from "@/lib/learning";

const RESOURCE_ICONS = {
  pdf:   { icon: FileText,   label: "PDF",   color: "text-red-400" },
  audio: { icon: Headphones, label: "Audio", color: "text-blue-400" },
  video: { icon: Video,      label: "Vidéo", color: "text-purple-400" },
  link:  { icon: ExternalLink, label: "Lien", color: "text-emerald-400" },
};

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!(await canAccessLesson(user.id, id))) notFound();

  const [{ data: lesson }, { data: progress }, { data: quizzes }, { data: noteRow }] = await Promise.all([
    supabase.from("lessons").select("*, modules(id, title)").eq("id", id).single(),
    supabase.from("student_progress").select("completed").eq("student_id", user.id).eq("lesson_id", id).single(),
    supabase.from("quizzes").select("id, title").eq("lesson_id", id),
    supabase.from("lesson_notes").select("content").eq("user_id", user.id).eq("lesson_id", id).maybeSingle(),
  ]);

  if (!lesson || !lesson.is_published) notFound();
  const resources = await listLessonResources(id);

  const isCompleted = progress?.completed ?? false;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={`/app/modules/${(lesson.modules as { id: string })?.id}`}
        className="flex items-center gap-2 text-muted hover:text-cream text-sm transition-colors w-fit"
      >
        <ArrowLeft size={15} />
        {(lesson.modules as { title: string })?.title ?? "Module"}
      </Link>

      {/* Lesson header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          {lesson.duration_minutes > 0 && (
            <span className="flex items-center gap-1 text-muted text-xs">
              <Clock size={12} />{lesson.duration_minutes} min
            </span>
          )}
          {isCompleted && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-gold">
              Complétée ✓
            </span>
          )}
        </div>
        <h1 className="text-cream text-xl font-semibold">{lesson.title}</h1>
      </div>

      {/* Content */}
      {lesson.content && (
        <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-6">
          <div
            className="lesson-content"
            dangerouslySetInnerHTML={{ __html: sanitizeLessonHtml(lesson.content) }}
          />
        </div>
      )}

      {/* Resources */}
      {resources.length > 0 && (
        <div>
          <h2 className="text-cream font-semibold mb-3">Ressources</h2>
          <div className="space-y-2">
            {resources.map((res) => {
              const meta = RESOURCE_ICONS[res.type as keyof typeof RESOURCE_ICONS] ?? RESOURCE_ICONS.link;
              const Icon = meta.icon;
              return (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-surface-2 border border-white/[0.06] rounded-xl p-4 hover:border-gold/20 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-3 shrink-0">
                    <Icon size={16} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-cream text-sm font-medium truncate">{res.title}</p>
                    <p className="text-muted text-xs">{meta.label}</p>
                  </div>
                  <ExternalLink size={14} className="text-muted group-hover:text-gold transition-colors shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Quiz */}
      {quizzes && quizzes.length > 0 && (
        <div className="bg-surface-2 border border-gold/15 rounded-2xl p-5">
          <h2 className="text-cream font-semibold mb-1">Quiz de la leçon</h2>
          <p className="text-muted text-xs mb-4">Testez vos connaissances avant de continuer.</p>
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              href={`/app/quiz/${quiz.id}`}
              className="inline-flex items-center gap-2 bg-gold text-[#0A0A0A] font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gold-light transition-colors"
            >
              Démarrer le quiz
            </Link>
          ))}
        </div>
      )}

      {/* Notes personnelles */}
      <LessonNotes
        lessonId={id}
        userId={user.id}
        initialContent={noteRow?.content ?? ""}
      />

      {/* Mark complete */}
      <MarkLessonComplete
        lessonId={id}
        isCompleted={isCompleted}
      />
    </div>
  );
}
