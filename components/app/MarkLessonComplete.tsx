"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Trophy } from "lucide-react";
import { BadgeUnlockedModal } from "@/components/app/BadgeUnlockedModal";

interface BadgeInfo {
  id: string;
  name: string;
  description: string | null;
  icon: string;
}

export function MarkLessonComplete({
  lessonId,
  isCompleted,
}: {
  lessonId: string;
  isCompleted: boolean;
}) {
  const [done, setDone] = useState(isCompleted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newBadges, setNewBadges] = useState<BadgeInfo[]>([]);
  const [moduleComplete, setModuleComplete] = useState(false);
  const router = useRouter();

  async function handleComplete() {
    if (done || loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/learning/lessons/${lessonId}/complete`, {
        method: "POST",
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Erreur inattendue");
      setModuleComplete(Boolean(payload.moduleComplete));
      setNewBadges(payload.badges ?? []);

      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  if (done) {
    return (
      <>
        {/* Notification module terminé */}
        {moduleComplete && (
          <div className="flex items-center gap-4 bg-gradient-to-r from-gold/15 to-gold/5 border border-gold/30 rounded-2xl p-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gold/20 border border-gold/30 shrink-0">
              <Trophy size={22} className="text-gold" />
            </div>
            <div>
              <p className="text-gold font-bold text-sm">Module terminé !</p>
              <p className="text-muted text-xs mt-0.5">Félicitations, tu as complété toutes les leçons de ce module.</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 bg-gold/10 border border-gold/20 rounded-2xl p-5">
          <CheckCircle2 size={20} className="text-gold shrink-0" />
          <div>
            <p className="text-cream font-medium text-sm">Leçon complétée !</p>
            <p className="text-muted text-xs mt-0.5">Ta progression a été enregistrée.</p>
          </div>
        </div>

        {/* Modal badge débloqué */}
        {newBadges.length > 0 && (
          <BadgeUnlockedModal badges={newBadges} onClose={() => setNewBadges([])} />
        )}
      </>
    );
  }

  return (
    <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5 space-y-3">
      <p className="text-muted text-sm">Tu as terminé cette leçon ?</p>
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      <button
        onClick={handleComplete}
        disabled={loading}
        className="flex items-center gap-2.5 bg-gold hover:bg-gold-light text-[#0A0A0A] font-semibold text-sm px-6 py-3 rounded-xl transition-colors glow-gold disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <CheckCircle2 size={17} />
        {loading ? "Enregistrement…" : "Marquer comme terminée"}
      </button>
    </div>
  );
}
