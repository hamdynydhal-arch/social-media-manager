import type { SocialAxis, SocialPatternsQuestion, SocialPatternsResult, SocialPattern, PatternIntensity } from './socialPatternsTypes';

const STORAGE_KEY = 'nafees_social_patterns_result';

/**
 * Compute axis scores and classify social pattern.
 *
 * Axis scores (0–100 each):
 *   D   — Dominance
 *   Au  — Autonomy / Independence
 *   SA  — Social Accommodation
 *   AS  — Attention Seeking
 *
 * Pattern scores (weighted composites):
 *   alpha = D·0.55 + AS·0.45
 *   sigma = Au·0.65 + (100−SA)·0.20 + (100−AS)·0.15
 *   beta  = SA·0.65 + (100−D)·0.25 + (100−Au)·0.10
 *   delta = AS·0.50 + SA·0.30 + (100−D)·0.20
 *
 * Winning pattern = highest composite score.
 * Intensity:  strong ≥70 / moderate ≥55 / mild <55
 */
export function calculateSocialPatternsScores(
  answers: Record<string, number>,
  questions: SocialPatternsQuestion[],
  likertMin: number,
  likertMax: number,
  tier: 'core' | 'deep' = 'deep',
): SocialPatternsResult {
  const axisData: Record<SocialAxis, { sum: number; count: number }> = {
    D:  { sum: 0, count: 0 },
    Au: { sum: 0, count: 0 },
    SA: { sum: 0, count: 0 },
    AS: { sum: 0, count: 0 },
  };

  const range = likertMax - likertMin;

  for (const q of questions) {
    const raw = answers[q.id];
    if (raw === undefined) continue;
    const adjusted = q.direction === 'reverse' ? (likertMax + likertMin) - raw : raw;
    const pct = ((adjusted - likertMin) / range) * 100;
    axisData[q.axis].sum += pct;
    axisData[q.axis].count += 1;
  }

  const D  = axisData.D.count  > 0 ? axisData.D.sum  / axisData.D.count  : 50;
  const Au = axisData.Au.count > 0 ? axisData.Au.sum / axisData.Au.count : 50;
  const SA = axisData.SA.count > 0 ? axisData.SA.sum / axisData.SA.count : 50;
  const AS = axisData.AS.count > 0 ? axisData.AS.sum / axisData.AS.count : 50;

  const alphaScore = D  * 0.55 + AS * 0.45;
  const sigmaScore = Au * 0.65 + (100 - SA) * 0.20 + (100 - AS) * 0.15;
  const betaScore  = SA * 0.65 + (100 - D)  * 0.25 + (100 - Au) * 0.10;
  const deltaScore = AS * 0.50 + SA * 0.30  + (100 - D) * 0.20;

  const patternScores = { alpha: alphaScore, sigma: sigmaScore, beta: betaScore, delta: deltaScore };
  const pattern = (Object.entries(patternScores).reduce(
    (best, curr) => curr[1] > best[1] ? curr : best
  )[0]) as SocialPattern;

  const winningScore = patternScores[pattern];
  const intensity: PatternIntensity = winningScore >= 70 ? 'strong' : winningScore >= 55 ? 'moderate' : 'mild';

  return {
    timestamp: Date.now(),
    answers,
    dominancePct: D,
    autonomyPct: Au,
    accommodationPct: SA,
    attentionPct: AS,
    patternScores,
    pattern,
    intensity,
    tier,
    questionCount: questions.length,
  };
}

export function saveSocialPatternsResult(result: SocialPatternsResult): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(result)); } catch {}
}

export function loadSocialPatternsResult(): SocialPatternsResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SocialPatternsResult) : null;
  } catch { return null; }
}
