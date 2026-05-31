"use client";

import { motion } from "framer-motion";
import { Flame, HelpCircle, TrendingDown, Zap, Brain } from "lucide-react";

const PROBLEMS = [
  {
    icon: Flame,
    title: "Trop d'émotion",
    desc: "Les décisions prises sous le stress ou l'euphorie mènent à des erreurs répétées.",
  },
  {
    icon: HelpCircle,
    title: "Pas de plan clair",
    desc: "Sans structure, chaque trade devient une improvisation risquée.",
  },
  {
    icon: TrendingDown,
    title: "Mauvaise gestion du risque",
    desc: "L'absence de règles précises expose à des pertes disproportionnées.",
  },
  {
    icon: Zap,
    title: "Décisions impulsives",
    desc: "FOMO, revenge trading, entrées non planifiées des pièges classiques.",
  },
  {
    icon: Brain,
    title: "Manque de discipline",
    desc: "La régularité et la rigueur sont les vraies clés de la progression.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-xs tracking-widest uppercase text-gold/70 font-medium text-center mb-4"
        >
          Le problème
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold text-cream text-center mb-14 leading-tight"
        >
          La majorité des débutants perdent{" "}
          <span className="text-gradient-gold">par manque de cadre</span>
        </motion.h2>

        {/* Manifesto quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative max-w-2xl mx-auto mb-16 text-center px-6"
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-16 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-16 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
          <p className="text-xl sm:text-2xl text-cream/80 leading-relaxed font-light italic">
            &ldquo;Tout le monde peut cliquer sur Acheter.<br />
            Personne ne t&apos;apprend à ne pas paniquer.&rdquo;
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROBLEMS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group p-6 rounded-xl bg-surface border border-white/5 hover:border-white/10 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-[#0A0A0A] border border-white/5 flex items-center justify-center mb-4 group-hover:border-white/10 transition-colors">
                  <Icon size={18} className="text-muted/60" />
                </div>
                <h3 className="text-cream font-semibold mb-2">{p.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{p.desc}</p>
              </motion.div>
            );
          })}

          {/* Card de résolution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: PROBLEMS.length * 0.08 }}
            className="relative p-6 rounded-xl bg-gradient-to-br from-gold/8 to-gold/3 border border-gold/20 flex items-center justify-center overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <p className="text-sm text-gold/90 text-center leading-relaxed font-medium">
              Ces erreurs sont évitables.<br />
              <span className="text-cream/70 font-normal">Avec la bonne méthode.</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
