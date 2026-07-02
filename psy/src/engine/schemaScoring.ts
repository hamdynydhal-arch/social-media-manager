import type { SchemaQuestion, SchemaResult, SchemaKey, SchemaMode } from './schemaTypes';

const SCHEMA_KEYS: SchemaKey[] = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];
const THRESHOLD = 3.5;
const STORAGE_KEY = 'schema_results';

export function calculateSchemaScores(
  answers: Record<string, number>,
  questions: SchemaQuestion[],
  likertMin: number,
  likertMax: number,
  tier: 'core' | 'deep' = 'deep',
): SchemaResult {
  const sums: Partial<Record<SchemaKey, number>> = {};
  const totalWeights: Partial<Record<SchemaKey, number>> = {};

  for (const q of questions) {
    const answer = answers[q.id];
    if (answer == null) continue;
    for (const [key, weight] of Object.entries(q.weights) as [SchemaKey, number][]) {
      sums[key] = (sums[key] ?? 0) + answer * weight;
      totalWeights[key] = (totalWeights[key] ?? 0) + weight;
    }
  }

  const scores = {} as Record<SchemaKey, number>;
  const percentages = {} as Record<SchemaKey, number>;
  const range = likertMax - likertMin;

  for (const key of SCHEMA_KEYS) {
    const mean = totalWeights[key] ? (sums[key] ?? 0) / totalWeights[key] : likertMin;
    scores[key] = mean;
    percentages[key] = ((mean - likertMin) / range) * 100;
  }

  const activeSchemas = SCHEMA_KEYS
    .filter((k) => scores[k] >= THRESHOLD)
    .sort((a, b) => scores[b] - scores[a]);

  const primarySchema =
    activeSchemas[0] ??
    [...SCHEMA_KEYS].sort((a, b) => scores[b] - scores[a])[0];

  const mode = determineMode(activeSchemas, scores);

  return {
    testId: 'schema',
    completedAt: new Date().toISOString(),
    scores,
    percentages,
    activeSchemas,
    primarySchema,
    mode,
    tier,
    questionCount: questions.length,
  };
}

function determineMode(
  activeSchemas: SchemaKey[],
  scores: Record<SchemaKey, number>,
): SchemaMode {
  if (activeSchemas.length === 0) return 'healthy';

  // S2 dominant → abused mode
  if (activeSchemas[0] === 'S2' || scores['S2'] >= 4.0) return 'abused';

  const top2 = new Set(activeSchemas.slice(0, 2));

  // S6 prominent → subjugated
  if (top2.has('S6') && activeSchemas[0] === 'S6') return 'subjugated';

  // S7 + S4 → inner critic mode
  if (top2.has('S7') && top2.has('S4')) return 'critic';
  if (activeSchemas[0] === 'S7' && scores['S7'] >= 4.0) return 'critic';

  // S4 + S5 → rejected child
  if (top2.has('S4') && top2.has('S5')) return 'rejected';

  // S1 + S3 → vulnerable child
  if (top2.has('S1') && top2.has('S3')) return 'vulnerable';

  // Single dominant schema fallback
  const primary = activeSchemas[0];
  if (primary === 'S4' || primary === 'S5') return 'rejected';
  if (primary === 'S6') return 'subjugated';
  if (primary === 'S7') return 'critic';
  return 'vulnerable';
}

export function saveSchemaResult(result: SchemaResult): void {
  try {
    const existing = loadSchemaHistory();
    existing.unshift(result);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 5)));
  } catch {
    // localStorage unavailable
  }
}

export function loadSchemaHistory(): SchemaResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SchemaResult[]) : [];
  } catch {
    return [];
  }
}
