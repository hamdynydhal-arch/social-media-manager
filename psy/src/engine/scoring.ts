import type { Question, FactorKey, Level, TestResult, ScoringConfig, TestContent, ProfileTitle } from './types';

/**
 * Calculate Big Five factor scores from user answers.
 *
 * Scoring rules:
 *  - Direct item:  score = answer (1–5)
 *  - Reverse item: score = (likertMax + 1) − answer   e.g. 6 − answer for a 1-5 scale
 *
 * Each factor has 10 items → raw sum range: 10–50
 * Percentage = ((sum − 10) / 40) × 100
 *
 * Thresholds (configurable per factor):
 *   low    : percentage < lowThreshold  (default 33)
 *   medium : percentage < highThreshold (default 67)
 *   high   : percentage ≥ highThreshold
 */
export function calculateScores(
  answers: Record<string, number>,
  questions: Question[],
  config: ScoringConfig
): Partial<Record<FactorKey, number>> {
  const factorData: Partial<Record<FactorKey, { sum: number; count: number }>> = {};

  for (const q of questions) {
    if (!q.factor || answers[q.id] === undefined) continue;

    let score = answers[q.id];

    if (q.direction === 'reverse') {
      score = (config.likertMax + 1) - score;
    }

    if (!factorData[q.factor]) {
      factorData[q.factor] = { sum: 0, count: 0 };
    }
    factorData[q.factor]!.sum += score;
    factorData[q.factor]!.count += 1;
  }

  const scores: Partial<Record<FactorKey, number>> = {};
  for (const [factor, data] of Object.entries(factorData) as [FactorKey, { sum: number; count: number }][]) {
    if (data) {
      const min = data.count * config.likertMin;
      const max = data.count * config.likertMax;
      scores[factor] = Math.round(((data.sum - min) / (max - min)) * 100);
    }
  }

  return scores;
}

export function getLevel(percentage: number, lowThreshold = 33, highThreshold = 67): Level {
  if (percentage >= highThreshold) return 'high';
  if (percentage >= lowThreshold) return 'medium';
  return 'low';
}

export function getLevels(
  scores: Partial<Record<FactorKey, number>>,
  config: ScoringConfig
): Partial<Record<FactorKey, Level>> {
  const levels: Partial<Record<FactorKey, Level>> = {};
  for (const [factor, score] of Object.entries(scores) as [FactorKey, number][]) {
    const factorConfig = config.factors[factor];
    const low = factorConfig?.lowThreshold ?? 33;
    const high = factorConfig?.highThreshold ?? 67;
    levels[factor] = getLevel(score, low, high);
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
