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
  Globe,
  MessageSquare,
  Radio,
  NotebookPen,
  Medal,
  Flame,
  BarChart2,
  Layers,
  ClipboardList,
  PhoneCall,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const NAV = [
  { label: "Dashboard",    href: "/app/dashboard",    icon: LayoutDashboard },
  { label: "Modules",      href: "/app/modules",      icon: BookOpen },
  { label: "Graphique",    href: "/app/chart",        icon: BarChart2 },
  { label: "Indicateurs",  href: "/app/indicators",   icon: Layers },
  { label: "Checklist",    href: "/app/checklist",    icon: ClipboardList },
  { label: "Session 1:1",  href: "/app/calls",        icon: PhoneCall },
  { label: "Membres",      href: "/app/members",      icon: Users },
  { label: "Messages",     href: "/app/messages",     icon: MessageSquare },
  { label: "Communauté",   href: "/app/community",    icon: Globe },
  { label: "Chat",         href: "/app/chat",         icon: MessageSquare },
  { label: "Lives",        href: "/app/live",         icon: Radio },
  { label: "Journal",      href: "/app/journal",      icon: NotebookPen },
  { label: "Classement",   href: "/app/leaderboard",  icon: Medal },
  { label: "Ressources",   href: "/app/resources",    icon: FileText },
  { label: "Résultats",    href: "/app/results",      icon: Trophy },
  { label: "Mon profil",   href: "/app/profile",      icon: User },
];

export function AppSidebar({
  profile,
  hasNewCommunity,
  completedLessons = 0,
  totalLessons = 0,
  currentStreak = 0,
  userId,
}: {
  profile: Profile | null;
  hasNewCommunity?: boolean;
  completedLessons?: number;
  totalLessons?: number;
  currentStreak?: number;
  userId?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-surface border-r border-white/[0.06] z-40">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-white/[0.06] shrink-0">
        <Logo href="/app/dashboard" size="sm" />
      </div>

      {/* Profile + XP */}
      <div className="px-4 py-4 border-b border-white/[0.06] space-y-3">
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-bold text-sm shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-cream text-xs font-semibold truncate">{profile?.full_name ?? "Élève"}</p>
            <p className="text-muted text-[10px] truncate">{profile?.email}</p>
          </div>
        </div>

        {/* XP bar compact */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-muted text-[10px]">{completedLessons} / {totalLessons} leçons</span>
            <span className="text-gold text-[10px] font-bold">{pct}%</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, #9A7B10, #D4AF37, #E8CC6A)" }}
            />
          </div>
        </div>

        {/* Streak badge */}
        {currentStreak > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-500/8 border border-orange-500/15 w-fit">
            <Flame size={12} className="text-orange-400" />
            <span className="text-orange-400 text-[11px] font-semibold">{currentStreak} jour{currentStreak > 1 ? "s" : ""} de streak</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const isCommunity = href === "/app/community";

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
              <span className="relative shrink-0">
                <Icon size={17} />
                {isCommunity && hasNewCommunity && !active && (
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
