/**
 * Cross-Test Correlation Matrix
 *
 * Computes psychometric coherence across the 4 measurement systems:
 * OCEAN (Big Five) × ECR-R (Attachment) × Schema Therapy × Social Patterns
 *
 * Correlation weights drawn from peer-reviewed meta-analyses:
 *   - Noftle & Shaver (2006) — Personality predictors of attachment
 *   - Thimm (2010) — Mediation of early maladaptive schemas between personality and attachment
 *   - Mikulincer & Shaver (2007) — Attachment in Adulthood (Ch. 12)
 *   - McCrae & Costa (2003) — Personality in Adulthood (OCEAN × social behavior)
 *   - Hogan & Holland (2003) — C × leadership/dominance meta-analysis
 *
 * Formula: expectedValue = 50 + r × (observedDeviation)
 * Coherence per pair: 1 - |observed - expected| / 50
 * Bounded to [0, 1].
 */

import type { TraitVector } from './synthesisTypes';

// ── Types ────────────────────────────────────────────────────────────────────

export interface CrossCorrelationRule {
  id: string;
  testA: string;
  traitA: keyof TraitVector | string;
  testB: string;
  traitB: string;
  /** Pearson r from literature (positive = same direction, negative = inverse) */
  r: number;
  /** Literature citation key */
  source: string;
}

export interface CorrelationInsight {
  type: 'amplifier' | 'tension' | 'coherent';
  /** 0–100 magnitude */
  magnitude: number;
  /** Arabic description of the cross-test pattern */
  description: string;
  /** Pairs involved */
  tests: string[];
}

export interface CorrelationResult {
  /** Overall coherence 0–100: how well all tests agree */
  overallCoherence: number;
  /** Individual cross-test insights */
  insights: CorrelationInsight[];
  /** Dominant amplifiers (multiple tests agree strongly) */
  amplifiers: string[];
  /** Meaningful tensions (tests point in different directions) */
  tensions: string[];
}

// ── Correlation Rules (peer-reviewed weights) ─────────────────────────────────

/**
 * Each rule defines an expected directional relationship between two traits
 * across different test systems. r is the expected Pearson correlation.
 */
const CROSS_TEST_RULES: CrossCorrelationRule[] = [
  // ── OCEAN × Attachment ──────────────────────────────────────────────────
  {
    id: 'N_anxiety',
    testA: 'ocean', traitA: 'N',
    testB: 'attachment', traitB: 'anxietyPct',
    r: +0.50,
    source: 'Noftle & Shaver (2006)',
  },
  {
    id: 'E_avoidance',
    testA: 'ocean', traitA: 'E',
    testB: 'attachment', traitB: 'avoidancePct',
    r: -0.35,
    source: 'Noftle & Shaver (2006)',
  },
  {
    id: 'A_anxiety',
    testA: 'ocean', traitA: 'A',
    testB: 'attachment', traitB: 'anxietyPct',
    r: -0.20,
    source: 'Noftle & Shaver (2006)',
  },
  {
    id: 'C_avoidance',
    testA: 'ocean', traitA: 'C',
    testB: 'attachment', traitB: 'avoidancePct',
    r: -0.18,
    source: 'Noftle & Shaver (2006)',
  },

  // ── OCEAN × Schema ───────────────────────────────────────────────────────
  {
    id: 'N_S1',
    testA: 'ocean', traitA: 'N',
    testB: 'schema', traitB: 'S1',
    r: +0.55,
    source: 'Thimm (2010)',
  },
  {
    id: 'N_S4',
    testA: 'ocean', traitA: 'N',
    testB: 'schema', traitB: 'S4',
    r: +0.50,
    source: 'Thimm (2010)',
  },
  {
    id: 'N_S3',
    testA: 'ocean', traitA: 'N',
    testB: 'schema', traitB: 'S3',
    r: +0.45,
    source: 'Thimm (2010)',
  },
  {
    id: 'A_S2',
    testA: 'ocean', traitA: 'A',
    testB: 'schema', traitB: 'S2',
    r: -0.40,
    source: 'Thimm (2010)',
  },
  {
    id: 'C_S7',
    testA: 'ocean', traitA: 'C',
    testB: 'schema', traitB: 'S7',
    r: +0.45,
    source: 'Thimm (2010)',
  },
  {
    id: 'C_S6',
    testA: 'ocean', traitA: 'C',
    testB: 'schema', traitB: 'S6',
    r: -0.35,
    source: 'Thimm (2010)',
  },

  // ── Attachment × Schema ──────────────────────────────────────────────────
  {
    id: 'anxiety_S1',
    testA: 'attachment', traitA: 'anxietyPct',
    testB: 'schema', traitB: 'S1',
    r: +0.60,
    source: 'Mikulincer & Shaver (2007)',
  },
  {
    id: 'avoidance_S2',
    testA: 'attachment', traitA: 'avoidancePct',
    testB: 'schema', traitB: 'S2',
    r: +0.55,
    source: 'Mikulincer & Shaver (2007)',
  },
  {
    id: 'avoidance_S3',
    testA: 'attachment', traitA: 'avoidancePct',
    testB: 'schema', traitB: 'S3',
    r: +0.40,
    source: 'Mikulincer & Shaver (2007)',
  },
  {
    id: 'anxiety_S4',
    testA: 'attachment', traitA: 'anxietyPct',
    testB: 'schema', traitB: 'S4',
    r: +0.45,
    source: 'Mikulincer & Shaver (2007)',
  },

  // ── OCEAN × Social Patterns ──────────────────────────────────────────────
  {
    id: 'E_SA',
    testA: 'ocean', traitA: 'E',
    testB: 'social', traitB: 'accommodationPct',
    r: +0.35,
    source: 'McCrae & Costa (2003)',
  },
  {
    id: 'A_SA',
    testA: 'ocean', traitA: 'A',
    testB: 'social', traitB: 'accommodationPct',
    r: +0.45,
    source: 'McCrae & Costa (2003)',
  },
  {
    id: 'E_AS',
    testA: 'ocean', traitA: 'E',
    testB: 'social', traitB: 'attentionPct',
    r: +0.40,
    source: 'McCrae & Costa (2003)',
  },
  {
    id: 'C_D',
    testA: 'ocean', traitA: 'C',
    testB: 'social', traitB: 'dominancePct',
    r: +0.30,
    source: 'Hogan & Holland (2003)',
  },
  {
    id: 'N_SA',
    testA: 'ocean', traitA: 'N',
    testB: 'social', traitB: 'accommodationPct',
    r: +0.28,
    source: 'McCrae & Costa (2003)',
  },

  // ── Attachment × Social Patterns ─────────────────────────────────────────
  {
    id: 'avoidance_Au',
    testA: 'attachment', traitA: 'avoidancePct',
    testB: 'social', traitB: 'autonomyPct',
    r: +0.35,
    source: 'Mikulincer & Shaver (2007) — estimated',
  },
  {
    id: 'anxiety_SA',
    testA: 'attachment', traitA: 'anxietyPct',
    testB: 'social', traitB: 'accommodationPct',
    r: +0.30,
    source: 'Mikulincer & Shaver (2007) — estimated',
  },
];

// ── Trait Extractor ───────────────────────────────────────────────────────────

/**
 * Extracts a scalar score (0–100) for a named trait from the TraitVector.
 * Returns null when the test hasn't been completed.
 */
function extractTrait(
  vector: TraitVector,
  test: string,
  trait: string,
): number | null {
  switch (test) {
    case 'ocean': {
      if (!vector.completedTests.has('ocean')) return null;
      const v = (vector.ocean as Record<string, number | undefined>)[trait];
      return v !== undefined ? v : null;
    }
    case 'attachment': {
      if (!vector.completedTests.has('attachment')) return null;
      if (trait === 'anxietyPct') return vector.attachmentAnxiety;
      if (trait === 'avoidancePct') return vector.attachmentAvoidance;
      return null;
    }
    case 'schema': {
      if (!vector.completedTests.has('schema')) return null;
      const v = (vector.schemas as Record<string, number | undefined>)[trait];
      return v !== undefined ? v : null;
    }
    case 'social': {
      // Social pattern axes are stored separately in localStorage.
      // loadSocialAxis returns null when no result exists.
      return loadSocialAxis(trait);
    }
    default:
      return null;
  }
}

function loadSocialAxis(trait: string): number | null {
  try {
    const raw = localStorage.getItem('nafees_social_patterns_result');
    if (!raw) return null;
    const r = JSON.parse(raw) as {
      dominancePct?: number;
      autonomyPct?: number;
      accommodationPct?: number;
      attentionPct?: number;
    };
    const map: Record<string, number | undefined> = {
      dominancePct: r.dominancePct,
      autonomyPct: r.autonomyPct,
      accommodationPct: r.accommodationPct,
      attentionPct: r.attentionPct,
    };
    const v = map[trait];
    return v !== undefined ? v : null;
  } catch {
    return null;
  }
}

// ── Core Computation ──────────────────────────────────────────────────────────

/**
 * For a given cross-test rule, computes how coherent the two observed trait
 * values are with the expected correlation.
 *
 * Both traits are on a 0–100 scale centered at 50.
 * Expected traitB given traitA: E[B] = 50 + r × (traitA − 50)
 * Coherence: 1 − |traitB − E[B]| / 50 → clamped to [0,1]
 */
function computePairCoherence(
  traitAValue: number,
  traitBValue: number,
  r: number,
): number {
  const expected = 50 + r * (traitAValue - 50);
  const deviation = Math.abs(traitBValue - expected);
  return Math.max(0, Math.min(1, 1 - deviation / 50));
}

// ── Narrative Generators ───────────────────────────────────────────────────────

const TEST_NAMES: Record<string, string> = {
  ocean: 'الشخصية',
  attachment: 'التعلق',
  schema: 'المخططات',
  social: 'الأنماط الاجتماعية',
};

function buildInsight(
  rule: CrossCorrelationRule,
  traitA: number,
  traitB: number,
  coherence: number,
): CorrelationInsight {
  const aHigh = traitA > 65;
  const aLow = traitA < 35;
  const bHigh = traitB > 65;
  const bLow = traitB < 35;

  const testAName = TEST_NAMES[rule.testA] ?? rule.testA;
  const testBName = TEST_NAMES[rule.testB] ?? rule.testB;

  const bothAlign =
    (aHigh && bHigh && rule.r > 0) ||
    (aLow && bLow && rule.r > 0) ||
    (aHigh && bLow && rule.r < 0) ||
    (aLow && bHigh && rule.r < 0);

  const bothOppose =
    (aHigh && bLow && rule.r > 0) ||
    (aLow && bHigh && rule.r > 0) ||
    (aHigh && bHigh && rule.r < 0) ||
    (aLow && bLow && rule.r < 0);

  const type = bothAlign
    ? 'amplifier'
    : bothOppose
      ? 'tension'
      : 'coherent';

  // Magnitude measures how far both traits are from neutral, regardless of direction.
  // High magnitude = strong signal (or strong tension); used for threshold filtering.
  const devA = traitA - 50;
  const devB = traitB - 50;
  const magnitude = Math.round((Math.abs(devA) + Math.abs(devB)) / 2);

  const descriptions = buildDescription(rule, traitA, traitB, type);

  return {
    type,
    magnitude,
    description: descriptions,
    tests: [rule.testA, rule.testB],
  };
}

function buildDescription(
  rule: CrossCorrelationRule,
  traitA: number,
  traitB: number,
  type: CorrelationInsight['type'],
): string {
  const id = rule.id;

  const map: Partial<Record<string, [string, string, string]>> = {
    // [amplifier, tension, coherent]
    N_anxiety: [
      'القلق العاطفي مُدعَّم بعصبية عالية — نمط شائع في التعلق القلق.',
      'القلق العاطفي ظاهر رغم استقرار عصبي — مصدره محدد لا عام.',
      'مستوى العصبية يتناسق مع قلق التعلق.',
    ],
    E_avoidance: [
      'الانبساطية تقابلها درجة منخفضة من التجنب — دفء اجتماعي واسع.',
      'انبساطية عالية مع تجنب مرتفع — حضور اجتماعي خارجي مع حذر داخلي.',
      'العصبية والتجنب متوافقان.',
    ],
    N_S1: [
      'الخوف من الهجر مُضخَّم بعصبية عالية — استجابة عاطفية حادة لمواقف الفراق.',
      'خوف من الهجر حاضر رغم الاستقرار الانفعالي — مخطط معرفي مبكر لا سمة.',
      'الاستقرار الانفعالي ومخطط الهجر متوافقان.',
    ],
    N_S4: [
      'الشعور بالنقص مُعزَّز بعصبية عالية — حديث داخلي ناقد مستمر.',
      'مخطط عيب قوي مع استقرار انفعالي — قناعة معرفية لا مزاج.',
      'عصبية منخفضة تتوافق مع تقدير ذات مستقر.',
    ],
    anxiety_S1: [
      'القلق والخوف من الهجر يُعززان بعضهما — نمط قلق-هجر متكامل.',
      'قلق مرتفع دون مخطط هجر واضح — قلق علائقي لا وجودي.',
      'قلق التعلق ومخطط الهجر متوافقان.',
    ],
    avoidance_S2: [
      'التجنب والشك بالآخرين يُغذّيان بعضهما — صعوبة حقيقية في بناء الثقة.',
      'تجنب عاطفي مع ثقة عالية — مسافة وقائية لا دفاعية.',
      'مستوى التجنب والثقة متوافقان.',
    ],
    A_SA: [
      'المقبولية العالية تتوافق مع تكيف اجتماعي — شخصية دبلوماسية ودية.',
      'مقبولية منخفضة مع تكيف اجتماعي — إرضاء الآخرين بأسلوب إستراتيجي.',
      'المقبولية والتكيف الاجتماعي متوافقان.',
    ],
    C_S7: [
      'الضمير العالي والمعايير المرتفعة يتعاضدان — نمط إنجاز كمالي.',
      'ضمير منخفض مع معايير مرتفعة — نقد ذاتي دون انضباط سلوكي.',
      'الضمير ومخطط المعايير متوافقان.',
    ],
    avoidance_Au: [
      'التجنب العاطفي يتوافق مع الاستقلالية العالية — خصوصية ذاتية واسعة.',
      'تجنب مرتفع مع استقلالية منخفضة — انسحاب دون اكتفاء ذاتي.',
      'التجنب والاستقلالية متوافقان.',
    ],
    E_AS: [
      'الانبساطية العالية تتعاضد مع الحاجة للاعتراف — حضور اجتماعي يبحث عن التقدير.',
      'انبساطية عالية مع حاجة اعتراف منخفضة — حضور اجتماعي بلا حاجة للتحقق.',
      'الانبساطية والحاجة للاعتراف متوافقان.',
    ],
  };

  const entry = map[id];
  if (entry) {
    if (type === 'amplifier') return entry[0];
    if (type === 'tension') return entry[1];
    return entry[2];
  }

  // Generic fallback
  const aDir = traitA > 50 ? 'مرتفع' : 'منخفض';
  const bDir = traitB > 50 ? 'مرتفع' : 'منخفض';
  return `${rule.traitA} ${aDir} و${rule.traitB} ${bDir} عبر اختبارَي ${TEST_NAMES[rule.testA]} و${TEST_NAMES[rule.testB]}.`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function computeCorrelationMatrix(vector: TraitVector): CorrelationResult {
  const completed = vector.completedTests;
  if (completed.size < 2) {
    return { overallCoherence: 0, insights: [], amplifiers: [], tensions: [] };
  }

  const coherenceValues: number[] = [];
  const insights: CorrelationInsight[] = [];

  for (const rule of CROSS_TEST_RULES) {
    const traitA = extractTrait(vector, rule.testA, rule.traitA as string);
    const traitB = extractTrait(vector, rule.testB, rule.traitB);

    if (traitA === null || traitB === null) continue;

    const coherence = computePairCoherence(traitA, traitB, rule.r);
    coherenceValues.push(coherence);

    // Only surface meaningful insights (one or both traits are non-neutral)
    const bothNeutral = Math.abs(traitA - 50) < 10 && Math.abs(traitB - 50) < 10;
    if (!bothNeutral) {
      insights.push(buildInsight(rule, traitA, traitB, coherence));
    }
  }

  const overallCoherence =
    coherenceValues.length > 0
      ? Math.round(
          (coherenceValues.reduce((s, v) => s + v, 0) / coherenceValues.length) * 100,
        )
      : 0;

  const amplifiers = insights
    .filter((i) => i.type === 'amplifier' && i.magnitude > 20)
    .map((i) => i.description);

  const tensions = insights
    .filter((i) => i.type === 'tension' && i.magnitude > 15)
    .map((i) => i.description);

  return { overallCoherence, insights, amplifiers, tensions };
}
