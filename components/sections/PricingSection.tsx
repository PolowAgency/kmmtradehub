"use client";

import { motion } from "framer-motion";
import { X, Check, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

const WITHOUT = [
  "Trader sur des intuitions non vérifiées",
  "Ignorer la gestion du risque",
  "Chercher des signaux miracles",
  "Subir le FOMO sur chaque mouvement",
  "Abandonner après quelques pertes",
];

const WITH = [
  "Analyser avec une méthode reproductible",
  "Sizing précis sur chaque position",
  "Un processus clair avant chaque entrée",
  "Agir avec discipline et patience",
  "Progresser même quand ça perd",
];

const INCLUDED = [
  "Contenus éducatifs structurés",
  "Analyses de marché régulières",
  "Méthode et cadre de progression",
  "Rappels de discipline",
  "Accès à l'espace membres privé",
  "Résiliable à tout moment",
];

export function PricingSection() {
  return (
    <section id="paiement" className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-xs tracking-widest uppercase text-gold/70 font-medium text-center mb-4"
        >
          L&apos;offre
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold text-cream text-center mb-14 leading-tight"
        >
          Ce qui change quand tu travailles{" "}
          <span className="text-gradient-gold">avec méthode</span>
        </motion.h2>

        {/* Comparaison avant/après */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {/* Sans KMM VIP */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-xl bg-surface border border-white/5 p-6"
          >
            <p className="text-xs tracking-widest uppercase text-muted/50 font-medium mb-5">
              Sans méthode
            </p>
            <ul className="space-y-3">
              {WITHOUT.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <X size={9} className="text-muted/50" />
                  </div>
                  <span className="text-sm text-muted/60 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Avec KMM VIP */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl bg-gradient-to-br from-gold/6 to-gold/2 border border-gold/20 p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <p className="text-xs tracking-widest uppercase text-gold/60 font-medium mb-5">
              Membres KMM VIP
            </p>
            <ul className="space-y-3">
              {WITH.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center shrink-0">
                    <Check size={9} className="text-gold" />
                  </div>
                  <span className="text-sm text-cream/80 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Price card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="relative rounded-2xl border border-gold/25 bg-surface overflow-hidden"
        >
          {/* Ligne dorée haut */}
          <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

          {/* Halo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gold/6 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

              {/* Prix + CTA */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/25 bg-gold/5 text-gold text-xs tracking-widest uppercase font-medium mb-6">
                  Accès KMM VIP
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl sm:text-6xl font-bold text-cream">50€</span>
                  <span className="text-muted text-sm">/ mois</span>
                </div>

                <p className="text-xs text-gold/60 font-medium tracking-wide mb-6">
                  Sans engagement résiliable en 1 clic
                </p>

                <p className="text-sm text-muted leading-relaxed mb-8">
                  Un abonnement mensuel pour accéder en continu aux contenus,
                  analyses et ressources de KMM VIP.
                </p>

                <Button
                  href="/api/checkout"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto text-xs tracking-widest uppercase font-bold"
                >
                  Rejoindre maintenant
                  <ArrowRight size={15} />
                </Button>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted/50">
                  <AlertTriangle size={11} className="text-gold/30 shrink-0" />
                  Le trading comporte un risque de perte en capital.
                </div>
              </div>

              {/* Ce qui est inclus */}
              <div>
                <p className="text-xs tracking-widest uppercase text-gold/60 font-medium mb-5">
                  Ce qui est inclus
                </p>
                <ul className="space-y-3">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center shrink-0">
                        <Check size={9} className="text-gold" />
                      </div>
                      <span className="text-sm text-cream/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
