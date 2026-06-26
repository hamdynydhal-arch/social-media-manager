import type { Level } from '../engine/types';

interface FactorBarProps {
  name: string;
  shortName: string;
  icon: string;
  color: string;
  score: number;
  level: Level;
}

const LEVEL_LABELS: Record<Level, string> = {
  high: 'مرتفع',
  medium: 'متوسط',
  low: 'منخفض',
};

const LEVEL_BG: Record<Level, string> = {
  high: 'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  low: 'bg-blue-50 text-blue-700',
};

export default function FactorBar({ name, icon, color, score, level }: FactorBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl w-7 text-center flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold text-gray-700">{name}</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_BG[level]}`}>
              {LEVEL_LABELS[level]}
            </span>
            <span className="text-sm font-bold text-gray-500">{score}%</span>
          </div>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${score}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
    </div>
  );
}
