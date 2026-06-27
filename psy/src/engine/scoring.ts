import type { Question, FactorKey, Level, TestResult, ScoringConfig, TestContent, ProfileTitle } from './types';

/**
 * Weighted Big Five scoring with Z-score → logistic transform.
 *
 * Per item:
 *   adjusted = answer  (direct)  |  (likertMax+1) − answer  (reverse)
 *   contribution = adjusted × weight
 *
 * Per factor:
 *   μ  = totalWeight × midpoint              (midpoint = (likertMin+likertMax)/2)
 *   σ  = totalWeight × (likertMax−likertMin) / 6   (six-sigma approximation)
 *   z  = (weightedSum − μ) / σ               → [-3, +3] for extreme responses
 *   pct = 100 / (1 + exp(−z))               (standard logistic, no extra steepness)
 *
 * Scores remain floating-point throughout; rounding only happens in the UI.
 *
 * Five-level thresholds (configurable, defaults in %):
 *   very_low  : [  0, 15)
 *   low       : [ 15, 40)
 *   medium    : [ 40, 60)
 *   high      : [ 60, 85)
 *   very_high : [ 85,100]
 */

export function calculateScores(
  answers: Record<string, number>,
  questions: Question[],
  config: ScoringConfig
): Partial<Record<FactorKey, number>> {
  const factorData: Partial<Record<FactorKey, { weightedSum: number; totalWeight: number }>> = {};

  for (const q of questions) {
    if (!q.factor || answers[q.id] === undefined) continue;

    const weight = q.weight ?? 1.0;
    let adjusted = answers[q.id];

    if (q.direction === 'reverse') {
      adjusted = (config.likertMax + 1) - adjusted;
    }

    if (!factorData[q.factor]) {
      factorData[q.factor] = { weightedSum: 0, totalWeight: 0 };
    }
    factorData[q.factor]!.weightedSum += adjusted * weight;
    factorData[q.factor]!.totalWeight += weight;
  }

  const midpoint = (config.likertMin + config.likertMax) / 2;
  const range = config.likertMax - config.likertMin;

  const scores: Partial<Record<FactorKey, number>> = {};
  for (const [factor, data] of Object.entries(factorData) as [FactorKey, { weightedSum: number; totalWeight: number }][]) {
    if (data && data.totalWeight > 0) {
      const mu = data.totalWeight * midpoint;
      const sigma = data.totalWeight * range / 6;
      const z = (data.weightedSum - mu) / sigma;
      // Standard logistic → (0, 100), full floating-point precision
      scores[factor] = 100 / (1 + Math.exp(-z));
    }
  }

  return scores;
}

export function getLevel(
  percentage: number,
  veryLow = 15,
  low = 40,
  high = 60,
  veryHigh = 85
): Level {
  if (percentage >= veryHigh) return 'very_high';
  if (percentage >= high) return 'high';
  if (percentage >= low) return 'medium';
  if (percentage >= veryLow) return 'low';
  return 'very_low';
}

export function getLevels(
  scores: Partial<Record<FactorKey, number>>,
  config: ScoringConfig
): Partial<Record<FactorKey, Level>> {
  const levels: Partial<Record<FactorKey, Level>> = {};
  for (const [factor, score] of Object.entries(scores) as [FactorKey, number][]) {
    const fc = config.factors[factor];
    const vl = fc?.veryLowThreshold ?? 15;
    const l  = fc?.lowThreshold    ?? 40;
    const h  = fc?.highThreshold   ?? 60;
    const vh = fc?.veryHighThreshold ?? 85;
    levels[factor] = getLevel(score, vl, l, h, vh);
  }
  return levels;
}

export function selectProfileTitle(
  levels: Partial<Record<FactorKey, Level>>,
  profileTitles: ProfileTitle[]
): ProfileTitle {
  let bestMatch = profileTitles[0];
  let bestScore = -1;

  for (const profile of profileTitles) {
    let matchScore = 0;
    for (const [factor, allowedLevels] of Object.entries(profile.requiredLevels) as [FactorKey, Level[]][]) {
      if (levels[factor] && allowedLevels.includes(levels[factor]!)) {
        matchScore++;
      }
    }
    if (matchScore > bestScore) {
      bestScore = matchScore;
      bestMatch = profile;
    }
  }

  return bestMatch;
}

export function buildTestResult(
  answers: Record<string, number>,
  questions: Question[],
  config: ScoringConfig
): Omit<TestResult, 'testId'> {
  const scores = calculateScores(answers, questions, config);
  const levels = getLevels(scores, config);
  return {
    timestamp: Date.now(),
    answers,
    scores,
    levels,
  };
}

export function saveResult(result: TestResult): void {
  const history = loadHistory();
  history.unshift(result);
  localStorage.setItem('psy_results', JSON.stringify(history.slice(0, 5)));
}

export function loadHistory(): TestResult[] {
  try {
    const raw = localStorage.getItem('psy_results');
    return raw ? (JSON.parse(raw) as TestResult[]) : [];
  } catch {
    return [];
  }
}
