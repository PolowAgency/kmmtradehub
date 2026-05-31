"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Lesson = {
  id: string; module_id: string; title: string; content: string | null;
  order_index: number; duration_minutes: number; is_published: boolean;
  modules?: { title: string } | null;
};
type Module = { id: string; title: string };

export function AdminLessonsClient({
  initialLessons,
  modules,
}: {
  initialLessons: Lesson[];
  modules: Module[];
}) {
  const [lessons, setLessons] = useState(initialLessons);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [form, setForm] = useState({ module_id: modules[0]?.id ?? "", title: "", content: "", duration_minutes: 0 });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  function openCreate() {
    setEditing(null);
    setForm({ module_id: modules[0]?.id ?? "", title: "", content: "", duration_minutes: 0 });
    setShowForm(true);
  }

  function openEdit(l: Lesson) {
    setEditing(l);
    setForm({ module_id: l.module_id, title: l.title, content: l.content ?? "", duration_minutes: l.duration_minutes });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.module_id) return;
    setLoading(true);

    if (editing) {
      const { data } = await supabase
        .from("lessons")
        .update(form)
        .eq("id", editing.id)
        .select("*, modules(title)")
        .single();
      if (data) setLessons((prev) => prev.map((l) => (l.id === editing.id ? data : l)));
    } else {
      const orderIndex = lessons.filter((l) => l.module_id === form.module_id).length + 1;
      const { data } = await supabase
        .from("lessons")
        .insert({ ...form, order_index: orderIndex, is_published: false })
        .select("*, modules(title)")
        .single();
      if (data) setLessons((prev) => [...prev, data]);
    }

    setLoading(false);
    setShowForm(false);
  }

  async function handleToggle(l: Lesson) {
    const { data } = await supabase
      .from("lessons")
      .update({ is_published: !l.is_published })
      .eq("id", l.id)
      .select("*, modules(title)")
      .single();
    if (data) setLessons((prev) => prev.map((x) => (x.id === l.id ? data : x)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette leçon ?")) return;
    await supabase.from("lessons").delete().eq("id", id);
    setLessons((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-cream text-2xl font-semibold">Leçons</h1>
          <p className="text-muted text-sm mt-1">{lessons.length} leçon{lessons.length > 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={openCreate}
          disabled={modules.length === 0}
          className="flex items-center gap-2 bg-gold text-[#0A0A0A] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> Nouvelle leçon
        </button>
      </div>

      {modules.length === 0 && (
        <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4">
          <p className="text-amber-400 text-sm">Créez d&apos;abord un module avant d&apos;ajouter des leçons.</p>
        </div>
      )}

      {showForm && (
        <div className="bg-surface-2 border border-gold/20 rounded-2xl p-6 space-y-4">
          <h2 className="text-cream font-semibold text-sm">{editing ? "Modifier" : "Créer"} une leçon</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Module *</label>
              <select
                value={form.module_id}
                onChange={(e) => setForm((f) => ({ ...f, module_id: e.target.value }))}
                className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors"
              >
                {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Durée (min)</label>
              <input
                type="number"
                value={form.duration_minutes}
                onChange={(e) => setForm((f) => ({ ...f, duration_minutes: Number(e.target.value) }))}
                className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-widest mb-2">Titre *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors"
              placeholder="ex: Introduction aux bougies japonaises"
            />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-widest mb-2">Contenu (HTML)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={8}
              className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors resize-none font-mono text-xs"
              placeholder="<h2>Introduction</h2><p>Contenu de la leçon...</p>"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={loading || !form.title.trim()}
              className="px-5 py-2.5 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {loading ? "Enregistrement…" : "Sauvegarder"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-white/[0.12] text-muted hover:text-cream text-sm transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {lessons.length === 0 && !showForm && (
          <div className="flex flex-col items-center py-16 text-center">
            <FileText size={40} className="text-muted/30 mb-4" />
            <p className="text-muted text-sm">Aucune leçon.</p>
          </div>
        )}
        {lessons.map((l) => (
          <div key={l.id} className="flex items-center gap-4 bg-surface-2 border border-white/[0.06] rounded-xl p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-cream text-sm font-medium truncate">{l.title}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${
                  l.is_published ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400" : "bg-surface-3 border-white/[0.08] text-muted"
                }`}>
                  {l.is_published ? "Publié" : "Brouillon"}
                </span>
              </div>
              <p className="text-muted text-xs">{(l.modules as { title?: string } | null)?.title ?? ""} · {l.duration_minutes} min</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => handleToggle(l)} className="p-2 rounded-lg text-muted hover:text-gold hover:bg-gold/5 transition-colors">
                {l.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button onClick={() => openEdit(l)} className="p-2 rounded-lg text-muted hover:text-cream hover:bg-white/[0.05] transition-colors">
                <Pencil size={15} />
              </button>
              <button onClick={() => handleDelete(l.id)} className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/5 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
