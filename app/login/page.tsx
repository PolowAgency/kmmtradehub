"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/login?reset=true`,
    });
    setLoading(false);
    if (resetError) { setError("Impossible d'envoyer l'email. Vérifie l'adresse."); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <p className="text-cream font-semibold">Email envoyé !</p>
        <p className="text-muted text-sm">Vérifie ta boîte mail (et tes spams) pour le lien de réinitialisation.</p>
        <button onClick={onBack} className="text-gold text-sm hover:text-gold-light transition-colors">← Retour</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-4">
      <div>
        <label className="block text-xs text-muted uppercase tracking-widest mb-2">Email</label>
        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="ton@email.com"
            className="w-full bg-surface-2 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-cream placeholder:text-muted/50 focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>
      </div>
      {error && <p className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2.5 px-3">{error}</p>}
      <button type="submit" disabled={loading} className="w-full bg-gold hover:bg-gold-light text-[#0A0A0A] font-semibold text-sm py-3 rounded-xl transition-colors glow-gold disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? "Envoi…" : "Envoyer le lien"}
      </button>
      <button type="button" onClick={onBack} className="w-full text-muted text-sm hover:text-cream transition-colors py-1">← Retour</button>
    </form>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/app/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link href="/" className="flex items-baseline gap-1 mb-10 group">
        <span className="text-gold font-bold text-xl tracking-wider">KMM</span>
        <span className="text-cream/50 text-xs tracking-[0.2em] uppercase group-hover:text-cream/70 transition-colors">
          TRADE
        </span>
      </Link>

      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-surface border border-white/[0.08] rounded-2xl p-8">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 mb-6 mx-auto">
            <TrendingUp size={22} className="text-gold" />
          </div>

          <h1 className="text-cream font-semibold text-xl text-center mb-1">
            {showForgot ? "Mot de passe oublié" : "Accès élèves"}
          </h1>
          <p className="text-muted text-sm text-center mb-8">
            {showForgot ? "Reçois un lien par email pour te reconnecter" : "Connecte-toi à ton espace KMM TRADE"}
          </p>

          {showForgot ? (
            <ForgotPasswordForm onBack={() => setShowForgot(false)} />
          ) : (

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="ton@email.com"
                  className="w-full bg-surface-2 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-cream placeholder:text-muted/50 focus:outline-none focus:border-gold/40 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-surface-2 border border-white/[0.08] rounded-xl pl-10 pr-11 py-3 text-sm text-cream placeholder:text-muted/50 focus:outline-none focus:border-gold/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-cream transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2.5 px-3">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-light text-[#0A0A0A] font-semibold text-sm py-3 rounded-xl transition-colors glow-gold disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>

            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="w-full text-muted/60 hover:text-muted text-xs transition-colors py-1 text-center"
            >
              Mot de passe oublié ?
            </button>
          </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted/50 mt-6">
          Pas encore membre ?{" "}
          <Link href="/offre" className="text-gold hover:text-gold-light transition-colors">
            Découvrir KMM VIP
          </Link>
        </p>
        <p className="text-center text-[10px] text-muted/30 mt-3 leading-relaxed max-w-xs mx-auto">
          Plateforme éducative. Le trading comporte des risques de perte en capital.
        </p>
      </div>
    </div>
  );
}
