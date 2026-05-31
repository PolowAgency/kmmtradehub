"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Upload,
  HelpCircle,
  BarChart3,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  MessageSquare,
  Radio,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

const NAV = [
  { label: "Dashboard",   href: "/admin",              icon: LayoutDashboard, exact: true },
  { label: "Étudiants",   href: "/admin/students",     icon: Users },
  { label: "Modules",     href: "/admin/modules",      icon: BookOpen },
  { label: "Leçons",      href: "/admin/lessons",      icon: FileText },
  { label: "Communauté",  href: "/admin/community",    icon: MessageSquare },
  { label: "Lives",       href: "/admin/live",         icon: Radio },
  { label: "Uploads",     href: "/admin/uploads",      icon: Upload },
  { label: "Quiz",        href: "/admin/quizzes",      icon: HelpCircle },
  { label: "Analytics",   href: "/admin/analytics",    icon: BarChart3 },
];

// Bottom tab bar items for mobile (max 5)
const MOBILE_NAV = [
  { label: "Dashboard",  href: "/admin",            icon: LayoutDashboard, exact: true },
  { label: "Modules",    href: "/admin/modules",    icon: BookOpen },
  { label: "Communauté", href: "/admin/community",  icon: MessageSquare },
  { label: "Lives",      href: "/admin/live",       icon: Radio },
  { label: "Plus",       href: "#more",             icon: Menu },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [moreOpen, setMoreOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
    <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-surface border-r border-white/[0.06] z-40">
      {/* Logo */}
      <div className="flex flex-col items-center justify-center h-20 border-b border-white/[0.06] shrink-0 gap-1">
        <Logo href="/admin" size="sm" />
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-400 font-semibold tracking-widest uppercase">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                active
                  ? "bg-gold/10 text-gold border border-gold/20"
                  : "text-muted hover:text-cream hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={17} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}

        <div className="pt-2">
          <Link
            href="/app/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-cream hover:bg-white/[0.04] transition-all duration-200 border border-dashed border-white/[0.08]"
          >
            <ArrowLeft size={17} />
            <span className="font-medium">Vue élève</span>
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200"
        >
          <LogOut size={17} />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>

    {/* Mobile: bottom tab bar */}
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-white/[0.06] z-50 flex items-stretch h-16 safe-area-inset-bottom">
      {MOBILE_NAV.map(({ label, href, icon: Icon, exact }) => {
        if (href === "#more") {
          return (
            <button
              key="more"
              onClick={() => setMoreOpen((v) => !v)}
              className="flex-1 flex flex-col items-center justify-center gap-1 text-muted active:text-cream transition-colors"
            >
              {moreOpen ? <X size={18} /> : <Menu size={18} />}
              <span className="text-[9px] font-medium">{label}</span>
            </button>
          );
        }
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${active ? "text-gold" : "text-muted"}`}
          >
            <Icon size={18} />
            <span className="text-[9px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>

    {/* Mobile: "More" drawer */}
    {moreOpen && (
      <div
        className="md:hidden fixed inset-0 z-40"
        onClick={() => setMoreOpen(false)}
      >
        <div
          className="absolute bottom-16 left-0 right-0 bg-surface border-t border-white/[0.08] p-4 space-y-1"
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { label: "Étudiants",  href: "/admin/students",  icon: Users },
            { label: "Leçons",     href: "/admin/lessons",   icon: FileText },
            { label: "Uploads",    href: "/admin/uploads",   icon: Upload },
            { label: "Quiz",       href: "/admin/quizzes",   icon: HelpCircle },
            { label: "Analytics",  href: "/admin/analytics", icon: BarChart3 },
            { label: "Vue élève",  href: "/app/dashboard",   icon: ArrowLeft },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMoreOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                pathname.startsWith(href) ? "bg-gold/10 text-gold border border-gold/20" : "text-muted hover:text-cream hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={17} />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
          >
            <LogOut size={17} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    )}
    </>
  );
}
