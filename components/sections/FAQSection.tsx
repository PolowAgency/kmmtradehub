"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Est-ce adapté aux débutants ?",
    a: "Oui. KMM VIP est pensé pour ceux qui souhaitent apprendre les bases du trading de manière structurée. Aucune expérience préalable n'est requise, mais une volonté réelle d'apprendre est indispensable.",
  },
  {
    q: "Est-ce que les gains sont garantis ?",
    a: "Non, et ce serait malhonnête de le prétendre. Le trading comporte des risques de perte en capital. KMM VIP est une offre éducative, pas un service de conseil en investissement. Aucun résultat financier n'est garanti.",
  },
  {
    q: "Comment accéder à KMM VIP ?",
    a: "Clique sur le bouton 'Rejoindre KMM VIP', procède au paiement sécurisé via Stripe, et tu reçois immédiatement un accès à l'espace membres par email.",
  },
  {
    q: "Comment fonctionne l'abonnement ?",
    a: "L'abonnement est à 50€ par mois, sans engagement. Le paiement est traité de façon sécurisée via Stripe. Tu peux résilier à tout moment en un clic depuis ton espace membres.",
  },
  {
    q: "Que contient exactement l'offre KMM VIP ?",
    a: "KMM VIP inclut des contenus éducatifs structurés, des analyses de marché régulières, une méthode de travail claire, des ressources sur la gestion du risque, un accès à l'espace privé membres et des rappels de discipline.",
  },
  {
    q: "Le trading est-il risqué ?",
    a: "Oui. Le trading sur les marchés financiers comporte un risque significatif de perte en capital. Ne tradez jamais avec de l'argent que vous ne pouvez pas vous permettre de perdre. KMM VIP existe précisément pour t'aider à comprendre et gérer ces risques.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-xs tracking-widest uppercase text-gold/70 font-medium text-center mb-4"
        >
          Questions fréquentes
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold text-cream text-center mb-12 leading-tight"
        >
          Tu as des{" "}
          <span className="text-gradient-gold">questions ?</span>
        </motion.h2>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`rounded-xl border bg-surface overflow-hidden transition-colors duration-300 ${
                open === i ? "border-gold/20" : "border-white/5"
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors group"
                aria-expanded={open === i}
              >
                <span className="text-sm sm:text-base text-cream font-medium pr-4">
                  {item.q}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gold/50 shrink-0 transition-transform duration-300 ${
                    open === i ? "rotate-180 text-gold" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-5 border-t border-white/5">
                      <p className="text-sm text-muted leading-relaxed pt-4">{item.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
