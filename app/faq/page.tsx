import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Réponses aux questions fréquentes sur KMM VIP : accès, contenu, paiement, risques du trading.",
};

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="pt-24">
        <section className="py-16 sm:py-20 px-4 sm:px-6 text-center">
          <p className="text-xs tracking-widest uppercase text-gold/70 font-medium mb-4">
            Aide
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-cream mb-4">
            Questions <span className="text-gradient-gold">fréquentes</span>
          </h1>
          <p className="text-muted max-w-lg mx-auto leading-relaxed">
            Tout ce que tu dois savoir avant de rejoindre KMM VIP.
          </p>
        </section>
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
