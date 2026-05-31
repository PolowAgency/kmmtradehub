import Link from "next/link";
import { Radio, Clock, PlayCircle, Calendar } from "lucide-react";

interface Live {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  status: "scheduled" | "live" | "ended";
  thumbnail_url: string | null;
  live_replays: Array<{ id: string }>;
}

const STATUS = {
  live: { label: "En direct", color: "bg-red-500/15 text-red-400 border-red-500/25", dot: "bg-red-500 animate-pulse" },
  scheduled: { label: "Programmé", color: "bg-gold/10 text-gold border-gold/20", dot: "bg-gold" },
  ended: { label: "Terminé", color: "bg-surface-3 text-muted border-white/[0.08]", dot: "bg-muted" },
};

export function LiveCard({ live }: { live: Live }) {
  const meta = STATUS[live.status] ?? STATUS.ended;
  const hasReplay = live.live_replays?.length > 0;
  const date = new Date(live.scheduled_at);

  return (
    <Link
      href={`/app/live/${live.id}`}
      className="block bg-surface-2 border border-white/[0.06] rounded-2xl overflow-hidden hover:border-gold/20 transition-all duration-200 group"
    >
      {/* Thumbnail / Placeholder */}
      <div className="relative h-36 bg-gradient-to-br from-surface-3 to-surface overflow-hidden">
        {live.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={live.thumbnail_url} alt={live.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Radio size={36} className="text-muted/20" />
          </div>
        )}
        {/* Status badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${meta.color}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </div>
        {/* Replay badge */}
        {hasReplay && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2/90 border border-white/[0.1] text-[10px] text-muted">
            <PlayCircle size={10} />
            Replay
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-cream font-semibold text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-gold transition-colors">
          {live.title}
        </h3>
        {live.description && (
          <p className="text-muted text-xs leading-relaxed line-clamp-2 mb-3">{live.description}</p>
        )}
        <div className="flex items-center gap-1.5 text-muted text-[11px]">
          {live.status === "scheduled" ? (
            <><Calendar size={11} /> {date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</>
          ) : live.status === "live" ? (
            <><Clock size={11} /> En cours</>
          ) : (
            <><Clock size={11} /> {date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</>
          )}
        </div>
      </div>
    </Link>
  );
}
