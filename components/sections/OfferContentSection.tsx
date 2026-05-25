"use client";

import { motion } from "framer-motion";
import { BookOpen, BarChart3, Target, Shield, Lock, Bell } from "lucide-react";

const OFFER_ITEMS = [
  {
    icon: BookOpen,
    title: "Contenus pédagogiques",
    desc: "Des ressources structurées pour comprendre les fondamentaux du trading : analyse, psychologie, gestion du capital.",
    badge: "Éducation",
  },
  {
    icon: BarChart3,
    title: "Analyses de marché",
    desc: "Des lectures de marché régulières pour affiner ta compréhension des dynamiques de prix.",
    badge: "Analyse",
  },
  {
    icon: Target,
    title: "Méthode de travail",
    desc: "Un process clair et reproductible pour structurer tes séances d'analyse et tes prises de décision.",
    badge: "Méthode",
  },
  {
    icon: Shield,
    title: "Gestion du risque",
    desc: "Les règles essentielles pour protéger ton capital et survivre sur le long terme.",
    badge: "Risque",
  },
  {
    icon: Lock,
    title: "Accès privé",
    desc: "Un espace dédié pour les membres KMM VIP avec accès aux contenus exclusifs.",
    badge: "Exclusif",
  },
  {
    icon: Bell,
    title: "Rappels de discipline",
    desc: "Des rappels réguliers pour maintenir une approche rigoureuse et éviter les biais comportementaux.",
    badge: "Discipline",
  },
];

export function OfferContentSection({ first = false }: { first?: boolean }) {
  return (
    <section className={`${first ? "pt-10 pb-20 sm:pt-12 sm:pb-28" : "py-20 sm:py-28"} px-4 sm:px-6`}>
      <div className="max-w-5xl mx-auto">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-xs tracking-widest uppercase text-gold/70 font-medium text-center mb-4"
        >
          Ce que tu obtiens
        </motion.p>

        {/* Titre */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold text-cream text-center mb-4 leading-tight"
        >
          Le contenu de{" "}
          <span className="text-gradient-gold">KMM VIP</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-muted text-center max-w-xl mx-auto mb-14 leading-relaxed"
        >
          Chaque élément est pensé pour construire une progression sérieuse,
          pas pour impressionner.
        </motion.p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OFFER_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="group p-6 rounded-xl bg-surface border border-white/5 hover:border-gold/20 transition-all duration-300 relative overflow-hidden"
              >
                {/* Subtle corner glow */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gold/3 rounded-bl-full pointer-events-none" />

                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#0A0A0A] border border-white/5 flex items-center justify-center group-hover:border-gold/20 transition-colors">
                    <Icon size={18} className="text-gold/70" />
                  </div>
                  <span className="text-[10px] tracking-widest uppercase text-gold/50 font-medium">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-cream font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
