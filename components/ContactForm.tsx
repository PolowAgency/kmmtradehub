"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      {/* Contact info */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-white/5 mb-8">
        <Mail size={18} className="text-gold/60 shrink-0" />
        <div>
          <p className="text-xs text-muted">Email</p>
          <p className="text-sm text-cream">contact@kmmtradehub.com</p>
        </div>
      </div>

      {status === "success" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 px-8 rounded-2xl bg-surface border border-gold/15"
        >
          <CheckCircle size={40} className="text-gold mx-auto mb-4" />
          <h2 className="text-xl font-bold text-cream mb-2">Message envoyé</h2>
          <p className="text-muted text-sm">
            Merci ! Nous reviendrons vers toi dans les plus brefs délais.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-muted mb-2 tracking-wide" htmlFor="name">
              Nom
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ton nom"
              className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-cream placeholder:text-muted/50 text-sm focus:outline-none focus:border-gold/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-2 tracking-wide" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="ton@email.com"
              className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-cream placeholder:text-muted/50 text-sm focus:outline-none focus:border-gold/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-2 tracking-wide" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Ta question ou ton message..."
              className="w-full px-4 py-3 rounded-lg bg-surface border border-white/10 text-cream placeholder:text-muted/50 text-sm focus:outline-none focus:border-gold/30 transition-colors resize-none"
            />
          </div>

          {status === "error" && (
            <p className="text-xs text-red-400">
              Une erreur est survenue. Réessaie ou contacte-nous par email.
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={status === "sending"}
            className="w-full"
          >
            {status === "sending" ? "Envoi en cours..." : "Envoyer le message"}
            <Send size={15} />
          </Button>
        </form>
      )}
    </div>
  );
}
