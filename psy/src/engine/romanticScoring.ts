import type {
  RomanticAxis,
  RomanticArchetype,
  RomanticAxisScores,
  RomanticIntensity,
  RomanticQuestion,
  RomanticResult,
} from './romanticTypes';

const LIKERT_MIN = 1;
const LIKERT_MAX = 7;
const STORAGE_KEY = 'nafees_romantic_result';

// ─── Score adjustment ────────────────────────────────────────────────────────

function adjustScore(raw: number, direction: 'direct' | 'reverse'): number {
  if (direction === 'reverse') {
    return (LIKERT_MAX + LIKERT_MIN) - raw;
  }
  return raw;
}

function toPct(adjusted: number): number {
  return ((adjusted - LIKERT_MIN) / (LIKERT_MAX - LIKERT_MIN)) * 100;
}

// ─── Axis computation ────────────────────────────────────────────────────────

function computeAxisScores(
  questions: RomanticQuestion[],
  answers: Record<string, number>,
): RomanticAxisScores {
  const axes: RomanticAxis[] = ['WA', 'QT', 'AS', 'PT', 'PA', 'SE'];
  const totals: Record<string, number> = { WA: 0, QT: 0, AS: 0, PT: 0, PA: 0, SE: 0 };
  const counts: Record<string, number> = { WA: 0, QT: 0, AS: 0, PT: 0, PA: 0, SE: 0 };

  for (const q of questions) {
    const raw = answers[q.id];
    if (raw === undefined || raw === null) continue;
    const adjusted = adjustScore(raw, q.direction);
    const pct = toPct(adjusted);
    totals[q.axis] += pct;
    counts[q.axis] += 1;
  }

  const result = {} as RomanticAxisScores;
  for (const axis of axes) {
    result[axis] = counts[axis] > 0 ? totals[axis] / counts[axis] : 0;
  }
  return result;
}

// ─── Dominant & secondary axes ───────────────────────────────────────────────

function rankAxes(axisPcts: RomanticAxisScores): RomanticAxis[] {
  const axes: RomanticAxis[] = ['WA', 'QT', 'AS', 'PT', 'PA', 'SE'];
  return [...axes].sort((a, b) => axisPcts[b] - axisPcts[a]);
}

// ─── Archetype determination ─────────────────────────────────────────────────

function determineArchetype(axisPcts: RomanticAxisScores): RomanticArchetype {
  const { WA, QT, AS, PT, PA, SE } = axisPcts;

  if (PA >= 68 && PT >= 60) {
    return 'passionate_explorer';
  }
  if (WA >= 68 && QT >= 60) {
    return 'classic_lover';
  }
  if (SE >= 68 && AS >= 58) {
    return 'safe_haven';
  }
  if (QT >= 68 && SE >= 62 && WA >= 60) {
    return 'emotional_dreamer';
  }
  if (AS >= 65 && PT >= 58 && WA < 58) {
    return 'silent_knight';
  }
  if (AS >= 65) {
    return 'practical_romantic';
  }

  // Fallback: dominant axis mapping
  const ranked = rankAxes(axisPcts);
  const dominant = ranked[0];
  const dominantMap: Record<RomanticAxis, RomanticArchetype> = {
    WA: 'classic_lover',
    QT: 'emotional_dreamer',
    AS: 'practical_romantic',
    PT: 'passionate_explorer',
    PA: 'passionate_explorer',
    SE: 'safe_haven',
  };
  return dominantMap[dominant];
}

// ─── Intensity determination ─────────────────────────────────────────────────

function determineIntensity(dominantScore: number): RomanticIntensity {
  if (dominantScore >= 72) return 'strong';
  if (dominantScore >= 58) return 'moderate';
  return 'mild';
}

// ─── Tier detection ──────────────────────────────────────────────────────────

function detectTier(questions: RomanticQuestion[]): 'core' | 'deep' {
  const hasDeep = questions.some((q) => q.tier !== 'core');
  return hasDeep ? 'deep' : 'core';
}

// ─── Main scoring function ───────────────────────────────────────────────────

export function scoreRomantic(
  questions: RomanticQuestion[],
  answers: Record<string, number>,
): RomanticResult {
  const axisPcts = computeAxisScores(questions, answers);
  const ranked = rankAxes(axisPcts);
  const dominantAxis = ranked[0];
  const secondaryAxis = ranked[1];
  const archetype = determineArchetype(axisPcts);
  const intensity = determineIntensity(axisPcts[dominantAxis]);
  const tier = detectTier(questions);
  const questionCount = questions.filter((q) => answers[q.id] !== undefined).length;

  return {
    timestamp: Date.now(),
    answers,
    axisPcts,
    dominantAxis,
    secondaryAxis,
    archetype,
    intensity,
    tier,
    questionCount,
  };
}

// ─── Persistence ─────────────────────────────────────────────────────────────

export function saveRomanticResult(result: RomanticResult): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // localStorage may be unavailable in some environments; fail silently
  }
}

export function loadRomanticResult(): RomanticResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RomanticResult;
  } catch {
    return null;
  }
}
