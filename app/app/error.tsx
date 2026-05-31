"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 px-4">
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <span className="text-xl">⚠️</span>
      </div>
      <h1 className="text-cream text-xl font-bold">Quelque chose s'est mal passé</h1>
      <p className="text-muted text-sm">Une erreur inattendue s'est produite.</p>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors"
        >
          Réessayer
        </button>
        <Link
          href="/app/dashboard"
          className="px-4 py-2.5 rounded-xl border border-white/[0.12] text-cream text-sm hover:border-gold/30 transition-colors"
        >
          Tableau de bord
        </Link>
      </div>
    </div>
  );
}
