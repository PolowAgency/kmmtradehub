"use client";

import { useEffect, useState } from "react";

const SESSIONS = [
  {
    name: "Tokyo",
    open: 1,   // heure Paris (UTC+2 été)
    close: 10,
    color: "bg-blue-400",
    textColor: "text-blue-400",
    borderColor: "border-blue-400/30",
    bg: "bg-blue-400/8",
    note: "Or calme · volumes faibles",
  },
  {
    name: "Londres",
    open: 9,
    close: 18,
    color: "bg-amber-400",
    textColor: "text-amber-400",
    borderColor: "border-amber-400/30",
    bg: "bg-amber-400/8",
    note: "Or actif · grands mouvements",
  },
  {
    name: "New York",
    open: 14,
    close: 23,
    color: "bg-emerald-400",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-400/30",
    bg: "bg-emerald-400/8",
    note: "Or très actif · news US",
  },
];

const GOLD_EVENTS = [
  { time: "14:30", label: "NFP / CPI / PPI", note: "Impact fort sur l'or" },
  { time: "20:00", label: "Décision Fed",     note: "Volatilité extrême" },
  { time: "09:00", label: "PMI Zone Euro",    note: "Impact modéré" },
];

export function GoldSessionsBar() {
  const [hour, setHour] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setHour(new Date().getHours());
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const activeSession = hour !== null
    ? SESSIONS.find((s) => hour >= s.open && hour < s.close)
    : null;

  const isOverlap = hour !== null && hour >= 14 && hour < 18;

  return (
    <div className="flex flex-wrap gap-2">
      {/* Sessions */}
      {SESSIONS.map((s) => {
        const isActive = hour !== null && hour >= s.open && hour < s.close;
        return (
          <div
            key={s.name}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
              isActive
                ? `${s.bg} ${s.borderColor} ${s.textColor}`
                : "bg-surface-2 border-white/[0.06] text-muted"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? s.color : "bg-white/[0.15]"}`} />
            <span className="font-semibold">{s.name}</span>
            <span className="hidden sm:inline opacity-60">{s.open}h–{s.close}h</span>
            {isActive && <span className="hidden md:inline opacity-70">· {s.note}</span>}
          </div>
        );
      })}

      {/* Overlap badge */}
      {isOverlap && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gold/30 bg-gold/8 text-gold text-xs font-bold animate-pulse">
          ⚡ Overlap Londres/NY — meilleure fenêtre or
        </div>
      )}

      {/* Pas de session active */}
      {!activeSession && hour !== null && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.06] bg-surface-2 text-muted text-xs">
          🌙 Marché calme — hors sessions principales
        </div>
      )}
    </div>
  );
}
