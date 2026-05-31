import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CommunityPostCard } from "@/components/app/CommunityPostCard";
import { CommunitySearch } from "@/components/app/CommunitySearch";
import { Users } from "lucide-react";
import Link from "next/link";

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ cat?: string; q?: string }> }) {
  const { cat, q } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";

  const [{ data: categories }, { data: posts }] = await Promise.all([
    supabase.from("community_categories").select("*").order("order_index"),
    supabase
      .from("community_posts")
      .select("*, community_categories(id,name,icon,slug), profiles(full_name,email), community_attachments(id,type), community_comments(id), community_reactions(user_id,reaction_type), community_bookmarks(user_id)")
      .eq("is_published", true)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  // Reset notification badge (best-effort)
  supabase.from("profiles").update({ community_last_seen_at: new Date().toISOString() }).eq("id", user.id).then(() => {});

  // Filter by category + search query
  let filtered = cat ? posts?.filter((p) => p.community_categories?.slug === cat) : posts;
  if (q?.trim()) {
    const lower = q.trim().toLowerCase();
    filtered = filtered?.filter((p) =>
      p.title.toLowerCase().includes(lower) ||
      p.content?.toLowerCase().includes(lower)
    );
  }

  const pinned = !q ? (filtered?.filter((p) => p.is_pinned) ?? []) : [];
  const regular = !q ? (filtered?.filter((p) => !p.is_pinned) ?? []) : (filtered ?? []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-cream text-2xl font-bold">Communauté</h1>
          <p className="text-muted text-sm mt-0.5">Analyses, annonces et ressources KMM</p>
        </div>
        <div className="flex items-center gap-1.5 text-muted text-xs bg-surface-2 border border-white/[0.07] px-3 py-2 rounded-xl">
          <Users size={13} />
          <span>{posts?.length ?? 0} posts</span>
        </div>
      </div>

      {/* Barre de recherche */}
      <CommunitySearch initialQuery={q ?? ""} />

      {/* Catégories filter (masqué si recherche active) */}
      {!q && categories && categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          <Link
            href="/app/community"
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              !cat ? "bg-gold/15 border-gold/30 text-gold" : "bg-surface-2 border-white/[0.07] text-muted hover:border-gold/20 hover:text-cream"
            }`}
          >
            Tous
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/app/community?cat=${c.slug}`}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                cat === c.slug ? "bg-gold/15 border-gold/30 text-gold" : "bg-surface-2 border-white/[0.07] text-muted hover:border-gold/20 hover:text-cream"
              }`}
            >
              <span>{c.icon}</span>
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {/* Résultat de recherche label */}
      {q && (
        <p className="text-muted text-sm">
          {(filtered?.length ?? 0)} résultat{(filtered?.length ?? 0) !== 1 ? "s" : ""} pour <span className="text-cream font-medium">« {q} »</span>
        </p>
      )}

      {/* Admin CTA */}
      {isAdmin && !q && (
        <Link
          href="/admin/community/new"
          className="flex items-center justify-center gap-2 border border-dashed border-gold/25 rounded-2xl py-3.5 text-gold/70 text-sm hover:border-gold/40 hover:text-gold transition-all"
        >
          + Créer un post
        </Link>
      )}

      {/* Épinglés */}
      {pinned.length > 0 && (
        <div className="space-y-3">
          {pinned.map((post) => (
            <CommunityPostCard key={post.id} post={post as any} userId={user.id} />
          ))}
        </div>
      )}

      {/* Posts */}
      {regular.length === 0 && pinned.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center gap-3">
          <span className="text-4xl">🔍</span>
          <p className="text-muted text-sm">{q ? "Aucun résultat pour cette recherche." : "Aucun post dans cette catégorie pour l'instant."}</p>
          {q && (
            <Link href="/app/community" className="text-gold text-sm hover:underline">← Voir tous les posts</Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {regular.map((post) => (
            <CommunityPostCard key={post.id} post={post as any} userId={user.id} />
          ))}
        </div>
      )}
    </div>
  );
}
