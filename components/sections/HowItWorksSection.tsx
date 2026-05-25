"use client";

import { motion } from "framer-motion";
import { CreditCard, Zap, TrendingUp } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: CreditCard,
    title: "Tu t'abonnes",
    desc: "Un paiement sécurisé via Stripe. 50€/mois, sans engagement, résiliable à tout moment en un clic.",
    highlight: "2 minutes",
  },
  {
    number: "02",
    icon: Zap,
    title: "Tu accèdes immédiatement",
    desc: "Dès le paiement confirmé, tu reçois ton email d'accès à l'espace privé KMM VIP. Pas d'attente.",
    highlight: "Accès instantané",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Tu progresses avec méthode",
    desc: "Contenus, analyses, rappels de discipline — tout est là pour t'aider à construire une routine sérieuse.",
    highlight: "Dès maintenant",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-xs tracking-widest uppercase text-gold/70 font-medium text-center mb-4"
        >
          Simple et rapide
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold text-cream text-center mb-12 leading-tight"
        >
          Rejoindre KMM VIP en{" "}
          <span className="text-gradient-gold">3 étapes</span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
          {/* Connecting line on desktop */}
          <div className="hidden sm:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20" />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
                className="flex flex-col items-center text-center relative"
              >
                {/* Step circle */}
                <div className="relative w-20 h-20 mb-5">
                  <div className="absolute inset-0 rounded-full bg-gold/8 border border-gold/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon size={24} className="text-gold" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#0A0A0A]">{i + 1}</span>
                  </div>
                </div>

                <span className="inline-block px-3 py-0.5 rounded-full bg-gold/10 text-gold text-[10px] tracking-widest uppercase font-semibold mb-3">
                  {step.highlight}
                </span>

                <h3 className="text-cream font-semibold text-base mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed max-w-[220px]">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
