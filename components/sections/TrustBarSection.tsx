"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

const STATS = [
  { end: 300, suffix: "+", label: "Membres dans la communauté" },
  { end: 3, suffix: " ans", label: "D'expérience sur les marchés" },
  { end: 50, suffix: "€", label: "Par mois, sans engagement" },
  { end: 0, suffix: "", label: "Promesse de gain ou de résultat" },
];

function AnimatedNumber({ end, suffix }: { end: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    if (end === 0) { setCount(0); return; }
    const duration = 1400;
    const steps = 55;
    const increment = end / steps;
    let current = 0;
    const id = setInterval(() => {
      current += increment;
      if (current >= end) { setCount(end); clearInterval(id); }
      else setCount(Math.round(current));
    }, duration / steps);
    return () => clearInterval(id);
  }, [inView, end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function TrustBarSection() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#0C0C0C] border-y border-white/[0.04]">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gold mb-2 tabular-nums">
                <AnimatedNumber end={stat.end} suffix={stat.suffix} />
              </div>
              <div className="h-px w-8 bg-gold/20 mx-auto mb-3" />
              <div className="text-xs text-muted/60 leading-snug max-w-[120px] mx-auto">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
