"use client";

import { useState } from "react";
import { Phone, CheckCircle2, XCircle, Clock, PhoneCall, ChevronDown, ChevronUp, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Slot = string | null;
type Request = {
  id: string;
  topic: string;
  message: string | null;
  contact: string;
  slot_1: string;
  slot_2: Slot;
  slot_3: Slot;
  status: string;
  confirmed_slot: Slot;
  admin_note: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string } | null;
};

const STATUS_CONFIG = {
  pending:   { label: "En attente",  color: "text-amber-400 bg-amber-400/8 border-amber-400/20",   icon: Clock },
  accepted:  { label: "Confirmé",    color: "text-emerald-400 bg-emerald-400/8 border-emerald-400/20", icon: CheckCircle2 },
  declined:  { label: "Refusé",      color: "text-red-400 bg-red-400/8 border-red-400/20",         icon: XCircle },
  completed: { label: "Terminé",     color: "text-muted bg-surface-3 border-white/[0.08]",         icon: PhoneCall },
};

function formatSlot(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function AdminCallsClient({ initialRequests }: { initialRequests: Request[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [requests, setRequests] = useState(initialRequests);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("pending");
  const [note, setNote] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const pending   = requests.filter((r) => r.status === "pending").length;
  const accepted  = requests.filter((r) => r.status === "accepted").length;

  async function updateStatus(id: string, status: string, confirmedSlot?: string) {
    setLoading(id);
    await supabase.from("call_requests").update({
      status,
      confirmed_slot: confirmedSlot ?? null,
      admin_note: note[id] ?? null,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status, confirmed_slot: confirmedSlot ?? null, admin_note: note[id] ?? null } : r));
    setExpanded(null);
    setLoading(null);
    router.refresh();
  }

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-cream text-2xl font-semibold">Sessions 1:1</h1>
          <p className="text-muted text-sm mt-1">
            {pending > 0 && <span className="text-amber-400 font-semibold">{pending} en attente</span>}
            {pending > 0 && accepted > 0 && " · "}
            {accepted > 0 && <span className="text-emerald-400 font-semibold">{accepted} confirmée{accepted > 1 ? "s" : ""}</span>}
            {pending === 0 && accepted === 0 && "Aucune demande active"}
          </p>
        </div>

        {/* Filtres */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { key: "pending",   label: "En attente" },
            { key: "accepted",  label: "Confirmées" },
            { key: "completed", label: "Terminées" },
            { key: "all",       label: "Toutes" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filter === key ? "bg-gold/15 border-gold/30 text-gold" : "bg-surface-2 border-white/[0.07] text-muted hover:text-cream"
              }`}
            >
              {label}
              <span className="ml-1.5 opacity-60">{key === "all" ? requests.length : requests.filter((r) => r.status === key).length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Phone size={36} className="text-muted/30 mb-4" />
          <p className="text-muted text-sm">Aucune demande dans cette catégorie.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((req) => {
          const cfg = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
          const Icon = cfg.icon;
          const isExpanded = expanded === req.id;
          const slots = [req.slot_1, req.slot_2, req.slot_3].filter(Boolean) as string[];

          return (
            <div key={req.id} className="bg-surface-2 border border-white/[0.06] rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-full bg-surface-3 text-muted font-bold text-sm flex items-center justify-center shrink-0">
                  {req.profiles?.full_name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-cream text-sm font-semibold truncate">{req.profiles?.full_name ?? "Élève"}</p>
                  <p className="text-muted text-xs truncate">{req.topic}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                    <Icon size={10} />{cfg.label}
                  </span>
                  <button onClick={() => setExpanded(isExpanded ? null : req.id)} className="p-1.5 text-muted hover:text-cream transition-colors">
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {/* Détail */}
              {isExpanded && (
                <div className="border-t border-white/[0.05] px-5 pb-5 pt-4 space-y-4">
                  {/* Infos contact */}
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-muted text-[10px] uppercase tracking-widest mb-1">Contact</p>
                      <p className="text-cream text-sm font-semibold">{req.contact}</p>
                    </div>
                    <div>
                      <p className="text-muted text-[10px] uppercase tracking-widest mb-1">Email</p>
                      <p className="text-cream text-sm">{req.profiles?.email}</p>
                    </div>
                    <div>
                      <p className="text-muted text-[10px] uppercase tracking-widest mb-1">Demande</p>
                      <p className="text-muted text-xs">{new Date(req.created_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>

                  {/* Message élève */}
                  {req.message && (
                    <div className="bg-surface-3 rounded-xl p-3">
                      <p className="text-muted text-[10px] uppercase tracking-widest mb-1">Message</p>
                      <p className="text-cream/80 text-sm leading-relaxed">{req.message}</p>
                    </div>
                  )}

                  {/* Créneaux proposés */}
                  <div>
                    <p className="text-muted text-[10px] uppercase tracking-widest mb-2">Créneaux proposés</p>
                    <div className="space-y-2">
                      {slots.map((slot, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="flex-1 flex items-center gap-2 bg-surface-3 border border-white/[0.06] rounded-xl px-3 py-2">
                            <span className="text-muted text-[10px] shrink-0">{i + 1}.</span>
                            <span className="text-cream text-sm">{formatSlot(slot)}</span>
                          </div>
                          {req.status === "pending" && (
                            <button
                              onClick={() => updateStatus(req.id, "accepted", slot)}
                              disabled={!!loading}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-400/15 transition-all disabled:opacity-50"
                            >
                              <Check size={12} /> Retenir ce créneau
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Créneau confirmé */}
                  {req.confirmed_slot && (
                    <div className="bg-emerald-400/8 border border-emerald-400/20 rounded-xl px-4 py-3">
                      <p className="text-emerald-400 text-xs font-semibold">✅ Créneau confirmé : {formatSlot(req.confirmed_slot)}</p>
                    </div>
                  )}

                  {/* Note admin */}
                  <div>
                    <label className="block text-muted text-[10px] uppercase tracking-widest mb-2">Message à l'élève (optionnel)</label>
                    <textarea
                      value={note[req.id] ?? req.admin_note ?? ""}
                      onChange={(e) => setNote((n) => ({ ...n, [req.id]: e.target.value }))}
                      placeholder="Ex: Parfait, je te rappelle sur WhatsApp 5 minutes avant…"
                      rows={2}
                      className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold/40 resize-none"
                    />
                  </div>

                  {/* Actions */}
                  {req.status === "pending" && (
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => updateStatus(req.id, "declined")}
                        disabled={!!loading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-400/8 border border-red-400/20 text-red-400 text-sm font-medium hover:bg-red-400/12 transition-all disabled:opacity-50"
                      >
                        <XCircle size={14} /> Refuser
                      </button>
                    </div>
                  )}
                  {req.status === "accepted" && (
                    <button
                      onClick={() => updateStatus(req.id, "completed")}
                      disabled={!!loading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-3 border border-white/[0.1] text-muted text-sm hover:text-cream transition-all disabled:opacity-50"
                    >
                      <PhoneCall size={14} /> Marquer comme terminé
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
