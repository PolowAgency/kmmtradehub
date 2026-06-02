"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send } from "lucide-react";

type Message = { id: string; content: string; sender_id: string; created_at: string };

export function DMChat({ currentUserId, otherUserId, otherName, initialMessages }: {
  currentUserId: string;
  otherUserId: string;
  otherName: string;
  initialMessages: Message[];
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = supabase.channel("dm_" + [currentUserId, otherUserId].sort().join("_"))
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
        filter: `sender_id=eq.${otherUserId}`,
      }, (payload) => {
        const m = payload.new as Message;
        if (m.sender_id === otherUserId) setMessages((prev) => [...prev, m]);
      })
      .subscribe();

    // Mark as read
    supabase.from("direct_messages").update({ read_at: new Date().toISOString() })
      .eq("sender_id", otherUserId).eq("recipient_id", currentUserId).is("read_at", null).then(() => {});

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, otherUserId]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    const { data } = await supabase.from("direct_messages").insert({
      sender_id: currentUserId,
      recipient_id: otherUserId,
      content: input.trim(),
    }).select().single();
    if (data) setMessages((prev) => [...prev, data]);
    setInput("");
    setSending(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 px-1 py-4">
        {messages.length === 0 && (
          <p className="text-center text-muted text-sm py-8">Commence la conversation avec {otherName} !</p>
        )}
        {messages.map((m) => {
          const isMe = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                isMe
                  ? "bg-gold text-[#0A0A0A] font-medium rounded-br-sm"
                  : "bg-surface-2 border border-white/[0.07] text-cream rounded-bl-sm"
              }`}>
                {m.content}
                <p className={`text-[9px] mt-1 ${isMe ? "text-black/40 text-right" : "text-muted/50"}`}>
                  {new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] pt-3 pb-1">
        <div className="flex items-center gap-3 bg-surface-2 border border-white/[0.08] rounded-2xl px-4 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={`Message à ${otherName}…`}
            className="flex-1 bg-transparent text-sm text-cream placeholder-muted/50 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-8 h-8 rounded-xl bg-gold flex items-center justify-center disabled:opacity-40 hover:bg-gold-light transition-colors shrink-0"
          >
            <Send size={14} className="text-[#0A0A0A]" />
          </button>
        </div>
      </div>
    </div>
  );
}
