import Link from "next/link";
import { TrendingUp } from "lucide-react";

const LEGAL_LINKS = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "CGV", href: "/cgv" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mb-10">
          {/* Brand */}
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-bold tracking-widest text-gradient-gold">KMM</span>
              <span className="text-lg font-bold tracking-widest text-cream/80">TRADEHUB</span>
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Une approche structurée et sérieuse du trading. Méthode, discipline,
              gestion du risque.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-gold/80 mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Accueil", href: "/" },
                { label: "Offre KMM VIP", href: "/offre" },
                { label: "FAQ", href: "/faq" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-cream transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Réseaux + légal */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-gold/80 mb-4">
              Réseaux sociaux
            </h3>
            <div className="flex gap-3 mb-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-muted hover:text-gold hover:border-gold/30 transition-all text-xs font-bold"
                aria-label="Instagram"
              >
                IG
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-muted hover:text-gold hover:border-gold/30 transition-all text-xs font-bold"
                aria-label="TikTok"
              >
                TK
              </a>
            </div>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted hover:text-cream transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer + copyright */}
        <div className="border-t border-white/5 pt-8 space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-surface border border-gold/10">
            <TrendingUp size={14} className="text-gold/60 mt-0.5 shrink-0" />
            <p className="text-xs text-muted leading-relaxed">
              <span className="text-gold/80 font-medium">Avertissement sur les risques :</span>{" "}
              Le trading sur les marchés financiers comporte un risque significatif de perte en
              capital. Les performances passées ne préjugent pas des performances futures. KMM VIP
              est une offre éducative et ne constitue pas un conseil en investissement. Ne tradez
              jamais avec de l&apos;argent que vous ne pouvez pas vous permettre de perdre.
            </p>
          </div>
          <p className="text-xs text-muted/50 text-center">
            © {new Date().getFullYear()} KMMTRADEHUB. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
