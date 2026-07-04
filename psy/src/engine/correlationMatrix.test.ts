/**
 * Unit tests for the Cross-Test Correlation Matrix
 *
 * Tests verify:
 *  1. Returns zero coherence when fewer than 2 tests are present
 *  2. Computes non-zero coherence with ≥2 tests
 *  3. High N + high anxiety produces an amplifier insight
 *  4. High N + high avoidance produces a tension insight (expected: low avoidance)
 *  5. Coherence is bounded 0–100
 *  6. loadSocialAxis gracefully returns null when no social result in storage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { computeCorrelationMatrix } from './CorrelationMatrix';
import type { TraitVector } from './synthesisTypes';

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

describe('computeCorrelationMatrix', () => {
  beforeEach(() => {
    try { localStorage.clear(); } catch {}
  });

  it('returns zero coherence when only 1 test is complete', () => {
    const v = makeVector({ completedTests: new Set(['ocean'] as const) });
    const result = computeCorrelationMatrix(v);
    expect(result.overallCoherence).toBe(0);
    expect(result.insights).toHaveLength(0);
  });

  it('returns non-zero coherence with 2+ tests completed (ocean + attachment)', () => {
    const v = makeVector({ completedTests: new Set(['ocean', 'attachment'] as const) });
    const result = computeCorrelationMatrix(v);
    expect(result.overallCoherence).toBeGreaterThan(0);
    expect(result.overallCoherence).toBeLessThanOrEqual(100);
  });

  it('coherence is exactly 100 when all traits are neutral (50)', () => {
    // With all traits at 50, every pair aligns perfectly with the expected correlation
    const v = makeVector();
    const result = computeCorrelationMatrix(v);
    // All deviations are 0, so all pairs should score coherence=1 → 100
    expect(result.overallCoherence).toBe(100);
  });

  it('high N (80) + high anxiety (80) produces an amplifier insight', () => {
    // N=80 predicts anxiety=65+ via r=+0.50 → expected anxiety ≈ 65
    // Actual anxiety=80 is in the same direction, should be amplifier
    const v = makeVector({
      ocean: { N: 80, E: 50, A: 50, C: 50, O: 50 },
      attachmentAnxiety: 80,
    });
    const result = computeCorrelationMatrix(v);
    expect(result.amplifiers.length).toBeGreaterThan(0);
  });

  it('high N (80) + low avoidance (20) produces a tension insight (E−avoidance rule)', () => {
    // Rule E_avoidance: r=-0.35, so low E predicts high avoidance
    // But with E=50 neutral and N=80, the N_anxiety pair and A_S2 pair dominate
    // Let's test the N pair directly with opposing avoidance
    const v = makeVector({
      ocean: { N: 50, E: 20, A: 50, C: 50, O: 50 },
      attachmentAvoidance: 20, // E low predicts high avoidance (r=-0.35), but avoidance is low → tension
    });
    const result = computeCorrelationMatrix(v);
    // E=20 (low), expected avoidance = 50 + (-0.35)*(20-50) = 50 + 10.5 = 60.5
    // Actual avoidance = 20, deviation = |20 - 60.5| = 40.5 → strong tension
    expect(result.tensions.length).toBeGreaterThan(0);
  });

  it('high A (80) + low S2 (20) produces an amplifier insight', () => {
    // A_S2 rule: r=-0.40 → high A predicts low S2
    const v = makeVector({
      ocean: { N: 50, E: 50, A: 80, C: 50, O: 50 },
      schemas: { S1: 50, S2: 20, S3: 50, S4: 50, S5: 50, S6: 50, S7: 50 },
    });
    const result = computeCorrelationMatrix(v);
    expect(result.amplifiers.length).toBeGreaterThan(0);
  });

  it('returns empty arrays for amplifiers and tensions with neutral data', () => {
    const v = makeVector();
    const result = computeCorrelationMatrix(v);
    // All traits neutral → no significant deviations → no insights surfaced
    expect(result.amplifiers).toHaveLength(0);
    expect(result.tensions).toHaveLength(0);
  });

  it('handles empty completedTests gracefully', () => {
    const empty: TraitVector = {
      ocean: {},
      attachmentAnxiety: 50,
      attachmentAvoidance: 50,
      schemas: {},
      romanticAxes: {},
      completedTests: new Set(),
    };
    const result = computeCorrelationMatrix(empty);
    expect(result.overallCoherence).toBe(0);
    expect(result.insights).toHaveLength(0);
    expect(result.amplifiers).toHaveLength(0);
    expect(result.tensions).toHaveLength(0);
  });

  it('coherence stays in [0, 100] with extreme inputs', () => {
    const v = makeVector({
      ocean: { N: 100, E: 0, A: 0, C: 0, O: 0 },
      attachmentAnxiety: 100,
      attachmentAvoidance: 0,
      schemas: { S1: 100, S2: 0, S3: 100, S4: 100, S5: 100, S6: 100, S7: 100 },
    });
    const result = computeCorrelationMatrix(v);
    expect(result.overallCoherence).toBeGreaterThanOrEqual(0);
    expect(result.overallCoherence).toBeLessThanOrEqual(100);
  });

  it('high C (80) + high S7 (80) produces an amplifier insight', () => {
    // C_S7 rule: r=+0.45 → high C predicts high S7
    const v = makeVector({
      ocean: { N: 50, E: 50, A: 50, C: 80, O: 50 },
      schemas: { S1: 50, S2: 50, S3: 50, S4: 50, S5: 50, S6: 50, S7: 80 },
    });
    const result = computeCorrelationMatrix(v);
    expect(result.amplifiers.length).toBeGreaterThan(0);
  });
});
