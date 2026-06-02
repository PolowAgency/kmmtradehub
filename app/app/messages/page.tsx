import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Récupérer toutes les conversations (dernier message par interlocuteur)
  const { data: sent } = await supabase
    .from("direct_messages")
    .select("id, content, created_at, read_at, recipient_id, profiles!direct_messages_recipient_id_fkey(id, full_name)")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false });

  const { data: received } = await supabase
    .from("direct_messages")
    .select("id, content, created_at, read_at, sender_id, profiles!direct_messages_sender_id_fkey(id, full_name)")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false });

  // Regrouper par interlocuteur, garder le dernier message
  const convMap = new Map<string, { id: string; name: string; lastMsg: string; at: string; unread: boolean }>();

  (sent ?? []).forEach((m) => {
    const p = m.profiles as unknown as { id: string; full_name: string | null } | null;
    if (!p) return;
    if (!convMap.has(p.id) || new Date(m.created_at) > new Date(convMap.get(p.id)!.at)) {
      convMap.set(p.id, { id: p.id, name: p.full_name ?? "Membre", lastMsg: m.content, at: m.created_at, unread: false });
    }
  });

  (received ?? []).forEach((m) => {
    const p = m.profiles as unknown as { id: string; full_name: string | null } | null;
    if (!p) return;
    const existing = convMap.get(p.id);
    if (!existing || new Date(m.created_at) > new Date(existing.at)) {
      convMap.set(p.id, { id: p.id, name: p.full_name ?? "Membre", lastMsg: m.content, at: m.created_at, unread: !m.read_at });
    }
  });

  const conversations = Array.from(convMap.values()).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-cream text-2xl font-bold">Messages</h1>
          <p className="text-muted text-sm mt-0.5">Messages privés avec les membres</p>
        </div>
        <Link href="/app/members" className="text-gold text-sm hover:text-gold-light transition-colors">+ Nouvelle conversation</Link>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-2 border border-white/[0.07] flex items-center justify-center">
            <MessageSquare size={28} className="text-muted/30" />
          </div>
          <div>
            <p className="text-cream font-medium">Aucun message</p>
            <p className="text-muted text-sm mt-1">Va dans l'annuaire membres pour démarrer une conversation.</p>
          </div>
          <Link href="/app/members" className="px-5 py-2.5 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors">
            Voir les membres
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/app/messages/${conv.id}`}
              className="flex items-center gap-4 bg-surface-2 border border-white/[0.06] rounded-2xl p-4 hover:border-gold/20 transition-all group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                conv.unread ? "bg-gold/20 text-gold border border-gold/30" : "bg-surface-3 text-muted"
              }`}>
                {conv.name[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${conv.unread ? "text-cream" : "text-cream/80"}`}>{conv.name}</p>
                <p className="text-muted text-xs truncate mt-0.5">{conv.lastMsg}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <p className="text-muted text-[10px]">{new Date(conv.at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>
                {conv.unread && <div className="w-2 h-2 rounded-full bg-gold" />}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
