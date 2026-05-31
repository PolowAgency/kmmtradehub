"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Offre", href: "/offre" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const STUDENT_LINK = { label: "Espace élèves", href: "/login" };

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-20">

        {/* Logo */}
        <Logo href="/" size="sm" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs tracking-widest uppercase font-medium transition-colors duration-200 ${
                pathname === link.href
                  ? "text-gold"
                  : "text-muted hover:text-cream"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={STUDENT_LINK.href}
            className="text-xs tracking-widest uppercase font-medium text-muted hover:text-cream transition-colors px-4 py-2.5 rounded-full border border-white/[0.08] hover:border-white/[0.18]"
          >
            {STUDENT_LINK.label}
          </Link>
          <Link
            href="/offre#paiement"
            className="text-xs tracking-widest uppercase font-semibold text-[#0A0A0A] bg-gold hover:bg-gold-light transition-colors px-6 py-2.5 rounded-full glow-gold"
          >
            Rejoindre KMM VIP
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden text-muted hover:text-cream transition-colors p-1"
          aria-label="Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0A0A0A]/98 backdrop-blur-xl border-t border-white/[0.06]">
          <nav className="flex flex-col px-4 pt-4 pb-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`py-4 border-b border-white/[0.05] text-sm tracking-widest uppercase transition-colors ${
                  pathname === link.href ? "text-gold" : "text-muted hover:text-cream"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 py-5 space-y-3">
            <Link
              href={STUDENT_LINK.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-full py-3.5 text-xs tracking-widest uppercase font-medium text-cream border border-white/[0.12] rounded-lg hover:border-white/[0.25] transition-colors"
            >
              {STUDENT_LINK.label}
            </Link>
            <Link
              href="/offre#paiement"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-full py-4 text-xs tracking-widest uppercase font-semibold text-[#0A0A0A] bg-gold glow-gold"
            >
              Rejoindre KMM VIP
            </Link>
            <p className="text-center text-[10px] text-muted/50 mt-1 tracking-wider">
              50€ / mois · Sans engagement
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
