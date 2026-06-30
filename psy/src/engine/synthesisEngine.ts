/**
 * Psychological Synthesis Engine — محرك التوليف النفسي
 *
 * Scoring algorithm
 * ─────────────────
 * Each Persona Dimension score is a weighted average of deviations from the
 * neutral midpoint (50) across all contributing trait scores:
 *
 *   deviation_i  = traitScore_i − 50
 *   weightedSum  = Σ (weight_i × deviation_i)
 *   score        = 50 + weightedSum / Σ|weight_i|
 *
 * This guarantees score ∈ [0, 100] and ensures that a truly neutral trait
 * (score = 50) contributes nothing to the dimension — only genuine deviations
 * from the population midpoint carry signal.
 *
 * Weights are signed correlation coefficients taken verbatim from the
 * peer-reviewed sources documented in synthesisMatrix.ts.  No thresholds
 * or rules are invented; the inference is entirely correlation-weighted.
 */

import { loadHistory } from './scoring';
import { loadAttachmentHistory } from './attachmentScoring';
import { loadSchemaHistory } from './schemaScoring';
import { getLevel } from './scoring';
import { DIMENSION_RULES, SYNTHESIS_PATTERNS } from './synthesisMatrix';
import type { FactorKey } from './types';
import type { SchemaKey } from './schemaTypes';
import type {
  TraitVector,
  SynthesisResult,
  PersonaDimension,
  SynthesisPattern,
  DimensionRule,
  ConfidenceLevel,
} from './synthesisTypes';

const STORAGE_KEY = 'nafees_synthesis_result';

// ── Pure math (exported for unit tests) ─────────────────────────────────────

/**
 * Compute a single dimension score from a trait vector using the
 * weighted-deviation formula described in the module header.
 *
 * Missing traits (tests not completed) are silently skipped; the absent
 * weights are excluded from both numerator and denominator, so the score
 * remains well-defined even with partial data.
 */
export function computeDimensionScore(rule: DimensionRule, vector: TraitVector): number {
  let weightedSum = 0;
  let totalAbsWeight = 0;

  for (const w of rule.weights) {
    let traitScore: number | undefined;

    if (w.domain === 'ocean') {
      traitScore = vector.ocean[w.key as FactorKey];
    } else if (w.domain === 'attachment_anxiety') {
      traitScore = vector.attachmentAnxiety;
    } else if (w.domain === 'attachment_avoidance') {
      traitScore = vector.attachmentAvoidance;
    } else if (w.domain === 'schema') {
      traitScore = vector.schemas[w.key as SchemaKey];
    }

    if (traitScore === undefined) continue;

    const deviation = traitScore - 50;
    weightedSum += w.weight * deviation;
    totalAbsWeight += Math.abs(w.weight);
  }

  if (totalAbsWeight === 0) return 50;
  return Math.max(0, Math.min(100, 50 + weightedSum / totalAbsWeight));
}

// ── Trait vector builder ─────────────────────────────────────────────────────

export function buildTraitVector(): TraitVector {
  const oceanHistory    = loadHistory();
  const attachmentHistory = loadAttachmentHistory();
  const schemaHistory   = loadSchemaHistory();

  const ocean: Partial<Record<FactorKey, number>> = {};
  const schemas: Partial<Record<SchemaKey, number>> = {};
  const completedTests = new Set<'ocean' | 'attachment' | 'schema'>();
  let attachmentAnxiety = 50;
  let attachmentAvoidance = 50;

  if (oceanHistory.length > 0) {
    Object.assign(ocean, oceanHistory[0].scores);
    completedTests.add('ocean');
  }

  if (attachmentHistory.length > 0) {
    attachmentAnxiety  = attachmentHistory[0].anxietyPct;
    attachmentAvoidance = attachmentHistory[0].avoidancePct;
    completedTests.add('attachment');
  }

  if (schemaHistory.length > 0) {
    for (const [key, pct] of Object.entries(schemaHistory[0].percentages) as [SchemaKey, number][]) {
      schemas[key] = pct;
    }
    completedTests.add('schema');
  }

  return { ocean, attachmentAnxiety, attachmentAvoidance, schemas, completedTests };
}

// ── Pattern matching ─────────────────────────────────────────────────────────

export function matchPatterns(
  dimensions: PersonaDimension[],
  vector: TraitVector,
): SynthesisPattern[] {
  const matched: SynthesisPattern[] = [];
  for (const pattern of SYNTHESIS_PATTERNS) {
    const hasRequiredTests = pattern.requiredTests.every((t) => vector.completedTests.has(t));
    if (!hasRequiredTests) continue;

    const dim = dimensions.find((d) => d.id === pattern.primaryDomain);
    if (!dim) continue;

    if (pattern.trigger === 'low'  && dim.score <= pattern.threshold) matched.push(pattern);
    if (pattern.trigger === 'high' && dim.score >= pattern.threshold) matched.push(pattern);
  }
  return matched;
}

// ── Narrative generation ─────────────────────────────────────────────────────

const DIM_DESC: Record<string, [string, string, string]> = {
  // [high ≥65, medium 40–64, low <40]
  emotional_regulation: [
    'قدرة متميزة على تنظيم الانفعالات والتعافي من الضغوط العاطفية',
    'تنظيم انفعالي متوسط — يتأثر بالضغط لكن يستعيد التوازن تدريجياً',
    'ضغط انفعالي مرتفع مع صعوبة في احتواء ردود الفعل العاطفية المكثفة',
  ],
  interpersonal_trust: [
    'ثقة علائقية صحية تتيح بناء روابط عميقة وحقيقية',
    'ثقة انتقائية وحذرة — القدرة موجودة لكن اليقظة الدفاعية حاضرة',
    'صعوبة في الثقة بالآخرين — يقظة علائقية مكثفة ومُستنزِفة',
  ],
  relational_closeness: [
    'رغبة قوية في القرب العلائقي والتواصل الإنساني العميق',
    'توازن بين الحاجة للقرب والحاجة للمساحة الشخصية',
    'ميل نحو الاستقلالية والمسافة العلائقية — الوحدة الاختيارية مريحة',
  ],
  self_worth: [
    'إحساس متين بالقيمة الذاتية — لا يتزعزع كثيراً بالنقد الخارجي',
    'تقدير ذات متوسط — يتأثر بالسياق والتقييمات الخارجية',
    'شك عميق في القيمة الذاتية — غالباً مرتبط بمخططات طفولية مبكرة',
  ],
  autonomy_achievement: [
    'توجه قوي نحو الإنجاز المستقل والتحكم الذاتي في المسار الحياتي',
    'استقلالية معقولة مع بعض الاعتمادية الانتقائية في مجالات محددة',
    'صعوبات في الاستقلالية — قد تعكس نمط الخضوع أو الخوف من الفشل',
  ],
};

function getDimDescription(id: string, score: number): string {
  const desc = DIM_DESC[id];
  if (!desc) return '';
  if (score >= 65) return desc[0];
  if (score >= 40) return desc[1];
  return desc[2];
}

function getConfidence(completedTests: Set<string>): ConfidenceLevel {
  const n = completedTests.size;
  if (n >= 3) return 'high';
  if (n === 2) return 'moderate';
  return 'low';
}

function buildNarrative(dims: PersonaDimension[], patterns: SynthesisPattern[], completed: Set<string>): string {
  if (completed.size === 0) {
    return 'لم يتم إكمال أي اختبار حتى الآن. أكمل الاختبارات الثلاثة للحصول على توليف نفسي شامل ودقيق.';
  }

  let text = '';

  if (completed.size < 3) {
    text += `ملاحظة: التحليل مبني على ${completed.size} من 3 اختبارات — إكمال الاختبارات الثلاثة يرفع دقة التوليف. `;
  }

  const emotional  = dims.find(d => d.id === 'emotional_regulation');
  const trust      = dims.find(d => d.id === 'interpersonal_trust');
  const selfWorth  = dims.find(d => d.id === 'self_worth');
  const autonomy   = dims.find(d => d.id === 'autonomy_achievement');

  text += 'التوليف النفسي يكشف عن صورة متعددة الأبعاد: ';

  if (emotional) {
    text += getDimDescription('emotional_regulation', emotional.score) + '؛ ';
  }
  if (trust) {
    text += getDimDescription('interpersonal_trust', trust.score) + '؛ ';
  }
  if (selfWorth) {
    text += getDimDescription('self_worth', selfWorth.score) + '؛ ';
  }
  if (autonomy) {
    text += getDimDescription('autonomy_achievement', autonomy.score) + '. ';
  }

  if (patterns.length > 0) {
    const labels = patterns.map(p => p.label).join('، ');
    text += `الأنماط الجوهرية الناشئة من التقاطع بين الاختبارات: ${labels}. `;
    text += patterns[0].description;
  }

  return text;
}

function buildKeyInsights(dims: PersonaDimension[], patterns: SynthesisPattern[]): string[] {
  const insights: string[] = [];

  for (const dim of dims) {
    if (dim.score < 35) {
      insights.push(`${dim.title}: منطقة تحتاج اهتماماً واعياً (${Math.round(dim.score)}%)`);
    } else if (dim.score > 70) {
      insights.push(`${dim.title}: مورد نفسي قوي (${Math.round(dim.score)}%)`);
    }
  }

  for (const p of patterns.slice(0, 2)) {
    if (!insights.some(i => i.includes(p.label))) {
      insights.push(`النمط المُكتشَف: ${p.label}`);
    }
  }

  return insights.slice(0, 5);
}

// ── Main synthesis entry point ───────────────────────────────────────────────

export function runSynthesis(): SynthesisResult {
  const vector = buildTraitVector();
  const completedTestsArray = Array.from(vector.completedTests) as ('ocean' | 'attachment' | 'schema')[];

  const dimensions: PersonaDimension[] = DIMENSION_RULES.map((rule) => {
    const score = computeDimensionScore(rule, vector);
    return {
      id: rule.dimensionId,
      title: rule.title,
      score,
      level: getLevel(score),
      description: getDimDescription(rule.dimensionId, score),
      patterns: [],
    };
  });

  const matchedPatterns = matchPatterns(dimensions, vector);

  for (const pattern of matchedPatterns) {
    const dim = dimensions.find((d) => d.id === pattern.primaryDomain);
    if (dim) dim.patterns.push(pattern);
  }

  return {
    timestamp: Date.now(),
    completedTests: completedTestsArray,
    confidence: getConfidence(vector.completedTests),
    dimensions,
    primaryNarrative: buildNarrative(dimensions, matchedPatterns, vector.completedTests),
    keyInsights: buildKeyInsights(dimensions, matchedPatterns),
  };
}

// ── Persistence (localStorage) ───────────────────────────────────────────────

export function saveSynthesisResult(result: SynthesisResult): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(result)); } catch {}
}

export function loadSynthesisResult(): SynthesisResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SynthesisResult) : null;
  } catch { return null; }
}
