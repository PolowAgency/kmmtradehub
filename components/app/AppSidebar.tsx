"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  User,
  LogOut,
  Shield,
  Trophy,
  Users,
  MessageSquare,
  Radio,
  NotebookPen,
  Medal,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const NAV = [
  { label: "Dashboard",   href: "/app/dashboard",    icon: LayoutDashboard },
  { label: "Modules",     href: "/app/modules",       icon: BookOpen },
  { label: "Communauté",  href: "/app/community",     icon: Users },
  { label: "Chat",        href: "/app/chat",          icon: MessageSquare },
  { label: "Lives",       href: "/app/live",          icon: Radio },
  { label: "Journal",     href: "/app/journal",       icon: NotebookPen },
  { label: "Classement",  href: "/app/leaderboard",   icon: Medal },
  { label: "Ressources",  href: "/app/resources",     icon: FileText },
  { label: "Résultats",   href: "/app/results",       icon: Trophy },
  { label: "Mon profil",  href: "/app/profile",       icon: User },
];

export function AppSidebar({ profile, hasNewCommunity }: { profile: Profile | null; hasNewCommunity?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-surface border-r border-white/[0.06] z-40">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-white/[0.06] shrink-0">
        <Logo href="/app/dashboard" size="sm" />
      </div>

      {/* Profile */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-surface-2">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-semibold text-sm shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-cream text-xs font-medium truncate">{profile?.full_name ?? "Élève"}</p>
            <p className="text-muted text-[10px] truncate">{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
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
              <span className="relative">
                <Icon size={17} />
                {href === "/app/community" && hasNewCommunity && !active && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border border-surface" />
                )}
              </span>
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}

        {profile?.role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-cream hover:bg-white/[0.04] transition-all duration-200 mt-2 border border-dashed border-white/[0.08]"
          >
            <Shield size={17} />
            <span className="font-medium">Admin</span>
          </Link>
        )}
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
  );
}
