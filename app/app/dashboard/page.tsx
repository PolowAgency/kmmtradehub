import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, CheckCircle2, PlayCircle, BookOpen } from "lucide-react";
import { StreakWidget } from "@/components/app/StreakWidget";
import { XPBar } from "@/components/app/XPBar";
import { BadgeCard } from "@/components/app/BadgeCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: streak },
    { data: progress },
    { data: badges },
    { data: allBadges },
    { data: modules },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("streaks").select("*").eq("student_id", user.id).maybeSingle(),
    supabase.from("student_progress").select("*, lessons(title, module_id)").eq("student_id", user.id),
    supabase.from("student_badges").select("*, badges(*)").eq("student_id", user.id),
    supabase.from("badges").select("*").order("condition_value"),
    supabase.from("modules").select("*, lessons(id, is_published)").eq("is_published", true).order("order_index"),
  ]);

  const completedLessons = progress?.filter((p) => p.completed).length ?? 0;
  const totalLessons = modules?.reduce((acc, m) => acc + (m.lessons?.filter((l: { is_published: boolean }) => l.is_published).length ?? 0), 0) ?? 0;
  const currentStreak = streak?.current_streak ?? 0;
  const longestStreak = streak?.longest_streak ?? 0;

  const lastProgress = progress
    ?.sort((a, b) => new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime())
    .find((p) => !p.completed);

  const firstName = profile?.full_name?.split(" ")[0] ?? "Trader";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const earnedBadgeIds = new Set(badges?.map((sb) => sb.badge_id));

  return (
    <div className="space-y-7">

      {/* Header */}
      <div>
        <p className="text-muted text-base">{greeting},</p>
        <h1 className="text-cream text-3xl font-bold mt-0.5">{firstName} 👋</h1>
      </div>

      {/* Continue CTA */}
      {lastProgress ? (
        <Link
          href={`/app/lessons/${(lastProgress as { lesson_id: string }).lesson_id}`}
          className="flex items-center justify-between gap-4 border border-gold/25 rounded-2xl p-5 hover:border-gold/40 transition-all group"
          style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.03) 100%)" }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gold/15 border border-gold/25 shrink-0">
              <PlayCircle size={24} className="text-gold" />
            </div>
            <div>
              <p className="text-xs text-gold/70 uppercase tracking-widest mb-1 font-semibold">Reprendre</p>
              <p className="text-cream font-semibold text-base leading-snug line-clamp-1">
                {(lastProgress as { lessons?: { title?: string } }).lessons?.title ?? "Dernière leçon"}
              </p>
            </div>
          </div>
          <ArrowRight size={20} className="text-gold group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>
      ) : (
        <Link
          href="/app/modules"
          className="flex items-center justify-between gap-4 border border-white/[0.08] rounded-2xl p-5 hover:border-gold/20 transition-all group bg-surface-2"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-3 shrink-0">
              <BookOpen size={22} className="text-gold" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-widest mb-1">Commencer</p>
              <p className="text-cream font-semibold text-base">Parcourir les modules</p>
            </div>
          </div>
          <ArrowRight size={20} className="text-muted group-hover:text-gold group-hover:translate-x-1 transition-all shrink-0" />
        </Link>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-2 border border-white/[0.07] rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-cream">{completedLessons}</p>
          <p className="text-muted text-xs mt-0.5 uppercase tracking-wide">Leçons</p>
        </div>
        <div className="bg-surface-2 border border-white/[0.07] rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-cream">{currentStreak}</p>
          <p className="text-muted text-xs mt-0.5 uppercase tracking-wide">Streak</p>
        </div>
        <div className="bg-surface-2 border border-white/[0.07] rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-cream">{earnedBadgeIds.size}</p>
          <p className="text-muted text-xs mt-0.5 uppercase tracking-wide">Badges</p>
        </div>
      </div>

      {/* Progression */}
      <XPBar completed={completedLessons} total={totalLessons} />

      {/* Streak */}
      <StreakWidget currentStreak={currentStreak} longestStreak={longestStreak} />

      {/* Modules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-cream text-xl font-bold">Modules</h2>
          <Link href="/app/modules" className="text-gold text-sm hover:text-gold-light transition-colors flex items-center gap-1.5 font-medium">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {modules?.slice(0, 4).map((mod) => {
            const modLessons = mod.lessons?.filter((l: { is_published: boolean }) => l.is_published) ?? [];
            const modCompleted = progress?.filter((p) => p.completed && modLessons.some((l: { id: string }) => l.id === p.lesson_id)).length ?? 0;
            const modProgress = modLessons.length > 0 ? Math.round((modCompleted / modLessons.length) * 100) : 0;
            const isDone = modProgress === 100 && modLessons.length > 0;

            return (
              <Link
                key={mod.id}
                href={`/app/modules/${mod.id}`}
                className="flex items-center gap-4 bg-surface-2 border border-white/[0.07] rounded-xl p-4 hover:border-gold/20 transition-all duration-200 group"
              >
                {/* Mini ring */}
                <div className="relative shrink-0 w-10 h-10">
                  <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
                    <circle
                      cx="18" cy="18" r="14" fill="none"
                      stroke="#D4AF37"
                      strokeWidth="3.5"
                      strokeDasharray={`${(modProgress / 100) * 87.96} 87.96`}
                      strokeLinecap="round"
                      opacity={modProgress > 0 ? 1 : 0}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isDone
                      ? <CheckCircle2 size={14} className="text-gold" />
                      : <span className="text-[9px] text-muted font-bold leading-none">{modProgress}%</span>
                    }
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-cream text-sm font-semibold truncate">{mod.title}</p>
                  <p className="text-muted text-xs mt-0.5">{modCompleted} / {modLessons.length} leçons</p>
                </div>
                <ArrowRight size={16} className="text-muted group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      {allBadges && allBadges.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-cream text-xl font-bold">Badges</h2>
            <span className="text-muted text-sm">
              <span className="text-gold font-bold">{earnedBadgeIds.size}</span> / {allBadges.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {allBadges.map((badge) => {
              const earned = earnedBadgeIds.has(badge.id);
              const earnedEntry = badges?.find((sb) => sb.badge_id === badge.id);
              return (
                <BadgeCard
                  key={badge.id}
                  icon={badge.icon ?? "🏆"}
                  name={badge.name}
                  earned={earned}
                  earnedAt={earnedEntry?.earned_at}
                  size="sm"
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
