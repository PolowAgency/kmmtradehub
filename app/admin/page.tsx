import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, BookOpen, FileText, HelpCircle, ArrowRight, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: studentsCount },
    { count: modulesCount },
    { count: lessonsCount },
    { count: quizzesCount },
    { data: recentStudents },
    { data: recentProgress },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("modules").select("*", { count: "exact", head: true }),
    supabase.from("lessons").select("*", { count: "exact", head: true }),
    supabase.from("quizzes").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("id, full_name, email, created_at").eq("role", "student").order("created_at", { ascending: false }).limit(5),
    supabase.from("student_progress").select("*, profiles(full_name), lessons(title)").eq("completed", true).order("completed_at", { ascending: false }).limit(8),
  ]);

  const stats = [
    { label: "Étudiants",  value: studentsCount ?? 0, icon: Users,       href: "/admin/students",  color: "text-blue-400",    bg: "bg-blue-400/10" },
    { label: "Modules",    value: modulesCount ?? 0,  icon: BookOpen,    href: "/admin/modules",   color: "text-gold",        bg: "bg-gold/10" },
    { label: "Leçons",     value: lessonsCount ?? 0,  icon: FileText,    href: "/admin/lessons",   color: "text-purple-400",  bg: "bg-purple-400/10" },
    { label: "Quiz",       value: quizzesCount ?? 0,  icon: HelpCircle,  href: "/admin/quizzes",   color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-cream text-2xl font-semibold">Tableau de bord admin</h1>
        <p className="text-muted text-sm mt-1">Vue d&apos;ensemble de la plateforme KMM TRADE.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href, color, bg }) => (
          <Link
            key={label}
            href={href}
            className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5 hover:border-gold/20 transition-all duration-200 group"
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${bg} mb-4`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-cream font-bold text-3xl">{value}</p>
            <p className="text-muted text-sm mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent students */}
        <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-cream font-semibold text-sm">Nouveaux étudiants</h2>
            <Link href="/admin/students" className="text-gold text-xs flex items-center gap-1 hover:text-gold-light transition-colors">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentStudents?.length === 0 && (
              <p className="text-muted text-sm">Aucun étudiant.</p>
            )}
            {recentStudents?.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-3 text-muted font-semibold text-xs shrink-0">
                  {(s.full_name as string | null)?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-cream text-xs font-medium truncate">{s.full_name as string | null ?? ""}</p>
                  <p className="text-muted text-[10px] truncate">{s.email}</p>
                </div>
                <p className="text-muted text-[10px] shrink-0">
                  {new Date(s.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent completions */}
        <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-cream font-semibold text-sm">Leçons complétées récemment</h2>
            <TrendingUp size={16} className="text-gold" />
          </div>
          <div className="space-y-3">
            {recentProgress?.length === 0 && (
              <p className="text-muted text-sm">Aucune activité.</p>
            )}
            {recentProgress?.map((p) => {
              const prog = p as {
                id: string;
                completed_at: string | null;
                profiles?: { full_name?: string | null };
                lessons?: { title?: string };
              };
              return (
                <div key={prog.id} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-cream text-xs truncate">
                      <span className="font-medium">{prog.profiles?.full_name ?? "?"}</span>
                      {" "}a complété{" "}
                      <span className="text-muted">{prog.lessons?.title ?? ""}</span>
                    </p>
                    {prog.completed_at && (
                      <p className="text-muted text-[10px] mt-0.5">
                        {new Date(prog.completed_at).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-cream font-semibold text-sm mb-3">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Créer un module",  href: "/admin/modules",  icon: BookOpen },
            { label: "Créer une leçon",  href: "/admin/lessons",  icon: FileText },
            { label: "Uploader contenu", href: "/admin/uploads",  icon: TrendingUp },
            { label: "Créer un quiz",    href: "/admin/quizzes",  icon: HelpCircle },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 bg-surface-2 border border-white/[0.08] hover:border-gold/20 rounded-xl px-4 py-2.5 text-sm text-muted hover:text-cream transition-all duration-200"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
