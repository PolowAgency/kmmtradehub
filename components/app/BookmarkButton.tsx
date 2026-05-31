"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  postId: string;
  userId: string;
  isBookmarked: boolean;
}

export function BookmarkButton({ postId, userId, isBookmarked: initial }: Props) {
  const [saved, setSaved] = useState(initial);
  const supabase = createClient();

  async function toggle() {
    const next = !saved;
    setSaved(next);
    if (next) {
      await supabase.from("community_bookmarks").insert({ post_id: postId, user_id: userId });
    } else {
      await supabase.from("community_bookmarks").delete().eq("post_id", postId).eq("user_id", userId);
    }
  }

  return (
    <button
      onClick={toggle}
      title={saved ? "Retirer des favoris" : "Sauvegarder"}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all border ${
        saved
          ? "text-gold border-gold/20 bg-gold/8"
          : "text-muted border-white/[0.06] hover:text-cream hover:border-white/[0.12]"
      }`}
    >
      <Bookmark size={13} fill={saved ? "currentColor" : "none"} />
      {saved ? "Sauvegardé" : "Sauvegarder"}
    </button>
  );
}
