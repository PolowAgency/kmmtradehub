import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatRoom } from "@/components/app/ChatRoom";

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*, profiles(full_name, email)")
    .eq("is_deleted", false)
    .order("created_at", { ascending: true })
    .limit(100);

  return (
    <div
      className="-mt-6 -mx-4 sm:-mx-6 md:mt-0 md:mx-0 flex flex-col"
      style={{ height: "calc(100dvh - 4rem)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 md:px-0 pt-5 pb-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
          <h1 className="text-cream font-bold text-lg">Chat communauté</h1>
        </div>
        <span className="text-muted text-xs ml-auto">Texte uniquement</span>
      </div>

      <div className="flex-1 min-h-0 px-4 sm:px-6 md:px-0">
        <ChatRoom
          userId={user.id}
          isAdmin={isAdmin}
          initialMessages={(messages ?? []) as any}
        />
      </div>
    </div>
  );
}
