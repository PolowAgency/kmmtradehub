import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Paiement réussi — Bienvenue dans KMM VIP",
  description: "Ton accès KMM VIP est confirmé. Bienvenue.",
};

export default function SuccesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4 py-32">
        <div className="max-w-lg w-full text-center">
          <div className="relative rounded-2xl border border-gold/20 bg-surface p-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-gold/8 rounded-full blur-3xl pointer-events-none" />
            <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent absolute top-0 left-0 right-0" />

            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={28} className="text-gold" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-cream mb-3">
                Bienvenue dans KMM VIP
              </h1>

              <p className="text-muted text-sm leading-relaxed mb-8">
                Ton paiement a été accepté. Tu vas recevoir un email avec
                les instructions pour accéder à ton espace VIP. Vérifie
                également tes spams si nécessaire.
              </p>

              <div className="space-y-3">
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-lg bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors glow-gold"
                >
                  Retour à l&apos;accueil
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-lg border border-white/10 text-muted text-sm hover:text-cream hover:border-white/20 transition-colors"
                >
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted/50 mt-6">
            Le trading comporte un risque de perte en capital.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
