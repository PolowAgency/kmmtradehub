import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OfferContentSection } from "@/components/sections/OfferContentSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "Offre KMM VIP",
  description:
    "Découvrez le contenu de l'offre KMM VIP : contenus éducatifs, analyses, méthode de trading, gestion du risque et accompagnement. 50€/mois sans engagement.",
};

export default function OffrePage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <OfferContentSection first />
        <BenefitsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
