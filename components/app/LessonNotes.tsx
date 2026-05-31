"use client";

import { useState, useEffect, useRef } from "react";
import { StickyNote, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  lessonId: string;
  userId: string;
  initialContent: string;
}

export function LessonNotes({ lessonId, userId, initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (content === initialContent) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("saving");
    timerRef.current = setTimeout(async () => {
      await supabase.from("lesson_notes").upsert(
        { user_id: userId, lesson_id: lessonId, content, updated_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id" }
      );
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    }, 800);
  }, [content]);

  return (
    <div className="bg-surface-2 border border-white/[0.06] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <StickyNote size={16} className="text-gold" />
          <span className="text-cream text-sm font-semibold">Mes notes</span>
          {content && <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />}
        </div>
        <div className="flex items-center gap-2">
          {status === "saving" && <Loader2 size={12} className="animate-spin text-muted" />}
          {status === "saved"  && <Check size={12} className="text-emerald-400" />}
          <span className="text-muted text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-white/[0.05]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écris tes notes, points clés, questions…"
            rows={6}
            className="w-full mt-4 bg-transparent text-sm text-cream placeholder-muted/40 resize-none focus:outline-none leading-relaxed"
            autoFocus
          />
          <p className="text-muted/30 text-[10px] mt-2">Sauvegarde automatique</p>
        </div>
      )}
    </div>
  );
}
