"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Phone, CheckCircle2, Loader2, Calendar } from "lucide-react";

const TOPICS = [
  "Lecture d'un graphique / setup",
  "Gestion du risque & sizing",
  "Analyse d'un trade perdant",
  "Williams %R / ROC / PVT",
  "Bookmap & order flow",
  "Psychologie du trading",
  "Construire ma routine",
  "Autre",
];

type CallRequest = {
  id: string;
  topic: string;
  status: string;
  slot_1: string;
  confirmed_slot: string | null;
  admin_note: string | null;
  created_at: string;
};

export function CallRequestForm({ userId, existing }: { userId: string; existing: CallRequest[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16);

  const [form, setForm] = useState({
    topic: TOPICS[0],
    message: "",
    contact: "",
    slot_1: "",
    slot_2: "",
    slot_3: "",
  });

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.slot_1 || !form.contact.trim()) {
      setError("Remplis au moins le 1er créneau et ton contact.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.from("call_requests").insert({
      student_id: userId,
      topic: form.topic,
      message: form.message || null,
      contact: form.contact,
      slot_1: new Date(form.slot_1).toISOString(),
      slot_2: form.slot_2 ? new Date(form.slot_2).toISOString() : null,
      slot_3: form.slot_3 ? new Date(form.slot_3).toISOString() : null,
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
    router.refresh();
  }

  const STATUS_LABEL: Record<string, { label: string; color: string }> = {
    pending:   { label: "En attente",  color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    accepted:  { label: "Confirmé ✅", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    declined:  { label: "Refusé",      color: "text-red-400 bg-red-400/10 border-red-400/20" },
    completed: { label: "Terminé",     color: "text-muted bg-surface-3 border-white/[0.08]" },
  };

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h1 className="text-cream text-2xl font-bold">Session 1:1 avec KMM</h1>
        <p className="text-muted text-sm mt-1">Réserve une session privée pour travailler un point précis avec Kevin.</p>
      </div>

      {/* Demandes existantes */}
      {existing.length > 0 && (
        <div className="space-y-3">
          <p className="text-cream text-sm font-semibold">Mes demandes</p>
          {existing.map((r) => {
            const s = STATUS_LABEL[r.status] ?? STATUS_LABEL.pending;
            return (
              <div key={r.id} className="bg-surface-2 border border-white/[0.06] rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-cream text-sm font-medium">{r.topic}</p>
                    <p className="text-muted text-xs mt-0.5">
                      {new Date(r.slot_1).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} · {new Date(r.slot_1).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {r.confirmed_slot && (
                      <p className="text-emerald-400 text-xs mt-1 font-semibold">
                        📅 Confirmé : {new Date(r.confirmed_slot).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {new Date(r.confirmed_slot).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                    {r.admin_note && (
                      <p className="text-muted/80 text-xs mt-1.5 italic border-l border-gold/30 pl-3">"{r.admin_note}"</p>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${s.color}`}>{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Formulaire */}
      {sent ? (
        <div className="flex flex-col items-center gap-4 py-10 text-center bg-emerald-400/5 border border-emerald-400/20 rounded-2xl">
          <CheckCircle2 size={40} className="text-emerald-400" />
          <div>
            <p className="text-cream font-bold text-lg">Demande envoyée !</p>
            <p className="text-muted text-sm mt-1">Kevin reviendra vers toi rapidement pour confirmer le créneau.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 bg-surface-2 border border-white/[0.06] rounded-2xl p-6">
          <p className="text-cream font-semibold text-sm">Nouvelle demande de session</p>

          {/* Sujet */}
          <div>
            <label className="block text-xs text-muted uppercase tracking-widest mb-2">Sujet de la session *</label>
            <select
              value={form.topic}
              onChange={(e) => set("topic", e.target.value)}
              className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40"
            >
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs text-muted uppercase tracking-widest mb-2">Détails (optionnel)</label>
            <textarea
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              rows={3}
              placeholder="Décris ton problème, envoie un screenshot de ton graphique, pose ta question…"
              className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 resize-none"
            />
          </div>

          {/* Créneaux */}
          <div>
            <label className="block text-xs text-muted uppercase tracking-widest mb-2">
              <Calendar size={11} className="inline mr-1" />
              Créneaux disponibles *
            </label>
            <div className="space-y-2">
              {[
                { key: "slot_1", label: "1er choix *", required: true },
                { key: "slot_2", label: "2ème choix" },
                { key: "slot_3", label: "3ème choix" },
              ].map(({ key, label, required }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-muted text-xs w-20 shrink-0">{label}</span>
                  <input
                    type="datetime-local"
                    min={tomorrow}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => set(key, e.target.value)}
                    required={required}
                    className="flex-1 bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-cream focus:outline-none focus:border-gold/40"
                  />
                </div>
              ))}
            </div>
            <p className="text-muted/50 text-[10px] mt-2">Propose 3 créneaux pour maximiser les chances de trouver un horaire commun.</p>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-xs text-muted uppercase tracking-widest mb-2">
              <Phone size={11} className="inline mr-1" />
              Téléphone / WhatsApp *
            </label>
            <input
              type="text"
              value={form.contact}
              onChange={(e) => set("contact", e.target.value)}
              placeholder="+33 6 XX XX XX XX"
              required
              className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40"
            />
            <p className="text-muted/50 text-[10px] mt-1">Kevin te contactera sur ce numéro pour confirmer et démarrer l'appel.</p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold text-[#0A0A0A] font-bold text-sm hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Phone size={15} />}
            {loading ? "Envoi…" : "Envoyer ma demande de session"}
          </button>
        </form>
      )}
    </div>
  );
}
