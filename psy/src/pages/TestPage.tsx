import { useState } from 'react';
import type { Question } from '../engine/types';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';

interface TestPageProps {
  questions: Question[];
  onComplete: (answers: Record<string, number>) => void;
}

export default function TestPage({ questions, onComplete }: TestPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const current = questions[currentIndex];
  const currentAnswer = answers[current?.id];
  const isLast = currentIndex === questions.length - 1;

  function handleAnswer(value: number) {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  }

  function goNext() {
    if (currentAnswer === undefined) return;
    if (isLast) {
      onComplete({ ...answers, [current.id]: currentAnswer });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function goPrev() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  if (!current) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">

          {/* Animated question number */}
          <div className="text-center mb-4">
            <span className="inline-block bg-indigo-100 text-indigo-600 text-sm font-bold px-3 py-1 rounded-full">
              سؤال {currentIndex + 1}
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

          {/* Skip hint */}
          {currentAnswer === undefined && (
            <p className="text-center text-xs text-gray-400 mt-3">
              اختر إجابة للمتابعة
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
