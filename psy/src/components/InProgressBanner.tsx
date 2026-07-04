import { useState } from 'react';

interface TestMeta {
  id: string;
  name: string;
  progressKey: string;
  resultKey: string;
}

const TESTS: TestMeta[] = [
  { id: 'ocean',           name: 'الشخصية الكبرى 🧠',      progressKey: 'ocean_test_progress',              resultKey: 'psy_results'                    },
  { id: 'attachment',      name: 'التعلق العاطفي 💙',        progressKey: 'attachment_test_progress',         resultKey: 'attachment_results'             },
  { id: 'schema',          name: 'المخططات النفسية 🌱',      progressKey: 'schema_test_progress',             resultKey: 'schema_results'                 },
  { id: 'social_patterns', name: 'الأنماط الاجتماعية ⚖️',   progressKey: 'nafees_social_patterns_progress',  resultKey: 'nafees_social_patterns_result'  },
  { id: 'romantic',        name: 'الشيفرة العاطفية 💌',     progressKey: 'nafees_romantic_progress',         resultKey: 'nafees_romantic_result'         },
];

function getInProgressTests(currentTestId: string): string[] {
  return TESTS
    .filter((t) => {
      if (t.id === currentTestId) return false;
      try {
        if (localStorage.getItem(t.resultKey)) return false;
        const raw = localStorage.getItem(t.progressKey);
        if (!raw) return false;
        const p = JSON.parse(raw) as { currentIndex?: number; current?: number };
        return (p.currentIndex ?? p.current ?? 0) > 0;
      } catch {
        return false;
      }
    })
    .map((t) => t.name);
}

interface InProgressBannerProps {
  currentTestId: string;
}

export default function InProgressBanner({ currentTestId }: InProgressBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const others = getInProgressTests(currentTestId);
  if (!others.length) return null;

  const names = others.join('، ');

  return (
    <div
      className="max-w-md mx-auto px-4 pt-3"
      dir="rtl"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 bg-nafees-sky/15 border border-nafees-sky/30 rounded-2xl px-4 py-3">
        <span className="text-lg flex-shrink-0 mt-0.5">💾</span>
        <p className="flex-1 text-[11px] text-nafees-blue leading-relaxed">
          <strong>ملاحظة:</strong> لديك تقدم غير مكتمل في {names} — يتم حفظ تقدمك تلقائياً ويمكنك استكماله لاحقاً.
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-nafees-blue/50 hover:text-nafees-blue text-lg leading-none active:scale-95 transition-all"
          aria-label="إغلاق"
        >
          ×
        </button>
      </div>
    </div>
  );
}
