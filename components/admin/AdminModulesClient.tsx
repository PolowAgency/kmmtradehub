"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Module = {
  id: string; title: string; description: string | null;
  level: string | null; duration_minutes: number; order_index: number;
  is_published: boolean; lessons?: Array<{ id: string }>;
};

const LEVELS = [
  { value: "debutant",      label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "avance",        label: "Avancé" },
];

export function AdminModulesClient({ initialModules }: { initialModules: Module[] }) {
  const [modules, setModules] = useState(initialModules);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Module | null>(null);
  const [form, setForm] = useState({ title: "", description: "", level: "debutant", duration_minutes: 0 });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  function openCreate() {
    setEditing(null);
    setForm({ title: "", description: "", level: "debutant", duration_minutes: 0 });
    setShowForm(true);
  }

  function openEdit(mod: Module) {
    setEditing(mod);
    setForm({
      title: mod.title,
      description: mod.description ?? "",
      level: mod.level ?? "debutant",
      duration_minutes: mod.duration_minutes,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setLoading(true);

    if (editing) {
      const { data } = await supabase
        .from("modules")
        .update({ ...form })
        .eq("id", editing.id)
        .select("*, lessons(id)")
        .single();
      if (data) setModules((prev) => prev.map((m) => (m.id === editing.id ? data : m)));
    } else {
      const orderIndex = modules.length + 1;
      const { data } = await supabase
        .from("modules")
        .insert({ ...form, order_index: orderIndex, is_published: false })
        .select("*, lessons(id)")
        .single();
      if (data) setModules((prev) => [...prev, data]);
    }

    setLoading(false);
    setShowForm(false);
  }

  async function handleTogglePublish(mod: Module) {
    const { data } = await supabase
      .from("modules")
      .update({ is_published: !mod.is_published })
      .eq("id", mod.id)
      .select("*, lessons(id)")
      .single();
    if (data) setModules((prev) => prev.map((m) => (m.id === mod.id ? data : m)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce module et toutes ses leçons ?")) return;
    await supabase.from("modules").delete().eq("id", id);
    setModules((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-cream text-2xl font-semibold">Modules</h1>
          <p className="text-muted text-sm mt-1">{modules.length} module{modules.length > 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gold text-[#0A0A0A] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-gold-light transition-colors"
        >
          <Plus size={16} /> Nouveau module
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-surface-2 border border-gold/20 rounded-2xl p-6 space-y-4">
          <h2 className="text-cream font-semibold text-sm">{editing ? "Modifier" : "Créer"} un module</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Titre *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors"
                placeholder="ex: Bases du trading"
              />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Niveau</label>
              <select
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors"
              >
                {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-widest mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-widest mb-2">Durée (minutes)</label>
            <input
              type="number"
              value={form.duration_minutes}
              onChange={(e) => setForm((f) => ({ ...f, duration_minutes: Number(e.target.value) }))}
              className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors"
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
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl border border-white/[0.12] text-muted hover:text-cream text-sm transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {modules.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <BookOpen size={40} className="text-muted/30 mb-4" />
            <p className="text-muted text-sm">Aucun module. Créez-en un !</p>
          </div>
        )}
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="flex items-center gap-4 bg-surface-2 border border-white/[0.06] rounded-xl p-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-cream text-sm font-medium truncate">{mod.title}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${
                  mod.is_published ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400" : "bg-surface-3 border-white/[0.08] text-muted"
                }`}>
                  {mod.is_published ? "Publié" : "Brouillon"}
                </span>
              </div>
              <p className="text-muted text-xs">{mod.lessons?.length ?? 0} leçon{(mod.lessons?.length ?? 0) > 1 ? "s" : ""}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => handleTogglePublish(mod)} className="p-2 rounded-lg text-muted hover:text-gold hover:bg-gold/5 transition-colors" title={mod.is_published ? "Dépublier" : "Publier"}>
                {mod.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button onClick={() => openEdit(mod)} className="p-2 rounded-lg text-muted hover:text-cream hover:bg-white/[0.05] transition-colors">
                <Pencil size={15} />
              </button>
              <button onClick={() => handleDelete(mod.id)} className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/5 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
