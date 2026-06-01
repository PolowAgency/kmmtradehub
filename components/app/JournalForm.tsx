"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2 } from "lucide-react";

const PAIRS = ["XAUUSD", "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "GBPJPY", "NASDAQ", "SP500", "BTCUSD"];

const EMOTIONS = [
  { value: "confident",  label: "Confiant",  emoji: "💪" },
  { value: "neutral",    label: "Neutre",    emoji: "😐" },
  { value: "fearful",    label: "Anxieux",   emoji: "😰" },
  { value: "greedy",     label: "Gourmand",  emoji: "🤑" },
  { value: "frustrated", label: "Frustré",   emoji: "😤" },
];

const INDICATORS_LIST = [
  { id: "EMA20",   label: "EMA 20",     emoji: "📈" },
  { id: "EMA50",   label: "EMA 50",     emoji: "📈" },
  { id: "EMA200",  label: "EMA 200",    emoji: "📈" },
  { id: "RSI",     label: "RSI",        emoji: "⚡" },
  { id: "MACD",    label: "MACD",       emoji: "🔀" },
  { id: "STOCH",   label: "Stoch.",     emoji: "🎯" },
  { id: "BB",      label: "Bollinger",  emoji: "🎸" },
  { id: "ATR",     label: "ATR",        emoji: "📏" },
  { id: "VOL",     label: "Volume",     emoji: "📊" },
  { id: "SR",      label: "S/R",        emoji: "🧱" },
];

const IND_PREFIX = "[IND:";
const IND_SEP = "]\n";

function encodeIndicators(indicators: string[], notes: string): string {
  if (indicators.length === 0) return notes;
  return `${IND_PREFIX}${indicators.join(",")}${IND_SEP}${notes}`;
}

function decodeIndicators(raw: string | null): { indicators: string[]; notes: string } {
  if (!raw) return { indicators: [], notes: "" };
  if (raw.startsWith(IND_PREFIX)) {
    const endIdx = raw.indexOf(IND_SEP);
    if (endIdx !== -1) {
      const indStr = raw.slice(IND_PREFIX.length, endIdx);
      const notes = raw.slice(endIdx + IND_SEP.length);
      return { indicators: indStr ? indStr.split(",") : [], notes };
    }
  }
  return { indicators: [], notes: raw };
}

interface JournalEntry {
  id: string;
  traded_at: string;
  pair: string;
  direction: "long" | "short";
  result: "win" | "loss" | "breakeven";
  entry_price: number | null;
  exit_price: number | null;
  lot_size: number | null;
  rr: number | null;
  pnl: number | null;
  emotion: string | null;
  screenshot_url: string | null;
  notes: string | null;
}

interface Props {
  userId: string;
  entry?: JournalEntry;
}

export function JournalForm({ userId, entry }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decoded = decodeIndicators(entry?.notes ?? null);

  const [form, setForm] = useState({
    traded_at:      entry?.traded_at ?? new Date().toISOString().slice(0, 10),
    pair:           entry?.pair ?? "XAUUSD",
    direction:      entry?.direction ?? "long",
    result:         entry?.result ?? "win",
    entry_price:    entry?.entry_price?.toString() ?? "",
    exit_price:     entry?.exit_price?.toString() ?? "",
    lot_size:       entry?.lot_size?.toString() ?? "",
    rr:             entry?.rr?.toString() ?? "",
    pnl:            entry?.pnl?.toString() ?? "",
    emotion:        entry?.emotion ?? "neutral",
    screenshot_url: entry?.screenshot_url ?? "",
    notes:          decoded.notes,
  });

  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(decoded.indicators);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleIndicator(id: string) {
    setSelectedIndicators((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.pair || !form.direction || !form.result) return;
    setSaving(true);
    setError(null);

    const payload = {
      user_id:        userId,
      traded_at:      form.traded_at,
      pair:           form.pair,
      direction:      form.direction,
      result:         form.result,
      entry_price:    form.entry_price ? parseFloat(form.entry_price) : null,
      exit_price:     form.exit_price  ? parseFloat(form.exit_price)  : null,
      lot_size:       form.lot_size    ? parseFloat(form.lot_size)    : null,
      rr:             form.rr          ? parseFloat(form.rr)          : null,
      pnl:            form.pnl         ? parseFloat(form.pnl)         : null,
      emotion:        form.emotion || null,
      screenshot_url: form.screenshot_url || null,
      notes:          encodeIndicators(selectedIndicators, form.notes),
      updated_at:     new Date().toISOString(),
    };

    if (entry) {
      const { error: err } = await supabase.from("trading_journal").update(payload).eq("id", entry.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from("trading_journal").insert(payload);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    router.push("/app/journal");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Date + Paire + Direction */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-muted text-xs uppercase tracking-widest">Date</label>
          <input
            type="date"
            value={form.traded_at}
            onChange={(e) => set("traded_at", e.target.value)}
            className="w-full bg-surface-2 border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold/30"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-muted text-xs uppercase tracking-widest">Paire</label>
          <select
            value={form.pair}
            onChange={(e) => set("pair", e.target.value)}
            className="w-full bg-surface-2 border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold/30"
          >
            {PAIRS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-muted text-xs uppercase tracking-widest">Direction</label>
          <div className="flex gap-2">
            {(["long", "short"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => set("direction", d)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  form.direction === d
                    ? d === "long"
                      ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
                      : "bg-red-400/10 border-red-400/30 text-red-400"
                    : "bg-surface-2 border-white/[0.07] text-muted hover:border-white/[0.15]"
                }`}
              >
                {d === "long" ? "▲ Long" : "▼ Short"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Résultat */}
      <div className="space-y-1.5">
        <label className="text-muted text-xs uppercase tracking-widest">Résultat</label>
        <div className="flex gap-3">
          {([
            { value: "win",       label: "Gagnant",   color: "emerald" },
            { value: "loss",      label: "Perdant",   color: "red" },
            { value: "breakeven", label: "Breakeven", color: "amber" },
          ] as const).map(({ value, label, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => set("result", value)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                form.result === value
                  ? color === "emerald" ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
                  : color === "red"     ? "bg-red-400/10 border-red-400/30 text-red-400"
                  :                       "bg-amber-400/10 border-amber-400/30 text-amber-400"
                  : "bg-surface-2 border-white/[0.07] text-muted hover:border-white/[0.15]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Prix + Lots + R:R + PnL */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { key: "entry_price", label: "Prix entrée" },
          { key: "exit_price",  label: "Prix sortie" },
          { key: "lot_size",    label: "Lots" },
          { key: "rr",          label: "R:R" },
        ].map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-muted text-xs uppercase tracking-widest">{label}</label>
            <input
              type="number"
              step="any"
              value={form[key as keyof typeof form]}
              onChange={(e) => set(key, e.target.value)}
              className="w-full bg-surface-2 border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold/30"
            />
          </div>
        ))}
      </div>

      {/* PnL */}
      <div className="space-y-1.5">
        <label className="text-muted text-xs uppercase tracking-widest">PnL ($)</label>
        <input
          type="number"
          step="any"
          value={form.pnl}
          onChange={(e) => set("pnl", e.target.value)}
          placeholder="Ex: 120 ou -45"
          className="w-full bg-surface-2 border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold/30 placeholder-muted/30"
        />
      </div>

      {/* Indicateurs utilisés */}
      <div className="space-y-2">
        <label className="text-muted text-xs uppercase tracking-widest">Indicateurs utilisés</label>
        <div className="flex gap-2 flex-wrap">
          {INDICATORS_LIST.map(({ id, label, emoji }) => {
            const active = selectedIndicators.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleIndicator(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  active
                    ? "bg-gold/10 border-gold/30 text-gold"
                    : "bg-surface-2 border-white/[0.07] text-muted hover:border-white/[0.15] hover:text-cream"
                }`}
              >
                <span className="text-sm leading-none">{emoji}</span>
                {label}
              </button>
            );
          })}
        </div>
        {selectedIndicators.length > 0 && (
          <p className="text-muted/50 text-[10px]">
            {selectedIndicators.length} indicateur{selectedIndicators.length > 1 ? "s" : ""} sélectionné{selectedIndicators.length > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Émotion */}
      <div className="space-y-2">
        <label className="text-muted text-xs uppercase tracking-widest">État d'esprit</label>
        <div className="flex gap-2 flex-wrap">
          {EMOTIONS.map(({ value, label, emoji }) => (
            <button
              key={value}
              type="button"
              onClick={() => set("emotion", value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                form.emotion === value
                  ? "bg-gold/10 border-gold/30 text-gold"
                  : "bg-surface-2 border-white/[0.07] text-muted hover:border-white/[0.15]"
              }`}
            >
              <span className="text-base leading-none">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Screenshot URL */}
      <div className="space-y-1.5">
        <label className="text-muted text-xs uppercase tracking-widest">Lien screenshot (optionnel)</label>
        <input
          type="url"
          value={form.screenshot_url}
          onChange={(e) => set("screenshot_url", e.target.value)}
          placeholder="https://…"
          className="w-full bg-surface-2 border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold/30 placeholder-muted/30"
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-muted text-xs uppercase tracking-widest">Analyse / Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={4}
          placeholder="Ce qui s'est passé, pourquoi j'ai pris ce trade, ce que j'aurais dû faire différemment…"
          className="w-full bg-surface-2 border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold/30 placeholder-muted/30 resize-none leading-relaxed"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Enregistrement…" : entry ? "Mettre à jour" : "Enregistrer le trade"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-3 rounded-xl border border-white/[0.12] text-muted text-sm hover:text-cream hover:border-white/[0.2] transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
