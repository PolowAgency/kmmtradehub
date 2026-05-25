"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden px-4 pb-6 pt-3 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent"
        >
          <Link
            href="/offre#paiement"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gold text-[#0A0A0A] font-bold text-sm glow-gold tracking-wide"
          >
            Rejoindre KMM VIP — 50€/mois
            <ArrowRight size={15} />
          </Link>
          <p className="text-center text-[10px] text-muted/50 mt-2">
            Sans engagement · Résiliable en 1 clic
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
