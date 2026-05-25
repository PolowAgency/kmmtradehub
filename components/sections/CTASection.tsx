"use client";

import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">

      {/* Fond dégradé or */}
      <div className="absolute inset-0 bg-[#0A0A0A]" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,175,55,0.10) 0%, transparent 70%)",
      }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      {/* Grille */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(212,175,55,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.02) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/40" />
          <span className="text-[10px] tracking-[0.35em] uppercase text-gold/60 font-medium">
            Prêt à progresser ?
          </span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/40" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-cream mb-6 leading-[1.05] tracking-tight"
        >
          Arrête de trader<br />
          <span className="text-gradient-gold">à l&apos;aveugle.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-muted leading-relaxed mb-10 max-w-xl mx-auto"
        >
          50€/mois pour accéder à une méthode structurée, des contenus sérieux
          et un cadre pour progresser. Sans promesse de gains. Sans bullshit.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <Button
            href="/offre#paiement"
            variant="primary"
            size="lg"
            className="text-xs tracking-widest uppercase font-bold"
          >
            Accéder à KMM VIP
            <ArrowRight size={15} />
          </Button>
          <Button href="/faq" variant="ghost" size="lg" className="text-xs tracking-widest uppercase">
            Questions fréquentes
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-center gap-2 text-[11px] text-muted/40"
        >
          <AlertTriangle size={11} className="text-gold/25 shrink-0" />
          Le trading comporte un risque de perte en capital.
        </motion.p>
      </div>
    </section>
  );
}
