/**
 * Unit tests for the Psychological Synthesis Engine
 *
 * Tests verify:
 *  1. computeDimensionScore produces correct weighted-average-deviation math
 *  2. Neutral input (all traits at 50) → score = 50 for every dimension
 *  3. Extreme inputs saturate to 0 or 100 without overflow
 *  4. Directional correctness: high N lowers emotional_regulation; high C raises it
 *  5. Missing-data handling: absent tests are gracefully skipped
 *  6. matchPatterns fires/withholds correctly based on thresholds and required tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { computeDimensionScore, matchPatterns, runSynthesis, buildTraitVector } from './synthesisEngine';
import { DIMENSION_RULES } from './synthesisMatrix';
import type { TraitVector, PersonaDimension } from './synthesisTypes';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeVector(overrides: Partial<TraitVector> = {}): TraitVector {
  return {
    ocean:               { E: 50, A: 50, C: 50, N: 50, O: 50 },
    attachmentAnxiety:   50,
    attachmentAvoidance: 50,
    schemas:             { S1: 50, S2: 50, S3: 50, S4: 50, S5: 50, S6: 50, S7: 50 },
    romanticAxes:        { WA: 50, QT: 50, AS: 50, PT: 50, PA: 50, SE: 50 },
    completedTests:      new Set(['ocean', 'attachment', 'schema'] as const),
    ...overrides,
  };
}

function ruleFor(id: string) {
  const r = DIMENSION_RULES.find(r => r.dimensionId === id);
  if (!r) throw new Error(`No rule for dimension: ${id}`);
  return r;
}

function makeDimensions(scores: Record<string, number>): PersonaDimension[] {
  return DIMENSION_RULES.map(rule => ({
    id: rule.dimensionId,
    title: rule.title,
    score: scores[rule.dimensionId] ?? 50,
    level: 'medium' as const,
    description: '',
    patterns: [],
  }));
}

// ── 1. Neutral input → 50 for all dimensions ─────────────────────────────────

describe('Neutral trait vector', () => {
  const neutral = makeVector();

  for (const rule of DIMENSION_RULES) {
    it(`${rule.dimensionId}: all traits at 50 → score = 50`, () => {
      const score = computeDimensionScore(rule, neutral);
      expect(score).toBeCloseTo(50, 5);
    });
  }
});

// ── 2. Score bounds — must stay in [0, 100] ──────────────────────────────────

describe('Score bounds', () => {
  it('does not exceed 100 with maximally positive inputs', () => {
    // For emotional_regulation: high C=100, low N=0, low anxiety, low schemas
    const v = makeVector({
      ocean: { N: 0, E: 100, A: 100, C: 100, O: 100 },
      attachmentAnxiety: 0,
      attachmentAvoidance: 0,
      schemas: { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0, S7: 0 },
    });
    for (const rule of DIMENSION_RULES) {
      const score = computeDimensionScore(rule, v);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it('does not go below 0 with maximally negative inputs', () => {
    const v = makeVector({
      ocean: { N: 100, E: 0, A: 0, C: 0, O: 0 },
      attachmentAnxiety: 100,
      attachmentAvoidance: 100,
      schemas: { S1: 100, S2: 100, S3: 100, S4: 100, S5: 100, S6: 100, S7: 100 },
    });
    for (const rule of DIMENSION_RULES) {
      const score = computeDimensionScore(rule, v);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

// ── 3. Directional correctness ────────────────────────────────────────────────

describe('emotional_regulation directional correctness', () => {
  const rule = ruleFor('emotional_regulation');

  it('high N (100) lowers emotional_regulation below 50', () => {
    const v = makeVector({ ocean: { N: 100, E: 50, A: 50, C: 50, O: 50 } });
    expect(computeDimensionScore(rule, v)).toBeLessThan(50);
  });

  it('low N (0) raises emotional_regulation above 50', () => {
    const v = makeVector({ ocean: { N: 0, E: 50, A: 50, C: 50, O: 50 } });
    expect(computeDimensionScore(rule, v)).toBeGreaterThan(50);
  });

  it('high C (100) raises emotional_regulation above 50', () => {
    const v = makeVector({ ocean: { N: 50, E: 50, A: 50, C: 100, O: 50 } });
    expect(computeDimensionScore(rule, v)).toBeGreaterThan(50);
  });

  it('high anxiety (100) lowers emotional_regulation below 50', () => {
    const v = makeVector({ attachmentAnxiety: 100 });
    expect(computeDimensionScore(rule, v)).toBeLessThan(50);
  });

  it('low N + low S4 + high C produces higher score than high N + high S4 + low C', () => {
    const goodReg = makeVector({
      ocean: { N: 20, E: 50, A: 50, C: 80, O: 50 },
      schemas: { S1: 50, S2: 50, S3: 50, S4: 10, S5: 50, S6: 50, S7: 50 },
      attachmentAnxiety: 20,
    });
    const poorReg = makeVector({
      ocean: { N: 80, E: 50, A: 50, C: 20, O: 50 },
      schemas: { S1: 50, S2: 50, S3: 50, S4: 90, S5: 50, S6: 50, S7: 50 },
      attachmentAnxiety: 80,
    });
    expect(computeDimensionScore(rule, goodReg)).toBeGreaterThan(computeDimensionScore(rule, poorReg));
  });
});

describe('interpersonal_trust directional correctness', () => {
  const rule = ruleFor('interpersonal_trust');

  it('high A (100) raises trust above 50', () => {
    const v = makeVector({ ocean: { N: 50, E: 50, A: 100, C: 50, O: 50 } });
    expect(computeDimensionScore(rule, v)).toBeGreaterThan(50);
  });

  it('high avoidance (100) lowers trust below 50', () => {
    const v = makeVector({ attachmentAvoidance: 100 });
    expect(computeDimensionScore(rule, v)).toBeLessThan(50);
  });

  it('high S2 (Mistrust schema) lowers trust below 50', () => {
    const v = makeVector({
      schemas: { S1: 50, S2: 90, S3: 50, S4: 50, S5: 50, S6: 50, S7: 50 },
    });
    expect(computeDimensionScore(rule, v)).toBeLessThan(50);
  });
});

describe('self_worth directional correctness', () => {
  const rule = ruleFor('self_worth');

  it('high S4 (Defectiveness schema) lowers self_worth below 50', () => {
    const v = makeVector({
      schemas: { S1: 50, S2: 50, S3: 50, S4: 90, S5: 50, S6: 50, S7: 50 },
    });
    expect(computeDimensionScore(rule, v)).toBeLessThan(50);
  });

  it('low N + high C + low S4 raises self_worth above 50', () => {
    const v = makeVector({
      ocean: { N: 20, E: 50, A: 50, C: 80, O: 70 },
      schemas: { S1: 50, S2: 50, S3: 50, S4: 10, S5: 50, S6: 50, S7: 50 },
      attachmentAnxiety: 20,
    });
    expect(computeDimensionScore(rule, v)).toBeGreaterThan(50);
  });
});

describe('autonomy_achievement directional correctness', () => {
  const rule = ruleFor('autonomy_achievement');

  it('high C (100) raises autonomy_achievement above 50', () => {
    const v = makeVector({ ocean: { N: 50, E: 50, A: 50, C: 100, O: 50 } });
    expect(computeDimensionScore(rule, v)).toBeGreaterThan(50);
  });

  it('high S6 (Subjugation schema) lowers autonomy_achievement below 50', () => {
    const v = makeVector({
      schemas: { S1: 50, S2: 50, S3: 50, S4: 50, S5: 50, S6: 90, S7: 50 },
    });
    expect(computeDimensionScore(rule, v)).toBeLessThan(50);
  });
});

// ── 4. Missing-data handling ──────────────────────────────────────────────────

describe('Missing data handling', () => {
  it('returns 50 when no traits are available', () => {
    const empty: TraitVector = {
      ocean: {},
      attachmentAnxiety: 50,
      attachmentAvoidance: 50,
      schemas: {},
      romanticAxes: {},
      completedTests: new Set(),
    };
    // With all-neutral attachment values and empty ocean/schemas, all weights
    // either contribute 0 deviation or are skipped
    for (const rule of DIMENSION_RULES) {
      const score = computeDimensionScore(rule, empty);
      // Score should be 50 (only neutral attachment values remain)
      expect(score).toBeCloseTo(50, 2);
    }
  });

  it('ocean-only vector: works without attachment or schema data', () => {
    const v: TraitVector = {
      ocean: { N: 80, E: 50, A: 50, C: 50, O: 50 },
      attachmentAnxiety: 50,
      attachmentAvoidance: 50,
      schemas: {},
      romanticAxes: {},
      completedTests: new Set(['ocean'] as const),
    };
    const rule = ruleFor('emotional_regulation');
    const score = computeDimensionScore(rule, v);
    // High N → should lower emotional regulation
    expect(score).toBeLessThan(50);
  });
});

// ── 5. matchPatterns threshold logic ─────────────────────────────────────────

describe('matchPatterns', () => {
  it('fires anxious_vigilant when emotional_regulation ≤ 40 and required tests present', () => {
    const dims = makeDimensions({ emotional_regulation: 30 });
    const v = makeVector();
    const patterns = matchPatterns(dims, v);
    expect(patterns.some(p => p.id === 'anxious_vigilant')).toBe(true);
  });

  it('does NOT fire anxious_vigilant when emotional_regulation > 40', () => {
    const dims = makeDimensions({ emotional_regulation: 60 });
    const v = makeVector();
    const patterns = matchPatterns(dims, v);
    expect(patterns.some(p => p.id === 'anxious_vigilant')).toBe(false);
  });

  it('fires secure_adaptive when interpersonal_trust ≥ 65 and required tests present', () => {
    const dims = makeDimensions({ interpersonal_trust: 70 });
    const v = makeVector();
    const patterns = matchPatterns(dims, v);
    expect(patterns.some(p => p.id === 'secure_adaptive')).toBe(true);
  });

  it('does NOT fire schema_driven_vigilance when schema test not completed', () => {
    const dims = makeDimensions({ self_worth: 20 });
    const v = makeVector({ completedTests: new Set(['ocean', 'attachment'] as const) });
    const patterns = matchPatterns(dims, v);
    expect(patterns.some(p => p.id === 'schema_driven_vigilance')).toBe(false);
  });

  it('fires schema_driven_vigilance when all 3 tests present and self_worth ≤ 35', () => {
    const dims = makeDimensions({ self_worth: 30 });
    const v = makeVector();
    const patterns = matchPatterns(dims, v);
    expect(patterns.some(p => p.id === 'schema_driven_vigilance')).toBe(true);
  });

  it('fires high_achievement_fragile when autonomy_achievement ≥ 65 and ocean + schema present', () => {
    const dims = makeDimensions({ autonomy_achievement: 70 });
    const v = makeVector({ completedTests: new Set(['ocean', 'schema'] as const) });
    const patterns = matchPatterns(dims, v);
    expect(patterns.some(p => p.id === 'high_achievement_fragile')).toBe(true);
  });

  it('does NOT fire high_achievement_fragile when only ocean is present', () => {
    const dims = makeDimensions({ autonomy_achievement: 70 });
    const v = makeVector({ completedTests: new Set(['ocean'] as const) });
    const patterns = matchPatterns(dims, v);
    expect(patterns.some(p => p.id === 'high_achievement_fragile')).toBe(false);
  });
});

// ── 6. Weighted sum arithmetic verification ───────────────────────────────────

describe('Weighted sum arithmetic', () => {
  it('verifies the formula numerically for a known input', () => {
    // emotional_regulation rule has N: -0.72, anxiety: -0.46, S1: -0.51, S4: -0.60, C: +0.35
    // With N=80, anxiety=70, S1=60, S4=50, C=70 (all other traits at 50)
    const v = makeVector({
      ocean: { N: 80, E: 50, A: 50, C: 70, O: 50 },
      attachmentAnxiety: 70,
      schemas: { S1: 60, S2: 50, S3: 50, S4: 50, S5: 50, S6: 50, S7: 50 },
    });
    const rule = ruleFor('emotional_regulation');

    // Manual calculation:
    // deviation(N)=30, w=-0.72  → contrib=-21.6
    // deviation(anxiety)=20, w=-0.46 → contrib=-9.2
    // deviation(S1)=10, w=-0.51 → contrib=-5.1
    // deviation(S4)=0, w=-0.60 → contrib=0
    // deviation(C)=20, w=+0.35 → contrib=7.0
    // weightedSum = -21.6 + -9.2 + -5.1 + 0 + 7.0 = -28.9
    // totalAbsWeight = 0.72+0.46+0.51+0.60+0.35 = 2.64
    // score = 50 + (-28.9/2.64) = 50 + (-10.946...) ≈ 39.05

    const score = computeDimensionScore(rule, v);
    expect(score).toBeCloseTo(39.05, 0);
  });
});

// ── 7. Zero-data anti-hallucination guard ────────────────────────────────────
//
// These tests verify the hard guard clause added to runSynthesis():
// when no test results exist in localStorage, the engine must return null
// instead of a default persona label derived from neutral (50,50,50) scores.

describe('Zero-data guard (anti-hallucination)', () => {
  beforeEach(() => {
    // Ensure a clean localStorage so loadHistory/loadAttachmentHistory/
    // loadSchemaHistory all return empty arrays → completedTests.size === 0.
    try { localStorage.clear(); } catch {}
  });

  it('runSynthesis() returns null when localStorage is empty', () => {
    const result = runSynthesis();
    expect(result).toBeNull();
  });

  it('buildTraitVector() completedTests is empty when no history exists', () => {
    const vector = buildTraitVector();
    expect(vector.completedTests.size).toBe(0);
  });

  it('matchPatterns fires no patterns when completedTests is empty', () => {
    const dims = makeDimensions({ emotional_regulation: 20, self_worth: 20 });
    const emptyVector: TraitVector = {
      ocean: {},
      attachmentAnxiety: 50,
      attachmentAvoidance: 50,
      schemas: {},
      romanticAxes: {},
      completedTests: new Set(),
    };
    const patterns = matchPatterns(dims, emptyVector);
    expect(patterns).toHaveLength(0);
  });

  it('all dimensions score exactly 50 when only neutral attachment defaults are present', () => {
    // With empty ocean + schemas and neutral attachment values (50),
    // all deviations are 0 → score must be 50 for every dimension.
    const neutralVector: TraitVector = {
      ocean: {},
      attachmentAnxiety: 50,
      attachmentAvoidance: 50,
      schemas: {},
      romanticAxes: {},
      completedTests: new Set(),
    };
    for (const rule of DIMENSION_RULES) {
      expect(computeDimensionScore(rule, neutralVector)).toBeCloseTo(50, 5);
    }
  });
});
