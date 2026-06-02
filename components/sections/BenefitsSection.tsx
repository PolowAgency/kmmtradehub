"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const BENEFITS = [
  {
    title: "Une méthode complète sur l'Or (XAUUSD)",
    desc: "Sessions, niveaux, DXY, indicateurs — tout ce qu'il faut analyser avant chaque trade sur l'Or.",
  },
  {
    title: "Valider chaque setup avant d'entrer",
    desc: "La checklist pre-trade en 5 sections t'oblige à vérifier les conditions avant d'appuyer sur Buy ou Sell.",
  },
  {
    title: "Analyser tes trades, pas juste les faire",
    desc: "Le journal te permet de mesurer ton winrate, ton R:R moyen, tes émotions — et de progresser avec des données réelles.",
  },
  {
    title: "Comprendre les outils que tu utilises",
    desc: "Chaque indicateur KMM est documenté : pourquoi il est là, comment le lire, ce qu'il signale vraiment.",
  },
  {
    title: "Progresser dans un cadre motivant",
    desc: "Streaks, badges, leaderboard — la progression gamifiée rend la discipline plus facile à tenir dans la durée.",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 bg-surface">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xs tracking-widest uppercase text-gold/70 font-medium mb-4"
            >
              Les bénéfices
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-bold text-cream mb-4 leading-tight"
            >
              Ce que tu construis{" "}
              <span className="text-gradient-gold">avec KMM VIP</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-muted leading-relaxed mb-8"
            >
              KMM VIP n&apos;est pas une promesse de résultats financiers. C&apos;est
              un cadre éducatif pour développer les bonnes pratiques du trader sérieux.
            </motion.p>

            {/* Benefits list */}
            <div className="space-y-4">
              {BENEFITS.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-cream font-medium text-sm mb-0.5">
                      {benefit.title}
                    </p>
                    <p className="text-xs text-muted leading-relaxed">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: visual block */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl border border-gold/15 bg-[#0A0A0A] p-8 relative overflow-hidden">
              {/* Decorative */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold/3 rounded-tr-full" />

              <div className="relative">
                <p className="text-xs tracking-widest uppercase text-gold/60 font-medium mb-6">
                  Dans la plateforme
                </p>

                {[
                  { icon: "📚", label: "Modules & leçons", sub: "Progression séquentielle" },
                  { icon: "✅", label: "Checklist pre-trade", sub: "XAUUSD — 5 sections" },
                  { icon: "📒", label: "Journal de trading", sub: "Import MT5 · Export CSV" },
                  { icon: "📈", label: "Indicateurs KMM", sub: "15+ outils documentés" },
                  { icon: "🏆", label: "Badges & Leaderboard", sub: "Streaks · XP · Classement" },
                  { icon: "📡", label: "Lives & Sessions 1:1", sub: "Direct + replays + appels" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.07 }}
                    className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0"
                  >
                    <span className="text-base w-6 shrink-0 text-center">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-cream/90 font-medium leading-none mb-0.5">{item.label}</p>
                      <p className="text-[11px] text-muted">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
