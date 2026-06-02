import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DMChat } from "@/components/app/DMChat";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DMPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId: otherUserId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.id === otherUserId) redirect("/app/messages");

  const [{ data: otherProfile }, { data: messages }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").eq("id", otherUserId).single(),
    supabase.from("direct_messages")
      .select("id, content, sender_id, created_at")
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .limit(100),
  ]);

  if (!otherProfile) notFound();

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06] shrink-0">
        <Link href="/app/messages" className="text-muted hover:text-cream transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-bold text-sm shrink-0">
          {otherProfile.full_name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="text-cream font-semibold text-sm">{otherProfile.full_name ?? "Membre"}</p>
          <p className="text-muted text-[10px]">KMM VIP</p>
        </div>
      </div>

      <DMChat
        currentUserId={user.id}
        otherUserId={otherUserId}
        otherName={otherProfile.full_name ?? "Membre"}
        initialMessages={(messages ?? []).map((m) => ({
          id: m.id,
          content: m.content,
          sender_id: m.sender_id,
          created_at: m.created_at,
        }))}
      />
    </div>
  );
}
