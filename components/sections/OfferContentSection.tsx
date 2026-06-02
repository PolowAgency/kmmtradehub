"use client";

import { motion } from "framer-motion";
import { GraduationCap, NotebookPen, ListChecks, BarChart2, Users, Trophy } from "lucide-react";

const OFFER_ITEMS = [
  {
    icon: GraduationCap,
    title: "Modules & leçons structurés",
    desc: "Une progression séquentielle verrouillée du débutant à l'avancé. Chaque leçon se termine par un quiz pour valider tes acquis.",
    badge: "Formation",
  },
  {
    icon: NotebookPen,
    title: "Journal de trading",
    desc: "Enregistre chaque trade : direction, R:R, PnL, émotion, screenshot. Import direct depuis MT5 et export CSV.",
    badge: "Suivi",
  },
  {
    icon: ListChecks,
    title: "Checklist pre-trade XAUUSD",
    desc: "5 sections complètes : sessions Or, analyse HTF/LTF, indicateurs KMM, setup & gestion, psychologie. Valide chaque setup avant d'entrer.",
    badge: "Méthode",
  },
  {
    icon: BarChart2,
    title: "Bibliothèque d'indicateurs",
    desc: "15+ indicateurs KMM documentés avec settings recommandés, signaux à surveiller et guide d'installation MT5 étape par étape.",
    badge: "Outils",
  },
  {
    icon: Users,
    title: "Communauté & Lives",
    desc: "Posts, chat en temps réel, messagerie privée, annuaire membres. Sessions live avec replays et agenda des prochains streams.",
    badge: "Communauté",
  },
  {
    icon: Trophy,
    title: "Progression & gamification",
    desc: "Badges à débloquer, streaks quotidiennes, barre XP et leaderboard. Ta progression devient visible et motivante.",
    badge: "Progression",
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
