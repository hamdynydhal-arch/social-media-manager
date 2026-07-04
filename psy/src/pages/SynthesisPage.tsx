import { useState, useEffect, useMemo, useRef } from 'react';
import { runSynthesis, saveSynthesisResult, buildTraitVector } from '../engine/synthesisEngine';
import { computeCorrelationMatrix } from '../engine/CorrelationMatrix';
import { exportToPdf } from '../utils/exportPdf';
import type {
  PersonaDimension,
  SynthesisPattern,
  SynthesisResult,
  ConfidenceLevel,
} from '../engine/synthesisTypes';

interface SynthesisPageProps {
  onHome: () => void;
}

// ── Static maps ───────────────────────────────────────────────────────────────

const DIM_ICONS: Record<string, string> = {
  emotional_regulation: '🌊',
  interpersonal_trust:  '🤝',
  relational_closeness: '💫',
  self_worth:           '🌱',
  autonomy_achievement: '🧭',
};

const DIM_SHORT: Record<string, string> = {
  emotional_regulation: 'الضبط',
  interpersonal_trust:  'الثقة',
  relational_closeness: 'القرب',
  self_worth:           'الذات',
  autonomy_achievement: 'الإنجاز',
};

const DIM_QUESTIONS: Record<string, string> = {
  emotional_regulation: 'كيف تتعامل مع التوتر العاطفي؟',
  interpersonal_trust:  'كيف تبني الثقة مع من حولك؟',
  relational_closeness: 'ما حاجتك للقرب والتواصل؟',
  self_worth:           'كيف تنظر إلى قيمتك الشخصية؟',
  autonomy_achievement: 'كيف تتوجه نحو أهدافك؟',
};

const DIM_SCIENTIFIC: Record<string, string> = {
  emotional_regulation: 'العصابية (N) المنبئ الأقوى بتدني الضبط: r=−.72 مُشتق من (Noftle & Shaver 2006، Thimm 2010)',
  interpersonal_trust:  'الوداعة (A) أبرز منبئات الثقة: r=.55، التجنب ينفيها: r=−.39 (Noftle & Shaver 2006)',
  relational_closeness: 'الانبساطية (E) المحرك الأول للقرب: r=.60؛ مخطط العزلة: r=−.43 (Noftle & Shaver 2006)',
  self_worth:           'مخطط النقص/الهجر أعلى ارتباطاً بتدني تقدير الذات: r=.60–.65 (Thimm 2010)',
  autonomy_achievement: 'الضمير (C) أقوى منبئات الإنجاز في OCEAN: r=.22–.31 (Barrick & Mount 1991)',
};

type DimColorKey = {
  bar: string;
  bg: string;
  text: string;
  border: string;
  radarFill: string;
  radarStroke: string;
};

const DIM_COLORS: Record<string, DimColorKey> = {
  emotional_regulation: {
    bar: 'bg-nafees-blue',
    bg: 'bg-nafees-sky/10',
    text: 'text-nafees-blue',
    border: 'border-nafees-sky/30',
    radarFill: '#1B4A6B',
    radarStroke: '#1B4A6B',
  },
  interpersonal_trust: {
    bar: 'bg-nafees-sage',
    bg: 'bg-nafees-sage/10',
    text: 'text-nafees-sage',
    border: 'border-nafees-sage/30',
    radarFill: '#7A9E8A',
    radarStroke: '#7A9E8A',
  },
  relational_closeness: {
    bar: 'bg-nafees-copper',
    bg: 'bg-nafees-copper/10',
    text: 'text-nafees-copper',
    border: 'border-nafees-copper/30',
    radarFill: '#C4956A',
    radarStroke: '#C4956A',
  },
  self_worth: {
    bar: 'bg-nafees-blue-mid',
    bg: 'bg-nafees-sky/15',
    text: 'text-nafees-blue-mid',
    border: 'border-nafees-sky/30',
    radarFill: '#2D6A96',
    radarStroke: '#2D6A96',
  },
  autonomy_achievement: {
    bar: 'bg-nafees-navy',
    bg: 'bg-nafees-navy/5',
    text: 'text-nafees-navy',
    border: 'border-nafees-navy/20',
    radarFill: '#0F2D45',
    radarStroke: '#0F2D45',
  },
};

const DIM_TERMS: Record<string, Array<[string, string]>> = {
  emotional_regulation: [
    [
      'العصابية',
      'بُعد شخصية يقيس القابلية للتأثر الانفعالي السلبي: القلق والحزن والتقلب المزاجي وحساسية الضغوط',
    ],
    [
      'قلق التعلق',
      'ميل للخوف من الهجر والحاجة للتأكيد المستمر للحب — أحد بُعدَي نظرية التعلق لبولبي وأينسورث',
    ],
  ],
  interpersonal_trust: [
    [
      'الوداعة',
      'بُعد شخصية يقيس الميل للتعاون والتعاطف والانسجام في العلاقات — المصدر الرئيسي للثقة العلائقية',
    ],
    [
      'التعلق التجنبي',
      'ميل لتفادي القرب العاطفي والاعتماد على الاستقلالية كاستراتيجية دفاعية (deactivating strategy)',
    ],
  ],
  relational_closeness: [
    [
      'الانبساطية',
      'بُعد الدفء الاجتماعي والرغبة في التفاعل مع الآخرين — المحرك الأول للقرب والتواصل العلائقي',
    ],
    [
      'مخطط العزلة',
      'قناعة مكتسبة في مرحلة الطفولة بالاختلاف عن الآخرين وعدم الانتماء الحقيقي لأي مجموعة',
    ],
  ],
  self_worth: [
    [
      'مخطط النقص/الهجر',
      'إحساس جذري بوجود عيب داخلي أو الخوف من الهجر — المخطط الأعلى ارتباطاً بتدني تقدير الذات',
    ],
    [
      'النموذج الداخلي للذات',
      'صورة لاواعية عن الذات تتشكل من خلال تجارب التعلق المبكرة وتحدد تقييم الفرد لقيمته الشخصية',
    ],
  ],
  autonomy_achievement: [
    [
      'الضمير الأخلاقي',
      'بُعد ضبط الذات والمثابرة والتنظيم في نموذج العوامل الخمسة — أقوى منبئاتها بالإنجاز المهني',
    ],
    [
      'مخطط الخضوع',
      'تضحية مزمنة باحتياجات الذات وقرارات الحياة لإرضاء الآخرين أو تجنب العواقب السلبية',
    ],
  ],
};

const CONFIDENCE_META: Record<ConfidenceLevel, { label: string; color: string; detail: string }> = {
  high:     { label: 'مرتفعة',  color: 'text-nafees-sage',   detail: 'مبني على 3 اختبارات مكتملة أو أكثر' },
  moderate: { label: 'متوسطة',  color: 'text-nafees-copper', detail: 'اختبارَين — أكمل المزيد لرفع الدقة' },
  low:      { label: 'منخفضة', color: 'text-nafees-warm',   detail: 'اختبار واحد — أكمل الأربعة للحصول على توليف كامل' },
};

// Radar dimension order (clockwise from top)
const RADAR_ORDER = [
  'emotional_regulation',
  'autonomy_achievement',
  'self_worth',
  'relational_closeness',
  'interpersonal_trust',
] as const;

// ── Persona naming system ─────────────────────────────────────────────────────

type PersonaInfo = { name: string; subtitle: string; gradientFrom: string; gradientTo: string; accentColor: string };

function derivePersona(dims: PersonaDimension[], patterns: SynthesisPattern[]): PersonaInfo {
  if (patterns.some((p) => p.id === 'secure_adaptive')) {
    return {
      name: 'الآمن المتكيف',
      subtitle: 'توازن نفسي حقيقي — ثقة راسخة وضبط انفعالي مستقر',
      gradientFrom: '#3D7A5A',
      gradientTo: '#0F2D45',
      accentColor: '#7A9E8A',
    };
  }
  if (patterns.some((p) => p.id === 'anxious_vigilant')) {
    return {
      name: 'اليقظ الحساس',
      subtitle: 'عمق انفعالي مع حساسية علائقية مرتفعة',
      gradientFrom: '#7A4A2A',
      gradientTo: '#0F2D45',
      accentColor: '#C4956A',
    };
  }
  if (patterns.some((p) => p.id === 'avoidant_independent')) {
    return {
      name: 'المستقل المحترز',
      subtitle: 'اكتفاء ذاتي مع مسافة علائقية مدروسة',
      gradientFrom: '#1B4A6B',
      gradientTo: '#0F2D45',
      accentColor: '#9CCCE8',
    };
  }
  if (patterns.some((p) => p.id === 'high_achievement_fragile')) {
    return {
      name: 'الباني الهش',
      subtitle: 'طموح خارجي مرتفع مع تساؤل داخلي صامت',
      gradientFrom: '#6B4A2A',
      gradientTo: '#0F2D45',
      accentColor: '#C4956A',
    };
  }
  if (patterns.some((p) => p.id === 'schema_driven_vigilance')) {
    return {
      name: 'المُبرمَج بالماضي',
      subtitle: 'تجارب الطفولة تُلوّن قراءة الحاضر',
      gradientFrom: '#4A3D2A',
      gradientTo: '#0F2D45',
      accentColor: '#9E9087',
    };
  }

  const top = [...dims].sort((a, b) => b.score - a.score)[0];
  const fallback: PersonaInfo = {
    name: 'المتطور المتجدد',
    subtitle: 'شخصية في طور النمو والتشكّل',
    gradientFrom: '#1B4A6B',
    gradientTo: '#0F2D45',
    accentColor: '#9CCCE8',
  };
  if (!top) return fallback;

  const map: Record<string, PersonaInfo> = {
    autonomy_achievement: {
      name: 'الباني الاستراتيجي',
      subtitle: 'توجه قوي نحو الإنجاز والاستقلالية الذاتية',
      gradientFrom: '#0F2D45',
      gradientTo: '#163550',
      accentColor: '#9CCCE8',
    },
    interpersonal_trust: {
      name: 'الموجه الاجتماعي',
      subtitle: 'ثقة علائقية ودفء إنساني أصيل',
      gradientFrom: '#2D5A40',
      gradientTo: '#0F2D45',
      accentColor: '#7A9E8A',
    },
    relational_closeness: {
      name: 'المتصل العميق',
      subtitle: 'رغبة أصيلة في التواصل والانتماء الإنساني',
      gradientFrom: '#6B4A2A',
      gradientTo: '#0F2D45',
      accentColor: '#C4956A',
    },
    self_worth: {
      name: 'الواثق المتأمل',
      subtitle: 'إحساس متين بالقيمة والهوية الشخصية',
      gradientFrom: '#1B4A6B',
      gradientTo: '#0F2D45',
      accentColor: '#9CCCE8',
    },
    emotional_regulation: {
      name: 'المستقر الرصين',
      subtitle: 'هدوء انفعالي وقدرة على التعافي والمرونة',
      gradientFrom: '#1B4A6B',
      gradientTo: '#0F2D45',
      accentColor: '#9CCCE8',
    },
  };

  return map[top.id] ?? fallback;
}

// ── SVG Radar helpers ─────────────────────────────────────────────────────────

function polarToXY(
  angleDeg: number,
  r: number,
  cx: number,
  cy: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function makePolygonPoints(
  scores: number[],
  maxR: number,
  cx: number,
  cy: number,
): string {
  return scores
    .map((s, i) => {
      const { x, y } = polarToXY((360 / scores.length) * i, (s / 100) * maxR, cx, cy);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

function makeRingPoints(pct: number, n: number, maxR: number, cx: number, cy: number): string {
  return Array.from({ length: n }, (_, i) => {
    const { x, y } = polarToXY((360 / n) * i, (pct / 100) * maxR, cx, cy);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function GlossaryTip({ term, definition }: { term: string; definition: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 bg-nafees-sky/20 text-nafees-blue text-[10px] px-2 py-0.5 rounded-full active:scale-95 transition-transform duration-150"
        aria-expanded={open}
      >
        {term}
        <span className="w-3.5 h-3.5 bg-nafees-blue/20 rounded-full text-[8px] flex items-center justify-center font-bold leading-none">
          ?
        </span>
      </button>
      <span
        className={`block overflow-hidden transition-all duration-300 ${open ? 'max-h-24 opacity-100 mt-1.5' : 'max-h-0 opacity-0'}`}
      >
        <span className="block text-[10px] text-nafees-warm-dark bg-nafees-cream-dark/60 rounded-xl px-2.5 py-2 leading-relaxed">
          {definition}
        </span>
      </span>
    </span>
  );
}

function RadarChart({ dims }: { dims: PersonaDimension[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const ordered = RADAR_ORDER.map((id) => dims.find((d) => d.id === id) ?? null);
  const scores = ordered.map((d) => d?.score ?? 50);

  const cx = 150;
  const cy = 148;
  const maxR = 78;
  const labelR = 101;
  const n = 5;

  const nodePoints = scores.map((s, i) => {
    const { x, y } = polarToXY((360 / n) * i, (s / 100) * maxR, cx, cy);
    return { x, y, score: s };
  });

  const dataPolygon = nodePoints
    .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(' ');

  const rings = [25, 50, 75].map((pct) => makeRingPoints(pct, n, maxR, cx, cy));
  const outerRing = makeRingPoints(100, n, maxR, cx, cy);

  const labelAnchors: Array<'start' | 'middle' | 'end'> = [
    'middle', // top
    'start',  // upper-right
    'start',  // lower-right
    'end',    // lower-left
    'end',    // upper-left
  ];

  const labelDyOffsets = [0, 4, 14, 14, 4]; // extra y-nudge for each label

  return (
    <div className="relative select-none">
      <svg
        viewBox="0 0 300 290"
        className="w-full max-w-[280px] mx-auto"
        aria-label="مخطط شبكي للأبعاد النفسية الخمسة"
      >
        {/* Outer boundary */}
        <polygon
          points={outerRing}
          fill="none"
          stroke="#E6E0D8"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Reference rings */}
        {rings.map((pts, ri) => (
          <polygon
            key={ri}
            points={pts}
            fill="none"
            stroke="#E6E0D8"
            strokeWidth="0.8"
            strokeDasharray={ri === 1 ? '3 3' : undefined}
            strokeLinejoin="round"
          />
        ))}

        {/* 50% label */}
        <text x={cx + 3} y={cy - (50 / 100) * maxR - 3} fontSize="8" fill="#9E9087" textAnchor="start">
          50%
        </text>

        {/* Axis lines */}
        {nodePoints.map((pt, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={pt.x}
            y2={pt.y}
            stroke="#E6E0D8"
            strokeWidth="1"
          />
        ))}

        {/* Data polygon fill */}
        <polygon
          points={dataPolygon}
          fill="#1B4A6B"
          fillOpacity="0.12"
          stroke="#1B4A6B"
          strokeWidth="2"
          strokeLinejoin="round"
          className="transition-all duration-700"
        />

        {/* Nodes */}
        {nodePoints.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hovered === i ? 9 : 6}
              fill={hovered === i ? '#C4956A' : '#1B4A6B'}
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setHovered(hovered === i ? null : i)}
            />
            {/* Score label near node */}
            <text
              x={pt.x}
              y={pt.y - 12}
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill={hovered === i ? '#C4956A' : '#0F2D45'}
              className="pointer-events-none transition-all duration-200"
            >
              {Math.round(pt.score)}
            </text>
          </g>
        ))}

        {/* Axis labels */}
        {ordered.map((dim, i) => {
          if (!dim) return null;
          const angleDeg = (360 / n) * i;
          const { x, y } = polarToXY(angleDeg, labelR, cx, cy);
          const anchor = labelAnchors[i];
          const dy = labelDyOffsets[i];
          return (
            <text
              key={dim.id}
              x={x}
              y={y + dy}
              textAnchor={anchor}
              fontSize="11"
              fontWeight="600"
              fill={hovered === i ? '#C4956A' : '#6B5E52'}
              fontFamily="Cairo, sans-serif"
              className="transition-colors duration-200"
            >
              {DIM_SHORT[dim.id]}
            </text>
          );
        })}

        {/* Dimension icons near nodes */}
        {ordered.map((dim, i) => {
          if (!dim) return null;
          const { x, y } = nodePoints[i];
          return (
            <text
              key={`icon-${dim.id}`}
              x={x}
              y={y + 20}
              textAnchor="middle"
              fontSize="10"
              className="pointer-events-none"
            >
              {DIM_ICONS[dim.id]}
            </text>
          );
        })}
      </svg>

      {/* Tooltip card */}
      <div
        className={`mx-4 mt-1 transition-all duration-300 overflow-hidden ${hovered !== null ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        {hovered !== null && ordered[hovered] && (
          <div className="bg-nafees-navy/90 rounded-xl p-3 text-right">
            <p className="text-xs font-bold text-nafees-cream mb-0.5">
              {DIM_ICONS[ordered[hovered]!.id]} {ordered[hovered]!.title}
            </p>
            <p className="text-[10px] text-nafees-sky/90 leading-relaxed">
              {DIM_SCIENTIFIC[ordered[hovered]!.id]}
            </p>
            <p className="text-[11px] font-bold text-nafees-copper mt-1">
              {Math.round(scores[hovered])}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── كبسولة التطوير العلاجي ────────────────────────────────────────────────────

type CbtLevel = { title: string; icon: string; techniques: string[] };
type CbtCapsule = { high: CbtLevel; mid: CbtLevel; low: CbtLevel };

const CBT_CAPSULES: Record<string, CbtCapsule> = {
  emotional_regulation: {
    high: {
      title: 'مهارات التعمق والمشاركة',
      icon: '🕊️',
      techniques: [
        'التعاطف الذاتي المتقدم: حين تواجه صعوبة، طبّق نفس اللطف الذي تُبديه لصديق — هذا يُعمّق المرونة الانفعالية ويُحصّنها.',
        'الدقة العاطفية (EQ Level 2): تدرّب على التمييز بين المشاعر المتشابهة (القلق والترقب، الحزن والخيبة) — الدقة في التسمية تُحسّن جودة استجاباتك.',
        'مشاركة المهارات: علّم من تحب تقنية تنظيم انفعالي واحدة شهرياً — التعليم يُرسّخ المهارة ويوسّع دائرة الصحة النفسية.',
      ],
    },
    mid: {
      title: 'بناء الوعي والمرونة',
      icon: '🌤️',
      techniques: [
        'إعادة الهيكلة المعرفية: حين تشعر بالضيق، اسأل: ما الدليل على صحة هذه الفكرة؟ هل هناك تفسير بديل؟ ما الذي سأقوله لصديق في موقفي هذا؟',
        'جدولة الأنشطة المتعمدة: حدد أسبوعياً 3 أنشطة تمنحك إحساساً بالكفاءة، و3 أنشطة ترتاح إليها — التوازن الممنهج يُثبّت المزاج.',
        'تمرين المراقب الرصين: حين تشتد المشاعر، تخيّل نفسك تراقبها من خلف زجاج شفاف — أنت لستَ مشاعرك، أنت من يُلاحظها بحرية.',
      ],
    },
    low: {
      title: 'أدوات الأزمة والتأسيس',
      icon: '🌊',
      techniques: [
        'تأريض 5-4-3-2-1: سمِّ 5 أشياء تراها، 4 تلمسها، 3 تسمعها، 2 تشمها، 1 تتذوقها — يُخفف حدة الانفعالات الحادة خلال دقيقتين.',
        'مذكرة المشاعر اليومية: سجّل: الموقف / المشاعر (0-10) / الأفكار التلقائية / ما فعلته / النتيجة. هذا الوعي المُوثَّق هو البنية التحتية للتغيير.',
        'بروتوكول TIPP (من العلاج السلوكي الجدلي-DBT): الحرارة (ضع وجهك في ماء بارد)، التمرين المكثف قصير المدة، التنفس البطيء 4 شهيق / 6 زفير — أدوات ثابتة للأزمة الانفعالية الحادة.',
      ],
    },
  },
  interpersonal_trust: {
    high: {
      title: 'تعميق الثقة بوعي',
      icon: '🔓',
      techniques: [
        'فحص علامات الثقة الزائدة: الثقة المرتفعة أحياناً تغفل عن علامات تحذير مشروعة — طوّر مهارة التمييز بين الحدس الإيجابي والتفاؤل المُبالغ فيه.',
        'إعلان التوقعات صراحةً: الثقة العالية قد تفترض توافقاً غير معلَن — عبِّر عن توقعاتك ومشاعرك وتحقق منها دورياً مع من تثق بهم.',
      ],
    },
    mid: {
      title: 'تعزيز التوقعات الإيجابية',
      icon: '🗝️',
      techniques: [
        'انتباه انتقائي مُعاد: لأسبوعين، سجّل يومياً تجربة ثقة واحدة سارت بشكل إيجابي — الدماغ مُبرمَج لتذكر الخذلان، هذا التمرين يُعيد موازنة السجل.',
        'طلب ما تحتاجه مباشرة: تدرّب على صياغة "أحتاج منك..." بدلاً من قراءة عقول الآخرين وتوقع الخذلان — الوضوح يبني الثقة الحقيقية.',
        'تحليل الأنماط التكرارية: هل الأشخاص الذين تتوقع خيانتهم يشتركون بصفات معينة؟ هل الماضي يُلوّن قراءتك للحاضر؟',
      ],
    },
    low: {
      title: 'بناء الثقة خطوة بخطوة',
      icon: '🔒',
      techniques: [
        'مخطط الثقة التدريجي: حدد شخصاً واحداً آمناً، وشاركه سراً صغيراً غير مكلف. إذا لم تُخذَل، خطوة أخرى الشهر التالي. الثقة تُبنى بتراكم لا بقرارات.',
        'فحص الأدلة (سجل الأفكار الوظيفية): حين تشك في نوايا شخص، سجّل الدليل المعزز والدليل المعارض. غالباً الدليل المعارض موجود لكنه مهمَل.',
        'إعادة كتابة المشهد (Imaginal Rescripting): تخيّل موقفاً قديماً أُخذلتَ فيه، ثم "أعِد كتابة" نهايته كما كنتَ تريدها — تقنية مُثبتة في تخفيف آثار صدمات الثقة.',
      ],
    },
  },
  relational_closeness: {
    high: {
      title: 'حماية الاستقلالية داخل القرب',
      icon: '💎',
      techniques: [
        'التمييز بين الاتصال الصحي والاندماج الزائد: العلاقات الصحية تحمي استقلالية الطرفين — تحقق دورياً: هل علاقاتك تُغذي كلاً منكم أم تستهلك أحدكم؟',
        'الاستجابة للقرب بوعي: حين يطلب أحد قرباً، ميّز بين الاستجابة من محبة حقيقية ومن خوف من الرفض — هذا الوعي يُحرر العلاقة.',
      ],
    },
    mid: {
      title: 'إدارة مسافة العلاقات',
      icon: '🌿',
      techniques: [
        'خارطة العلاقات الثلاثية: حدد شخصاً تريد قرباً أعمق معه، وشخصاً تريد مسافة أكثر منه، وشخصاً يلائم الحال — اتخذ خطوة صغيرة في كل اتجاه.',
        'تمرين الفضول الصادق: في محادثتك القادمة، اطرح ثلاثة أسئلة من فضول حقيقي لا من مجاملة — الاهتمام الأصيل يُعمّق الروابط.',
      ],
    },
    low: {
      title: 'التقرب التدريجي من الآخرين',
      icon: '🏔️',
      techniques: [
        'التعرض التدريجي الاجتماعي: اختر موقفاً غير مكلف (مجموعة اهتمام، حفلة صغيرة) وتعمّد الحديث مع شخص واحد جديد — التعرض المنتظم يُخفف الحواجز.',
        'بروتوكول التواصل المُخطَّط: حدد 2-3 أشخاص تُقدّر علاقتك بهم وتعمّد التواصل معهم أسبوعياً، حتى برسالة قصيرة. الاتصال المنتظم يبني الروابط.',
        'الكتابة العلاجية: اكتب رسالة لشخص أثّر في حياتك (دون إرسالها) عن أثره الحقيقي — هذا التمرين يُعيد الاتصال العاطفي بقوة.',
      ],
    },
  },
  self_worth: {
    high: {
      title: 'استقرار الثقة من الداخل',
      icon: '🌟',
      techniques: [
        'فحص مصدر الثقة: هل ثقتك داخلية المصدر أم مرتبطة بنجاح خارجي؟ الثقة المستدامة لا تتأثر بالفشل العرضي — ازرعها في القيم لا في الإنجازات.',
        'كن شاهداً صادقاً لمن حولك: ثقتك قد تكون مرسى لمن حولك — أشِر بصدق وتحديد إلى نقاط قوة من تحب؛ التقدير الأصيل يُعيد توزيع الصحة النفسية.',
      ],
    },
    mid: {
      title: 'تعزيز التقييم الداخلي',
      icon: '🌱',
      techniques: [
        'مراجعة معايير القيمة: راجع المعايير التي تقيس بها قيمتك الذاتية. هل هي اختياراتك الحقيقية أم إرث من الماضي؟ حدد معياراً واحداً تريد تغييره.',
        'يوميات النجاحات الصغيرة: سجّل يومياً ثلاثة أشياء نجحتَ فيها مهما كانت صغيرة — الانتباه الممنهج للإنجازات يُعيد ضبط مقياس التقييم الداخلي.',
      ],
    },
    low: {
      title: 'معالجة مخطط النقص والهجر',
      icon: '🌧️',
      techniques: [
        'عمل نمط المخططات (Schema Mode Work): حين تسمع الصوت الداخلي الناقد، تعرّف عليه كـ"صوت القاضي العقابي" لا كحقيقة موضوعية. قل له: "أنتَ صدى من الماضي، لستَ أنا."',
        'قائمة الأدلة المضادة: اكتب 10 مواقف أثبتَّ فيها كفاءةً أو محبةً أو قيمةً لأحد — استعِد هذه القائمة بنشاط حين تُسيطر الشكوك.',
        'بروتوكول التعاطف الذاتي (Kristin Neff): حين تنتقد نفسك، اسأل: "هل سأقول هذا لصديق مرّ بنفس الموقف؟" ثم كلّمْ نفسك بنفس اللطف المستحَق.',
      ],
    },
  },
  autonomy_achievement: {
    high: {
      title: 'استدامة الطموح بتوازن',
      icon: '🧭',
      techniques: [
        'التوازن بين الإنجاز والتعافي: الإنجاز المستدام يتطلب فترات تعافٍ حقيقية — جدول ساعة أسبوعياً لنشاط غير منتج تستمتع به دون إحساس بالذنب.',
        'العلاقة مع الفشل (Growth Mindset): بعد كل إخفاق، اسأل: ما الذي تعلمته؟ ماذا سأفعل بشكل مختلف؟ الفضول تجاه الفشل يحوّله من هزيمة إلى بيانات.',
      ],
    },
    mid: {
      title: 'تفعيل الدافعية الداخلية',
      icon: '⚖️',
      techniques: [
        'ضبط الأهداف بنظام SMART: حوّل هدفاً ضبابياً إلى خطوات محددة ومقاسة وزمنية — الوضوح يُحرر الطاقة المحجوزة خلف الغموض.',
        'مواجهة التسويف (التجربة السلوكية): حدد 5 دقائق فقط للبدء بمهمة تُسوّفها — الجزء الصعب هو البدء لا الإكمال؛ ابدأ وسيتبعك الزخم.',
      ],
    },
    low: {
      title: 'استكشاف القيم والدوافع الجوهرية',
      icon: '🤝',
      techniques: [
        'استكشاف القيم (ACT - Values Clarification): أجب: "ماذا أريد أن يُقال عني بعد 10 سنوات؟" و"ما الذي أُهدر وقتي فيه وأشعر باندفاع؟" — القيم المُكتشَفة تُطلق الدافعية الداخلية.',
        'نظام الأهداف الصغيرة (تفعيل سلوكي): حدد هدفاً قابلاً للإنجاز في 15 دقيقة وافعله اليوم. ثم كرر غداً. الفعل يسبق التحفيز لا العكس — ابدأ صغيراً.',
        'مراجعة مخطط الخضوع: هل تتراجع عن أهدافك خوفاً من الرفض أو لإرضاء الآخرين؟ هذا مخطط الخضوع — تعرّف عليه ليكفّ عن التحكم بقراراتك.',
      ],
    },
  },
};

function SmartCard({
  dim,
  visible,
  index,
}: {
  dim: PersonaDimension;
  visible: boolean;
  index: number;
}) {
  const [capsuleOpen, setCapsuleOpen] = useState(false);
  const colors = DIM_COLORS[dim.id] ?? DIM_COLORS.emotional_regulation;
  const icon = DIM_ICONS[dim.id] ?? '◆';
  const question = DIM_QUESTIONS[dim.id] ?? '';
  const terms = DIM_TERMS[dim.id] ?? [];
  const score = Math.round(dim.score);

  const levelLabel = score >= 65 ? 'مرتفع' : score >= 45 ? 'متوسط' : 'منخفض';
  const levelColor =
    score >= 65 ? 'text-nafees-sage' : score >= 45 ? 'text-nafees-copper' : 'text-nafees-warm';

  const capsule = CBT_CAPSULES[dim.id];
  const capsuleLevel: 'high' | 'mid' | 'low' = score >= 65 ? 'high' : score >= 45 ? 'mid' : 'low';
  const activeCapsule = capsule?.[capsuleLevel];

  return (
    <div
      className={`rounded-2xl p-5 border ${colors.bg} ${colors.border} transition-all duration-700`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <span className={`text-sm font-bold ${colors.text} leading-tight`}>{dim.title}</span>
            <div className="text-left flex-shrink-0">
              <span className={`text-xl font-bold ${colors.text} leading-none`}>{score}%</span>
              <span className={`block text-[10px] font-semibold ${levelColor}`}>{levelLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-nafees-cream-dark/50 rounded-full mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full ${colors.bar} transition-all duration-1000 ease-out`}
          style={{
            width: visible ? `${score}%` : '0%',
            transitionDelay: `${index * 80 + 350}ms`,
          }}
        />
      </div>

      {/* Clinical question */}
      <p className={`text-[11px] font-bold ${colors.text} mb-1.5 tracking-wide`}>{question}</p>

      {/* Description */}
      <p className="text-xs text-nafees-warm-dark leading-relaxed mb-3">{dim.description}</p>

      {/* Glossary terms */}
      {terms.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-nafees-cream-dark/40">
          {terms.map(([term, def]) => (
            <GlossaryTip key={term} term={term} definition={def} />
          ))}
        </div>
      )}

      {/* Matched patterns */}
      {dim.patterns.length > 0 && (
        <div className="mt-3 pt-3 border-t border-nafees-cream-dark/30 space-y-2">
          {dim.patterns.map((p: SynthesisPattern) => (
            <div key={p.id} className="bg-white/50 rounded-xl p-3">
              <p className={`text-xs font-bold mb-1 ${colors.text}`}>✦ {p.label}</p>
              <p className="text-[10px] text-nafees-warm-dark leading-relaxed">{p.description}</p>
              <p className="text-[9px] text-nafees-warm mt-1.5">
                {p.literatureSources.join(' · ')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* كبسولة التطوير العلاجي */}
      {activeCapsule && (
        <div className="mt-3 pt-3 border-t border-nafees-cream-dark/30">
          <button
            onClick={() => setCapsuleOpen((v) => !v)}
            className="w-full flex items-center justify-between text-right"
          >
            <span className={`text-[10px] font-bold ${colors.text} transition-transform duration-200 ${capsuleOpen ? 'rotate-180' : ''}`}>
              ▾
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs">{activeCapsule.icon}</span>
              <span className={`text-[11px] font-bold ${colors.text}`}>كبسولة التطوير العلاجي</span>
            </div>
          </button>
          <div className={`overflow-hidden transition-all duration-400 ${capsuleOpen ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            <div className={`rounded-xl p-3 ${colors.bg} border ${colors.border}`}>
              <p className={`text-[11px] font-bold ${colors.text} mb-2`}>{activeCapsule.title}</p>
              <ul className="space-y-2.5">
                {activeCapsule.techniques.map((technique, ti) => (
                  <li key={ti} className="flex items-start gap-2">
                    <span
                      className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold mt-0.5`}
                      style={{ background: colors.radarFill ?? '#1B4A6B' }}
                    >
                      {ti + 1}
                    </span>
                    <span className="text-[10px] text-nafees-warm-dark leading-relaxed">{technique}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[9px] text-nafees-warm mt-2.5 leading-relaxed">
                مُستند إلى: العلاج المعرفي السلوكي (CBT) · علاج المخططات (Young et al., 2003) · علاج القبول والالتزام (ACT)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MethodologyModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      style={{ backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-nafees-cream rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-10 h-1 bg-nafees-cream-dark rounded-full" />
        </div>

        <div className="px-6">
          <h3 className="text-lg font-bold text-nafees-navy mb-4 text-right">المنهجية العلمية</h3>

          {/* Formula */}
          <div className="bg-nafees-navy rounded-2xl p-4 mb-5 text-center">
            <p className="text-nafees-sky text-xs font-mono mb-1" dir="ltr">
              Score = 50 + Σ(wᵢ × (tᵢ − 50)) / Σ|wᵢ|
            </p>
            <div className="mt-3 text-right space-y-1" dir="rtl">
              <p className="text-nafees-cream-dark/80 text-[10px]">
                <span className="text-nafees-copper font-bold">wᵢ</span> = معامل الارتباط المنشور (من الدراسات أدناه)
              </p>
              <p className="text-nafees-cream-dark/80 text-[10px]">
                <span className="text-nafees-copper font-bold">tᵢ</span> = درجة السمة على مقياس 0–100
              </p>
              <p className="text-nafees-cream-dark/80 text-[10px]">
                الدرجة دائماً داخل النطاق [0، 100] — الانحراف عن 50 هو الإشارة الوحيدة
              </p>
            </div>
          </div>

          {/* Sources */}
          <p className="text-xs font-bold text-nafees-navy mb-3 text-right">المصادر العلمية</p>
          <div className="space-y-3">
            {[
              {
                ref: 'Noftle & Shaver (2006)',
                detail:
                  'Attachment dimensions and the Big Five personality traits. Journal of Research in Personality, 40(2), 179–208.',
                key: 'ns',
              },
              {
                ref: 'Thimm (2010)',
                detail:
                  'Personality and early maladaptive schemas: A five-factor model perspective. Journal of Behavior Therapy, 41(4), 373–380.',
                key: 'th',
              },
              {
                ref: 'Mikulincer & Shaver (2007)',
                detail:
                  'Attachment in Adulthood: Structure, Dynamics, and Change. Guilford Press.',
                key: 'ms',
              },
              {
                ref: 'Barrick & Mount (1991)',
                detail:
                  'The Big Five personality dimensions and job performance. Personnel Psychology, 44(1), 1–26.',
                key: 'bm',
              },
              {
                ref: 'Young, Klosko & Weishaar (2003)',
                detail: "Schema Therapy: A Practitioner's Guide. Guilford Press.",
                key: 'yk',
              },
            ].map((s) => (
              <div key={s.key} className="border-r-2 border-nafees-copper pr-3 text-right">
                <p className="text-[11px] font-bold text-nafees-warm-dark">{s.ref}</p>
                <p className="text-[10px] text-nafees-warm leading-relaxed">{s.detail}</p>
              </div>
            ))}
          </div>

          <p className="text-[9px] text-nafees-warm mt-5 leading-relaxed text-right">
            جميع معاملات الترجيح مُشتقة من معاملات الارتباط المنشورة في الدراسات أعلاه دون أي تعديل أو اجتهاد. المنهجية شفافة وقابلة للتحقق.
          </p>

          <button
            onClick={onClose}
            className="w-full mt-5 py-3 bg-nafees-navy text-nafees-cream rounded-2xl text-sm font-semibold active:scale-95 transition-transform duration-150"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Partner's Guide ───────────────────────────────────────────────────────────

const PARTNER_GUIDE: Record<string, [string, string, string, string, string, string]> = {
  // [high-icon, high-text, mid-icon, mid-text, low-icon, low-text]
  emotional_regulation: [
    '🕊️',
    'شريك هادئ في العواصف — لن تُخيفه انفعالاتك وسيوفر لك ملاذاً آمناً عاطفياً حتى في أصعب اللحظات.',
    '🌤️',
    'مرونة انفعالية معتدلة — يتأثر بالضغوط لكنه يتعافى. أعطِه وقتاً وعودته مضمونة.',
    '🌊',
    'يحتاج مساحةً وفهماً حين يمر بلحظات صعبة — الصبر وعدم تفسير ردود فعله شخصياً هو مفتاح العلاقة معه.',
  ],
  interpersonal_trust: [
    '🔓',
    'يفتح قلبه بشكل نسبي حين تُثبت اتساقك — العلاقة معه شفافة وصريحة حين يتأكد من أمانها.',
    '🗝️',
    'يبني الثقة تدريجياً — الاتساق في الأفعال لا الكلام هو ما يفتح بابه.',
    '🔒',
    'بحاجة إلى وقت وإثباتات متكررة قبل الانفتاح الكامل — لا تفسّر حذره شخصياً، هو حذرٌ وقائي لا رفضٌ لك.',
  ],
  relational_closeness: [
    '💎',
    'يبحث عن عمق وتواصل حقيقي — العلاقة السطحية لن تُرضيه. أعطِه مساحة للحديث العميق وسيُكافئك بولاء نادر.',
    '🌿',
    'يُقدّر القرب بجرعات معتدلة — يحتاج توازناً بين مساحته الخاصة وتواصل منتظم وأصيل.',
    '🏔️',
    'يحتفظ بمساحته الخاصة — احترام حدوده الشخصية هو أقوى لغة يفهمها في العلاقات.',
  ],
  self_worth: [
    '🌟',
    'يُقدّم نفسه بثقة هادئة — لا يحتاج لتأكيداتك المستمرة لكنه يُقدّرها حين تكون أصيلة ومحددة.',
    '🌱',
    'تقدير ذات مرن — يستفيد بشكل ملموس من الاعتراف بجهوده وإنجازاته ولو بجملة صغيرة.',
    '🌧️',
    'يحتاج تطمينات دورية أصيلة — الكلمات الطيبة والمحددة تحمل وزناً كبيراً في تجربته معك.',
  ],
  autonomy_achievement: [
    '🧭',
    'طموح يحتاج مساحةً لأهدافه — دعمه في أحلامه وعدم التنافس معها هو أقوى شكل من أشكال الحب.',
    '⚖️',
    'يوازن بين استقلاليته والتواصل — يستمتع بالشراكة حين تُحترم أولوياته وإيقاعه الخاص.',
    '🤝',
    'يُفضّل الشراكة والتشاور — القرارات المشتركة والتحقق من رأيه تُشعره بالأمان والتقدير.',
  ],
};

const DIM_PARTNER_TITLES: Record<string, string> = {
  emotional_regulation: 'التنظيم العاطفي',
  interpersonal_trust:  'بناء الثقة',
  relational_closeness: 'القرب والمسافة',
  self_worth:           'التقدير والاعتراف',
  autonomy_achievement: 'الاستقلالية والطموح',
};

function PartnerGuide({ dims }: { dims: PersonaDimension[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="max-w-md mx-auto px-4 pt-4 pb-4">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between bg-white rounded-2xl p-4 border border-nafees-copper/20 shadow-sm transition-all duration-200 active:scale-[0.99] text-right"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">💑</span>
          <div>
            <p className="text-sm font-bold text-nafees-navy">دليل الشريك</p>
            <p className="text-[10px] text-nafees-warm">كيف يفهمك شريك حياتك؟</p>
          </div>
        </div>
        <span className={`text-nafees-copper text-lg transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
          ↓
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ${expanded ? 'max-h-[2000px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}
      >
        <div className="space-y-3">
          {dims.map((dim) => {
            const guide = PARTNER_GUIDE[dim.id];
            if (!guide) return null;
            const score = dim.score;
            const [hiIcon, hiText, midIcon, midText, loIcon, loText] = guide;
            const isHigh = score >= 65;
            const isLow = score < 35;
            const icon = isHigh ? hiIcon : isLow ? loIcon : midIcon;
            const text = isHigh ? hiText : isLow ? loText : midText;
            const levelTag = isHigh ? 'مرتفع' : isLow ? 'منخفض' : 'متوسط';
            const levelColor = isHigh ? 'text-nafees-sage' : isLow ? 'text-nafees-warm' : 'text-nafees-copper';

            return (
              <div
                key={dim.id}
                className="bg-white rounded-2xl p-4 border border-nafees-cream-dark/30 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-bold text-nafees-navy">{DIM_PARTNER_TITLES[dim.id]}</p>
                      <span className={`text-[10px] font-bold ${levelColor}`}>{levelTag}</span>
                    </div>
                    <p className="text-[11px] text-nafees-warm-dark leading-relaxed">{text}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <p className="text-[9px] text-nafees-warm text-center px-2 pt-1 leading-relaxed">
            هذا الدليل مشتق من درجاتك على الأبعاد الخمسة. شاركه مع شريكك لفتح حوار أعمق.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Locked Synthesis Gate ──────────────────────────────────────────────────────

const TEST_LABELS: Record<string, string> = {
  ocean: 'الشخصية 🧠',
  attachment: 'التعلق 💙',
  schema: 'المخططات 🌱',
};

function LockedSynthesisGate({
  completedTests,
  onHome,
}: {
  completedTests: string[];
  onHome: () => void;
}) {
  const remaining = 3 - completedTests.length;
  return (
    <section className="max-w-md mx-auto px-4 pt-6 pb-4">
      <div
        className="relative rounded-3xl overflow-hidden border border-white/10"
        style={{ background: 'linear-gradient(135deg, #0F2D45 0%, #1B4A6B 100%)' }}
      >
        {/* Blurred ghost content */}
        <div className="blur-sm pointer-events-none select-none opacity-40 p-6 text-center">
          <p className="text-white text-2xl font-bold mb-1">هويتك النفسية الكاملة</p>
          <p className="text-white/70 text-sm">النمط المتكيف · الاستقرار الانفعالي · الإنجاز الاستراتيجي</p>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
          style={{ backdropFilter: 'blur(2px)' }}>
          <span className="text-3xl mb-3">🔒</span>
          <h3 className="text-lg font-bold text-white mb-2">التوليف الشامل مقفل</h3>
          <p className="text-white/75 text-sm leading-relaxed mb-4">
            أكمل {remaining} اختبار{remaining === 1 ? '' : 'ات'} {remaining === 1 ? 'إضافياً' : 'إضافية'} لكشف هويتك النفسية المتعددة الأبعاد
          </p>
          <div className="flex gap-2 justify-center flex-wrap mb-4">
            {(['ocean', 'attachment', 'schema'] as const).map((id) => {
              const done = completedTests.includes(id);
              return (
                <span
                  key={id}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${
                    done ? 'bg-nafees-sage text-white' : 'bg-white/15 text-white/60'
                  }`}
                >
                  {done ? '✓' : '○'} {TEST_LABELS[id]}
                </span>
              );
            })}
          </div>
          <button
            onClick={onHome}
            className="bg-white text-nafees-navy font-bold text-sm px-6 py-2.5 rounded-full active:scale-95 transition-transform duration-150"
          >
            استكمال الاختبارات
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SynthesisPage({ onHome }: SynthesisPageProps) {
  // All hooks must be declared before any conditional return
  const result = useMemo(() => {
    const r = runSynthesis();
    if (r) saveSynthesisResult(r);
    return r;
  }, []);

  const [visible, setVisible] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // ── Zero-data guard — anti-hallucination hard stop ──────────────────────────
  // runSynthesis() returns null when completedTests === 0. Never display a
  // default persona name when there is no data to support it.
  if (!result) {
    return (
      <div className="min-h-screen bg-nafees-cream flex flex-col" dir="rtl">
        <div
          className={`flex-1 flex flex-col items-center justify-center px-4 pb-24 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-sm border border-nafees-cream-dark/30">
            <p className="text-5xl mb-5">📋</p>
            <h1 className="text-xl font-bold text-nafees-navy mb-3">لا توجد بيانات كافية</h1>
            <p className="text-nafees-warm text-sm leading-relaxed mb-6">
              يرجى إكمال الاختبارات للبدء في تحليل شخصيتك. أكمل الاختبارات الثلاثة (الشخصية · التعلق · المخططات) لتفعيل محرك التوليف النفسي وتحليل التقاطعات.
            </p>
            <div className="flex gap-2 justify-center flex-wrap mb-6">
              {(['ocean', 'attachment', 'schema'] as const).map((id) => (
                <span key={id} className="text-[11px] px-3 py-1.5 rounded-full bg-nafees-cream border border-nafees-cream-dark/40 text-nafees-warm">
                  ○ {TEST_LABELS[id]}
                </span>
              ))}
            </div>
            <button
              onClick={onHome}
              className="bg-nafees-navy text-nafees-cream text-sm font-bold px-8 py-3 rounded-2xl active:scale-95 transition-transform duration-150"
            >
              ابدأ الاختبارات
            </button>
          </div>
        </div>
        <div className="max-w-md mx-auto w-full px-4 pb-10">
          <button
            onClick={onHome}
            className="w-full py-3 rounded-2xl border-2 border-nafees-cream-dark text-nafees-navy font-semibold text-sm active:scale-95 transition-transform duration-150"
          >
            ← العودة إلى الرئيسية
          </button>
        </div>
      </div>
    );
  }

  // ── Derived values (after null guard) ──────────────────────────────────────
  const fullSynthesis = result.completedTests.length === 3;

  const allPatterns = result.dimensions.flatMap((d) => d.patterns);

  const correlationResult = useMemo(() => {
    if (!fullSynthesis) return null;
    try {
      const vector = buildTraitVector();
      return computeCorrelationMatrix(vector);
    } catch {
      return null;
    }
  }, [fullSynthesis]);

  // Persona is only derived (and shown) when all 3 tests are complete.
  // With partial data the scores are valid but assigning a named persona
  // from an incomplete profile would be a form of hallucination.
  const persona = fullSynthesis ? derivePersona(result.dimensions, allPatterns) : null;

  const confidence = CONFIDENCE_META[result.confidence];

  async function handlePdfExport() {
    if (!reportRef.current || pdfLoading) return;
    setPdfLoading(true);
    try {
      await exportToPdf(reportRef.current, 'nafees-synthesis-report.pdf');
    } finally {
      setPdfLoading(false);
    }
  }

  // Hero gradient: use persona colours when available, otherwise neutral navy
  const heroGradFrom = persona?.gradientFrom ?? '#1B4A6B';
  const heroGradTo   = persona?.gradientTo   ?? '#0F2D45';

  return (
    <div className="min-h-screen bg-nafees-cream" dir="rtl" ref={reportRef}>

      {/* ── Hero / Header ── */}
      <div
        className={`transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: `linear-gradient(180deg, ${heroGradFrom} 0%, ${heroGradTo} 100%)` }}
      >
        <div className="max-w-md mx-auto px-4 pt-8 pb-8">
          <div
            className="rounded-3xl p-6 text-center shadow-2xl border border-white/15"
            style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            {/* Persona name — only when full synthesis is unlocked */}
            {fullSynthesis && persona ? (
              <>
                <h1
                  className="text-3xl font-bold text-nafees-cream mb-1"
                  style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', letterSpacing: '0.04em' }}
                >
                  {persona.name}
                </h1>
                <p className="text-nafees-cream-dark/80 text-sm mb-5 leading-relaxed">
                  {persona.subtitle}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-nafees-cream mb-1">
                  توليفك النفسي قيد الاكتمال
                </h1>
                <p className="text-nafees-cream-dark/70 text-sm mb-5 leading-relaxed">
                  أكمل {3 - result.completedTests.length} اختبار{result.completedTests.length === 2 ? '' : 'ات'} إضافية لكشف هويتك الكاملة
                </p>
              </>
            )}

            {/* Confidence + tests */}
            <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                <span className="text-nafees-cream-dark/70 text-xs">دقة التحليل:</span>
                <span className={`text-xs font-bold ${confidence.color}`}>{confidence.label}</span>
              </div>
            </div>

            {/* Completed tests indicators */}
            <div className="flex justify-center gap-2 flex-wrap mb-4">
              {(
                [
                  ['ocean', 'الشخصية', '🧠'],
                  ['attachment', 'التعلق', '💙'],
                  ['schema', 'المخططات', '🌱'],
                ] as const
              ).map(([id, label, emoji]) => {
                const done = result.completedTests.includes(id);
                return (
                  <span
                    key={id}
                    className={`text-[10px] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 ${
                      done
                        ? 'bg-white/20 text-nafees-cream'
                        : 'bg-white/5 text-nafees-cream-dark/35'
                    }`}
                  >
                    {emoji} {label}
                    {done ? (
                      <span className="text-nafees-sage font-bold">✓</span>
                    ) : (
                      <span className="opacity-40">○</span>
                    )}
                  </span>
                );
              })}
            </div>

            {/* Confidence detail */}
            <p className="text-[10px] text-nafees-cream-dark/50">{confidence.detail}</p>

            {/* Data completeness bar */}
            {result.dataCompleteness !== undefined && (
              <div className="mt-3 bg-white/10 rounded-xl px-3 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-nafees-cream-dark/60">اكتمال البيانات</span>
                  <span
                    className={`text-[11px] font-bold ${
                      result.dataCompleteness >= 80
                        ? 'text-nafees-sage'
                        : result.dataCompleteness >= 50
                          ? 'text-nafees-copper'
                          : 'text-nafees-cream-dark/70'
                    }`}
                  >
                    {result.dataCompleteness}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      result.dataCompleteness >= 80 ? 'bg-nafees-sage' : 'bg-nafees-copper'
                    }`}
                    style={{ width: `${result.dataCompleteness}%` }}
                  />
                </div>
              </div>
            )}

            {/* Demographic adjustment badge */}
            {result.demographicAdjustmentsApplied && (
              <div className="mt-2">
                <span className="text-[9px] bg-nafees-copper/25 text-nafees-copper px-2.5 py-0.5 rounded-full inline-block">
                  ✦ مُعدَّل وفق الملف الديموغرافي
                </span>
              </div>
            )}

            {/* Core tier transparency note */}
            {result.oceanTier === 'core' && (
              <div className="mt-3 bg-nafees-sky/15 border border-nafees-sky/25 rounded-xl px-3 py-2.5 text-right">
                <p className="text-[10px] text-nafees-sky leading-relaxed">
                  ⚡ تحليل الشخصية مبني على التقييم الأساسي (50 سؤالاً) — الأبعاد الخمسة دقيقة، لكن الوجوه الفرعية تتطلب التقييم الشامل.
                </p>
              </div>
            )}

            {/* Matched patterns — only show when full synthesis is available */}
            {fullSynthesis && allPatterns.length > 0 && persona && (
              <div className="mt-4 pt-4 border-t border-white/15">
                <p className="text-[10px] text-nafees-cream-dark/60 mb-2">الأنماط المُكتشَفة</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {allPatterns.map((p) => (
                    <span
                      key={p.id}
                      className="text-[10px] bg-white/10 px-2.5 py-1 rounded-full"
                      style={{ color: persona.accentColor }}
                    >
                      ✦ {p.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scroll hint */}
          <p className="text-center text-nafees-cream-dark/30 text-[10px] mt-3">
            اسحب للأسفل لعرض التحليل التفصيلي ↓
          </p>
        </div>
      </div>

      {/* ── Neural Radar Graph ── */}
      <section
        className={`max-w-md mx-auto px-4 pt-7 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-nafees-navy">الخريطة النفسية</h2>
          <span className="text-[10px] text-nafees-warm">اضغط على النقاط للتفاصيل</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-nafees-cream-dark/30 py-4 px-2">
          <RadarChart dims={result.dimensions} />
        </div>
      </section>

      {/* ── Clinical Insight Smart Cards ── */}
      <section
        className={`max-w-md mx-auto px-4 pt-6 pb-4 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <h2 className="text-sm font-bold text-nafees-navy mb-3 px-1">التحليل النفسي التفصيلي</h2>
        <div className="space-y-3">
          {result.dimensions.map((dim, i) => (
            <SmartCard key={dim.id} dim={dim} visible={visible} index={i} />
          ))}
        </div>
      </section>

      {/* ── Key Insights (only meaningful with full data) ── */}
      {fullSynthesis && result.keyInsights.length > 0 && (
        <section
          className={`max-w-md mx-auto px-4 pt-2 pb-2 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="bg-nafees-navy/5 rounded-2xl p-4 border border-nafees-navy/10">
            <h2 className="text-sm font-bold text-nafees-navy mb-3">✦ رؤى جوهرية</h2>
            <ul className="space-y-2">
              {result.keyInsights.map((insight, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-xs text-nafees-warm-dark leading-relaxed"
                >
                  <span className="text-nafees-copper flex-shrink-0 mt-px">◆</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Partner's Guide — gated on full synthesis ── */}
      {fullSynthesis && (
        <div className={`transition-all duration-700 delay-[350ms] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <PartnerGuide dims={result.dimensions} />
        </div>
      )}

      {/* ── Cross-Test Coherence — shown when full synthesis and correlation computed ── */}
      {fullSynthesis && correlationResult && correlationResult.overallCoherence > 0 && (
        <section
          className={`max-w-md mx-auto px-4 pt-2 pb-2 transition-all duration-700 delay-[400ms] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="bg-nafees-navy/5 rounded-2xl p-4 border border-nafees-navy/10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-nafees-navy">⚡ تناسق الاختبارات</h2>
              <div className="flex items-center gap-1.5">
                <span className={`text-base font-bold ${
                  correlationResult.overallCoherence >= 70 ? 'text-nafees-sage' :
                  correlationResult.overallCoherence >= 50 ? 'text-nafees-copper' : 'text-nafees-warm'
                }`}>
                  {correlationResult.overallCoherence}%
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-nafees-cream-dark/50 rounded-full mb-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  correlationResult.overallCoherence >= 70 ? 'bg-nafees-sage' :
                  correlationResult.overallCoherence >= 50 ? 'bg-nafees-copper' : 'bg-nafees-warm'
                }`}
                style={{ width: visible ? `${correlationResult.overallCoherence}%` : '0%' }}
              />
            </div>
            <p className="text-[10px] text-nafees-warm-dark leading-relaxed mb-3">
              يقيس مدى توافق نتائج اختباراتك مع بعضها وفق معاملات الارتباط المنشورة في الأدبيات النفسية.
              التوافق المرتفع يعني أن صورتك النفسية متسقة ومتماسكة عبر المقاييس المختلفة.
            </p>
            {correlationResult.amplifiers.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-nafees-navy mb-1">أنماط متقاطعة بارزة</p>
                {correlationResult.amplifiers.slice(0, 3).map((amp, i) => (
                  <div key={i} className="flex gap-2 text-[10px] text-nafees-warm-dark leading-relaxed">
                    <span className="text-nafees-sage flex-shrink-0">◆</span>
                    <span>{amp}</span>
                  </div>
                ))}
              </div>
            )}
            {correlationResult.tensions.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-[10px] font-bold text-nafees-copper mb-1">توترات نفسية مثيرة للاهتمام</p>
                {correlationResult.tensions.slice(0, 2).map((ten, i) => (
                  <div key={i} className="flex gap-2 text-[10px] text-nafees-warm-dark leading-relaxed">
                    <span className="text-nafees-copper flex-shrink-0">◇</span>
                    <span>{ten}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Locked Synthesis Gate — shown when < 3 tests complete ── */}
      {!fullSynthesis && (
        <div className={`transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <LockedSynthesisGate completedTests={result.completedTests} onHome={onHome} />
        </div>
      )}

      {/* ── Invite to complete / demographic nudge ── */}
      {(result.dataCompleteness ?? 100) < 80 && (
        <section
          className={`max-w-md mx-auto px-4 pt-2 pb-2 transition-all duration-700 delay-[350ms] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="bg-nafees-blue/5 rounded-2xl p-4 border border-nafees-blue/15 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">📊</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-nafees-navy mb-1">لرفع دقة التحليل</p>
              <p className="text-[10px] text-nafees-warm leading-relaxed mb-2">
                {result.completedTests.length < 3 && 'أكمل الاختبارات الثلاثة '}
                {!result.demographicAdjustmentsApplied && 'وأضف ملفك السياقي (العمر، الحالة الاجتماعية...) '}
                لرفع دقة التوليف النفسي إلى الحد الأقصى.
              </p>
              {result.completedTests.length < 3 && (
                <button
                  onClick={onHome}
                  className="text-[10px] bg-nafees-navy text-nafees-cream px-3 py-1.5 rounded-full font-semibold active:scale-95 transition-transform duration-150"
                >
                  استكمال الاختبارات
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Scientific Integrity Guard ── */}
      <section
        className={`max-w-md mx-auto px-4 pt-4 pb-8 transition-all duration-700 delay-[400ms] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <button
          onClick={() => setShowMethodology(true)}
          className="w-full flex items-center justify-between bg-nafees-cream-dark/40 hover:bg-nafees-cream-dark/60 rounded-2xl p-4 border border-nafees-cream-dark/50 transition-colors duration-200 active:scale-[0.99]"
        >
          <span className="text-xs text-nafees-warm-dark">عرض المعادلة والمصادر العلمية</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-nafees-blue">المنهجية</span>
            <span className="w-6 h-6 rounded-full bg-nafees-blue/10 flex items-center justify-center text-nafees-blue text-xs font-bold">
              ⚗
            </span>
          </div>
        </button>

        <div className="mt-3 bg-nafees-cream-dark/25 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-nafees-navy mb-2">المصادر الأساسية</p>
          <div className="space-y-1 text-[9px] text-nafees-warm leading-relaxed">
            <p>• Noftle & Shaver (2006) — J. Research in Personality, 40(2)</p>
            <p>• Thimm (2010) — J. Behavior Therapy, 41(4)</p>
            <p>• Mikulincer & Shaver (2007) — Attachment in Adulthood, Guilford</p>
            <p>• Barrick & Mount (1991) — Personnel Psychology, 44(1)</p>
            <p>• Young, Klosko & Weishaar (2003) — Schema Therapy, Guilford</p>
          </div>
          <p className="text-[9px] text-nafees-warm mt-2 leading-relaxed">
            جميع معاملات الترجيح مُشتقة مباشرة من معاملات الارتباط المنشورة — لا تخمين في المنهجية.
          </p>
        </div>

        <p className="text-[10px] text-nafees-warm text-center px-2 leading-relaxed mt-4">
          🔒 هذا التحليل لأغراض التوعية الذاتية فقط وليس تشخيصاً سريرياً.
          للحصول على تقييم متخصص، يُرشد للتواصل مع معالج نفسي مرخص.
        </p>
      </section>

      {/* PDF Export + Back buttons */}
      <div className="max-w-md mx-auto px-4 pb-10 space-y-3">
        {fullSynthesis && (
          <button
            onClick={handlePdfExport}
            disabled={pdfLoading}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
              pdfLoading
                ? 'bg-nafees-cream-dark text-nafees-warm cursor-not-allowed'
                : 'bg-nafees-copper text-white'
            }`}
          >
            {pdfLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                جارٍ إنشاء التقرير...
              </>
            ) : (
              <>
                <span>⬇</span>
                تحميل التقرير السريري الشامل
              </>
            )}
          </button>
        )}
        <button
          onClick={onHome}
          className="w-full py-3 rounded-2xl border-2 border-nafees-cream-dark text-nafees-navy font-semibold text-sm active:scale-95 transition-transform duration-150"
        >
          ← العودة إلى الرئيسية
        </button>
      </div>

      {/* Methodology modal */}
      {showMethodology && <MethodologyModal onClose={() => setShowMethodology(false)} />}
    </div>
  );
}
