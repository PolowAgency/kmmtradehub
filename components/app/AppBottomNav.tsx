"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  NotebookPen,
  MoreHorizontal,
  Radio,
  MessageSquare,
  Medal,
  FileText,
  Trophy,
  User,
  LogOut,
  X,
  Shield,
  BarChart2,
  Layers,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAIN_NAV = [
  { label: "Home",      href: "/app/dashboard",  icon: LayoutDashboard },
  { label: "Modules",   href: "/app/modules",    icon: BookOpen },
  { label: "Graphique", href: "/app/chart",      icon: BarChart2 },
  { label: "Journal",   href: "/app/journal",    icon: NotebookPen },
];

const MORE_NAV = [
  { label: "Indicateurs", href: "/app/indicators",  icon: Layers },
  { label: "Checklist",   href: "/app/checklist",   icon: ClipboardList },
  { label: "Membres",     href: "/app/members",     icon: Users },
  { label: "Communauté",  href: "/app/community",   icon: MessageSquare },
  { label: "Lives",       href: "/app/live",        icon: Radio },
  { label: "Classement",  href: "/app/leaderboard", icon: Medal },
  { label: "Ressources",  href: "/app/resources",   icon: FileText },
  { label: "Résultats",   href: "/app/results",     icon: Trophy },
  { label: "Mon profil",  href: "/app/profile",     icon: User },
];

export function AppBottomNav({ hasNewCommunity, isAdmin }: { hasNewCommunity?: boolean; isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  const isMoreActive = MORE_NAV.some((item) =>
    pathname === item.href || pathname.startsWith(item.href + "/")
  );

  async function handleLogout() {
    setOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* More drawer */}
      {open && (
        <div className="md:hidden fixed bottom-16 inset-x-0 z-50 bg-surface border-t border-white/[0.08] rounded-t-2xl overflow-hidden safe-area-pb">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <p className="text-muted text-xs uppercase tracking-widest font-medium">Navigation</p>
            <button onClick={() => setOpen(false)} className="text-muted p-1">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1 px-3 pb-4">
            {MORE_NAV.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all ${
                    active
                      ? "bg-gold/10 text-gold"
                      : "text-muted hover:text-cream hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                  <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
                </Link>
              );
            })}
            {/* Admin */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all border border-dashed ${
                  pathname.startsWith("/admin")
                    ? "border-gold/30 text-gold"
                    : "border-white/[0.08] text-muted hover:text-cream"
                }`}
              >
                <Shield size={20} strokeWidth={1.8} />
                <span className="text-[10px] font-medium">Admin</span>
              </Link>
            )}

            {/* Déconnexion */}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl text-muted/50 hover:text-red-400 transition-all"
            >
              <LogOut size={20} strokeWidth={1.8} />
              <span className="text-[10px] font-medium">Déco</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-white/[0.08] safe-area-pb">
        <div className="flex items-center justify-around px-1 h-16">
          {MAIN_NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-0 ${
                  active ? "text-gold" : "text-muted"
                }`}
              >
                <span className="relative">
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                  {href === "/app/community" && hasNewCommunity && !active && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border border-surface" />
                  )}
                </span>
                <span className="text-[10px] tracking-wide font-medium truncate">{label}</span>
              </Link>
            );
          })}

          {/* Plus button */}
          <button
            onClick={() => setOpen((v) => !v)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-0 ${
              isMoreActive || open ? "text-gold" : "text-muted"
            }`}
          >
            <MoreHorizontal size={20} strokeWidth={isMoreActive || open ? 2.5 : 1.8} />
            <span className="text-[10px] tracking-wide font-medium">Plus</span>
          </button>
        </div>
      </nav>
    </>
  );
}
