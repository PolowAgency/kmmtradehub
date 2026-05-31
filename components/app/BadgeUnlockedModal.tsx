"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
}

interface Props {
  badges: Badge[];
  onClose: () => void;
}

export function BadgeUnlockedModal({ badges, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // Petit délai pour que l'animation d'entrée soit visible
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  function handleNext() {
    if (current < badges.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      handleClose();
    }
  }

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  const badge = badges[current];
  if (!badge) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-5 transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-xs text-center transition-all duration-300 ${
          visible ? "scale-100 translate-y-0" : "scale-90 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow derrière */}
        <div
          className="absolute inset-0 rounded-3xl blur-2xl opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)" }}
        />

        <div className="relative bg-surface-2 border border-gold/30 rounded-3xl p-8 shadow-2xl">
          {/* Bouton fermer */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted hover:text-cream transition-colors"
          >
            <X size={16} />
          </button>

          {/* Label */}
          <p className="text-gold text-[10px] uppercase tracking-widest font-bold mb-6">
            Badge débloqué !
          </p>

          {/* Icône animée */}
          <div
            className="mx-auto mb-5 flex items-center justify-center w-24 h-24 rounded-full border-2 border-gold/40"
            style={{
              background: "radial-gradient(circle at 40% 35%, rgba(232,204,106,0.25) 0%, rgba(212,175,55,0.08) 100%)",
              animation: "badgePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
            }}
          >
            <span style={{ fontSize: "2.5rem", lineHeight: 1 }}>{badge.icon}</span>
          </div>

          <h2 className="text-cream text-xl font-bold mb-2">{badge.name}</h2>
          {badge.description && (
            <p className="text-muted text-sm leading-relaxed mb-6">{badge.description}</p>
          )}

          {/* Indicateur si plusieurs badges */}
          {badges.length > 1 && (
            <div className="flex justify-center gap-1.5 mb-4">
              {badges.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === current ? "w-5 bg-gold" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
          )}

          <button
            onClick={handleNext}
            className="w-full py-3 rounded-xl bg-gold text-[#0A0A0A] font-bold text-sm hover:bg-gold-light transition-colors"
          >
            {current < badges.length - 1 ? "Badge suivant →" : "Super !"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes badgePop {
          0%   { transform: scale(0.5) rotate(-10deg); opacity: 0; }
          70%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
