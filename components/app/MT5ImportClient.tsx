"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type ParsedTrade = {
  traded_at: string;
  pair: string;
  direction: "long" | "short";
  result: "win" | "loss" | "breakeven";
  entry_price: number | null;
  exit_price: number | null;
  lot_size: number | null;
  pnl: number | null;
};

// Parse MT5 trade history CSV export
// Supports: Ticket,Open Time,Type,Lots,Symbol,Price,S/L,T/P,Close Time,Close Price,...,Profit
function parseMT5CSV(csv: string): ParsedTrade[] {
  const lines = csv.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  // Detect header line
  const headerLine = lines[0].toLowerCase();
  const isStandard = headerLine.includes("type") && headerLine.includes("symbol");
  if (!isStandard) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));

  const idx = (name: string) => headers.findIndex((h) => h.includes(name));
  const iType       = idx("type");
  const iLots       = idx("lots") !== -1 ? idx("lots") : idx("size") !== -1 ? idx("size") : idx("volume");
  const iSymbol     = idx("symbol") !== -1 ? idx("symbol") : idx("item");
  const iPrice      = headers.indexOf("price");
  const iClose      = idx("close price") !== -1 ? idx("close price") : headers.lastIndexOf("price");
  const iOpenTime   = idx("open time");
  const iProfit     = idx("profit");

  const trades: ParsedTrade[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/"/g, ""));
    if (cols.length < 4) continue;

    const type    = (cols[iType] ?? "").toLowerCase();
    const symbol  = (cols[iSymbol] ?? "").toUpperCase();
    const lots    = parseFloat(cols[iLots] ?? "0") || null;
    const entry   = parseFloat(cols[iPrice] ?? "") || null;
    const close   = parseFloat(cols[iClose] ?? "") || null;
    const profit  = parseFloat(cols[iProfit] ?? "0");
    const timeRaw = cols[iOpenTime] ?? "";

    if (!symbol || (!type.includes("buy") && !type.includes("sell"))) continue;

    // Parse date: "2024.01.15 09:30:00" or "2024-01-15 09:30:00"
    const dateStr = timeRaw.replace(/\./g, "-").split(" ")[0];
    const traded_at = dateStr || new Date().toISOString().slice(0, 10);

    const direction: "long" | "short" = type.includes("buy") ? "long" : "short";
    const result: "win" | "loss" | "breakeven" =
      profit > 0.01 ? "win" : profit < -0.01 ? "loss" : "breakeven";

    // Normalize symbol to match journal pairs
    const normalizedSymbol = symbol.replace("FX:", "").replace("/", "");

    trades.push({
      traded_at,
      pair: normalizedSymbol,
      direction,
      result,
      entry_price: entry,
      exit_price: close,
      lot_size: lots,
      pnl: profit || null,
    });
  }

  return trades;
}

export function MT5ImportClient({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [trades, setTrades] = useState<ParsedTrade[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) { setError("Fichier CSV requis (.csv)"); return; }
    setError(null);
    setDone(false);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseMT5CSV(text);
      if (parsed.length === 0) {
        setError("Aucun trade trouvé. Vérifie que le fichier est bien un export MT5 (Historique du compte → Exporter CSV).");
      } else {
        setTrades(parsed);
      }
    };
    reader.readAsText(file, "utf-8");
  }

  async function handleImport() {
    if (trades.length === 0) return;
    setImporting(true);
    const payload = trades.map((t) => ({
      user_id: userId,
      traded_at: t.traded_at,
      pair: t.pair,
      direction: t.direction,
      result: t.result,
      entry_price: t.entry_price,
      exit_price: t.exit_price,
      lot_size: t.lot_size,
      pnl: t.pnl,
      notes: "Importé depuis MT5",
      updated_at: new Date().toISOString(),
    }));
    const { error: err } = await supabase.from("trading_journal").insert(payload);
    setImporting(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    setTrades([]);
    setTimeout(() => router.push("/app/journal"), 1500);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-cream text-2xl font-bold">Importer depuis MT5</h1>
        <p className="text-muted text-sm mt-0.5">Exporte ton historique de trades depuis MT5 et importe-le en un clic.</p>
      </div>

      {/* Guide */}
      <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-4 space-y-2">
        <p className="text-cream text-xs font-semibold mb-3">Comment exporter depuis MT5 :</p>
        {[
          "Ouvrir MT5 → onglet Historique (en bas)",
          "Clic droit sur la liste → Enregistrer comme rapport → Choisir CSV",
          "Ou : Affichage → Historique du compte → clic droit → Exporter CSV",
          "Importer le fichier .csv ici",
        ].map((s, i) => (
          <div key={i} className="flex items-start gap-2.5 text-xs text-muted">
            <span className="w-5 h-5 rounded-full bg-gold/15 text-gold text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
            {s}
          </div>
        ))}
      </div>

      {/* Drop zone */}
      {trades.length === 0 && !done && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all ${
            dragOver ? "border-gold/50 bg-gold/5" : "border-white/[0.12] hover:border-gold/30 hover:bg-white/[0.02]"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-white/[0.08] flex items-center justify-center">
            <Upload size={24} className="text-muted" />
          </div>
          <div className="text-center">
            <p className="text-cream font-semibold text-sm">Glisse ton fichier CSV ici</p>
            <p className="text-muted text-xs mt-1">ou clique pour sélectionner</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 bg-red-400/5 border border-red-400/20 rounded-xl p-4">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {done && (
        <div className="flex items-center gap-3 bg-emerald-400/5 border border-emerald-400/20 rounded-xl p-4">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <p className="text-emerald-300 text-sm font-medium">Trades importés ! Redirection vers le journal…</p>
        </div>
      )}

      {/* Preview */}
      {trades.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-cream text-sm font-semibold">{trades.length} trade{trades.length > 1 ? "s" : ""} détecté{trades.length > 1 ? "s" : ""} · {fileName}</p>
            <button onClick={() => { setTrades([]); setFileName(""); }} className="text-muted text-xs hover:text-cream">Changer</button>
          </div>

          <div className="bg-surface-2 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
              {trades.map((t, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    t.result === "win" ? "bg-emerald-400/10" : t.result === "loss" ? "bg-red-400/10" : "bg-amber-400/10"
                  }`}>
                    {t.direction === "long"
                      ? <TrendingUp size={13} className={t.result === "win" ? "text-emerald-400" : t.result === "loss" ? "text-red-400" : "text-amber-400"} />
                      : <TrendingDown size={13} className={t.result === "win" ? "text-emerald-400" : t.result === "loss" ? "text-red-400" : "text-amber-400"} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-cream text-xs font-semibold">{t.pair}</p>
                    <p className="text-muted text-[10px]">{t.traded_at} · {t.lot_size ?? ""}  lots</p>
                  </div>
                  {t.pnl != null && (
                    <p className={`text-xs font-bold shrink-0 ${t.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(2)}$
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-[#0A0A0A] font-bold text-sm hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {importing ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              {importing ? "Import en cours…" : `Importer ${trades.length} trades`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
