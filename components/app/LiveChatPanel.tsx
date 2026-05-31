"use client";

import { useEffect, useRef, useState } from "react";
import { Send, CheckCircle, MessageSquare, HelpCircle, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Profile { full_name: string | null; email: string }

interface LiveMessage {
  id: string;
  user_id: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
  profiles: Profile | null;
}

interface LiveQuestion {
  id: string;
  user_id: string;
  content: string;
  is_answered: boolean;
  is_deleted: boolean;
  created_at: string;
  profiles: Profile | null;
}

interface Props {
  liveId: string;
  userId: string;
  isAdmin: boolean;
  initialMessages: LiveMessage[];
  initialQuestions: LiveQuestion[];
}

type Tab = "chat" | "questions";

export function LiveChatPanel({ liveId, userId, isAdmin, initialMessages, initialQuestions }: Props) {
  const [tab, setTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<LiveMessage[]>(initialMessages);
  const [questions, setQuestions] = useState<LiveQuestion[]>(initialQuestions);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (tab === "chat") bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tab]);

  useEffect(() => {
    const channel = supabase
      .channel(`live_panel_${liveId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_messages", filter: `live_id=eq.${liveId}` }, async (payload) => {
        const { data } = await supabase.from("live_messages").select("*, profiles(full_name, email)").eq("id", payload.new.id).single();
        if (data && !data.is_deleted) {
          setMessages((prev) => prev.some((m) => m.id === data.id) ? prev : [...prev, data as LiveMessage]);
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "live_messages", filter: `live_id=eq.${liveId}` }, (payload) => {
        setMessages((prev) => prev.map((m) => m.id === payload.new.id ? { ...m, ...payload.new } as LiveMessage : m));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "live_messages" }, (payload) => {
        setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_questions", filter: `live_id=eq.${liveId}` }, async (payload) => {
        const { data } = await supabase.from("live_questions").select("*, profiles(full_name, email)").eq("id", payload.new.id).single();
        if (data && !data.is_deleted) {
          setQuestions((prev) => prev.some((q) => q.id === data.id) ? prev : [...prev, data as LiveQuestion]);
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "live_questions", filter: `live_id=eq.${liveId}` }, (payload) => {
        setQuestions((prev) => prev.map((q) => q.id === payload.new.id ? { ...q, ...payload.new } as LiveQuestion : q));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, liveId]);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    if (tab === "chat") {
      await supabase.from("live_messages").insert({ live_id: liveId, user_id: userId, content: text.trim() });
    } else {
      await supabase.from("live_questions").insert({ live_id: liveId, user_id: userId, content: text.trim() });
    }
    setText("");
    setSending(false);
  }

  async function handleDeleteMessage(id: string) {
    await supabase.from("live_messages").update({ is_deleted: true }).eq("id", id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleMarkAnswered(id: string, current: boolean) {
    await supabase.from("live_questions").update({ is_answered: !current }).eq("id", id);
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, is_answered: !current } : q));
  }

  async function handleDeleteQuestion(id: string) {
    await supabase.from("live_questions").update({ is_deleted: true }).eq("id", id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function label(profiles: Profile | null) {
    return profiles?.full_name ?? profiles?.email?.split("@")[0] ?? "Membre";
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }

  const visibleMessages = messages.filter((m) => !m.is_deleted);
  const visibleQuestions = questions.filter((q) => !q.is_deleted);
  const unanswered = visibleQuestions.filter((q) => !q.is_answered).length;

  return (
    <div className="flex flex-col h-full bg-surface-2 border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/[0.06] shrink-0">
        <button
          onClick={() => setTab("chat")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors ${tab === "chat" ? "text-gold border-b-2 border-gold" : "text-muted hover:text-cream"}`}
        >
          <MessageSquare size={14} />
          Chat
        </button>
        <button
          onClick={() => setTab("questions")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors ${tab === "questions" ? "text-gold border-b-2 border-gold" : "text-muted hover:text-cream"}`}
        >
          <HelpCircle size={14} />
          Questions
          {unanswered > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">{unanswered}</span>
          )}
        </button>
      </div>

      {/* Chat tab */}
      {tab === "chat" && (
        <>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scroll-smooth">
            {visibleMessages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted/50 text-xs">Sois le premier à écrire !</p>
              </div>
            )}
            {visibleMessages.map((msg, idx) => {
              const isOwn = msg.user_id === userId;
              const prev = visibleMessages[idx - 1];
              const sameAuthor = prev?.user_id === msg.user_id &&
                new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() < 60000;

              return (
                <div key={msg.id} className={`flex gap-2 group ${isOwn ? "flex-row-reverse" : ""} ${sameAuthor ? "mt-0.5" : "mt-2.5"}`}>
                  {!sameAuthor ? (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 ${
                      isOwn ? "bg-gold/20 text-gold" : "bg-surface-3 text-muted"
                    }`}>
                      {label(msg.profiles)[0]?.toUpperCase()}
                    </div>
                  ) : <div className="w-6 shrink-0" />}

                  <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[80%]`}>
                    {!sameAuthor && (
                      <div className={`flex items-center gap-1.5 mb-0.5 ${isOwn ? "flex-row-reverse" : ""}`}>
                        <span className="text-[10px] font-semibold text-cream">{label(msg.profiles)}</span>
                        <span className="text-[9px] text-muted/40">{formatTime(msg.created_at)}</span>
                      </div>
                    )}
                    <div className={`px-3 py-1.5 rounded-2xl text-xs leading-relaxed ${
                      isOwn
                        ? "bg-gold text-[#0A0A0A] rounded-tr-sm"
                        : "bg-surface-3 text-cream border border-white/[0.07] rounded-tl-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-muted hover:text-red-400 self-center"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="shrink-0 border-t border-white/[0.06] px-3 py-2.5">
            <div className="flex items-end gap-2 bg-surface-3 border border-white/[0.08] rounded-xl px-3 py-2 focus-within:border-gold/30 transition-colors">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Message…"
                rows={1}
                className="flex-1 bg-transparent text-xs text-cream placeholder-muted/40 resize-none focus:outline-none max-h-20"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="w-7 h-7 rounded-lg bg-gold text-[#0A0A0A] hover:bg-gold-light transition-colors disabled:opacity-40 flex items-center justify-center shrink-0"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Questions tab */}
      {tab === "questions" && (
        <>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {visibleQuestions.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted/50 text-xs text-center">Aucune question pour l'instant.<br />Pose la tienne !</p>
              </div>
            )}
            {visibleQuestions.map((q) => (
              <div
                key={q.id}
                className={`rounded-xl border p-3 transition-all ${q.is_answered ? "border-green-500/20 bg-green-500/5 opacity-60" : "border-white/[0.07] bg-surface-3"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-semibold text-cream">{label(q.profiles)}</span>
                      <span className="text-[9px] text-muted/40">{formatTime(q.created_at)}</span>
                      {q.is_answered && (
                        <span className="flex items-center gap-0.5 text-[9px] text-green-400 font-medium">
                          <CheckCircle size={9} /> Répondu
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-cream leading-relaxed">{q.content}</p>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMarkAnswered(q.id, q.is_answered)}
                        className={`p-1.5 rounded-lg transition-colors ${q.is_answered ? "text-green-400 hover:text-muted" : "text-muted hover:text-green-400"}`}
                        title={q.is_answered ? "Marquer non répondu" : "Marquer comme répondu"}
                      >
                        <CheckCircle size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="shrink-0 border-t border-white/[0.06] px-3 py-2.5">
            <div className="flex items-end gap-2 bg-surface-3 border border-white/[0.08] rounded-xl px-3 py-2 focus-within:border-gold/30 transition-colors">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Pose une question…"
                rows={1}
                className="flex-1 bg-transparent text-xs text-cream placeholder-muted/40 resize-none focus:outline-none max-h-20"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="w-7 h-7 rounded-lg bg-gold text-[#0A0A0A] hover:bg-gold-light transition-colors disabled:opacity-40 flex items-center justify-center shrink-0"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
