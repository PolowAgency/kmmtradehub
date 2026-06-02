import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, TrendingUp, TrendingDown, ExternalLink, Download } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Journal de trading" };

const EMOTION_EMOJI: Record<string, string> = {
  confident: "💪", fearful: "😰", greedy: "🤑", neutral: "😐", frustrated: "😤",
};

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: entries } = await supabase
    .from("trading_journal")
    .select("*")
    .eq("user_id", user.id)
    .order("traded_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  const all = entries ?? [];
  const wins       = all.filter((e) => e.result === "win").length;
  const losses     = all.filter((e) => e.result === "loss").length;
  const winrate    = all.length > 0 ? Math.round((wins / all.length) * 100) : 0;
  const totalPnl   = all.reduce((sum, e) => sum + (e.pnl ?? 0), 0);
  const avgRR      = all.filter((e) => e.rr).length > 0
    ? (all.reduce((s, e) => s + (e.rr ?? 0), 0) / all.filter((e) => e.rr).length).toFixed(2)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-cream text-2xl font-bold">Journal de trading</h1>
          <p className="text-muted text-sm mt-0.5">{all.length} trade{all.length !== 1 ? "s" : ""} enregistré{all.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {all.length > 0 && (
            <a
              href="/api/journal/export"
              className="flex items-center gap-2 border border-white/[0.1] text-muted hover:text-cream text-sm px-3 py-2.5 rounded-xl transition-colors"
              title="Exporter en CSV"
            >
              <Download size={14} />
              <span className="hidden sm:inline">CSV</span>
            </a>
          )}
          <Link
            href="/app/journal/new"
            className="flex items-center gap-2 bg-gold text-[#0A0A0A] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-gold-light transition-colors"
          >
            <Plus size={15} /> Nouveau trade
          </Link>
        </div>
      </div>

      {/* Stats */}
      {all.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-4">
            <p className="text-muted text-xs mb-1">Winrate</p>
            <p className={`text-2xl font-black ${winrate >= 50 ? "text-emerald-400" : "text-red-400"}`}>{winrate}%</p>
            <p className="text-muted/50 text-[10px] mt-0.5">{wins}W / {losses}L</p>
          </div>
          <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-4">
            <p className="text-muted text-xs mb-1">PnL total</p>
            <p className={`text-2xl font-black ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(0)}$
            </p>
            <p className="text-muted/50 text-[10px] mt-0.5">{all.length} trades</p>
          </div>
          <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-4">
            <p className="text-muted text-xs mb-1">R:R moyen</p>
            <p className="text-2xl font-black text-gold">{avgRR ?? ""}</p>
            <p className="text-muted/50 text-[10px] mt-0.5">par trade</p>
          </div>
          <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-4">
            <p className="text-muted text-xs mb-1">Trades ce mois</p>
            <p className="text-2xl font-black text-cream">
              {all.filter((e) => {
                const d = new Date(e.traded_at);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </p>
            <p className="text-muted/50 text-[10px] mt-0.5">{new Date().toLocaleDateString("fr-FR", { month: "long" })}</p>
          </div>
        </div>
      )}

      {/* Liste */}
      {all.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4 text-center">
          <span className="text-5xl">📒</span>
          <p className="text-cream font-semibold">Aucun trade enregistré</p>
          <p className="text-muted text-sm max-w-xs">Commence à documenter tes trades pour suivre ta progression et identifier tes patterns.</p>
          <Link href="/app/journal/new" className="mt-2 px-5 py-2.5 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors">
            Enregistrer mon premier trade
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {all.map((entry) => {
            const isWin  = entry.result === "win";
            const isLoss = entry.result === "loss";
            return (
              <Link
                key={entry.id}
                href={`/app/journal/${entry.id}`}
                className="flex items-center gap-4 bg-surface-2 border border-white/[0.06] rounded-2xl p-4 hover:border-gold/20 transition-all group"
              >
                {/* Direction icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isWin  ? "bg-emerald-400/10 border-emerald-400/20" :
                  isLoss ? "bg-red-400/10 border-red-400/20" :
                           "bg-amber-400/10 border-amber-400/20"
                }`}>
                  {entry.direction === "long"
                    ? <TrendingUp size={18} className={isWin ? "text-emerald-400" : isLoss ? "text-red-400" : "text-amber-400"} />
                    : <TrendingDown size={18} className={isWin ? "text-emerald-400" : isLoss ? "text-red-400" : "text-amber-400"} />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-cream font-semibold text-sm">{entry.pair}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      isWin  ? "bg-emerald-400/10 text-emerald-400" :
                      isLoss ? "bg-red-400/10 text-red-400" :
                               "bg-amber-400/10 text-amber-400"
                    }`}>
                      {isWin ? "WIN" : isLoss ? "LOSS" : "BE"}
                    </span>
                    {entry.emotion && <span className="text-sm">{EMOTION_EMOJI[entry.emotion]}</span>}
                  </div>
                  <p className="text-muted text-xs mt-0.5">
                    {new Date(entry.traded_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    {entry.rr && <span className="ml-2">R:R {entry.rr}</span>}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  {entry.pnl != null && (
                    <p className={`text-sm font-bold ${entry.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {entry.pnl >= 0 ? "+" : ""}{entry.pnl}$
                    </p>
                  )}
                  {entry.screenshot_url && (
                    <ExternalLink size={11} className="text-muted/40 ml-auto mt-1" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
