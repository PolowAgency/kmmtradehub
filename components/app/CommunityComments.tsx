"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CornerDownRight, Flag, Trash2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EmojiReactions } from "@/components/app/EmojiReactions";

type ReactionType = "fire" | "check" | "target" | "pray" | "laugh";

interface Author { full_name: string | null; email: string }
interface Comment {
  id: string;
  content: string;
  author_id: string;
  parent_id: string | null;
  is_deleted: boolean;
  created_at: string;
  profiles: Author | null;
  community_reactions: Array<{ user_id: string; reaction_type: string }>;
}

interface Props {
  postId: string;
  userId: string;
  isAdmin: boolean;
  initialComments: Comment[];
}

export function CommunityComments({ postId, userId, isAdmin, initialComments }: Props) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const topLevel = comments.filter((c) => !c.parent_id && !c.is_deleted);
  const replies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId && !c.is_deleted);

  function authorLabel(c: Comment) {
    return c.profiles?.full_name ?? c.profiles?.email?.split("@")[0] ?? "Membre";
  }

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    const { data } = await supabase
      .from("community_comments")
      .insert({ post_id: postId, author_id: userId, content: text.trim(), parent_id: replyTo?.id ?? null })
      .select("*, profiles(full_name, email), community_likes(*)")
      .single();
    if (data) {
      setComments((prev) => [...prev, data as Comment]);
    }
    setText("");
    setReplyTo(null);
    setSending(false);
    router.refresh();
  }


  async function handleDelete(commentId: string) {
    if (!confirm("Supprimer ce commentaire ?")) return;
    if (isAdmin) {
      await supabase.from("community_comments").delete().eq("id", commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } else {
      await supabase.from("community_comments").update({ is_deleted: true, content: "[supprimé]" }).eq("id", commentId);
      setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, is_deleted: true } : c));
    }
  }

  async function handleReport(commentId: string) {
    await supabase.from("comment_reports").insert({ comment_id: commentId, reporter_id: userId, reason: "Signalé par l'utilisateur" });
    alert("Commentaire signalé à l'admin.");
  }

  function startReply(id: string, name: string) {
    setReplyTo({ id, name });
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div className="space-y-5">
      <h2 className="text-cream font-bold text-base">
        Commentaires <span className="text-muted text-sm font-normal">({topLevel.length + comments.filter(c => c.parent_id).length})</span>
      </h2>

      {/* Liste */}
      <div className="space-y-4">
        {topLevel.length === 0 && (
          <p className="text-muted text-sm text-center py-6">Aucun commentaire pour l'instant. Sois le premier !</p>
        )}
        {topLevel.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={replies(comment.id)}
            userId={userId}
            isAdmin={isAdmin}
            onDelete={handleDelete}
            onReport={handleReport}
            onReply={startReply}
            authorLabel={authorLabel}
          />
        ))}
      </div>

      {/* Zone de saisie */}
      <div className="bg-surface-2 border border-white/[0.07] rounded-2xl p-4 space-y-3">
        {replyTo && (
          <div className="flex items-center gap-2 text-xs text-gold/80 bg-gold/5 border border-gold/15 rounded-lg px-3 py-2">
            <CornerDownRight size={12} />
            <span>Répondre à <strong>{replyTo.name}</strong></span>
            <button onClick={() => setReplyTo(null)} className="ml-auto text-muted hover:text-cream transition-colors text-[10px]">✕</button>
          </div>
        )}
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={replyTo ? `Répondre à ${replyTo.name}…` : "Écrire un commentaire…"}
          rows={2}
          className="w-full bg-transparent text-sm text-cream placeholder-muted/50 resize-none focus:outline-none leading-relaxed"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-xs hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            <Send size={13} />
            {sending ? "Envoi…" : "Commenter"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment, replies, userId, isAdmin,
  onDelete, onReport, onReply, authorLabel,
}: {
  comment: Comment;
  replies: Comment[];
  userId: string;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onReport: (id: string) => void;
  onReply: (id: string, name: string) => void;
  authorLabel: (c: Comment) => string;
}) {
  const name = authorLabel(comment);
  const isOwn = comment.author_id === userId;

  const userReaction = (comment.community_reactions?.find((r) => r.user_id === userId)?.reaction_type ?? null) as ReactionType | null;
  const reactionCounts = (() => {
    const map: Record<string, number> = {};
    comment.community_reactions?.forEach((r) => { map[r.reaction_type] = (map[r.reaction_type] ?? 0) + 1; });
    return Object.entries(map).map(([type, count]) => ({ type: type as ReactionType, count }));
  })();

  return (
    <div>
      <div className="flex gap-3">
        <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/20 flex items-center justify-center text-gold text-[10px] font-bold shrink-0 mt-0.5">
          {name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-cream text-xs font-semibold">{name}</span>
            <span className="text-muted/50 text-[10px]">
              {new Date(comment.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <p className="text-muted text-sm leading-relaxed">{comment.content}</p>
          <div className="mt-2 mb-1">
            <EmojiReactions
              commentId={comment.id}
              userId={userId}
              userReaction={userReaction}
              counts={reactionCounts}
            />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <button onClick={() => onReply(comment.id, name)} className="text-muted text-[11px] hover:text-cream transition-colors flex items-center gap-1">
              <CornerDownRight size={11} /> Répondre
            </button>
            {(isOwn || isAdmin) && (
              <button onClick={() => onDelete(comment.id)} className="text-muted text-[11px] hover:text-red-400 transition-colors flex items-center gap-1">
                <Trash2 size={11} />
              </button>
            )}
            {!isOwn && !isAdmin && (
              <button onClick={() => onReport(comment.id)} className="text-muted/40 text-[10px] hover:text-red-400/60 transition-colors flex items-center gap-1">
                <Flag size={10} />
              </button>
            )}
          </div>

          {/* Réponses */}
          {replies.length > 0 && (
            <div className="mt-3 pl-3 border-l border-white/[0.06] space-y-3">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  replies={[]}
                  userId={userId}
                  isAdmin={isAdmin}
                  onDelete={onDelete}
                  onReport={onReport}
                  onReply={onReply}
                  authorLabel={authorLabel}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
