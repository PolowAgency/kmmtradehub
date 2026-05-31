interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakWidget({ currentStreak, longestStreak }: StreakWidgetProps) {
  const days = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <div className="bg-surface-2 border border-white/[0.07] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-muted text-xs uppercase tracking-widest">Régularité</p>
        {longestStreak > 0 && (
          <p className="text-muted text-xs">Record : <span className="text-cream">{longestStreak} j</span></p>
        )}
      </div>

      <div className="flex items-end gap-4">
        {/* Nombre principal */}
        <div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black text-cream leading-none">{currentStreak}</span>
            <span className="text-muted text-base mb-1">jours</span>
          </div>
          {currentStreak === 0 && (
            <p className="text-muted text-sm mt-1.5">Connecte-toi chaque jour pour construire ton streak.</p>
          )}
          {currentStreak >= 3 && currentStreak < 7 && (
            <p className="text-gold text-sm mt-1.5 font-medium">🔥 Bonne dynamique !</p>
          )}
          {currentStreak >= 7 && (
            <p className="text-gold text-sm mt-1.5 font-bold">🔥 En feu - {currentStreak} jours d&apos;affilée !</p>
          )}
        </div>
      </div>

      {/* 7 barres un par jour */}
      <div className="flex items-end gap-2 mt-5 h-10">
        {days.map((day, i) => {
          const filled = i < Math.min(currentStreak, 7);
          const height = filled ? `${40 + i * 8}%` : "20%";
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full rounded-sm transition-all duration-500"
                style={{
                  height,
                  background: filled
                    ? `linear-gradient(180deg, #E8CC6A ${i * 10}%, #D4AF37 100%)`
                    : "rgba(255,255,255,0.05)",
                }}
              />
              <span className="text-[10px] text-muted/50">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
