"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    initials: "SH",
    name: "Suhayl H",
    tag: "Acheteur vérifié",
    title: "Masterclass",
    quote: "Au top ! On change de niveau tout simplement. Tu régale frero ! Allez-y yeux fermés les gars.",
  },
  {
    initials: "MK",
    name: "Mohyeddin K",
    tag: "Acheteur vérifié",
    title: "Indispensable pour trader.",
    quote: "Un outil puissant et complet qui te donne une vision claire de la situation à tout moment. Vraiment top !",
  },
  {
    initials: "TV",
    name: "Thomas V",
    tag: "Acheteur vérifié",
    title: "Sérieux. Pour personne motivée.",
    quote: "Sérieux, pas d'arnaque.",
  },
  {
    initials: "MC",
    name: "Mickael C",
    tag: "Acheteur vérifié",
    title: "Ravie",
    quote: "Je recommande.",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className="text-gold fill-gold" />
      ))}
    </div>
  );
}

export function SocialProofSection() {
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
          Avis vérifiés
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold text-cream text-center mb-4 leading-tight"
        >
          Ce que disent les membres de{" "}
          <span className="text-gradient-gold">KMM VIP</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-xs text-muted/40 text-center mb-12 italic"
        >
          * Avis réels d&apos;acheteurs vérifiés. Aucune performance financière n&apos;est mentionnée.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.09 }}
              className="group p-7 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-gold/15 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/0 to-transparent group-hover:via-gold/30 transition-all duration-500" />

              <Stars />

              <p className="text-cream font-semibold text-sm mb-2">{t.title}</p>
              <p className="text-cream/65 text-sm leading-relaxed mb-5 italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-gold tracking-wider">{t.initials}</span>
                </div>
                <div>
                  <p className="text-xs text-cream/70 font-medium">{t.name}</p>
                  <p className="text-[10px] text-muted/50">{t.tag}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
