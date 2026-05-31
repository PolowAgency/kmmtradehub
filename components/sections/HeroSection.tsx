"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

const TW_WORDS = ["méthode.", "discipline.", "rigueur.", "constance."];

export function HeroSection() {
  const twRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let wi = 0, ci = 0, deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const type = () => {
      const el = twRef.current;
      if (!el) return;
      const word = TW_WORDS[wi];

      if (!deleting) {
        el.textContent = word.slice(0, ci + 1);
        ci++;
        if (ci === word.length) {
          deleting = true;
          timer = setTimeout(type, 1900);
          return;
        }
      } else {
        el.textContent = word.slice(0, ci - 1);
        ci--;
        if (ci === 0) {
          deleting = false;
          wi = (wi + 1) % TW_WORDS.length;
        }
      }
      timer = setTimeout(type, deleting ? 55 : 105);
    };

    timer = setTimeout(type, 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 pt-20 pb-16">

      {/* Image de fond */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-reference.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          style={{ filter: "brightness(0.42) saturate(0.84) contrast(1.02)" }}
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.3) 36%, rgba(10,10,10,0.93) 100%)",
        }} />
      </div>

      {/* Grille subtile */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(212,175,55,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.025) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      {/* Halo or en haut */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[280px] pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.10) 0%, transparent 70%)",
      }} />

      {/* Contenu */}
      <div className="relative z-10 w-full max-w-4xl mx-auto text-center">

        {/* H1 avec typewriter */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[clamp(2.4rem,7vw,5.5rem)] font-bold text-cream leading-[1.08] tracking-tight mb-5"
        >
          Le trading,<br />
          c&apos;est une question<br />
          de{" "}
          <span className="inline-block min-w-[1ch]">
            <span ref={twRef} className="text-gradient-gold" />
            <span className="tw-cursor" />
          </span>
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="text-base sm:text-lg text-muted max-w-xl mx-auto leading-relaxed mb-10"
        >
          KMM VIP t&apos;accompagne avec une approche structurée, sérieuse et sans promesse
          irréaliste. Parce que la rigueur est la seule vraie edge.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-7"
        >
          <Button href="/offre#paiement" variant="primary" size="lg" className="text-xs tracking-widest uppercase font-bold">
            Rejoindre KMM VIP
            <ArrowRight size={15} />
          </Button>
          <Button href="/offre" variant="secondary" size="lg" className="text-xs tracking-widest uppercase">
            Voir l&apos;offre
          </Button>
        </motion.div>

        {/* PWA badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.62 }}
          className="flex items-center justify-center gap-2 mb-3"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-muted/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="" className="w-4 h-4 rounded-sm" />
            Disponible sur mobile sans App Store
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex items-center justify-center gap-2 text-[11px] text-muted/40"
        >
          <AlertTriangle size={11} className="text-gold/25 shrink-0" />
          Le trading comporte un risque de perte en capital.
        </motion.p>

        {/* Stats bas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="mt-16 pt-8 border-t border-white/[0.05] grid grid-cols-3 gap-4 max-w-sm mx-auto"
        >
          {[
            { val: "50€", sub: "/mois · sans engagement" },
            { val: "0", sub: "promesse de gain" },
            { val: "100%", sub: "approche éducative" },
          ].map((s) => (
            <div key={s.sub} className="text-center">
              <div className="text-2xl font-bold text-gold mb-1">{s.val}</div>
              <div className="text-[10px] text-muted/50 leading-tight">{s.sub}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
