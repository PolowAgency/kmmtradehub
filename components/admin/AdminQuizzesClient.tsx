"use client";

import { useState } from "react";
import { Plus, Trash2, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Quiz = { id: string; title: string; description: string | null; passing_score: number; module_id: string | null; lesson_id: string | null; quiz_questions?: Array<{ id: string }> };
type Module = { id: string; title: string };
type Lesson = { id: string; title: string; module_id: string };

export function AdminQuizzesClient({
  initialQuizzes,
  modules,
  lessons,
}: {
  initialQuizzes: Quiz[];
  modules: Module[];
  lessons: Lesson[];
}) {
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", passing_score: 70, module_id: "", lesson_id: "" });
  const [questions, setQuestions] = useState<Array<{ question: string; explanation: string; answers: Array<{ answer: string; is_correct: boolean }> }>>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  function addQuestion() {
    setQuestions((q) => [
      ...q,
      { question: "", explanation: "", answers: [
        { answer: "", is_correct: true },
        { answer: "", is_correct: false },
        { answer: "", is_correct: false },
      ]}
    ]);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    const validQuestions = questions.filter(
      (question) =>
        question.question.trim() &&
        question.answers.filter((answer) => answer.answer.trim()).length >= 2 &&
        question.answers.some((answer) => answer.answer.trim() && answer.is_correct)
    );
    if (validQuestions.length === 0) return;
    setLoading(true);

    const { data: quiz } = await supabase
      .from("quizzes")
      .insert({
        title: form.title,
        description: form.description || null,
        passing_score: form.passing_score,
        module_id: form.module_id || null,
        lesson_id: form.lesson_id || null,
      })
      .select("*, quiz_questions(id)")
      .single();

    if (quiz) {
      // Insert questions + answers
      for (let i = 0; i < validQuestions.length; i++) {
        const q = validQuestions[i];
        if (!q.question.trim()) continue;
        const { data: questionRow } = await supabase
          .from("quiz_questions")
          .insert({ quiz_id: quiz.id, question: q.question, order_index: i, explanation: q.explanation || null })
          .select("id")
          .single();
        if (questionRow) {
          await supabase.from("quiz_answers").insert(
            q.answers.filter((a) => a.answer.trim()).map((a, idx) => ({
              question_id: questionRow.id,
              answer: a.answer,
              is_correct: a.is_correct,
              order_index: idx,
            }))
          );
        }
      }
      setQuizzes((prev) => [quiz, ...prev]);
    }

    setLoading(false);
    setShowForm(false);
    setForm({ title: "", description: "", passing_score: 70, module_id: "", lesson_id: "" });
    setQuestions([]);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce quiz ?")) return;
    await supabase.from("quizzes").delete().eq("id", id);
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-cream text-2xl font-semibold">Quiz</h1>
          <p className="text-muted text-sm mt-1">{quizzes.length} quiz créé{quizzes.length > 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setQuestions([]); }}
          className="flex items-center gap-2 bg-gold text-[#0A0A0A] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-gold-light transition-colors"
        >
          <Plus size={16} /> Nouveau quiz
        </button>
      </div>

      {showForm && (
        <div className="bg-surface-2 border border-gold/20 rounded-2xl p-6 space-y-5">
          <h2 className="text-cream font-semibold text-sm">Créer un quiz</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Titre *</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Score minimum (%)</label>
              <input type="number" min={0} max={100} value={form.passing_score} onChange={(e) => setForm((f) => ({ ...f, passing_score: Number(e.target.value) }))} className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Module (optionnel)</label>
              <select value={form.module_id} onChange={(e) => setForm((f) => ({ ...f, module_id: e.target.value }))} className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors">
                <option value="">Aucun</option>
                {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-2">Leçon (optionnel)</label>
              <select value={form.lesson_id} onChange={(e) => setForm((f) => ({ ...f, lesson_id: e.target.value }))} className="w-full bg-surface-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors">
                <option value="">Aucune</option>
                {lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-muted uppercase tracking-widest">Questions ({questions.length})</label>
              <button onClick={addQuestion} className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-light transition-colors">
                <Plus size={13} /> Ajouter
              </button>
            </div>
            <div className="space-y-4">
              {questions.map((q, qi) => (
                <div key={qi} className="bg-surface-3 border border-white/[0.06] rounded-xl p-4 space-y-3">
                  <input
                    value={q.question}
                    onChange={(e) => setQuestions((qs) => qs.map((x, i) => i === qi ? { ...x, question: e.target.value } : x))}
                    placeholder={`Question ${qi + 1}`}
                    className="w-full bg-[#0A0A0A] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40 transition-colors"
                  />
                  <div className="space-y-2">
                    {q.answers.map((a, ai) => (
                      <div key={ai} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQuestions((qs) => qs.map((x, i) => i === qi ? { ...x, answers: x.answers.map((ans, j) => ({ ...ans, is_correct: j === ai })) } : x))}
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${a.is_correct ? "border-gold bg-gold/30" : "border-white/[0.2]"}`}
                        >
                          {a.is_correct && <div className="w-2 h-2 rounded-full bg-gold" />}
                        </button>
                        <input
                          value={a.answer}
                          onChange={(e) => setQuestions((qs) => qs.map((x, i) => i === qi ? { ...x, answers: x.answers.map((ans, j) => j === ai ? { ...ans, answer: e.target.value } : ans) } : x))}
                          placeholder={`Réponse ${ai + 1}${a.is_correct ? " (correcte)" : ""}`}
                          className="flex-1 bg-[#0A0A0A] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-cream focus:outline-none focus:border-gold/40 transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                  <input
                    value={q.explanation}
                    onChange={(e) => setQuestions((qs) => qs.map((x, i) => i === qi ? { ...x, explanation: e.target.value } : x))}
                    placeholder="Explication (optionnel)"
                    className="w-full bg-[#0A0A0A] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-muted focus:outline-none focus:border-gold/40 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={loading || !form.title.trim()} className="px-5 py-2.5 rounded-xl bg-gold text-[#0A0A0A] font-semibold text-sm hover:bg-gold-light transition-colors disabled:opacity-50">
              {loading ? "Enregistrement…" : "Créer le quiz"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-white/[0.12] text-muted hover:text-cream text-sm transition-colors">Annuler</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {quizzes.length === 0 && !showForm && (
          <div className="flex flex-col items-center py-16 text-center">
            <HelpCircle size={40} className="text-muted/30 mb-4" />
            <p className="text-muted text-sm">Aucun quiz.</p>
          </div>
        )}
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-surface-2 border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <p className="text-cream text-sm font-medium truncate">{quiz.title}</p>
                <p className="text-muted text-xs">{quiz.quiz_questions?.length ?? 0} question{(quiz.quiz_questions?.length ?? 0) > 1 ? "s" : ""} · Score min : {quiz.passing_score}%</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setExpanded(expanded === quiz.id ? null : quiz.id)} className="p-2 rounded-lg text-muted hover:text-cream transition-colors">
                  {expanded === quiz.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                <button onClick={() => handleDelete(quiz.id)} className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/5 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
