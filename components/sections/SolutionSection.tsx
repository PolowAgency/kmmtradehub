"use client";

import { motion } from "framer-motion";
import { BarChart3, Shield, BookOpen } from "lucide-react";

const PILLARS = [
  {
    number: "01",
    icon: BarChart3,
    title: "Une méthode d'analyse claire",
    desc: "Lire les marchés sans intuition hasardeuse. Un process reproductible, structuré, applicable à chaque session.",
  },
  {
    number: "02",
    icon: Shield,
    title: "La gestion du risque avant tout",
    desc: "Des règles précises de sizing et de stop-loss pour protéger ton capital. Survivre, c'est la priorité.",
  },
  {
    number: "03",
    icon: BookOpen,
    title: "Une routine de progression",
    desc: "Des habitudes de travail solides. La régularité construit le trader que tu veux devenir.",
  },
];

export function SolutionSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 bg-surface">
      <div className="max-w-5xl mx-auto">

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-xs tracking-widest uppercase text-gold/70 font-medium text-center mb-4"
        >
          La solution
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold text-cream text-center mb-4 leading-tight"
        >
          KMM VIP t&apos;apporte{" "}
          <span className="text-gradient-gold">méthode et cadre</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-muted text-center max-w-xl mx-auto mb-16 leading-relaxed"
        >
          Pas de promesses, pas de faux résultats. Un accompagnement sérieux
          pour ceux qui veulent progresser avec rigueur.
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative p-8 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-gold/20 transition-all duration-300 overflow-hidden"
              >
                {/* Numéro décoratif */}
                <div className="absolute top-4 right-5 text-[4rem] font-bold text-white/[0.03] leading-none select-none">
                  {p.number}
                </div>

                {/* Ligne or top au hover */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/0 to-transparent group-hover:via-gold/40 transition-all duration-500" />

                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-gold/8 border border-gold/15 flex items-center justify-center mb-6 group-hover:border-gold/30 transition-colors">
                    <Icon size={18} className="text-gold" />
                  </div>

                  <p className="text-[10px] tracking-[0.25em] uppercase text-gold/50 font-medium mb-3">
                    Pilier {p.number}
                  </p>

                  <h3 className="text-cream font-semibold text-lg mb-3 leading-tight">{p.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
