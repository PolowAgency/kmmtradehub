"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BookOpen, Trophy, Radio, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Notif = {
  id: string;
  type: "post" | "badge" | "live";
  label: string;
  sub: string;
  href: string;
  at: string;
  read: boolean;
};

const STORAGE_KEY = "kmm_notifs_read";

export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setReadIds(new Set(JSON.parse(stored)));
  }, []);

  useEffect(() => {
    async function fetchNotifs() {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

      const [{ data: posts }, { data: badges }, { data: lives }] = await Promise.all([
        supabase.from("community_posts").select("id, title, created_at").eq("is_published", true).gte("created_at", sevenDaysAgo).order("created_at", { ascending: false }).limit(5),
        supabase.from("student_badges").select("id, earned_at, badges(name, icon)").eq("student_id", userId).gte("earned_at", sevenDaysAgo).order("earned_at", { ascending: false }).limit(5),
        supabase.from("lives").select("id, title, scheduled_at, status").in("status", ["scheduled", "live"]).order("scheduled_at", { ascending: false }).limit(3),
      ]);

      const all: Notif[] = [
        ...(badges ?? []).map((b) => {
          const badge = b.badges as unknown as { name: string; icon: string } | null;
          return {
            id: `badge_${b.id}`,
            type: "badge" as const,
            label: `Badge débloqué : ${badge?.name ?? ""}`,
            sub: badge?.icon ?? "🏆",
            href: "/app/profile",
            at: b.earned_at,
            read: false,
          };
        }),
        ...(lives ?? []).map((l) => ({
          id: `live_${l.id}`,
          type: "live" as const,
          label: l.status === "live" ? `🔴 En direct : ${l.title}` : `Live prévu : ${l.title}`,
          sub: l.status === "live" ? "Rejoindre maintenant" : new Date(l.scheduled_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
          href: `/app/live/${l.id}`,
          at: l.scheduled_at,
          read: false,
        })),
        ...(posts ?? []).map((p) => ({
          id: `post_${p.id}`,
          type: "post" as const,
          label: `Nouveau post : ${p.title}`,
          sub: new Date(p.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
          href: `/app/community/${p.id}`,
          at: p.created_at,
          read: false,
        })),
      ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

      setNotifs(all);
    }
    fetchNotifs();
  }, [userId]);

  function markAllRead() {
    const ids = new Set(notifs.map((n) => n.id));
    setReadIds(ids);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unread = notifs.filter((n) => !readIds.has(n.id)).length;

  const ICON = { post: BookOpen, badge: Trophy, live: Radio };
  const COLOR = { post: "text-blue-400 bg-blue-400/10", badge: "text-gold bg-gold/10", live: "text-red-400 bg-red-400/10" };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen((v) => !v); if (!open) markAllRead(); }}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-white/[0.08] text-muted hover:text-cream hover:border-white/[0.15] transition-all"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border border-surface text-[9px] font-black text-white flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-surface border border-white/[0.08] rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <p className="text-cream text-sm font-semibold">Notifications</p>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-cream"><X size={14} /></button>
          </div>
          {notifs.length === 0 ? (
            <div className="py-10 text-center">
              <Bell size={24} className="text-muted/30 mx-auto mb-2" />
              <p className="text-muted text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
              {notifs.map((n) => {
                const Icon = ICON[n.type];
                const color = COLOR[n.type];
                const isRead = readIds.has(n.id);
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-all ${isRead ? "opacity-60" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                      {n.type === "badge" ? <span className="text-base">{n.sub}</span> : <Icon size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-xs font-medium leading-snug">{n.label}</p>
                      {n.type !== "badge" && <p className="text-muted/60 text-[10px] mt-0.5">{n.sub}</p>}
                    </div>
                    {!isRead && <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
