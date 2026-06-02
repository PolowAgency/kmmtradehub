"use client";

import { useEffect, useState } from "react";
import { X, BookOpen, Users, Trophy, ArrowRight, Flame } from "lucide-react";

const STEPS = [
  {
    emoji: "👋",
    title: "Bienvenue dans KMM VIP",
    desc: "Tu rejoins une communauté de traders sérieux. Voici ce qui t'attend ici.",
    items: null,
  },
  {
    emoji: "🎯",
    title: "Ce que tu vas trouver",
    desc: null,
    items: [
      { icon: BookOpen, color: "text-gold",        bg: "bg-gold/10",        label: "Modules & leçons",   sub: "Progresse à ton rythme" },
      { icon: Users,    color: "text-blue-400",     bg: "bg-blue-400/10",    label: "Communauté",         sub: "Échange avec les membres" },
      { icon: Trophy,   color: "text-purple-400",   bg: "bg-purple-400/10",  label: "Quiz & résultats",   sub: "Teste tes connaissances" },
      { icon: Flame,    color: "text-orange-400",   bg: "bg-orange-400/10",  label: "Streaks & badges",   sub: "Reste régulier" },
    ],
  },
  {
    emoji: "🚀",
    title: "Prêt à commencer ?",
    desc: "Lance-toi sur le premier module. Le marché n'attend pas — mais la rigueur, ça s'apprend.",
    items: null,
  },
];

export function OnboardingModal({
  userId,
  userName,
  onboardingDone,
}: {
  userId: string;
  userName: string;
  onboardingDone: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!onboardingDone) setVisible(true);
  }, [onboardingDone]);

  async function dismiss() {
    setVisible(false);
    // Persister côté Supabase — ne jamais réafficher sur aucun appareil
    await fetch("/api/user/onboarding", { method: "POST" });
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={dismiss} />

      <div className="relative w-full max-w-sm bg-surface border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
        <div
          className="absolute top-0 inset-x-0 h-32 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.12) 0%, transparent 70%)" }}
        />

        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-muted hover:text-cream hover:bg-white/[0.06] transition-all z-10"
        >
          <X size={16} />
        </button>

        <div className="px-6 pt-8 pb-6">
          <div className="text-5xl text-center mb-4">{current.emoji}</div>

          <h2 className="text-cream text-xl font-bold text-center mb-2">
            {step === 0 ? <>{userName}, {current.title}</> : current.title}
          </h2>

          {current.desc && (
            <p className="text-muted text-sm text-center leading-relaxed mb-5">{current.desc}</p>
          )}

          {current.items && (
            <div className="space-y-2.5 mb-5 mt-4">
              {current.items.map(({ icon: Icon, color, bg, label, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div>
                    <p className="text-cream text-sm font-medium">{label}</p>
                    <p className="text-muted text-xs">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === step ? "w-5 h-1.5 bg-gold" : "w-1.5 h-1.5 bg-white/[0.15]"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-full flex items-center justify-center gap-2 bg-gold text-[#0A0A0A] font-bold text-sm py-3 rounded-2xl hover:bg-gold-light transition-colors"
          >
            {isLast ? "Commencer maintenant" : "Suivant"}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
