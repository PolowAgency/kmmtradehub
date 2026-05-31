"use client";

import Link from "next/link";
import { MessageCircle, Paperclip, Pin, Bookmark } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EmojiReactions } from "@/components/app/EmojiReactions";

type ReactionType = "fire" | "check" | "target" | "pray" | "laugh";
interface ReactionCount { type: ReactionType; count: number }
interface Category { id: string; name: string; icon: string; slug: string }
interface Post {
  id: string;
  title: string;
  content: string | null;
  is_pinned: boolean;
  created_at: string;
  views: number;
  community_categories: Category | null;
  profiles: { full_name: string | null; email: string } | null;
  community_attachments: Array<{ id: string; type: string }>;
  community_comments: Array<{ id: string }>;
  community_reactions: Array<{ user_id: string; reaction_type: string }>;
  community_bookmarks: Array<{ user_id: string }>;
}

interface Props {
  post: Post;
  userId: string;
}

export function CommunityPostCard({ post, userId }: Props) {
  const supabase = createClient();

  const userReactionRaw = post.community_reactions?.find((r) => r.user_id === userId)?.reaction_type as ReactionType | undefined;
  const [userReaction, setUserReaction] = useState<ReactionType | null>(userReactionRaw ?? null);
  const [reactionCounts, setReactionCounts] = useState<ReactionCount[]>(() => {
    const map: Record<string, number> = {};
    post.community_reactions?.forEach((r) => {
      map[r.reaction_type] = (map[r.reaction_type] ?? 0) + 1;
    });
    return Object.entries(map).map(([type, count]) => ({ type: type as ReactionType, count }));
  });

  const isBookmarked = post.community_bookmarks?.some((b) => b.user_id === userId);
  const [saved, setSaved] = useState(isBookmarked);

  const authorName = post.profiles?.full_name ?? post.profiles?.email?.split("@")[0] ?? "Admin";
  const snippet = post.content?.replace(/<[^>]*>/g, "").slice(0, 120);

  async function toggleBookmark(e: React.MouseEvent) {
    e.preventDefault();
    const next = !saved;
    setSaved(next);
    if (next) {
      await supabase.from("community_bookmarks").insert({ post_id: post.id, user_id: userId });
    } else {
      await supabase.from("community_bookmarks").delete().eq("post_id", post.id).eq("user_id", userId);
    }
  }

  return (
    <Link
      href={`/app/community/${post.id}`}
      className="block bg-surface-2 border border-white/[0.06] rounded-2xl p-5 hover:border-gold/20 transition-all duration-200 group"
    >
      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        {post.is_pinned && (
          <Pin size={13} className="text-gold mt-0.5 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          {post.community_categories && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gold/10 border border-gold/15 text-gold/80 mb-2">
              <span>{post.community_categories.icon}</span>
              {post.community_categories.name}
            </span>
          )}
          <h3 className="text-cream font-semibold text-sm leading-snug group-hover:text-gold transition-colors line-clamp-2">
            {post.title}
          </h3>
        </div>
        {/* Bookmark */}
        <button
          onClick={toggleBookmark}
          className={`shrink-0 p-1.5 rounded-lg transition-colors ${saved ? "text-gold" : "text-muted/40 hover:text-muted"}`}
          title={saved ? "Retirer des favoris" : "Sauvegarder"}
        >
          <Bookmark size={13} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Snippet */}
      {snippet && (
        <p className="text-muted text-xs leading-relaxed line-clamp-2 mb-3">{snippet}…</p>
      )}

      {/* Attachments indicator */}
      {post.community_attachments?.length > 0 && (
        <div className="flex items-center gap-1 text-muted/50 text-[10px] mb-3">
          <Paperclip size={10} />
          <span>{post.community_attachments.length} fichier{post.community_attachments.length > 1 ? "s" : ""}</span>
        </div>
      )}

      {/* Reactions */}
      <div className="mb-3" onClick={(e) => e.preventDefault()}>
        <EmojiReactions
          postId={post.id}
          userId={userId}
          userReaction={userReaction}
          counts={reactionCounts}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-gold/20 border border-gold/20 flex items-center justify-center text-gold text-[9px] font-bold shrink-0">
            {authorName[0]?.toUpperCase()}
          </div>
          <span className="text-muted text-[10px]">{authorName}</span>
          <span className="text-muted/30 text-[10px]">·</span>
          <span className="text-muted/60 text-[10px]">
            {new Date(post.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </span>
        </div>
        <span className="flex items-center gap-1 text-muted text-[11px]">
          <MessageCircle size={12} />
          {post.community_comments?.length ?? 0}
        </span>
      </div>
    </Link>
  );
}
