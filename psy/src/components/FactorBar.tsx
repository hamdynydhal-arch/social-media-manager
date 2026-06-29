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
  very_high: 'مرتفع جداً',
  high: 'مرتفع',
  medium: 'متوسط',
  low: 'منخفض',
  very_low: 'منخفض جداً',
};

const LEVEL_BG: Record<Level, string> = {
  very_high: 'bg-nafees-navy/15 text-nafees-navy',
  high:      'bg-nafees-blue/15 text-nafees-blue',
  medium:    'bg-nafees-cream-dark text-nafees-warm-dark',
  low:       'bg-nafees-copper/15 text-nafees-warm-dark',
  very_low:  'bg-nafees-warm/15 text-nafees-warm-dark',
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
            <span className="text-sm font-bold text-gray-500">{Math.round(score)}%</span>
          </div>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.round(score)}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
    </div>
  );
}
