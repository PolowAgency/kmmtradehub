import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { type ReactNode } from "react";

interface LegalPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function LegalPage({ title, subtitle, children }: LegalPageProps) {
  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen">
        <section className="py-12 px-4 sm:px-6 text-center border-b border-white/5">
          <p className="text-xs tracking-widest uppercase text-gold/70 font-medium mb-3">
            Informations légales
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-cream">{title}</h1>
          {subtitle && (
            <p className="text-muted text-sm mt-3 max-w-lg mx-auto">{subtitle}</p>
          )}
        </section>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 prose-legal">
          <div className="space-y-8 text-sm text-muted leading-relaxed [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-cream [&_h2]:mb-3 [&_h2]:mt-8 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-cream/80 [&_h3]:mb-2 [&_h3]:mt-5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-gold/70 [&_a:hover]:text-gold">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
