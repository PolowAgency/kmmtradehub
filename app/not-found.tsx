import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <p className="text-gold text-7xl font-black">404</p>
        <h1 className="text-cream text-2xl font-bold">Page introuvable</h1>
        <p className="text-muted text-sm leading-relaxed">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/app/dashboard"
            className="px-5 py-2.5 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors"
          >
            Tableau de bord
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl border border-white/[0.12] text-cream text-sm hover:border-gold/30 transition-colors"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
