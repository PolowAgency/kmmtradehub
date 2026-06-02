"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Trash2, Pin, Eye, EyeOff, X, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Category { id: string; name: string; icon: string }
interface Attachment { id?: string; url: string; name: string; type: "image" | "pdf" | "video" | "link"; file_size?: number | null }
interface Post {
  id: string;
  title: string;
  content: string | null;
  category_id: string | null;
  is_published: boolean;
  is_pinned: boolean;
  community_attachments: Attachment[];
}

interface Props {
  categories: Category[];
  post?: Post;
  userId: string;
}

const ACCEPTED = "image/*,application/pdf,video/*";

export function AdminPostEditorClient({ categories, post, userId }: Props) {
  const isEdit = !!post;
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [categoryId, setCategoryId] = useState(post?.category_id ?? "");
  const [isPublished, setIsPublished] = useState(post?.is_published ?? true);
  const [isPinned, setIsPinned] = useState(post?.is_pinned ?? false);
  const [attachments, setAttachments] = useState<Attachment[]>(post?.community_attachments ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifResult, setNotifResult] = useState<string | null>(null);
  const [savedPostId, setSavedPostId] = useState(post?.id ?? "");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const type: Attachment["type"] = file.type.startsWith("image/") ? "image" : file.type.includes("pdf") ? "pdf" : file.type.startsWith("video/") ? "video" : "link";
      const path = `posts/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

      const { data, error } = await supabase.storage.from("community-admin-files").upload(path, file, { upsert: false });
      if (error) { alert(`Erreur upload : ${error.message}`); continue; }

      const { data: { publicUrl } } = supabase.storage.from("community-admin-files").getPublicUrl(data.path);
      setAttachments((prev) => [...prev, { url: publicUrl, name: file.name, type, file_size: file.size }]);
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function addLink() {
    if (!linkUrl.trim()) return;
    setAttachments((prev) => [...prev, { url: linkUrl.trim(), name: linkName || linkUrl.trim(), type: "link" }]);
    setLinkUrl(""); setLinkName("");
  }

  function removeAttachment(idx: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);

    if (isEdit && post) {
      // Mise à jour
      await supabase.from("community_posts").update({
        title: title.trim(),
        content: content || null,
        category_id: categoryId || null,
        is_published: isPublished,
        is_pinned: isPinned,
        updated_at: new Date().toISOString(),
      }).eq("id", post.id);

      // Supprimer les anciennes pièces jointes retirées
      const originalIds = new Set(post.community_attachments.map((a) => a.id).filter(Boolean));
      const keptIds = new Set(attachments.map((a) => a.id).filter(Boolean));
      const toDelete = [...originalIds].filter((id) => !keptIds.has(id));
      if (toDelete.length) await supabase.from("community_attachments").delete().in("id", toDelete as string[]);

      // Ajouter les nouvelles
      const newAtts = attachments.filter((a) => !a.id);
      if (newAtts.length) {
        await supabase.from("community_attachments").insert(
          newAtts.map((a) => ({ post_id: post.id, url: a.url, name: a.name, type: a.type, file_size: a.file_size ?? null }))
        );
      }
      router.push("/admin/community");
    } else {
      // Création
      const { data: newPost } = await supabase.from("community_posts").insert({
        title: title.trim(),
        content: content || null,
        category_id: categoryId || null,
        author_id: userId,
        is_published: isPublished,
        is_pinned: isPinned,
      }).select("id").single();

      if (newPost && attachments.length) {
        await supabase.from("community_attachments").insert(
          attachments.map((a) => ({ post_id: newPost.id, url: a.url, name: a.name, type: a.type, file_size: a.file_size ?? null }))
        );
      }
      if (newPost) setSavedPostId(newPost.id);
      router.push("/admin/community");
    }

    setSaving(false);
    router.refresh();
  }

  async function handleNotify() {
    const pid = savedPostId;
    if (!pid || !title.trim()) return;
    setNotifying(true);
    setNotifResult(null);
    try {
      const res = await fetch("/api/admin/notify-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: pid, postTitle: title }),
      });
      const data = await res.json() as { sent?: number };
      setNotifResult(`✅ Email envoyé à ${data.sent ?? 0} élève${(data.sent ?? 0) > 1 ? "s" : ""}`);
    } catch {
      setNotifResult("❌ Erreur d'envoi");
    }
    setNotifying(false);
  }

  const TYPE_EMOJI: Record<string, string> = { image: "🖼️", pdf: "📄", video: "🎬", link: "🔗" };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/community" className="text-muted hover:text-cream transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-cream text-xl font-semibold">{isEdit ? "Modifier le post" : "Nouveau post"}</h1>
      </div>

      {/* Titre */}
      <div>
        <label className="block text-xs text-muted uppercase tracking-widest mb-2">Titre *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre du post…"
          className="w-full bg-surface-2 border border-white/[0.08] rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold/40 transition-colors"
        />
      </div>

      {/* Catégorie */}
      <div>
        <label className="block text-xs text-muted uppercase tracking-widest mb-2">Catégorie</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full bg-surface-2 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors"
        >
          <option value="">Aucune</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      {/* Contenu — éditeur enrichi */}
      <div>
        <label className="block text-xs text-muted uppercase tracking-widest mb-2">Contenu</label>
        {/* Toolbar */}
        <div className="flex items-center gap-1 flex-wrap bg-surface-3 border border-white/[0.08] border-b-0 rounded-t-xl px-3 py-2">
          {[
            { label: "B",  title: "Gras",       wrap: (s: string) => `<strong>${s}</strong>` },
            { label: "I",  title: "Italique",    wrap: (s: string) => `<em>${s}</em>` },
            { label: "H2", title: "Titre",       wrap: (s: string) => `<h2>${s}</h2>` },
            { label: "¶",  title: "Paragraphe",  wrap: (s: string) => `<p>${s}</p>` },
          ].map(({ label, title, wrap }) => (
            <button
              key={label}
              type="button"
              title={title}
              onMouseDown={(e) => {
                e.preventDefault();
                const ta = document.getElementById("post-content") as HTMLTextAreaElement | null;
                if (!ta) return;
                const start = ta.selectionStart;
                const end = ta.selectionEnd;
                const selected = content.slice(start, end) || title;
                const newText = content.slice(0, start) + wrap(selected) + content.slice(end);
                setContent(newText);
              }}
              className="px-2 py-1 rounded text-xs font-bold text-muted hover:text-cream hover:bg-white/[0.06] transition-all"
            >
              {label}
            </button>
          ))}
          <div className="w-px h-4 bg-white/[0.1] mx-1" />
          {[
            { label: "• Liste",  snippet: "<ul>\n  <li>Élément 1</li>\n  <li>Élément 2</li>\n</ul>" },
            { label: "🔔 Alerte", snippet: '<div class="alert">⚠️ Message important</div>' },
            { label: "📊 Setup",  snippet: "<p><strong>Setup :</strong> Description du trade</p>\n<p><strong>Entrée :</strong> X$</p>\n<p><strong>SL :</strong> X$ · <strong>TP :</strong> X$</p>" },
          ].map(({ label, snippet }) => (
            <button
              key={label}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                const ta = document.getElementById("post-content") as HTMLTextAreaElement | null;
                if (!ta) return;
                const pos = ta.selectionStart;
                setContent(content.slice(0, pos) + "\n" + snippet + "\n" + content.slice(pos));
              }}
              className="px-2 py-1 rounded text-xs text-muted hover:text-cream hover:bg-white/[0.06] transition-all"
            >
              {label}
            </button>
          ))}
        </div>
        <textarea
          id="post-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écris ton post ici… ou utilise les boutons de mise en forme ci-dessus."
          rows={12}
          className="w-full bg-surface-2 border border-white/[0.08] rounded-b-xl px-4 py-3 text-cream text-sm font-mono focus:outline-none focus:border-gold/40 transition-colors resize-y"
        />
        <p className="text-muted/50 text-[10px] mt-1">HTML supporté. Utilise les boutons pour formater rapidement.</p>
      </div>

      {/* Pièces jointes */}
      <div>
        <label className="block text-xs text-muted uppercase tracking-widest mb-3">Fichiers joints</label>

        {/* Upload depuis disque */}
        <div
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center gap-2 border border-dashed border-white/[0.12] rounded-xl p-5 cursor-pointer hover:border-gold/30 hover:bg-gold/3 transition-all text-center mb-3"
        >
          {uploading ? (
            <Loader2 size={20} className="text-gold animate-spin" />
          ) : (
            <Upload size={20} className="text-muted/60" />
          )}
          <p className="text-muted text-sm">{uploading ? "Upload en cours…" : "Cliquer pour uploader images, PDF, vidéos"}</p>
          <input ref={fileRef} type="file" accept={ACCEPTED} multiple className="hidden" onChange={handleFileUpload} />
        </div>

        {/* Ajouter lien */}
        <div className="flex gap-2 mb-4">
          <input
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            placeholder="Nom du lien"
            className="flex-1 bg-surface-2 border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors"
          />
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://…"
            className="flex-1 bg-surface-2 border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors"
          />
          <button onClick={addLink} className="px-3 py-2.5 rounded-xl bg-surface-3 border border-white/[0.08] text-muted hover:text-cream hover:border-gold/30 text-sm transition-colors">
            + Lien
          </button>
        </div>

        {/* Liste */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((att, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-surface-2 border border-white/[0.07] rounded-xl px-4 py-3">
                <span className="text-base shrink-0">{TYPE_EMOJI[att.type]}</span>
                <p className="text-cream text-sm truncate flex-1">{att.name}</p>
                <button onClick={() => removeAttachment(idx)} className="text-muted hover:text-red-400 transition-colors shrink-0">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => setIsPublished((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            isPublished ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400" : "bg-surface-2 border-white/[0.08] text-muted"
          }`}
        >
          {isPublished ? <Eye size={15} /> : <EyeOff size={15} />}
          {isPublished ? "Publié" : "Brouillon"}
        </button>
        <button
          onClick={() => setIsPinned((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            isPinned ? "bg-gold/10 border-gold/20 text-gold" : "bg-surface-2 border-white/[0.08] text-muted"
          }`}
        >
          <Pin size={15} />
          {isPinned ? "Épinglé" : "Épingler"}
        </button>
      </div>

      {/* Save + Notify */}
      <div className="space-y-3 pt-2">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving || uploading}
            className="px-6 py-3 rounded-xl bg-gold text-[#0A0A0A] font-bold text-sm hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : isEdit ? "Mettre à jour" : "Publier le post"}
          </button>
          <Link href="/admin/community" className="px-6 py-3 rounded-xl border border-white/[0.12] text-muted hover:text-cream text-sm transition-colors">
            Annuler
          </Link>
        </div>

        {/* Bouton notification email */}
        {savedPostId && (
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleNotify}
              disabled={notifying}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-blue-400/25 bg-blue-400/5 text-blue-400 hover:bg-blue-400/10 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {notifying ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              {notifying ? "Envoi en cours…" : "📧 Notifier tous les élèves par email"}
            </button>
            {notifResult && <p className="text-sm text-muted">{notifResult}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
