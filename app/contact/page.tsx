import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez KMMTRADEHUB pour toute question sur l'offre KMM VIP.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen">
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs tracking-widest uppercase text-gold/70 font-medium mb-4">
                Nous contacter
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-cream mb-4">
                <span className="text-gradient-gold">Contact</span>
              </h1>
              <p className="text-muted leading-relaxed">
                Une question sur l&apos;offre KMM VIP ? Écris-nous, nous
                répondons dans les plus brefs délais.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
