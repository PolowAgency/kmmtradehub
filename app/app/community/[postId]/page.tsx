import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CommunityComments } from "@/components/app/CommunityComments";
import { BookmarkButton } from "@/components/app/BookmarkButton";
import { EmojiReactions } from "@/components/app/EmojiReactions";
import { ArrowLeft, FileText, Video, ExternalLink, ImageIcon, Pin, Edit } from "lucide-react";
import { sanitizeLessonHtml } from "@/lib/learning";

type ReactionType = "fire" | "check" | "target" | "pray" | "laugh";

const ATTACHMENT_ICONS = {
  image: { icon: ImageIcon,    color: "text-blue-400",    bg: "bg-blue-400/10" },
  pdf:   { icon: FileText,     color: "text-red-400",     bg: "bg-red-400/10" },
  video: { icon: Video,        color: "text-purple-400",  bg: "bg-purple-400/10" },
  link:  { icon: ExternalLink, color: "text-emerald-400", bg: "bg-emerald-400/10" },
};

export default async function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";

  const [{ data: post }, { data: comments }] = await Promise.all([
    supabase
      .from("community_posts")
      .select("*, community_categories(id,name,icon), profiles(full_name,email), community_attachments(*), community_reactions(user_id,reaction_type), community_bookmarks(user_id)")
      .eq("id", postId)
      .single(),
    supabase
      .from("community_comments")
      .select("*, profiles(full_name,email), community_reactions(user_id,reaction_type)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true }),
  ]);

  if (!post || (!post.is_published && !isAdmin)) notFound();

  // Incrémenter les vues (best-effort)
  supabase.from("community_posts").update({ views: (post.views ?? 0) + 1 }).eq("id", postId).then(() => {});

  const authorName = post.profiles?.full_name ?? post.profiles?.email?.split("@")[0] ?? "Admin";
  const userReaction = (post.community_reactions?.find((r: { user_id: string }) => r.user_id === user.id) as { reaction_type: ReactionType } | undefined)?.reaction_type ?? null;
  const reactionCounts = (() => {
    const map: Record<string, number> = {};
    post.community_reactions?.forEach((r: { reaction_type: string }) => { map[r.reaction_type] = (map[r.reaction_type] ?? 0) + 1; });
    return Object.entries(map).map(([type, count]) => ({ type: type as ReactionType, count }));
  })();
  const isBookmarked = post.community_bookmarks?.some((b: { user_id: string }) => b.user_id === user.id) ?? false;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Link href="/app/community" className="flex items-center gap-2 text-muted hover:text-cream text-sm transition-colors">
          <ArrowLeft size={15} />
          Communauté
        </Link>
        {isAdmin && (
          <Link href={`/admin/community/${postId}/edit`} className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-light transition-colors">
            <Edit size={13} /> Modifier
          </Link>
        )}
      </div>

      {/* Post */}
      <article className="space-y-4">
        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap">
          {post.is_pinned && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-gold">
              <Pin size={10} /> Épinglé
            </span>
          )}
          {post.community_categories && (
            <span className="flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-surface-3 border border-white/[0.07] text-muted">
              {post.community_categories.icon} {post.community_categories.name}
            </span>
          )}
          {!post.is_published && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400">Brouillon</span>
          )}
        </div>

        <h1 className="text-cream text-xl font-bold leading-snug">{post.title}</h1>

        <div className="flex items-center gap-2 text-muted text-xs">
          <div className="w-6 h-6 rounded-full bg-gold/20 border border-gold/20 flex items-center justify-center text-gold text-[10px] font-bold">
            {authorName[0]?.toUpperCase()}
          </div>
          <span className="font-medium text-cream/70">{authorName}</span>
          <span className="text-muted/30">·</span>
          <span>{new Date(post.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
          {post.views > 0 && <><span className="text-muted/30">·</span><span>{post.views} vues</span></>}
        </div>

        {/* Contenu */}
        {post.content && (
          <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-5">
            <div className="lesson-content" dangerouslySetInnerHTML={{ __html: sanitizeLessonHtml(post.content) }} />
          </div>
        )}

        {/* Pièces jointes */}
        {post.community_attachments && post.community_attachments.length > 0 && (
          <div className="space-y-2">
            <p className="text-muted text-xs uppercase tracking-widest">Fichiers joints</p>
            {post.community_attachments.map((att: { id: string; url: string; name: string; type: string }) => {
              const meta = ATTACHMENT_ICONS[att.type as keyof typeof ATTACHMENT_ICONS] ?? ATTACHMENT_ICONS.link;
              const Icon = meta.icon;
              return (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-surface-2 border border-white/[0.06] rounded-xl p-3.5 hover:border-gold/20 transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={15} className={meta.color} />
                  </div>
                  <span className="text-cream text-sm truncate flex-1">{att.name}</span>
                  <ExternalLink size={13} className="text-muted group-hover:text-gold transition-colors shrink-0" />
                </a>
              );
            })}
          </div>
        )}
      </article>

      {/* Réactions + Bookmark */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <EmojiReactions
          postId={postId}
          userId={user.id}
          userReaction={userReaction}
          counts={reactionCounts}
        />
        <BookmarkButton
          postId={postId}
          userId={user.id}
          isBookmarked={isBookmarked}
        />
      </div>

      <div className="border-t border-white/[0.06]" />

      {/* Commentaires */}
      <CommunityComments
        postId={postId}
        userId={user.id}
        isAdmin={isAdmin}
        initialComments={(comments ?? []) as any}
      />
    </div>
  );
}
