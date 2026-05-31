"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Pin, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Profile { full_name: string | null; email: string }
interface Message {
  id: string;
  user_id: string;
  content: string;
  is_deleted: boolean;
  is_pinned: boolean;
  created_at: string;
  profiles: Profile | null;
}

interface Props {
  userId: string;
  isAdmin: boolean;
  initialMessages: Message[];
}

export function ChatRoom({ userId, isAdmin, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("chat_messages_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        async (payload) => {
          // Fetch full message with profile join
          const { data } = await supabase
            .from("chat_messages")
            .select("*, profiles(full_name, email)")
            .eq("id", payload.new.id)
            .single();
          if (data && !data.is_deleted) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.id)) return prev;
              return [...prev, data as Message];
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_messages" },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) => m.id === payload.new.id ? { ...m, ...payload.new } as Message : m)
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "chat_messages" },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    await supabase.from("chat_messages").insert({ user_id: userId, content: text.trim() });
    setText("");
    setSending(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("chat_messages").delete().eq("id", id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  async function handlePin(id: string, current: boolean) {
    await supabase.from("chat_messages").update({ is_pinned: !current }).eq("id", id);
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_pinned: !current } : m));
  }

  const pinned = messages.find((m) => m.is_pinned && !m.is_deleted);
  const visible = messages.filter((m) => !m.is_deleted);

  function label(m: Message) {
    return m.profiles?.full_name ?? m.profiles?.email?.split("@")[0] ?? "Membre";
  }

  function isToday(date: string) {
    return new Date(date).toDateString() === new Date().toDateString();
  }

  function formatTime(date: string) {
    const d = new Date(date);
    return isToday(date)
      ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex flex-col h-full">

      {/* Message épinglé */}
      {pinned && (
        <div className="flex items-center gap-2.5 bg-gold/8 border-b border-gold/15 px-4 py-2.5 shrink-0">
          <Pin size={12} className="text-gold shrink-0" />
          <p className="text-gold text-xs truncate font-medium">{pinned.content}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scroll-smooth">
        {visible.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted/50 text-sm">Commence la conversation !</p>
          </div>
        )}
        {visible.map((msg, idx) => {
          const isOwn = msg.user_id === userId;
          const prevMsg = visible[idx - 1];
          const sameAuthor = prevMsg?.user_id === msg.user_id && (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) < 60000;

          return (
            <div key={msg.id} className={`flex gap-2.5 group ${isOwn ? "flex-row-reverse" : ""} ${sameAuthor ? "mt-0.5" : "mt-3"}`}>
              {/* Avatar */}
              {!sameAuthor ? (
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                  isOwn ? "bg-gold/20 text-gold border border-gold/20" : "bg-surface-3 text-muted border border-white/[0.08]"
                }`}>
                  {label(msg)[0]?.toUpperCase()}
                </div>
              ) : (
                <div className="w-7 shrink-0" />
              )}

              <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%]`}>
                {!sameAuthor && (
                  <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                    <span className="text-[11px] font-semibold text-cream">{label(msg)}</span>
                    <span className="text-[10px] text-muted/50">{formatTime(msg.created_at)}</span>
                  </div>
                )}
                <div className={`relative px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.is_pinned ? "border border-gold/20 " : ""
                } ${isOwn
                    ? "bg-gold text-[#0A0A0A] rounded-tr-sm"
                    : "bg-surface-3 text-cream border border-white/[0.07] rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>

              {/* Actions admin */}
              {isAdmin && (
                <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 self-center ${isOwn ? "order-first" : ""}`}>
                  <button onClick={() => handlePin(msg.id, msg.is_pinned)} className={`p-1 rounded-lg transition-colors ${msg.is_pinned ? "text-gold" : "text-muted hover:text-gold"}`}>
                    <Pin size={12} />
                  </button>
                  <button onClick={() => handleDelete(msg.id)} className="p-1 rounded-lg text-muted hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-white/[0.06] px-4 py-3">
        <div className="flex items-end gap-3 bg-surface-2 border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-gold/30 transition-colors">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Écrire un message…"
            rows={1}
            enterKeyHint="send"
            inputMode="text"
            autoComplete="off"
            autoCorrect="on"
            className="flex-1 bg-transparent text-sm text-cream placeholder-muted/50 resize-none focus:outline-none leading-relaxed max-h-24"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold text-[#0A0A0A] hover:bg-gold-light transition-colors disabled:opacity-40 shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="hidden sm:block text-muted/30 text-[10px] text-center mt-1.5">Entrée pour envoyer · Shift+Entrée pour aller à la ligne</p>
      </div>
    </div>
  );
}
