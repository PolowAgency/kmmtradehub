"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, NotebookPen, User } from "lucide-react";

const NAV = [
  { label: "Home",       href: "/app/dashboard",  icon: LayoutDashboard },
  { label: "Modules",    href: "/app/modules",     icon: BookOpen },
  { label: "Communauté", href: "/app/community",   icon: Users },
  { label: "Journal",    href: "/app/journal",     icon: NotebookPen },
  { label: "Profil",     href: "/app/profile",     icon: User },
];

export function AppBottomNav({ hasNewCommunity }: { hasNewCommunity?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-white/[0.08]">
      <div className="flex items-center justify-around px-1 h-16 safe-area-pb">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-0 ${
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
      </div>
    </nav>
  );
}
