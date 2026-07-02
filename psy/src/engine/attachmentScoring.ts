// ECR-R Scoring — Fraley, Waller, & Brennan (2000)
// Two independent axes: Attachment Anxiety + Attachment Avoidance
// Each axis scored as mean of 18 items on 7-point Likert scale
// Reverse-keyed items: (likertMax + 1) - raw_value
// Pattern classification threshold: 3.5 (midpoint of 1–7 scale)

import type { AttachmentQuestion, AttachmentPattern, AttachmentResult } from './attachmentTypes';

export function calculateAttachmentScores(
  answers: Record<string, number>,
  questions: AttachmentQuestion[],
  likertMin: number,
  likertMax: number,
  tier: 'core' | 'deep' = 'deep',
): AttachmentResult {
  let anxietySum = 0, anxietyCount = 0;
  let avoidanceSum = 0, avoidanceCount = 0;

  for (const q of questions) {
    if (answers[q.id] === undefined) continue;
    let value = answers[q.id];
    if (q.direction === 'reverse') {
      value = (likertMax + 1) - value;
    }
    if (q.axis === 'anxiety') {
      anxietySum += value;
      anxietyCount++;
    } else {
      avoidanceSum += value;
      avoidanceCount++;
    }
  }

  const anxietyScore  = anxietyCount  > 0 ? anxietySum  / anxietyCount  : (likertMin + likertMax) / 2;
  const avoidanceScore = avoidanceCount > 0 ? avoidanceSum / avoidanceCount : (likertMin + likertMax) / 2;

  // Convert to 0–100 for display
  const range = likertMax - likertMin;
  const anxietyPct   = range > 0 ? ((anxietyScore  - likertMin) / range) * 100 : 50;
  const avoidancePct = range > 0 ? ((avoidanceScore - likertMin) / range) * 100 : 50;

  const pattern = determinePattern(anxietyScore, avoidanceScore);

  return { anxietyScore, avoidanceScore, anxietyPct, avoidancePct, pattern, answers, tier, questionCount: questions.length };
}

export function determinePattern(
  anxietyScore: number,
  avoidanceScore: number
): AttachmentPattern {
  const threshold = 3.5; // midpoint of 1–7
  const highAnxiety   = anxietyScore   >= threshold;
  const highAvoidance = avoidanceScore >= threshold;

  if (!highAnxiety && !highAvoidance) return 'secure';
  if ( highAnxiety && !highAvoidance) return 'anxious';
  if (!highAnxiety &&  highAvoidance) return 'dismissing';
  return 'fearful';
}

export function saveAttachmentResult(result: AttachmentResult): void {
  try {
    const history = loadAttachmentHistory();
    history.unshift(result);
    localStorage.setItem('attachment_results', JSON.stringify(history.slice(0, 5)));
  } catch {}
}

export function loadAttachmentHistory(): AttachmentResult[] {
  try {
    const raw = localStorage.getItem('attachment_results');
    return raw ? (JSON.parse(raw) as AttachmentResult[]) : [];
  } catch {
    return [];
  }
}
