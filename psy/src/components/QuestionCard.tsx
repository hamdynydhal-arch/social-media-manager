import type { Question } from '../engine/types';
import LikertScale from './LikertScale';

interface QuestionCardProps {
  question: Question;
  answer: number | undefined;
  onAnswer: (value: number) => void;
}

export default function QuestionCard({ question, answer, onAnswer }: QuestionCardProps) {
  return (
    <div className="card w-full">
      <p className="text-xl font-semibold text-gray-800 leading-relaxed mb-8 text-center min-h-[4rem] flex items-center justify-center">
        {question.text}
      </p>

      {question.type === 'likert' && (
        <LikertScale value={answer} onChange={onAnswer} />
      )}

      {question.type === 'boolean' && (
        <div className="grid grid-cols-2 gap-4">
          {[{ value: 1, label: 'لا' }, { value: 5, label: 'نعم' }].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onAnswer(opt.value)}
              className={`
                py-4 rounded-2xl text-lg font-bold border-2 transition-all active:scale-95
                ${answer === opt.value
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {question.type === 'single_choice' && question.options && (
        <div className="flex flex-col gap-3">
          {question.options.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => onAnswer(Number(opt.value))}
              className={`
                py-3 px-4 rounded-2xl text-base font-medium border-2 text-right transition-all active:scale-95
                ${answer === Number(opt.value)
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
