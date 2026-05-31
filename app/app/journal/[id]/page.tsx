import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JournalForm } from "@/components/app/JournalForm";
import { JournalDeleteButton } from "@/components/app/JournalDeleteButton";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Modifier le trade" };

const EMOTION_EMOJI: Record<string, string> = {
  confident: "💪 Confiant", fearful: "😰 Anxieux", greedy: "🤑 Gourmand",
  neutral: "😐 Neutre", frustrated: "😤 Frustré",
};

export default async function JournalEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: entry } = await supabase
    .from("trading_journal")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!entry) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/app/journal" className="flex items-center gap-2 text-muted hover:text-cream text-sm transition-colors">
          <ArrowLeft size={15} /> Journal
        </Link>
        <JournalDeleteButton entryId={id} />
      </div>

      {/* Screenshot preview */}
      {entry.screenshot_url && (
        <a
          href={entry.screenshot_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gold text-sm hover:underline"
        >
          <ExternalLink size={13} /> Voir le screenshot
        </a>
      )}

      <JournalForm userId={user.id} entry={entry} />
    </div>
  );
}
