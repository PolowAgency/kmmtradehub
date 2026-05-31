"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, Radio, PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Live {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  status: "scheduled" | "live" | "ended";
  stream_url: string | null;
  live_replays: Array<{ id: string }>;
}

const STATUS_LABELS = { scheduled: "Programmé", live: "En direct", ended: "Terminé" };
const STATUS_COLORS = {
  live: "text-red-400 bg-red-400/10 border-red-400/20",
  scheduled: "text-gold bg-gold/10 border-gold/20",
  ended: "text-muted bg-surface-3 border-white/[0.08]",
};

export function AdminLiveClient({ initialLives }: { initialLives: Live[] }) {
  const [lives, setLives] = useState(initialLives);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", scheduled_at: "", stream_url: "", status: "scheduled" as Live["status"] });
  const [replayForm, setReplayForm] = useState<{ liveId: string; url: string; title: string; duration: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleCreate() {
    if (!form.title.trim() || !form.scheduled_at) return;
    setSaving(true);
    const { data } = await supabase.from("lives").insert({
      title: form.title.trim(),
      description: form.description || null,
      scheduled_at: form.scheduled_at,
      stream_url: form.stream_url || null,
      status: form.status,
    }).select("*, live_replays(id)").single();
    if (data) setLives((prev) => [data as Live, ...prev]);
    setShowForm(false);
    setForm({ title: "", description: "", scheduled_at: "", stream_url: "", status: "scheduled" });
    setSaving(false);
    router.refresh();
  }

  async function updateStatus(id: string, status: Live["status"]) {
    await supabase.from("lives").update({ status }).eq("id", id);
    setLives((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce live ?")) return;
    await supabase.from("lives").delete().eq("id", id);
    setLives((prev) => prev.filter((l) => l.id !== id));
  }

  async function addReplay() {
    if (!replayForm?.url.trim()) return;
    await supabase.from("live_replays").insert({
      live_id: replayForm.liveId,
      url: replayForm.url.trim(),
      title: replayForm.title || null,
      duration_minutes: replayForm.duration ? Number(replayForm.duration) : null,
    });
    setLives((prev) => prev.map((l) => l.id === replayForm.liveId ? { ...l, live_replays: [...l.live_replays, { id: "tmp" }] } : l));
    setReplayForm(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-cream text-2xl font-semibold">Lives</h1>
          <p className="text-muted text-sm mt-1">{lives.length} live{lives.length > 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gold text-[#0A0A0A] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-gold-light transition-colors"
        >
          <Plus size={16} /> Nouveau live
        </button>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <div className="bg-surface-2 border border-gold/20 rounded-2xl p-6 space-y-4">
          <h2 className="text-cream font-semibold text-sm">Créer un live</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Titre *</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Date & heure *</label>
              <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))} className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-widest mb-2">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors resize-none" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">URL stream (optionnel)</label>
              <input value={form.stream_url} onChange={(e) => setForm((f) => ({ ...f, stream_url: e.target.value }))} placeholder="https://youtube.com/embed/…" className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Statut</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Live["status"] }))} className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors">
                <option value="scheduled">Programmé</option>
                <option value="live">En direct</option>
                <option value="ended">Terminé</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={saving || !form.title.trim() || !form.scheduled_at} className="px-5 py-2.5 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors disabled:opacity-50">
              {saving ? "Enregistrement…" : "Créer"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-white/[0.12] text-muted hover:text-cream text-sm transition-colors">Annuler</button>
          </div>
        </div>
      )}

      {/* Modal replay */}
      {replayForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.75)" }} onClick={() => setReplayForm(null)}>
          <div className="bg-surface-2 border border-white/[0.1] rounded-2xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-cream font-semibold">Ajouter un replay</h3>
            <input value={replayForm.url} onChange={(e) => setReplayForm((r) => r ? { ...r, url: e.target.value } : r)} placeholder="URL du replay (YouTube, Vimeo…)" className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors" />
            <div className="grid grid-cols-2 gap-3">
              <input value={replayForm.title} onChange={(e) => setReplayForm((r) => r ? { ...r, title: e.target.value } : r)} placeholder="Titre (optionnel)" className="bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors" />
              <input type="number" value={replayForm.duration} onChange={(e) => setReplayForm((r) => r ? { ...r, duration: e.target.value } : r)} placeholder="Durée (min)" className="bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors" />
            </div>
            <div className="flex gap-3">
              <button onClick={addReplay} className="px-5 py-2.5 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors">Ajouter</button>
              <button onClick={() => setReplayForm(null)} className="px-5 py-2.5 rounded-xl border border-white/[0.12] text-muted hover:text-cream text-sm transition-colors">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Liste */}
      {lives.length === 0 && !showForm ? (
        <div className="flex flex-col items-center py-16 text-center gap-4">
          <Radio size={40} className="text-muted/20" />
          <p className="text-muted text-sm">Aucun live créé.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lives.map((live) => (
            <div key={live.id} className="flex items-center gap-4 bg-surface-2 border border-white/[0.06] rounded-xl p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[live.status]}`}>
                    {STATUS_LABELS[live.status]}
                  </span>
                  {live.live_replays?.length > 0 && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full border border-white/[0.08] text-muted">
                      {live.live_replays.length} replay{live.live_replays.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-cream text-sm font-medium truncate">{live.title}</p>
                <p className="text-muted text-[10px] mt-0.5">
                  {new Date(live.scheduled_at).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Changer statut rapide */}
                {live.status === "scheduled" && (
                  <button onClick={() => updateStatus(live.id, "live")} className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-medium border border-red-500/20 hover:bg-red-500/20 transition-colors">
                    Démarrer
                  </button>
                )}
                {live.status === "live" && (
                  <button onClick={() => updateStatus(live.id, "ended")} className="px-2.5 py-1.5 rounded-lg bg-surface-3 text-muted text-[10px] font-medium border border-white/[0.08] hover:text-cream transition-colors">
                    Terminer
                  </button>
                )}
                <button onClick={() => setReplayForm({ liveId: live.id, url: "", title: "", duration: "" })} className="p-2 rounded-lg text-muted hover:text-gold transition-colors" title="Ajouter replay">
                  <PlayCircle size={15} />
                </button>
                <button onClick={() => handleDelete(live.id)} className="p-2 rounded-lg text-muted hover:text-red-400 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
