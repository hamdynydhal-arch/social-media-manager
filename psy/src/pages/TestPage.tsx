import { useState, useEffect } from 'react';
import type { Question } from '../engine/types';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';

const STORAGE_KEY = 'ocean_test_progress';

interface SavedProgress {
  currentIndex: number;
  answers: Record<string, number>;
}

function loadProgress(): SavedProgress | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedProgress) : null;
  } catch {
    return null;
  }
}

interface TestPageProps {
  questions: Question[];
  onComplete: (answers: Record<string, number>) => void;
  onReset: () => void;
}

export default function TestPage({ questions, onComplete, onReset }: TestPageProps) {
  const saved = loadProgress();
  const [currentIndex, setCurrentIndex] = useState(saved?.currentIndex ?? 0);
  const [answers, setAnswers] = useState<Record<string, number>>(saved?.answers ?? {});
  const [toast, setToast] = useState<string | null>(null);

  // Auto-save on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentIndex, answers }));
    } catch {}
  }, [currentIndex, answers]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const current = questions[currentIndex];
  const currentAnswer = answers[current?.id];
  const isLast = currentIndex === questions.length - 1;

  function handleAnswer(value: number) {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  }

  function goNext() {
    if (currentAnswer === undefined) return;
    if (isLast) {
      localStorage.removeItem(STORAGE_KEY);
      onComplete({ ...answers, [current.id]: currentAnswer });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function goPrev() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  function handlePause() {
    // Auto-save already ran via useEffect; just confirm to user
    setToast('تم حفظ تقدمك بنجاح. يمكنك إغلاق الصفحة والعودة لاحقاً');
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentIndex(0);
    setAnswers({});
    onReset();
  }

  if (!current) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed top-4 left-4 right-4 z-50 bg-emerald-600 text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-xl text-center"
          style={{ animation: 'fadeInDown 0.25s ease' }}
        >
          ✅ {toast}
        </div>
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">

          <div className="text-center mb-4">
            <span className="inline-block bg-indigo-100 text-indigo-600 text-sm font-bold px-3 py-1 rounded-full">
              سؤال {currentIndex + 1} من {questions.length}
            </span>
          </div>

          <QuestionCard
            question={current}
            answer={currentAnswer}
            onAnswer={handleAnswer}
          />

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {currentIndex > 0 && (
              <button onClick={goPrev} className="btn-secondary flex-shrink-0">
                ← السابق
              </button>
            )}
            <button
              onClick={goNext}
              disabled={currentAnswer === undefined}
              className={`
                flex-1 font-bold py-3 px-6 rounded-2xl transition-all duration-200
                ${currentAnswer !== undefined
                  ? 'btn-primary'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
              `}
            >
              {isLast ? 'عرض النتيجة 🎉' : 'التالي →'}
            </button>
          </div>

          {currentAnswer === undefined && (
            <p className="text-center text-xs text-gray-400 mt-3">
              اختر إجابة للمتابعة
            </p>
          )}

          {/* Pause & Reset */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePause}
              className="flex-1 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:scale-95 py-2.5 px-4 rounded-2xl transition-all"
            >
              ⏸ انتظرني سأعود
            </button>
            <button
              onClick={handleReset}
              className="flex-1 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 active:scale-95 py-2.5 px-4 rounded-2xl transition-all"
            >
              🔄 إعادة من الصفر
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
