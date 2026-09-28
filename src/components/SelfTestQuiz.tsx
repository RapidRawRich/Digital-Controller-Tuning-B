import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { QuizFigure } from './QuizFigures';
import { CheckCircle2, XCircle, Award, RotateCcw, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SelfTestQuiz: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [multiInputs, setMultiInputs] = useState<Record<string, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({});

  const question = QUIZ_QUESTIONS[currentIdx];

  // Handler for multiple choice
  const handleSelectOption = (qId: number, optionId: string) => {
    if (submittedQuestions[qId]) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionId }));
  };

  // Handler for multi-input subquestion
  const handleInputChange = (subId: string, val: string) => {
    setMultiInputs(prev => ({ ...prev, [subId]: val }));
  };

  // Submit current question
  const handleSubmitQuestion = (qId: number) => {
    setSubmittedQuestions(prev => ({ ...prev, [qId]: true }));

    // Check if all submitted and check score for confetti
    const updatedSubmitted = { ...submittedQuestions, [qId]: true };
    if (Object.keys(updatedSubmitted).length === QUIZ_QUESTIONS.length) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Reset quiz
  const handleResetQuiz = () => {
    setUserAnswers({});
    setMultiInputs({});
    setSubmittedQuestions({});
    setCurrentIdx(0);
  };

  // Calculate score
  let score = 0;
  QUIZ_QUESTIONS.forEach(q => {
    if (!submittedQuestions[q.id]) return;
    if (q.type === 'multiple-choice') {
      const selected = q.options?.find(o => o.id === userAnswers[q.id]);
      if (selected?.isCorrect) score++;
    } else if (q.type === 'multi-input') {
      let allCorrect = true;
      q.subQuestions?.forEach(sub => {
        const val = multiInputs[sub.id];
        if (typeof sub.expected === 'number') {
          const num = parseFloat(val);
          const tol = sub.tolerance || 0.1;
          if (isNaN(num) || Math.abs(num - sub.expected) > tol) {
            allCorrect = false;
          }
        } else {
          if (!val || !val.toLowerCase().includes('lambda')) {
            allCorrect = false;
          }
        }
      });
      if (allCorrect) score++;
    }
  });

  const isSubmitted = submittedQuestions[question.id];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      {/* Quiz Header & Progress Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Authentic ILM Evaluation
          </span>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Self-Test Review Questions (ILM 310305dB)</span>
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            Score: <strong className="text-emerald-400 font-bold">{score}</strong> / {QUIZ_QUESTIONS.length}
          </div>
          <button
            type="button"
            onClick={handleResetQuiz}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Quiz</span>
          </button>
        </div>
      </div>

      {/* Question Selector Tabs 1 to 13 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {QUIZ_QUESTIONS.map((q, idx) => {
          const isDone = submittedQuestions[q.id];
          const isCurrent = idx === currentIdx;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIdx(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-bold shrink-0 transition-all border ${
                isCurrent
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-500/30 font-extrabold'
                  : isDone
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              Q{q.ilmNumber}
            </button>
          );
        })}
      </div>

      {/* Active Question Container */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-semibold text-slate-200">{question.title}</span>
          <span className="font-mono text-[11px] text-slate-500">{question.ilmReference}</span>
        </div>

        <p className="text-sm font-medium text-slate-100 leading-relaxed">
          {question.prompt}
        </p>

        {/* Render SVG figure if present */}
        {question.figureType && <QuizFigure type={question.figureType} />}

        {/* Input Section */}
        {question.type === 'multiple-choice' && question.options && (
          <div className="space-y-2.5 pt-2">
            {question.options.map(opt => {
              const isSelected = userAnswers[question.id] === opt.id;
              let optStyle = 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700';

              if (isSubmitted) {
                if (opt.isCorrect) {
                  optStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40';
                } else if (isSelected && !opt.isCorrect) {
                  optStyle = 'bg-rose-950/40 border-rose-500 text-rose-200 ring-1 ring-rose-500/40';
                }
              } else if (isSelected) {
                optStyle = 'bg-amber-950/30 border-amber-500 text-amber-200 shadow-sm';
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(question.id, opt.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3 ${optStyle}`}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {opt.id.slice(-1).toUpperCase()}
                  </span>
                  <span className="leading-relaxed flex-1">{opt.text}</span>
                  {isSubmitted && opt.isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {isSubmitted && isSelected && !opt.isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Multi-Input numerical calculation questions (Q4, Q5, Q6, Q8) */}
        {question.type === 'multi-input' && question.subQuestions && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {question.subQuestions.map(sub => {
              const val = multiInputs[sub.id] || '';
              let isFieldCorrect: boolean | null = null;

              if (isSubmitted) {
                if (typeof sub.expected === 'number') {
                  const num = parseFloat(val);
                  const tol = sub.tolerance || 0.1;
                  isFieldCorrect = !isNaN(num) && Math.abs(num - sub.expected) <= tol;
                } else {
                  isFieldCorrect = val.toLowerCase().includes('lambda') || val.toLowerCase().includes('imc');
                }
              }

              return (
                <div key={sub.id} className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {sub.label}
                  </label>
                  {sub.options ? (
                    <select
                      value={val}
                      disabled={isSubmitted}
                      onChange={e => handleInputChange(sub.id, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                    >
                      <option value="">Select method...</option>
                      {sub.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={val}
                        disabled={isSubmitted}
                        placeholder={sub.placeholder}
                        onChange={e => handleInputChange(sub.id, e.target.value)}
                        className={`w-full bg-slate-950 border rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 ${
                          isSubmitted
                            ? isFieldCorrect
                              ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
                              : 'border-rose-500 text-rose-300 bg-rose-950/20'
                            : 'border-slate-700'
                        }`}
                      />
                      {sub.unit && <span className="text-xs text-slate-400 font-mono">{sub.unit}</span>}
                    </div>
                  )}

                  {isSubmitted && (
                    <div className="mt-1 text-[11px] font-mono">
                      {isFieldCorrect ? (
                        <span className="text-emerald-400 font-bold">✓ Correct!</span>
                      ) : (
                        <span className="text-rose-400">
                          Expected: {sub.expected} {sub.unit || ''}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Submit & Navigation Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {!isSubmitted ? (
            <button
              type="button"
              onClick={() => handleSubmitQuestion(question.id)}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
            >
              Verify & Grade Question
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Question Graded</span>
              <button
                type="button"
                disabled={currentIdx === QUIZ_QUESTIONS.length - 1}
                onClick={() => setCurrentIdx(prev => Math.min(QUIZ_QUESTIONS.length - 1, prev + 1))}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-100 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <span>Next Question</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Official Rationale & Explanation (Shown upon submission) */}
        {isSubmitted && (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-2 mt-4">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <HelpCircle className="w-4 h-4" />
              <span>Official ILM Rationale & Formula Derivation:</span>
            </div>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line font-mono text-[11px]">
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
