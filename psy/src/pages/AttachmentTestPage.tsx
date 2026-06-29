import { useState, useEffect } from 'react';
import type { AttachmentQuestion } from '../engine/attachmentTypes';
import LikertScale7 from '../components/LikertScale7';
import ProgressBar from '../components/ProgressBar';

const STORAGE_KEY = 'attachment_test_progress';

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

interface AttachmentTestPageProps {
  questions: AttachmentQuestion[];
  onComplete: (answers: Record<string, number>) => void;
  onReset: () => void;
  onHome: () => void;
}

export default function AttachmentTestPage({ questions, onComplete, onReset, onHome }: AttachmentTestPageProps) {
  const saved = loadProgress();
  const [currentIndex, setCurrentIndex] = useState(saved?.currentIndex ?? 0);
  const [answers, setAnswers] = useState<Record<string, number>>(saved?.answers ?? {});
  const [toast, setToast] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentIndex, answers }));
    } catch {}
  }, [currentIndex, answers]);

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
    setToast('تم حفظ تقدمك بنجاح. يمكنك إغلاق الصفحة والعودة لاحقاً');
  }

  function confirmReset() {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentIndex(0);
    setAnswers({});
    setShowResetModal(false);
    onReset();
  }

  if (!current) return null;

  return (
    <div className="min-h-screen bg-nafees-cream flex flex-col">

      {toast && (
        <div
          className="fixed top-4 left-4 right-4 z-50 bg-nafees-sage text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-xl text-center"
          style={{ animation: 'fadeInDown 0.25s ease' }}
        >
          ✅ {toast}
        </div>
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onHome}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              → الرئيسية
            </button>
            <span className="text-xs font-semibold text-nafees-copper">💞 أسلوب التعلق</span>
          </div>
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">

          <div className="text-center mb-4">
            <span className="inline-block bg-nafees-copper/15 text-nafees-copper text-sm font-bold px-3 py-1 rounded-full">
              سؤال {currentIndex + 1} من {questions.length}
            </span>
          </div>

          {/* Question card */}
          <div className="card w-full">
            <p className="text-xl font-semibold text-gray-800 leading-relaxed mb-8 text-center min-h-[4rem] flex items-center justify-center">
              {current.text}
            </p>
            <LikertScale7 value={currentAnswer} onChange={handleAnswer} />
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {currentIndex > 0 && (
              <button
                onClick={goPrev}
                className="btn-secondary flex-shrink-0"
              >
                ← السابق
              </button>
            )}
            <button
              onClick={goNext}
              disabled={currentAnswer === undefined}
              className={`
                flex-1 font-bold py-3 px-6 rounded-2xl transition-all duration-200
                ${currentAnswer !== undefined
                  ? 'bg-nafees-copper hover:bg-nafees-warm-dark text-white shadow-lg active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
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
              className="flex-1 text-sm font-medium text-nafees-copper bg-nafees-copper/10 hover:bg-nafees-copper/20 active:scale-95 py-2.5 px-4 rounded-2xl transition-all"
            >
              ⏸ انتظرني سأعود
            </button>
            <button
              onClick={() => setShowResetModal(true)}
              className="flex-1 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 active:scale-95 py-2.5 px-4 rounded-2xl transition-all"
            >
              🔄 إعادة من الصفر
            </button>
          </div>

        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          style={{ animation: 'fadeIn 0.2s ease' }}
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-right"
            style={{ animation: 'scaleIn 0.2s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl text-center mb-3">⚠️</div>
            <h2 className="text-lg font-extrabold text-gray-800 text-center mb-2">تحذير!</h2>
            <p className="text-sm text-gray-600 leading-relaxed text-center mb-6">
              هل أنت متأكد أنك تريد إفراغ إجاباتك والبدء من الصفر؟
              <br />
              <span className="font-semibold text-gray-700">سيتم محو كل تقدمك الحالي ولن تتمكن من استعادته.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 active:scale-95 transition-all"
              >
                تراجع
              </button>
              <button
                onClick={confirmReset}
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm active:scale-95 transition-all"
              >
                نعم، احذف إجاباتي
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
