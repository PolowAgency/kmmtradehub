import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import "./globals.css";

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "KMMTRADEHUB Apprends à trader avec méthode et discipline",
    template: "%s | KMMTRADEHUB",
  },
  description:
    "KMM VIP t'aide à progresser sur les marchés avec une approche structurée, sérieuse et sans promesse irréaliste. Gestion du risque, discipline, méthode.",
  keywords: [
    "trading",
    "formation trading",
    "KMM VIP",
    "gestion du risque",
    "trading méthode",
    "apprendre à trader",
    "discipline trading",
  ],
  authors: [{ name: "KMMTRADEHUB" }],
  creator: "KMMTRADEHUB",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://kmmtradehub.com",
    siteName: "KMMTRADEHUB",
    title: "KMMTRADEHUB Apprends à trader avec méthode et discipline",
    description:
      "KMM VIP : une approche structurée du trading. Gestion du risque, discipline, méthode de progression.",
  },
  twitter: {
    card: "summary_large_image",
    title: "KMMTRADEHUB Apprends à trader avec méthode",
    description:
      "KMM VIP : une approche structurée du trading sans promesse irréaliste.",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://kmmtradehub.com"
  ),
  icons: {
    icon: "/favicon-32.png",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${leagueSpartan.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0A0A0A] text-cream">
        {children}
      </body>
    </html>
  );
}
