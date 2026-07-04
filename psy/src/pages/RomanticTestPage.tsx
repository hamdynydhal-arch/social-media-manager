import { useState, useEffect, useCallback } from 'react';
import type { RomanticQuestion } from '../engine/romanticTypes';
import LikertScale from '../components/LikertScale';
import { AXIS_LABELS } from '../data/romanticContent';

const STORAGE_KEY = 'nafees_romantic_progress';

interface RomanticTestPageProps {
  questions: RomanticQuestion[];
  onComplete: (answers: Record<string, number>) => void;
  onReset: () => void;
  onHome: () => void;
}

export default function RomanticTestPage({
  questions,
  onComplete,
  onReset,
  onHome,
}: RomanticTestPageProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [showPause, setShowPause] = useState(false);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { answers: a, current: c } = JSON.parse(saved) as {
          answers: Record<string, number>;
          current: number;
        };
        setAnswers(a ?? {});
        setCurrent(Math.min(c ?? 0, questions.length - 1));
      }
    } catch { /* ignore */ }
  }, [questions.length]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, current }));
    } catch { /* ignore */ }
  }, [answers, current]);

  const handleAnswer = useCallback(
    (value: number) => {
      const q = questions[current];
      setAnswers((prev) => ({ ...prev, [q.id]: value }));
      if (current < questions.length - 1) {
        setTimeout(() => setCurrent((c) => c + 1), 220);
      }
    },
    [current, questions],
  );

  const handlePrev = () => setCurrent((c) => Math.max(0, c - 1));

  const allAnswered = Object.keys(answers).length === questions.length;

  function handleSubmit() {
    localStorage.removeItem(STORAGE_KEY);
    onComplete(answers);
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers({});
    setCurrent(0);
    setShowReset(false);
    onReset();
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const answered = answers[q.id] !== undefined;
  const axisInfo = AXIS_LABELS[q.axis];

  return (
    <div className="min-h-screen bg-nafees-cream flex flex-col" dir="rtl">

      {/* Header */}
      <div className="bg-white border-b border-nafees-cream-dark/40 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => setShowPause(true)}
          className="text-nafees-navy font-bold text-sm"
        >
          ⏸ إيقاف
        </button>
        <span className="text-xs text-gray-500 font-medium">{current + 1} / {questions.length}</span>
        <button
          onClick={() => setShowReset(true)}
          className="text-gray-400 text-sm hover:text-red-500 transition-colors"
        >
          إعادة
        </button>
      </div>

      {/* Progress bar with rose color */}
      <div className="h-1.5 bg-nafees-cream-dark">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #BE185D, #C2410C)' }}
        />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 max-w-lg mx-auto w-full">

        {/* Axis badge */}
        <div className="mb-4">
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: 'rgba(190,24,93,0.08)', color: '#BE185D' }}
          >
            {axisInfo?.icon} {axisInfo?.name}
          </span>
        </div>

        {/* Question text */}
        <div className="card mb-6 min-h-[7rem] flex items-center">
          <p className="text-gray-800 text-base leading-relaxed font-medium">{q.text}</p>
        </div>

        {/* Scale */}
        <LikertScale value={answers[q.id]} onChange={handleAnswer} />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 gap-3">
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className="px-4 py-2.5 rounded-2xl border-2 border-nafees-navy/30 text-nafees-navy font-bold text-sm disabled:opacity-30 hover:bg-nafees-navy/10 transition-all active:scale-95"
          >
            ← السابق
          </button>

          {current === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className={`flex-1 py-3 rounded-2xl font-bold text-base transition-all active:scale-95
                ${allAnswered
                  ? 'text-white shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              style={allAnswered ? { background: 'linear-gradient(135deg, #BE185D, #881337)' } : undefined}
            >
              اكتشف نمطك العاطفي 💌
            </button>
          ) : (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              disabled={!answered}
              className={`flex-1 py-3 rounded-2xl font-bold text-base transition-all active:scale-95
                ${answered
                  ? 'bg-nafees-navy hover:bg-nafees-blue text-white shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              التالي →
            </button>
          )}
        </div>

        {/* Answered count */}
        <p className="text-center text-xs text-gray-400 mt-4">
          أجبتَ على {Object.keys(answers).length} من {questions.length} سؤالاً
        </p>
      </div>

      {/* Pause modal */}
      {showPause && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md px-5 pt-5 pb-10 animate-slide-up">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-extrabold text-gray-800 mb-2 text-center">تقدّمك محفوظ</h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              يمكنك مغادرة الاختبار الآن وسيحفظ تقدّمك تلقائياً. عد متى شئتَ لتكمل من حيث توقّفتَ.
            </p>
            <div className="space-y-3">
              <button
                onClick={onHome}
                className="w-full py-3 rounded-2xl bg-nafees-navy text-white font-bold"
              >
                🏠 الرئيسية (مع حفظ التقدم)
              </button>
              <button
                onClick={() => setShowPause(false)}
                className="w-full py-3 rounded-2xl border-2 border-nafees-navy/30 text-nafees-navy font-bold"
              >
                متابعة الاختبار
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset confirmation */}
      {showReset && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md px-5 pt-5 pb-10 animate-slide-up">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-extrabold text-gray-800 mb-2 text-center">إعادة الاختبار؟</h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              ستُحذَف جميع إجاباتك الحالية ويبدأ الاختبار من الأول.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-2xl bg-red-500 text-white font-bold"
              >
                نعم، إعادة من البداية
              </button>
              <button
                onClick={() => setShowReset(false)}
                className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
