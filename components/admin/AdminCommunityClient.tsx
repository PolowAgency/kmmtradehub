"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pin, PinOff, Eye, EyeOff, Trash2, Edit, MessageCircle, Bell, Flag, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Category { id: string; name: string; icon: string }
interface Post {
  id: string;
  title: string;
  is_published: boolean;
  is_pinned: boolean;
  created_at: string;
  views: number;
  community_categories: Category | null;
  community_comments: Array<{ id: string }>;
  community_reactions: Array<{ id: string }>;
}

export function AdminCommunityClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [notifying, setNotifying] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function togglePin(id: string, current: boolean) {
    await supabase.from("community_posts").update({ is_pinned: !current }).eq("id", id);
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, is_pinned: !current } : p));
  }

  async function togglePublish(id: string, current: boolean) {
    await supabase.from("community_posts").update({ is_published: !current }).eq("id", id);
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, is_published: !current } : p));
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce post et tous ses commentaires ?")) return;
    await supabase.from("community_posts").delete().eq("id", id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  }

  async function notifyAll(postId: string, postTitle: string) {
    if (!confirm(`Envoyer un email à tous les élèves pour le post « ${postTitle} » ?`)) return;
    setNotifying(postId);
    try {
      const res = await fetch(`/api/community/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (data.ok) {
        alert(`Email envoyé à ${data.count} élève${data.count > 1 ? "s" : ""}.`);
      } else {
        alert("Erreur lors de l'envoi : " + (data.error ?? "Inconnu"));
      }
    } finally {
      setNotifying(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-cream text-2xl font-semibold">Communauté</h1>
          <p className="text-muted text-sm mt-1">{posts.length} post{posts.length > 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/community/reports"
            className="flex items-center gap-2 text-muted text-sm px-4 py-2.5 rounded-xl border border-white/[0.07] hover:border-red-400/30 hover:text-red-400 transition-colors"
          >
            <Flag size={14} /> Signalements
          </Link>
          <Link
            href="/admin/community/new"
            className="flex items-center gap-2 bg-gold text-[#0A0A0A] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-gold-light transition-colors"
          >
            <Plus size={16} /> Nouveau post
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center gap-4">
          <MessageCircle size={40} className="text-muted/20" />
          <p className="text-muted text-sm">Aucun post créé. Publie le premier !</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`flex items-center gap-4 bg-surface-2 border rounded-xl p-4 ${
                post.is_pinned ? "border-gold/20" : "border-white/[0.06]"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {post.is_pinned && <Pin size={11} className="text-gold shrink-0" />}
                  {!post.is_published && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-400 border border-amber-400/20">Brouillon</span>
                  )}
                  {post.community_categories && (
                    <span className="text-[9px] text-muted/60">{post.community_categories.icon} {post.community_categories.name}</span>
                  )}
                </div>
                <p className="text-cream text-sm font-medium truncate">{post.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-muted text-[10px]">
                    {new Date(post.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1 text-muted text-[10px]">
                    <MessageCircle size={10} /> {post.community_comments?.length ?? 0}
                  </span>
                  {post.views > 0 && <span className="text-muted text-[10px]">{post.views} vues</span>}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => notifyAll(post.id, post.title)}
                  disabled={notifying === post.id}
                  title="Notifier tous les élèves"
                  className="p-2 rounded-lg text-muted hover:text-gold transition-colors disabled:opacity-40"
                >
                  {notifying === post.id ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
                </button>
                <button
                  onClick={() => togglePin(post.id, post.is_pinned)}
                  title={post.is_pinned ? "Désépingler" : "Épingler"}
                  className={`p-2 rounded-lg transition-colors ${post.is_pinned ? "text-gold" : "text-muted hover:text-gold"}`}
                >
                  {post.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
                </button>
                <button
                  onClick={() => togglePublish(post.id, post.is_published)}
                  title={post.is_published ? "Dépublier" : "Publier"}
                  className={`p-2 rounded-lg transition-colors ${post.is_published ? "text-emerald-400" : "text-muted hover:text-emerald-400"}`}
                >
                  {post.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <Link href={`/admin/community/${post.id}/edit`} className="p-2 rounded-lg text-muted hover:text-cream transition-colors">
                  <Edit size={14} />
                </Link>
                <button onClick={() => handleDelete(post.id)} className="p-2 rounded-lg text-muted hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
