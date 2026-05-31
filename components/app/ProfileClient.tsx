"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, CheckCircle2, TrendingUp, LogOut, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BadgeCard } from "@/components/app/BadgeCard";
import { StreakWidget } from "@/components/app/StreakWidget";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Streak = Database["public"]["Tables"]["streaks"]["Row"];
type Badge = { id: string; badge_id: string; earned_at: string; badges: { name: string; icon: string; description: string | null } | null };
type QuizResult = Database["public"]["Tables"]["quiz_results"]["Row"];

interface Props {
  profile: Profile | null;
  streak: Streak | null;
  badges: Badge[];
  quizResults: QuizResult[];
  completedLessons: number;
  userId: string;
}

export function ProfileClient({ profile, streak, badges, quizResults, completedLessons, userId }: Props) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSave() {
    setSaving(true);
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-cream text-2xl font-semibold">Mon profil</h1>

      {/* Avatar + info */}
      <div className="flex items-center gap-4 bg-surface-2 border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gold/20 border border-gold/30 text-gold font-bold text-2xl shrink-0">
          {profile?.full_name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="text-cream font-semibold">{profile?.full_name ?? "Élève"}</p>
          <p className="text-muted text-sm">{profile?.email}</p>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full mt-1.5 inline-block ${
            profile?.role === "admin"
              ? "bg-gold/20 text-gold border border-gold/20"
              : "bg-surface-3 text-muted border border-white/[0.08]"
          }`}>
            {profile?.role === "admin" ? "Admin" : "Élève"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-2 border border-white/[0.06] rounded-xl p-4 flex flex-col items-center gap-1.5">
          <BookOpen size={16} className="text-gold" />
          <p className="text-cream font-bold text-xl leading-none">{completedLessons}</p>
          <p className="text-muted text-[10px]">Leçons</p>
        </div>
        <div className="bg-surface-2 border border-white/[0.06] rounded-xl p-4 flex flex-col items-center gap-1.5">
          <span className="text-lg leading-none">🔥</span>
          <p className="text-cream font-bold text-xl leading-none">{streak?.current_streak ?? 0}</p>
          <p className="text-muted text-[10px]">Streak</p>
        </div>
        <div className="bg-surface-2 border border-white/[0.06] rounded-xl p-4 flex flex-col items-center gap-1.5">
          <span className="text-lg leading-none">🏆</span>
          <p className="text-cream font-bold text-xl leading-none">{badges.length}</p>
          <p className="text-muted text-[10px]">Badges</p>
        </div>
      </div>

      {/* Streak widget */}
      {(streak?.current_streak ?? 0) > 0 && (
        <StreakWidget currentStreak={streak?.current_streak ?? 0} longestStreak={streak?.longest_streak ?? 0} />
      )}

      {/* Edit name */}
      <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5">
        <h2 className="text-cream font-semibold text-sm mb-4">Informations</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-muted uppercase tracking-widest mb-2">Prénom / Nom</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-widest mb-2">Email</label>
            <input
              type="text"
              value={profile?.email ?? ""}
              disabled
              className="w-full bg-surface-3 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-muted cursor-not-allowed"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors disabled:opacity-60"
          >
            {saved ? "Enregistré ✓" : saving ? "Enregistrement…" : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <h2 className="text-cream font-bold mb-3">Mes badges ({badges.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map((sb) => (
              <BadgeCard
                key={sb.id}
                icon={sb.badges?.icon ?? "🏆"}
                name={sb.badges?.name ?? "Badge"}
                description={sb.badges?.description}
                earned
                earnedAt={sb.earned_at}
                size="md"
              />
            ))}
          </div>
        </div>
      )}

      {/* Quiz history */}
      {quizResults.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-cream font-semibold">Derniers quiz</h2>
            <Link href="/app/results" className="flex items-center gap-1 text-gold text-sm hover:text-gold-light transition-colors font-medium">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {quizResults.map((res) => (
              <div
                key={res.id}
                className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 border ${
                  res.passed ? "border-emerald-400/15 bg-emerald-400/5" : "border-red-400/15 bg-red-400/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {res.passed ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : (
                    <TrendingUp size={16} className="text-red-400 shrink-0" />
                  )}
                  <div>
                    <p className="text-cream text-xs font-medium">{res.passed ? "Réussi" : "À refaire"}</p>
                    <p className="text-muted text-[10px]">
                      {new Date(res.completed_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${res.passed ? "text-emerald-400" : "text-red-400"}`}>
                  {res.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2.5 text-sm text-muted hover:text-red-400 transition-colors"
      >
        <LogOut size={16} />
        Se déconnecter
      </button>
    </div>
  );
}
