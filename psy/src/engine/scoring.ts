import type { Question, FactorKey, FacetKey, Level, TestResult, ScoringConfig, ProfileTitle, OceanTier } from './types';

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

// NEO PI-R facet-to-factor mapping (Costa & McCrae, 1992)
const FACET_TO_FACTOR: Record<FacetKey, FactorKey> = {
  N1: 'N', N2: 'N', N3: 'N', N4: 'N', N5: 'N', N6: 'N',
  E1: 'E', E2: 'E', E3: 'E', E4: 'E', E5: 'E', E6: 'E',
  O1: 'O', O2: 'O', O3: 'O', O4: 'O', O5: 'O', O6: 'O',
  A1: 'A', A2: 'A', A3: 'A', A4: 'A', A5: 'A', A6: 'A',
  C1: 'C', C2: 'C', C3: 'C', C4: 'C', C5: 'C', C6: 'C',
};

// Facet cluster pairs for sub-type determination (AB5C approach)
// Hofstee, de Raad, & Goldberg (1992) — circumplex facet structure
const FACTOR_CLUSTERS: Record<FactorKey, [FacetKey, FacetKey][]> = {
  N: [['N1', 'N3'], ['N2', 'N5'], ['N4', 'N6']],
  E: [['E1', 'E2'], ['E3', 'E4'], ['E5', 'E6']],
  O: [['O1', 'O2'], ['O3', 'O5'], ['O4', 'O6']],
  A: [['A1', 'A3'], ['A2', 'A4'], ['A5', 'A6']],
  C: [['C1', 'C4'], ['C2', 'C3'], ['C5', 'C6']],
};

/**
 * Calculate per-facet scores using the same Z-score logistic transform as factor scores.
 * Each facet is scored independently from its 4 items.
 */
export function calculateFacetScores(
  answers: Record<string, number>,
  questions: Question[],
  config: ScoringConfig
): Partial<Record<FacetKey, number>> {
  const facetData: Partial<Record<FacetKey, { weightedSum: number; totalWeight: number }>> = {};

  for (const q of questions) {
    if (!q.facet || answers[q.id] === undefined) continue;

    const weight = q.weight ?? 1.0;
    let adjusted = answers[q.id];

    if (q.direction === 'reverse') {
      adjusted = (config.likertMax + 1) - adjusted;
    }

    if (!facetData[q.facet]) {
      facetData[q.facet] = { weightedSum: 0, totalWeight: 0 };
    }
    facetData[q.facet]!.weightedSum += adjusted * weight;
    facetData[q.facet]!.totalWeight += weight;
  }

  const midpoint = (config.likertMin + config.likertMax) / 2;
  const range = config.likertMax - config.likertMin;

  const facetScores: Partial<Record<FacetKey, number>> = {};
  for (const [facet, data] of Object.entries(facetData) as [FacetKey, { weightedSum: number; totalWeight: number }][]) {
    if (data && data.totalWeight > 0) {
      const mu = data.totalWeight * midpoint;
      const sigma = data.totalWeight * range / 6;
      const z = (data.weightedSum - mu) / sigma;
      facetScores[facet] = 100 / (1 + Math.exp(-z));
    }
  }

  return facetScores;
}

/**
 * Aggregate factor scores from facet scores.
 * Each factor score = average of its 6 facet scores.
 * Ref: Costa & McCrae (1992) — NEO PI-R manual
 */
export function aggregateFactorScoresFromFacets(
  facetScores: Partial<Record<FacetKey, number>>
): Partial<Record<FactorKey, number>> {
  const factorSums: Partial<Record<FactorKey, { sum: number; count: number }>> = {};

  for (const [facet, score] of Object.entries(facetScores) as [FacetKey, number][]) {
    const factor = FACET_TO_FACTOR[facet];
    if (!factorSums[factor]) {
      factorSums[factor] = { sum: 0, count: 0 };
    }
    factorSums[factor]!.sum += score;
    factorSums[factor]!.count += 1;
  }

  const factorScores: Partial<Record<FactorKey, number>> = {};
  for (const [factor, data] of Object.entries(factorSums) as [FactorKey, { sum: number; count: number }][]) {
    if (data && data.count > 0) {
      factorScores[factor] = data.sum / data.count;
    }
  }

  return factorScores;
}

/**
 * Determine the base profile code from factor scores.
 * Priority order based on: Judge et al. (2002), Barrick & Mount (1991),
 * Asendorpf et al. (2001), McCrae (1996)
 */
export function determineProfileCode(
  factorScores: Partial<Record<FactorKey, number>>
): string {
  const N = factorScores['N'] ?? 50;
  const E = factorScores['E'] ?? 50;
  const O = factorScores['O'] ?? 50;
  const A = factorScores['A'] ?? 50;
  const C = factorScores['C'] ?? 50;

  // Priority order
  if (N > 60 && O > 60) return 'N+O';
  if (A > 60 && E > 60) return 'A+E';
  if (E > 60 && C > 60) return 'E+C';
  if (O > 60 && C > 60) return 'O+C';
  if (O > 60 && E < 50) return 'O-lowE';
  if (C > 60 && N < 40) return 'C-lowN';
  if (C > 60 && A < 50) return 'C-lowA';
  return 'balanced';
}

/**
 * Determine sub-type suffix (a/b/c) based on which facet cluster pair scores highest.
 * Uses the AB5C circumplex approach (Hofstee et al., 1992).
 */
export function determineSubTypeSuffix(
  facetScores: Partial<Record<FacetKey, number>>,
  profileCode: string
): 'a' | 'b' | 'c' {
  // Map profile code to the primary factor whose clusters we use
  let primaryFactor: FactorKey;

  if (profileCode === 'N+O') {
    primaryFactor = 'N';
  } else if (profileCode === 'A+E') {
    primaryFactor = 'A';
  } else if (profileCode === 'E+C') {
    primaryFactor = 'E';
  } else if (profileCode === 'O+C' || profileCode === 'O-lowE') {
    primaryFactor = 'O';
  } else {
    // C-lowN, C-lowA, balanced all use E clusters (balanced) or C clusters (others)
    primaryFactor = profileCode === 'balanced' ? 'E' : 'C';
  }

  const clusters = FACTOR_CLUSTERS[primaryFactor];
  const suffixes: ('a' | 'b' | 'c')[] = ['a', 'b', 'c'];

  let bestSuffix: 'a' | 'b' | 'c' = 'a';
  let bestAvg = -1;

  for (let i = 0; i < clusters.length; i++) {
    const [f1, f2] = clusters[i];
    const s1 = facetScores[f1] ?? 50;
    const s2 = facetScores[f2] ?? 50;
    const avg = (s1 + s2) / 2;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestSuffix = suffixes[i];
    }
  }

  return bestSuffix;
}

/**
 * Build the full test result including facet scores and sub-type code.
 *
 * For core tier (50 items): factor scores are computed directly from item responses
 * (more statistically appropriate with ~10 items/factor than aggregating unreliable
 * 1-2-item facet scores). Sub-type classification is suppressed — it requires all
 * 6 facets with 4 items each to be reliable (anti-hallucination guard).
 *
 * For deep tier (120 items): full facet-based pipeline with 30-facet sub-typing.
 */
export function buildTestResult(
  answers: Record<string, number>,
  questions: Question[],
  config: ScoringConfig,
  tier?: OceanTier
): Omit<TestResult, 'testId'> {
  let scores: Partial<Record<FactorKey, number>>;
  let facetScores: Partial<Record<FacetKey, number>>;
  let subTypeCode: string;

  if (tier === 'core') {
    scores = calculateScores(answers, questions, config);
    facetScores = calculateFacetScores(answers, questions, config);
    subTypeCode = '';
  } else {
    facetScores = calculateFacetScores(answers, questions, config);
    scores = aggregateFactorScoresFromFacets(facetScores);
    const profileCode = determineProfileCode(scores);
    const suffix = determineSubTypeSuffix(facetScores, profileCode);
    subTypeCode = `${profileCode}-${suffix}`;
  }

  const levels = getLevels(scores, config);

  return {
    timestamp: Date.now(),
    answers,
    scores,
    levels,
    facetScores,
    subTypeCode,
    ...(tier ? { tier } : {}),
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
