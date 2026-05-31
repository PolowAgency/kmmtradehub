"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function JournalDeleteButton({ entryId }: { entryId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm("Supprimer ce trade ?")) return;
    setLoading(true);
    await supabase.from("trading_journal").delete().eq("id", entryId);
    router.push("/app/journal");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1.5 text-muted text-xs hover:text-red-400 transition-colors"
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      Supprimer
    </button>
  );
}
