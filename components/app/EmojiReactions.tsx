"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const REACTIONS = [
  { type: "fire",   emoji: "🔥" },
  { type: "check",  emoji: "💯" },
  { type: "target", emoji: "🎯" },
  { type: "pray",   emoji: "🙏" },
  { type: "laugh",  emoji: "😂" },
] as const;

type ReactionType = typeof REACTIONS[number]["type"];

interface ReactionCount { type: ReactionType; count: number }

interface Props {
  postId?: string;
  commentId?: string;
  userId: string;
  userReaction: ReactionType | null;
  counts: ReactionCount[];
}

export function EmojiReactions({ postId, commentId, userId, userReaction: initialReaction, counts: initialCounts }: Props) {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(initialReaction);
  const [counts, setCounts] = useState<ReactionCount[]>(initialCounts);
  const supabase = createClient();

  function getCount(type: ReactionType) {
    return counts.find((c) => c.type === type)?.count ?? 0;
  }

  function adjustCount(type: ReactionType, delta: number) {
    setCounts((prev) => {
      const existing = prev.find((c) => c.type === type);
      if (existing) {
        return prev
          .map((c) => c.type === type ? { ...c, count: Math.max(0, c.count + delta) } : c)
          .filter((c) => c.count > 0);
      }
      if (delta > 0) return [...prev, { type, count: 1 }];
      return prev;
    });
  }

  async function handleReact(type: ReactionType) {
    if (userReaction === type) {
      // Remove reaction
      setUserReaction(null);
      adjustCount(type, -1);

      const query = supabase.from("community_reactions").delete().eq("user_id", userId).eq("reaction_type", type);
      if (postId) await query.eq("post_id", postId);
      else if (commentId) await query.eq("comment_id", commentId);
    } else {
      // Optimistic update
      if (userReaction) adjustCount(userReaction, -1);
      setUserReaction(type);
      adjustCount(type, 1);

      if (userReaction) {
        // Update existing reaction
        const query = supabase.from("community_reactions").update({ reaction_type: type }).eq("user_id", userId);
        if (postId) await query.eq("post_id", postId);
        else if (commentId) await query.eq("comment_id", commentId);
      } else {
        // Insert new reaction
        const payload: Record<string, string> = { user_id: userId, reaction_type: type };
        if (postId) payload.post_id = postId;
        else if (commentId) payload.comment_id = commentId;
        await supabase.from("community_reactions").insert(payload);
      }
    }
  }

  const hasAny = REACTIONS.some((r) => getCount(r.type) > 0);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {REACTIONS.map(({ type, emoji }) => {
        const count = getCount(type);
        const active = userReaction === type;
        if (!hasAny && !active) {
          // Show all reactions as small "add" buttons when none exist
        }
        return (
          <button
            key={type}
            onClick={() => handleReact(type)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all border ${
              active
                ? "bg-gold/15 border-gold/30 text-gold"
                : count > 0
                  ? "bg-white/[0.04] border-white/[0.08] text-muted hover:border-gold/20 hover:text-cream"
                  : "bg-transparent border-white/[0.06] text-muted/50 hover:border-white/[0.12] hover:text-muted"
            }`}
          >
            <span className="text-sm leading-none">{emoji}</span>
            {count > 0 && <span className="font-medium tabular-nums">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
