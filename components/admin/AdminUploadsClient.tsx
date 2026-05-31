"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, FileText, Headphones, Video, ExternalLink, Upload, X, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Resource = {
  id: string; lesson_id: string; title: string; type: string; url: string; file_size?: number | null;
  lessons?: { title: string } | null;
};
type Lesson = { id: string; title: string; module_id: string; modules?: { title: string } | { title: string }[] | null };

const TYPE_META: Record<string, { icon: React.ElementType; color: string; bg: string; bucket: string; accept: string; label: string }> = {
  pdf:   { icon: FileText,     color: "text-red-400",     bg: "bg-red-400/10",     bucket: "pdf-resources",   accept: ".pdf",                      label: "PDF" },
  audio: { icon: Headphones,   color: "text-blue-400",    bg: "bg-blue-400/10",    bucket: "audio-resources", accept: ".mp3,.m4a,.wav,.ogg,.aac",  label: "Audio" },
  video: { icon: Video,        color: "text-purple-400",  bg: "bg-purple-400/10",  bucket: "video-resources", accept: ".mp4,.mov,.webm,.mkv",      label: "Vidéo" },
  link:  { icon: ExternalLink, color: "text-emerald-400", bg: "bg-emerald-400/10", bucket: "",                accept: "",                          label: "Lien" },
};

function buildUploadPath(fileName: string) {
  const ext = fileName.split(".").pop() ?? "";
  return `${crypto.randomUUID()}.${ext}`;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function getModuleTitle(lesson: Lesson): string {
  const m = lesson.modules;
  if (!m) return "?";
  if (Array.isArray(m)) return m[0]?.title ?? "?";
  return (m as { title: string }).title ?? "?";
}

export function AdminUploadsClient({
  initialResources,
  lessons,
}: {
  initialResources: Resource[];
  lessons: Lesson[];
}) {
  const [resources, setResources] = useState(initialResources);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ lesson_id: lessons[0]?.id ?? "", title: "", type: "pdf", url: "" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const isLink = form.type === "link";
  const meta = TYPE_META[form.type] ?? TYPE_META.link;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (!form.title) setForm((prev) => ({ ...prev, title: f.name.replace(/\.[^.]+$/, "") }));
  }

  function resetForm() {
    setShowForm(false);
    setFile(null);
    setError(null);
    setUploadProgress(0);
    setForm({ lesson_id: lessons[0]?.id ?? "", title: "", type: "pdf", url: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave() {
    if (!form.title.trim() || !form.lesson_id) return;
    if (!isLink && !file) { setError("Sélectionne un fichier."); return; }
    if (isLink && !form.url.trim()) { setError("Colle une URL."); return; }

    setError(null);
    setUploading(true);
    setUploadProgress(10);

    let finalUrl = form.url;
    let fileSize: number | null = null;

    if (!isLink && file) {
      const bucket = meta.bucket;
      const path = buildUploadPath(file.name);

      setUploadProgress(30);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError(`Erreur upload : ${uploadError.message}`);
        setUploading(false);
        return;
      }

      setUploadProgress(80);
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
      finalUrl = urlData.publicUrl;
      fileSize = file.size;
    }

    setUploadProgress(90);
    const { data } = await supabase
      .from("lesson_resources")
      .insert({ lesson_id: form.lesson_id, title: form.title, type: form.type, url: finalUrl, file_size: fileSize })
      .select("*, lessons(title)")
      .single();

    if (data) setResources((prev) => [data, ...prev]);
    setUploadProgress(100);
    setUploading(false);
    resetForm();
  }

  async function handleDelete(id: string, url: string, type: string) {
    if (!confirm("Supprimer cette ressource ?")) return;
    await supabase.from("lesson_resources").delete().eq("id", id);
    // Try to delete from storage too (best effort)
    if (type !== "link" && url.includes("supabase")) {
      const bucket = TYPE_META[type]?.bucket;
      if (bucket) {
        const path = url.split(`/${bucket}/`)[1];
        if (path) await supabase.storage.from(bucket).remove([path]);
      }
    }
    setResources((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-cream text-2xl font-semibold">Ressources & Uploads</h1>
          <p className="text-muted text-sm mt-1">{resources.length} ressource{resources.length > 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gold text-[#0A0A0A] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-gold-light transition-colors"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-surface-2 border border-gold/20 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-cream font-semibold text-sm">Ajouter une ressource</h2>
            <button onClick={resetForm} className="text-muted hover:text-cream transition-colors"><X size={16} /></button>
          </div>

          {/* Type selector */}
          <div>
            <label className="block text-xs text-muted uppercase tracking-widest mb-3">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(TYPE_META).map(([key, m]) => {
                const Icon = m.icon;
                return (
                  <button
                    key={key}
                    onClick={() => { setForm((f) => ({ ...f, type: key })); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all ${
                      form.type === key
                        ? `${m.bg} border-current ${m.color}`
                        : "border-white/[0.08] text-muted hover:text-cream hover:border-white/[0.2]"
                    }`}
                  >
                    <Icon size={18} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Leçon *</label>
              <select
                value={form.lesson_id}
                onChange={(e) => setForm((f) => ({ ...f, lesson_id: e.target.value }))}
                className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors"
              >
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {getModuleTitle(l)} {l.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Titre *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="ex: Fiche gestion du risque"
              />
            </div>
          </div>

          {/* File upload zone OR URL input */}
          {isLink ? (
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">URL *</label>
              <input
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="https://..."
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">
                Fichier * <span className="normal-case text-muted/60">({meta.accept.replace(/\./g, "").replace(/,/g, ", ").toUpperCase()})</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept={meta.accept}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`flex flex-col items-center gap-3 w-full py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  file
                    ? "border-gold/40 bg-gold/5"
                    : "border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.02]"
                }`}
              >
                {file ? (
                  <>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${meta.bg}`}>
                      <meta.icon size={20} className={meta.color} />
                    </div>
                    <div className="text-center">
                      <p className="text-cream text-sm font-medium">{file.name}</p>
                      <p className="text-muted text-xs mt-0.5">{formatSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="text-xs text-muted hover:text-red-400 transition-colors"
                    >
                      Changer de fichier
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.05]">
                      <Upload size={20} className="text-muted" />
                    </div>
                    <div className="text-center">
                      <p className="text-cream text-sm font-medium">Clique pour choisir un fichier</p>
                      <p className="text-muted text-xs mt-0.5">ou glisse-dépose ton fichier ici</p>
                    </div>
                  </>
                )}
              </label>
            </div>
          )}

          {/* Progress bar during upload */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Upload en cours…</span>
                <span className="text-gold">{uploadProgress}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={uploading || !form.title.trim() || (!isLink && !file) || (isLink && !form.url.trim())}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? <><Loader2 size={15} className="animate-spin" /> Upload…</> : <><Check size={15} /> Enregistrer</>}
            </button>
            <button onClick={resetForm} disabled={uploading} className="px-5 py-2.5 rounded-xl border border-white/[0.12] text-muted hover:text-cream text-sm transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {resources.length === 0 && !showForm && (
          <div className="flex flex-col items-center py-16 text-center">
            <Upload size={40} className="text-muted/30 mb-4" />
            <p className="text-muted text-sm">Aucune ressource. Uploadez votre premier contenu !</p>
          </div>
        )}
        {resources.map((res) => {
          const m = TYPE_META[res.type] ?? TYPE_META.link;
          const Icon = m.icon;
          return (
            <div key={res.id} className="flex items-center gap-4 bg-surface-2 border border-white/[0.06] rounded-xl p-4">
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${m.bg} shrink-0`}>
                <Icon size={15} className={m.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-cream text-sm font-medium truncate">{res.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-muted text-xs truncate">{(res.lessons as { title?: string } | null)?.title ?? ""}</p>
                  {res.file_size && <span className="text-muted/50 text-[10px]">· {formatSize(res.file_size)}</span>}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${m.bg} ${m.color} shrink-0`}>{m.label}</span>
                </div>
              </div>
              <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-muted hover:text-gold transition-colors shrink-0">
                <ExternalLink size={14} />
              </a>
              <button onClick={() => handleDelete(res.id, res.url, res.type)} className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/5 transition-colors shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
