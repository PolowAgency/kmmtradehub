import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page introuvable" };

export default function AppNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 px-4">
      <p className="text-gold text-6xl font-black">404</p>
      <h1 className="text-cream text-xl font-bold">Page introuvable</h1>
      <p className="text-muted text-sm">Cette page n'existe pas ou tu n'y as pas accès.</p>
      <Link
        href="/app/dashboard"
        className="px-5 py-2.5 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors"
      >
        Tableau de bord
      </Link>
    </div>
  );
}
