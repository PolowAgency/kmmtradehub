"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ArrowRight, Trophy } from "lucide-react";
import { BadgeUnlockedModal } from "@/components/app/BadgeUnlockedModal";

interface BadgeInfo {
  id: string;
  name: string;
  description: string | null;
  icon: string;
}

type Answer = { id: string; answer: string; order_index: number };
type Question = { id: string; question: string; explanation: string | null; quiz_answers: Answer[] };

interface Props {
  quizId: string;
  title: string;
  description: string | null;
  passingScore: number;
  questions: Question[];
}

export function QuizClient({ quizId, title, description, passingScore, questions }: Props) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [confirmed, setConfirmed] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalPassed, setFinalPassed] = useState(false);
  const [newBadges, setNewBadges] = useState<BadgeInfo[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [review, setReview] = useState<Record<string, { correctAnswerId: string | null; isCorrect: boolean; explanation: string | null }>>({});
  const router = useRouter();

  const q = questions[current];
  const totalQ = questions.length;
  const isConfirmed = confirmed[current];
  const selectedId = selected[current];
  const currentReview = q ? review[q.id] : undefined;
  const isCorrect = currentReview?.isCorrect;

  function handleSelect(answerId: string) {
    if (isConfirmed) return;
    setSelected((prev) => ({ ...prev, [current]: answerId }));
  }

  function handleConfirm() {
    if (!selectedId) return;
    setConfirmed((prev) => ({ ...prev, [current]: true }));
  }

  async function handleNext() {
    if (current < totalQ - 1) {
      setCurrent((c) => c + 1);
    } else {
      await finishQuiz();
    }
  }

  async function finishQuiz() {
    if (totalQ === 0) return;
    setSaving(true);
    const answers = Object.fromEntries(
      questions
        .map((question, index) => {
          const answerId = selected[index];
          return answerId ? [question.id, answerId] : null;
        })
        .filter((entry): entry is [string, string] => entry !== null)
    );

    const response = await fetch(`/api/learning/quizzes/${quizId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answers }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setSaving(false);
      setSubmitError(payload.error ?? "Une erreur est survenue. Réessaie.");
      return;
    }
    setSubmitError(null);

    const reviewByQuestion = Object.fromEntries(
      (payload.review ?? []).map((entry: { questionId: string; correctAnswerId: string | null; isCorrect: boolean; explanation: string | null }) => [
        entry.questionId,
        {
          correctAnswerId: entry.correctAnswerId,
          isCorrect: entry.isCorrect,
          explanation: entry.explanation,
        },
      ])
    ) as Record<string, { correctAnswerId: string | null; isCorrect: boolean; explanation: string | null }>;

    setReview(reviewByQuestion);
    setFinalScore(payload.score ?? 0);
    setFinalPassed(Boolean(payload.passed));
    setNewBadges(payload.badges ?? []);
    setSaving(false);
    setFinished(true);
    router.refresh();
  }

  // Results screen
  if (finished) {
    const correctCount = Object.values(review).filter((entry) => entry.isCorrect).length;

    return (
      <>
      <div className="flex flex-col items-center text-center py-8 space-y-6">
        <div className={`flex items-center justify-center w-20 h-20 rounded-full border-2 ${
          finalPassed ? "bg-gold/10 border-gold/30" : "bg-red-500/10 border-red-500/30"
        }`}>
          {finalPassed ? (
            <Trophy size={36} className="text-gold" />
          ) : (
            <XCircle size={36} className="text-red-400" />
          )}
        </div>

        <div>
          <p className="text-gold font-bold text-5xl mb-1">{finalScore}%</p>
          <p className="text-cream font-semibold text-lg">
            {finalPassed ? "Félicitations !" : "Presque !"}
          </p>
          <p className="text-muted text-sm mt-1">
            {correctCount} / {totalQ} bonne{correctCount > 1 ? "s" : ""} réponse{correctCount > 1 ? "s" : ""}
          </p>
        </div>

        {!finalPassed && (
          <p className="text-muted text-sm max-w-xs">
            Score minimum requis : {passingScore}%. Relis les leçons du module et réessaie !
          </p>
        )}

        <div className="flex gap-3 flex-wrap justify-center">
          {!finalPassed && (
            <button
              onClick={() => {
                setCurrent(0); setSelected({}); setConfirmed({}); setFinished(false); setReview({});
              }}
              className="px-5 py-2.5 rounded-xl border border-white/[0.12] text-cream text-sm hover:border-gold/30 transition-colors"
            >
              Réessayer
            </button>
          )}
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors"
          >
            Continuer
          </button>
        </div>
      </div>

      {/* Modal badge débloqué */}
      {newBadges.length > 0 && (
        <BadgeUnlockedModal badges={newBadges} onClose={() => setNewBadges([])} />
      )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      {totalQ === 0 && (
        <div className="bg-surface-2 border border-red-500/20 rounded-2xl p-6 text-sm text-red-300">
          Ce quiz est indisponible pour le moment.
        </div>
      )}

      {totalQ > 0 && (
      <>
      {/* Header */}
      <div>
        <h1 className="text-cream text-xl font-semibold">{title}</h1>
        {description && <p className="text-muted text-sm mt-1">{description}</p>}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-500"
            style={{ width: `${((current + 1) / totalQ) * 100}%` }}
          />
        </div>
        <span className="text-muted text-xs shrink-0">{current + 1}/{totalQ}</span>
      </div>

      {/* Question */}
      <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-6">
        <p className="text-cream font-semibold leading-relaxed mb-5">{q.question}</p>

        <div className="space-y-2.5">
          {q.quiz_answers.map((answer) => {
            const isSelected = selectedId === answer.id;
            const showResult = isConfirmed && !!currentReview;
            const isRight = currentReview?.correctAnswerId === answer.id;

            let cls = "border border-white/[0.08] text-muted hover:border-gold/30 hover:text-cream";
            if (isSelected) cls = "border-gold/40 bg-gold/5 text-cream";
            if (showResult && isRight) cls = "border-emerald-400/40 bg-emerald-400/5 text-emerald-300";
            if (showResult && isSelected && !isRight) cls = "border-red-400/40 bg-red-400/5 text-red-300";

            return (
              <button
                key={answer.id}
                onClick={() => handleSelect(answer.id)}
                disabled={isConfirmed}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm transition-all duration-200 ${cls} disabled:cursor-default`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  showResult && isRight ? "border-emerald-400" :
                  showResult && isSelected && !isRight ? "border-red-400" :
                  isSelected ? "border-gold bg-gold/20" :
                  "border-white/[0.15]"
                }`}>
                  {showResult && isRight && <CheckCircle2 size={12} className="text-emerald-400" />}
                  {showResult && isSelected && !isRight && <XCircle size={12} className="text-red-400" />}
                  {!showResult && isSelected && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                </div>
                {answer.answer}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isConfirmed && currentReview?.explanation && (
          <div className={`mt-4 p-4 rounded-xl text-sm ${
            isCorrect ? "bg-emerald-400/5 border border-emerald-400/20 text-emerald-300/80" : "bg-amber-400/5 border border-amber-400/20 text-amber-300/80"
          }`}>
            <p className="font-medium mb-0.5">{isCorrect ? "Bonne réponse !" : "Pas tout à fait…"}</p>
            <p className="text-xs leading-relaxed">{currentReview.explanation}</p>
          </div>
        )}
      </div>

      {/* Erreur soumission */}
      {submitError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className="flex sm:justify-end">
        {!isConfirmed ? (
          <button
            onClick={handleConfirm}
            disabled={!selectedId}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Valider
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors"
          >
            {current < totalQ - 1 ? "Question suivante" : saving ? "Enregistrement…" : "Voir les résultats"}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
      </>
      )}
    </div>
  );
}
