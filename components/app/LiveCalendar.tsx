"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Radio } from "lucide-react";
import Link from "next/link";

type Live = { id: string; title: string; scheduled_at: string; status: string };

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export function LiveCalendar({ lives }: { lives: Live[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const first = new Date(year, month, 1);
  const dayOfWeek = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); }

  const livesThisMonth = lives.filter((l) => {
    const d = new Date(l.scheduled_at);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  function livesOnDay(day: number) {
    return livesThisMonth.filter((l) => new Date(l.scheduled_at).getDate() === day);
  }

  const emptyCells: (number | null)[] = Array.from({ length: dayOfWeek }, () => null);
  const dayCells: (number | null)[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const cells: (number | null)[] = [...emptyCells, ...dayCells];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayDay = now.getFullYear() === year && now.getMonth() === month ? now.getDate() : null;

  return (
    <div className="bg-surface-2 border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <button onClick={prevMonth} className="p-1.5 rounded-lg text-muted hover:text-cream hover:bg-white/[0.05] transition-all">
          <ChevronLeft size={16} />
        </button>
        <p className="text-cream font-semibold text-sm">{MONTHS[month]} {year}</p>
        <button onClick={nextMonth} className="p-1.5 rounded-lg text-muted hover:text-cream hover:bg-white/[0.05] transition-all">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 border-b border-white/[0.05]">
        {DAYS.map((d) => (
          <div key={d} className="py-2 text-center text-muted text-[10px] font-semibold uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="min-h-[56px] border-r border-b border-white/[0.04] last:border-r-0" />;
          const dayLives = livesOnDay(day);
          const isToday = day === todayDay;
          return (
            <div key={i} className={`min-h-[56px] p-1.5 border-r border-b border-white/[0.04] last:border-r-0 ${isToday ? "bg-gold/5" : ""}`}>
              <div className={`text-[11px] font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                isToday ? "bg-gold text-[#0A0A0A]" : "text-muted"
              }`}>
                {day}
              </div>
              {dayLives.map((l) => (
                <Link key={l.id} href={`/app/live/${l.id}`}>
                  <div className={`text-[9px] font-semibold px-1 py-0.5 rounded truncate mb-0.5 ${
                    l.status === "live"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-gold/15 text-gold"
                  }`}>
                    {l.status === "live" ? "🔴 " : "📡 "}{l.title}
                  </div>
                </Link>
              ))}
            </div>
          );
        })}
      </div>

      {livesThisMonth.length === 0 && (
        <div className="py-6 text-center">
          <Radio size={20} className="text-muted/30 mx-auto mb-2" />
          <p className="text-muted text-xs">Aucun live ce mois-ci</p>
        </div>
      )}
    </div>
  );
}
