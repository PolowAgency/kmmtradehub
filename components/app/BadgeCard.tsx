interface BadgeCardProps {
  icon: string;
  name: string;
  description?: string | null;
  earned?: boolean;
  earnedAt?: string;
  size?: "sm" | "md";
}

export function BadgeCard({ icon, name, description, earned = true, earnedAt, size = "md" }: BadgeCardProps) {
  return (
    <div className={`relative flex flex-col items-center text-center rounded-2xl border transition-all duration-200 ${
      earned
        ? "bg-gradient-to-b from-gold/8 to-transparent border-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.06)]"
        : "bg-surface-2 border-white/[0.06] opacity-40 grayscale"
    } ${size === "sm" ? "p-3 gap-1.5" : "p-5 gap-3"}`}>
      {earned && (
        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-gold animate-pulse" />
      )}

      {/* Icon bubble */}
      <div className={`flex items-center justify-center rounded-2xl ${
        earned ? "bg-gold/15 border border-gold/20" : "bg-surface-3"
      } ${size === "sm" ? "w-10 h-10 text-2xl" : "w-16 h-16 text-4xl"}`}>
        {icon}
      </div>

      <div>
        <p className={`text-cream font-bold ${size === "sm" ? "text-xs" : "text-sm"}`}>{name}</p>
        {description && size === "md" && (
          <p className="text-muted text-xs mt-0.5 leading-relaxed">{description}</p>
        )}
        {earnedAt && size === "md" && (
          <p className="text-gold/60 text-[10px] mt-1.5">
            Obtenu le {new Date(earnedAt).toLocaleDateString("fr-FR")}
          </p>
        )}
      </div>
    </div>
  );
}
