"use client";

import { useState } from "react";
import { Plus, Trash2, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const CONDITION_TYPES = [
  { value: "lessons_completed", label: "Leçons complétées" },
  { value: "module_completed",  label: "Modules terminés" },
  { value: "quiz_passed",       label: "Quiz réussis" },
  { value: "streak_days",       label: "Jours de streak" },
];

const EMOJIS = ["🎯","🔥","📈","🏆","💎","✅","🏅","👑","⚡","🚀","📅","💪","🌟","🎖️","🥇","🛡️","🎓","🔑","💡","⭐"];

type Badge = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  condition_type: string;
  condition_value: number;
};

export function AdminBadgesClient({ initialBadges }: { initialBadges: Badge[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [badges, setBadges] = useState(initialBadges);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", icon: "🎯",
    condition_type: "lessons_completed", condition_value: 1,
  });

  function set(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.from("badges").insert({
      name: form.name,
      description: form.description || null,
      icon: form.icon,
      condition_type: form.condition_type,
      condition_value: form.condition_value,
    }).select().single();
    if (!error && data) {
      setBadges((prev) => [...prev, data]);
      setShowForm(false);
      setForm({ name: "", description: "", icon: "🎯", condition_type: "lessons_completed", condition_value: 1 });
      router.refresh();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce badge ? Les élèves qui l'ont gagné le perdront.")) return;
    await supabase.from("badges").delete().eq("id", id);
    setBadges((prev) => prev.filter((b) => b.id !== id));
    router.refresh();
  }

  const conditionLabel = (type: string, value: number) => {
    const t = CONDITION_TYPES.find((c) => c.value === type);
    return `${t?.label ?? type} ≥ ${value}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-cream text-2xl font-semibold">Badges</h1>
          <p className="text-muted text-sm mt-1">{badges.length} badge{badges.length > 1 ? "s" : ""} configuré{badges.length > 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gold text-[#0A0A0A] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-gold-light transition-colors"
        >
          <Plus size={16} /> Nouveau badge
        </button>
      </div>

      {showForm && (
        <div className="bg-surface-2 border border-gold/20 rounded-2xl p-6 space-y-5">
          <h2 className="text-cream font-semibold text-sm">Créer un badge</h2>

          {/* Emoji picker */}
          <div>
            <label className="block text-xs text-muted uppercase tracking-widest mb-2">Icône</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => set("icon", e)}
                  className={`text-xl w-10 h-10 rounded-xl border transition-all ${
                    form.icon === e ? "border-gold/40 bg-gold/10" : "border-white/[0.08] hover:border-white/[0.2]"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Nom *</label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ex : Premier pas"
                className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40"
              />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Description</label>
              <input
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Ex : Complète ta première leçon"
                className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Condition</label>
              <select
                value={form.condition_type}
                onChange={(e) => set("condition_type", e.target.value)}
                className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40"
              >
                {CONDITION_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Valeur minimum</label>
              <input
                type="number" min={1}
                value={form.condition_value}
                onChange={(e) => set("condition_value", Number(e.target.value))}
                className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={loading || !form.name.trim()} className="px-5 py-2.5 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors disabled:opacity-50">
              {loading ? "Enregistrement…" : "Créer le badge"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-white/[0.12] text-muted hover:text-cream text-sm">Annuler</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {badges.length === 0 && !showForm && (
          <div className="flex flex-col items-center py-16 text-center">
            <Award size={40} className="text-muted/30 mb-4" />
            <p className="text-muted text-sm">Aucun badge configuré.</p>
            <p className="text-muted/60 text-xs mt-1">Crée des badges pour motiver tes élèves.</p>
          </div>
        )}
        {badges.map((badge) => (
          <div key={badge.id} className="flex items-center gap-4 bg-surface-2 border border-white/[0.06] rounded-xl p-4">
            <div className="text-3xl shrink-0 w-12 h-12 flex items-center justify-center bg-surface-3 rounded-xl border border-white/[0.06]">
              {badge.icon ?? "🏆"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-cream text-sm font-semibold">{badge.name}</p>
              {badge.description && <p className="text-muted text-xs mt-0.5">{badge.description}</p>}
              <p className="text-gold/70 text-[10px] mt-1 font-mono">{conditionLabel(badge.condition_type, badge.condition_value)}</p>
            </div>
            <button onClick={() => handleDelete(badge.id)} className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/5 transition-colors shrink-0">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
