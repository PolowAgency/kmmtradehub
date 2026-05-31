import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Calendar, PlayCircle, Radio, Edit } from "lucide-react";
import { LiveChatPanel } from "@/components/app/LiveChatPanel";
import { LiveReminderButton } from "@/components/app/LiveReminderButton";

export default async function LiveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, email").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";

  const [
    { data: live },
    { data: replays },
    { data: messages },
    { data: questions },
    { count: attendeeCount },
    { data: reminderRow },
  ] = await Promise.all([
    supabase.from("lives").select("*").eq("id", id).single(),
    supabase.from("live_replays").select("*").eq("live_id", id).order("created_at"),
    supabase.from("live_messages").select("*, profiles(full_name, email)").eq("live_id", id).eq("is_deleted", false).order("created_at").limit(200),
    supabase.from("live_questions").select("*, profiles(full_name, email)").eq("live_id", id).eq("is_deleted", false).order("created_at"),
    supabase.from("live_attendees").select("*", { count: "exact", head: true }).eq("live_id", id),
    supabase.from("live_reminders").select("id").eq("live_id", id).eq("user_id", user.id).maybeSingle(),
  ]);

  if (!live) notFound();

  if (live.status === "live") {
    await supabase.from("live_attendees").upsert({ live_id: id, user_id: user.id }, { onConflict: "live_id,user_id" });
  }

  const isLive = live.status === "live";
  const isScheduled = live.status === "scheduled";
  const isEnded = live.status === "ended";
  const isReminded = Boolean(reminderRow);

  return (
    <div className="space-y-6">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Link href="/app/live" className="flex items-center gap-2 text-muted hover:text-cream text-sm transition-colors">
          <ArrowLeft size={15} />
          Lives
        </Link>
        {isAdmin && (
          <Link href={`/admin/live/${id}/edit`} className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-light transition-colors">
            <Edit size={13} /> Modifier
          </Link>
        )}
      </div>

      {/* Status badge */}
      <div>
        {isLive && (
          <div className="flex items-center gap-2 text-red-400 text-sm font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            En direct maintenant
            {(attendeeCount ?? 0) > 0 && (
              <span className="ml-2 text-muted text-xs font-normal">{attendeeCount} participant{(attendeeCount ?? 0) > 1 ? "s" : ""}</span>
            )}
          </div>
        )}
        {isScheduled && (
          <div className="flex items-center gap-2 text-gold text-sm font-medium mb-3">
            <Calendar size={14} />
            {new Date(live.scheduled_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
        <h1 className="text-cream text-xl font-bold">{live.title}</h1>
        {live.description && <p className="text-muted text-sm leading-relaxed mt-2">{live.description}</p>}
      </div>

      {/* Layout: player + chat côte à côte sur desktop */}
      {isLive && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Player */}
          <div className="flex-1 min-w-0">
            {live.stream_url && (
              <div className="rounded-2xl overflow-hidden border border-red-500/20 aspect-video bg-black">
                <iframe
                  src={live.stream_url}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Live Chat Panel */}
          <div className="lg:w-80 xl:w-96 h-[420px] lg:h-auto lg:min-h-[360px] shrink-0">
            <LiveChatPanel
              liveId={id}
              userId={user.id}
              isAdmin={isAdmin}
              initialMessages={(messages ?? []) as any}
              initialQuestions={(questions ?? []) as any}
            />
          </div>
        </div>
      )}

      {/* Programmé */}
      {isScheduled && (
        <div className="flex flex-col items-center gap-4 bg-surface-2 border border-white/[0.06] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Radio size={28} className="text-gold" />
          </div>
          <div>
            <p className="text-cream font-semibold">Ce live n'a pas encore commencé</p>
            <p className="text-muted text-sm mt-1">
              Rendez-vous le {new Date(live.scheduled_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {new Date(live.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <LiveReminderButton
            liveId={id}
            userId={user.id}
            email={profile?.email ?? ""}
            isReminded={isReminded}
          />
        </div>
      )}

      {/* Replays */}
      {(isEnded || (replays?.length ?? 0) > 0) && (
        <div>
          <h2 className="text-cream font-bold mb-3">
            {(replays?.length ?? 0) > 0 ? "Replay" : "Aucun replay disponible"}
          </h2>
          {replays?.map((replay) => (
            <a
              key={replay.id}
              href={replay.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-surface-2 border border-white/[0.06] rounded-xl p-4 hover:border-gold/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/15 flex items-center justify-center shrink-0">
                <PlayCircle size={20} className="text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-cream text-sm font-medium truncate">{replay.title ?? live.title}</p>
                {replay.duration_minutes && (
                  <p className="text-muted text-xs mt-0.5">{replay.duration_minutes} min</p>
                )}
              </div>
            </a>
          ))}
          {!replays?.length && isEnded && (
            <p className="text-muted text-sm bg-surface-2 border border-white/[0.06] rounded-xl p-4">
              Le replay sera ajouté prochainement.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
