import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { XCircle, ArrowRight, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Paiement annulé",
  description: "Ton paiement n'a pas abouti. Réessaie ou contacte-nous.",
};

export default function EchecPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4 py-32">
        <div className="max-w-lg w-full text-center">
          <div className="rounded-2xl border border-white/10 bg-surface p-10">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <XCircle size={28} className="text-red-400" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-cream mb-3">
              Paiement annulé
            </h1>

            <p className="text-muted text-sm leading-relaxed mb-8">
              Ton paiement n&apos;a pas été finalisé. Aucun montant n&apos;a été
              débité. Tu peux réessayer ou nous contacter si tu rencontres
              un problème.
            </p>

            <div className="space-y-3">
              <Link
                href="/offre#paiement"
                className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-lg bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors glow-gold"
              >
                <RefreshCw size={14} />
                Réessayer
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-lg border border-white/10 text-muted text-sm hover:text-cream hover:border-white/20 transition-colors"
              >
                Contacter le support
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
