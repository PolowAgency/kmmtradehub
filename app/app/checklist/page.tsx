"use client";

import { useState } from "react";
import { CheckCircle2, Circle, RefreshCw, ClipboardList, ArrowRight } from "lucide-react";
import Link from "next/link";

const SECTIONS = [
  {
    title: "🥇 XAUUSD — Or spécifique",
    items: [
      { id: "gold_session",  label: "Je trade pendant une session active (Londres 9h-18h ou NY 14h-23h)" },
      { id: "gold_overlap",  label: "L'overlap Londres/NY (14h-18h) est idéal — je le privilégie si possible" },
      { id: "gold_dxy",      label: "J'ai vérifié la direction du DXY (Dollar Index) — or et DXY sont inversés" },
      { id: "gold_news",     label: "Pas de news US majeures dans les 30 min (NFP, CPI, décision Fed)" },
      { id: "gold_level",    label: "J'ai identifié les niveaux psychologiques clés (ex: 2000$, 2050$, 2100$)" },
    ],
  },
  {
    title: "📊 Analyse de marché",
    items: [
      { id: "trend_htf",  label: "La tendance HTF (H4/Daily) est clairement identifiée" },
      { id: "trend_ltf",  label: "La tendance LTF (H1/M15) est alignée avec le HTF" },
      { id: "sr_id",      label: "Le support / résistance clé a été tracé" },
      { id: "sr_near",    label: "Le prix est proche d'un niveau S/R pertinent" },
    ],
  },
  {
    title: "📈 Confirmation des indicateurs",
    items: [
      { id: "ema_align",  label: "Les EMA 20/50/200 sont alignées dans la direction du trade" },
      { id: "rsi_ok",     label: "Le RSI n'est pas en zone de surachat/survente extrême" },
      { id: "macd_conf",  label: "Le MACD confirme la direction du trade" },
      { id: "stoch_ok",   label: "Le stochastique est sorti de la zone extrême" },
      { id: "vol_ok",     label: "Le volume soutient le mouvement" },
    ],
  },
  {
    title: "🎯 Setup & Gestion",
    items: [
      { id: "entry_clear",  label: "Le point d'entrée précis est identifié" },
      { id: "sl_placed",    label: "Le stop loss est positionné (au-delà du S/R ou 1.5× ATR)" },
      { id: "tp_placed",    label: "Le take profit est défini (niveau S/R suivant)" },
      { id: "rr_min",       label: "Le R:R est d'au moins 1:2" },
      { id: "lot_ok",       label: "La taille de position respecte le risque max (1-2% du compte)" },
    ],
  },
  {
    title: "🧠 Psychologie",
    items: [
      { id: "no_revenge",   label: "Ce n'est pas un trade de revanche après une perte" },
      { id: "no_fomo",      label: "Je ne prends pas ce trade par FOMO (peur de rater)" },
      { id: "calm",         label: "Je suis dans un état d'esprit calme et concentré" },
      { id: "plan_ok",      label: "Ce trade fait partie de mon plan de trading" },
    ],
  },
];

const ALL_IDS = SECTIONS.flatMap((s) => s.items.map((i) => i.id));

const GOLD_TIPS = [
  { emoji: "⚡", text: "L'overlap Londres/NY (14h–18h heure de Paris) est la meilleure fenêtre pour trader l'or." },
  { emoji: "📉", text: "DXY monte → or baisse. DXY baisse → or monte. Toujours vérifier en premier." },
  { emoji: "📰", text: "NFP (1er vendredi du mois) et décision Fed = éviter de trader 30 min avant et après." },
  { emoji: "🎯", text: "ATR moyen de l'or en H1 ≈ 3–8$. Ne jamais mettre un SL plus petit que l'ATR." },
  { emoji: "🧱", text: "Les niveaux ronds (2000$, 2050$, 2100$...) sont des aimants psychologiques très forts." },
];

export default function ChecklistPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function reset() {
    setChecked(new Set());
  }

  const total = ALL_IDS.length;
  const done = checked.size;
  const pct = Math.round((done / total) * 100);
  const allGreen = done === total;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-cream text-2xl font-bold">Checklist pre-trade</h1>
          <p className="text-muted text-sm mt-0.5">Valide chaque point avant de passer un ordre sur l'or.</p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted text-xs border border-white/[0.08] hover:text-cream hover:border-white/[0.15] transition-all"
        >
          <RefreshCw size={13} />
          Reset
        </button>
      </div>

      {/* Tips Gold */}
      <div className="bg-gold/5 border border-gold/15 rounded-2xl p-4 space-y-2">
        <p className="text-gold text-xs font-bold uppercase tracking-widest mb-3">🥇 Rappels XAUUSD</p>
        {GOLD_TIPS.map((tip, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="text-sm shrink-0">{tip.emoji}</span>
            <p className="text-cream/75 text-xs leading-relaxed">{tip.text}</p>
          </div>
        ))}
      </div>

      {/* Barre globale */}
      <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-gold" />
            <span className="text-cream font-semibold text-sm">Progression</span>
          </div>
          <span className={`text-sm font-bold ${allGreen ? "text-emerald-400" : "text-gold"}`}>
            {done} / {total}
          </span>
        </div>
        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              allGreen ? "bg-emerald-400" : "bg-gradient-to-r from-gold/70 to-gold"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {allGreen && (
          <div className="mt-4 flex items-center justify-between bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold">Setup validé — tu peux trader l'or !</span>
            </div>
            <Link
              href="/app/journal/new"
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Logguer <ArrowRight size={12} />
            </Link>
          </div>
        )}
        {!allGreen && done > 0 && (
          <p className="text-muted/60 text-xs mt-2">
            {total - done} point{total - done > 1 ? "s" : ""} restant{total - done > 1 ? "s" : ""} — ne précipite pas.
          </p>
        )}
      </div>

      {/* Sections */}
      {SECTIONS.map((section) => {
        const sectionDone = section.items.filter((i) => checked.has(i.id)).length;
        const sectionComplete = sectionDone === section.items.length;

        return (
          <div
            key={section.title}
            className={`bg-surface-2 border rounded-2xl overflow-hidden transition-all ${
              sectionComplete ? "border-emerald-400/15" : "border-white/[0.06]"
            }`}
          >
            <div className={`flex items-center justify-between px-5 py-3 border-b ${
              sectionComplete ? "border-emerald-400/10 bg-emerald-400/5" : "border-white/[0.05]"
            }`}>
              <p className="text-cream text-sm font-semibold">{section.title}</p>
              <span className={`text-xs font-bold ${sectionComplete ? "text-emerald-400" : "text-muted"}`}>
                {sectionDone}/{section.items.length}
              </span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {section.items.map((item) => {
                const isChecked = checked.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item.id)}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all ${
                      isChecked ? "bg-emerald-400/5" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <span className="shrink-0">
                      {isChecked
                        ? <CheckCircle2 size={18} className="text-emerald-400" />
                        : <Circle size={18} className="text-muted/30" />
                      }
                    </span>
                    <span className={`text-sm transition-all ${
                      isChecked ? "text-cream/60 line-through decoration-emerald-400/40" : "text-cream/90"
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* CTAs */}
      <div className="flex gap-3 pb-4">
        <Link
          href="/app/indicators"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.08] text-muted text-sm hover:text-cream hover:border-white/[0.15] transition-all"
        >
          📚 Indicateurs
        </Link>
        <Link
          href="/app/chart"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.08] text-muted text-sm hover:text-cream hover:border-white/[0.15] transition-all"
        >
          📈 Graphique or
        </Link>
      </div>
    </div>
  );
}
