"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  lastSeenAt: string | null;
  latestPostAt: string | null;
}

export function CommunityBadge({ userId, lastSeenAt, latestPostAt }: Props) {
  const [hasNew, setHasNew] = useState(() => {
    if (!latestPostAt) return false;
    if (!lastSeenAt) return true;
    return new Date(latestPostAt) > new Date(lastSeenAt);
  });

  useEffect(() => {
    if (!hasNew) return;
    // Mark as seen when this component mounts (user visited community)
    const supabase = createClient();
    supabase.from("profiles").update({ community_last_seen_at: new Date().toISOString() }).eq("id", userId).then(() => {
      setHasNew(false);
    });
  }, [userId, hasNew]);

  if (!hasNew) return null;

  return (
    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border border-surface" />
  );
}
