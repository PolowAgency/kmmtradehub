"use client";

import { motion } from "framer-motion";
import { BarChart3, Clock, Shield } from "lucide-react";

const CREDENTIALS = [
  { icon: BarChart3, label: "Trader actif sur les marchés" },
  { icon: Clock, label: "Plusieurs années d'expérience documentée" },
  { icon: Shield, label: "Approche fondée sur la gestion du risque" },
];

export function CreatorSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-gold/15">
              <div
                className="w-full aspect-[4/5] flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #0F0F0F 0%, #151508 60%, #0F0F0F 100%)" }}
              >
                <div className="text-center">
                  <div className="w-28 h-28 rounded-full bg-gold/8 border-2 border-gold/20 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl font-bold text-gradient-gold">K</span>
                  </div>
                  <p className="text-xs text-muted/40 tracking-widest uppercase">Photo à venir</p>
                </div>
              </div>

              {/* Coins dorés */}
              <div className="absolute top-0 left-0 w-16 h-16">
                <div className="absolute top-4 left-4 w-8 h-px bg-gold/40" />
                <div className="absolute top-4 left-4 h-8 w-px bg-gold/40" />
              </div>
              <div className="absolute bottom-0 right-0 w-16 h-16">
                <div className="absolute bottom-4 right-4 w-8 h-px bg-gold/40" />
                <div className="absolute bottom-4 right-4 h-8 w-px bg-gold/40" />
              </div>
            </div>
          </motion.div>

          {/* Texte */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-xs tracking-widest uppercase text-gold/70 font-medium mb-4">
              Qui je suis
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold text-cream mb-6 leading-tight">
              Une approche construite sur{" "}
              <span className="text-gradient-gold">l&apos;expérience réelle</span>
            </h2>

            <p className="text-muted leading-relaxed mb-5">
              KMM VIP n&apos;est pas une formation théorique créée par quelqu&apos;un
              qui n&apos;a jamais tradé. C&apos;est le résultat d&apos;années à travailler
              les marchés, à faire des erreurs, à les analyser et à construire
              une méthode qui tient sur le long terme.
            </p>

            <p className="text-muted leading-relaxed mb-8">
              L&apos;objectif est simple : te donner le cadre que j&apos;aurais
              voulu avoir quand j&apos;ai commencé. Pas des promesses une méthode.
            </p>

            <div className="space-y-3 mb-8">
              {CREDENTIALS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold/8 border border-gold/15 flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-gold" />
                    </div>
                    <span className="text-sm text-cream/75">{item.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Citation */}
            <div className="relative p-5 rounded-xl bg-surface border border-gold/10 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              <p className="text-sm text-muted/70 leading-relaxed italic">
                &ldquo;Je ne vends pas un raccourci vers la richesse. Je partage
                un cadre de travail sérieux pour ceux qui veulent progresser
                avec discipline.&rdquo;
              </p>
              <p className="text-xs text-gold/50 font-medium mt-3"> KMM, créateur de KMM VIP</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
