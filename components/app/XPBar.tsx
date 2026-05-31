interface XPBarProps {
  completed: number;
  total: number;
}

export function XPBar({ completed, total }: XPBarProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-surface-2 border border-white/[0.07] rounded-2xl p-6">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-muted text-xs uppercase tracking-widest mb-1">Progression globale</p>
          <p className="text-cream text-3xl font-bold">{pct}<span className="text-gold text-xl ml-0.5">%</span></p>
        </div>
        <p className="text-muted text-sm mb-1">{completed} / {total} leçons</p>
      </div>

      {/* Barre principale */}
      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #9A7B10 0%, #D4AF37 50%, #E8CC6A 100%)",
          }}
        />
      </div>

      {/* Jalons */}
      <div className="flex justify-between mt-2">
        {[25, 50, 75, 100].map((milestone) => (
          <div key={milestone} className="flex flex-col items-center gap-1">
            <div className={`w-1 h-1 rounded-full ${pct >= milestone ? "bg-gold" : "bg-white/[0.1]"}`} />
            <p className={`text-[10px] ${pct >= milestone ? "text-gold/60" : "text-muted/30"}`}>{milestone}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
