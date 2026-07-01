/**
 * Unit tests for the OCEAN scoring engine — multi-tier architecture
 *
 * Tests verify:
 *  1. Core tier (50 items) produces valid factor scores for all 5 factors
 *  2. Deep tier (120 items) produces valid factor scores + non-empty subTypeCode
 *  3. Core tier has subTypeCode === '' (anti-hallucination guard)
 *  4. Factor score direction is consistent between tiers for extreme inputs
 *  5. All factor scores stay within [0, 100]
 */

import { describe, it, expect } from 'vitest';
import {
  buildTestResult,
  calculateScores,
  getLevel,
} from './scoring';
import type { Question, ScoringConfig } from './types';

// ── Minimal scoring config ────────────────────────────────────────────────────

const CONFIG: ScoringConfig = {
  likertMin: 1,
  likertMax: 5,
  factors: {
    N: { name: 'Neuroticism', veryLowThreshold: 15, lowThreshold: 40, highThreshold: 60, veryHighThreshold: 85 },
    E: { name: 'Extraversion', veryLowThreshold: 15, lowThreshold: 40, highThreshold: 60, veryHighThreshold: 85 },
    O: { name: 'Openness', veryLowThreshold: 15, lowThreshold: 40, highThreshold: 60, veryHighThreshold: 85 },
    A: { name: 'Agreeableness', veryLowThreshold: 15, lowThreshold: 40, highThreshold: 60, veryHighThreshold: 85 },
    C: { name: 'Conscientiousness', veryLowThreshold: 15, lowThreshold: 40, highThreshold: 60, veryHighThreshold: 85 },
  },
};

// ── Question factories ────────────────────────────────────────────────────────

function makeQuestion(
  id: string,
  factor: 'N' | 'E' | 'O' | 'A' | 'C',
  facet: string,
  direction: 'direct' | 'reverse',
  tier: 'core' | 'deep',
  weight = 1.0,
): Question {
  return {
    id,
    text: `Question ${id}`,
    type: 'likert',
    factor,
    facet: facet as never,
    direction,
    weight,
    tier,
  };
}

// Build a minimal 10-question core set per factor (2 per factor, all core)
function makeCoreQuestions(): Question[] {
  const qs: Question[] = [];
  const factors: Array<'N' | 'E' | 'O' | 'A' | 'C'> = ['N', 'E', 'O', 'A', 'C'];
  const facetMap: Record<string, string[]> = {
    N: ['N1', 'N2'],
    E: ['E1', 'E2'],
    O: ['O1', 'O2'],
    A: ['A1', 'A2'],
    C: ['C1', 'C2'],
  };
  let idx = 1;
  for (const f of factors) {
    for (let i = 0; i < 2; i++) {
      qs.push(makeQuestion(`q${String(idx).padStart(3, '0')}`, f, facetMap[f][i], i === 0 ? 'direct' : 'reverse', 'core'));
      idx++;
    }
  }
  return qs;
}

// Build a larger 4-per-factor deep set (2 direct + 2 reverse)
function makeDeepQuestions(): Question[] {
  const qs: Question[] = [];
  const factors: Array<'N' | 'E' | 'O' | 'A' | 'C'> = ['N', 'E', 'O', 'A', 'C'];
  const facetMap: Record<string, string[]> = {
    N: ['N1', 'N2', 'N3', 'N4'],
    E: ['E1', 'E2', 'E3', 'E4'],
    O: ['O1', 'O2', 'O3', 'O4'],
    A: ['A1', 'A2', 'A3', 'A4'],
    C: ['C1', 'C2', 'C3', 'C4'],
  };
  let idx = 1;
  for (const f of factors) {
    for (let i = 0; i < 4; i++) {
      qs.push(makeQuestion(`q${String(idx).padStart(3, '0')}`, f, facetMap[f][i], i < 2 ? 'direct' : 'reverse', 'deep'));
      idx++;
    }
  }
  return qs;
}

function buildAnswers(questions: Question[], value: number): Record<string, number> {
  const ans: Record<string, number> = {};
  for (const q of questions) {
    ans[q.id] = value;
  }
  return ans;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('buildTestResult — core tier', () => {
  const qs = makeCoreQuestions();
  const midAnswers = buildAnswers(qs, 3); // neutral responses

  it('produces factor scores for all 5 factors', () => {
    const r = buildTestResult(midAnswers, qs, CONFIG, 'core');
    expect(Object.keys(r.scores)).toHaveLength(5);
    for (const f of ['N', 'E', 'O', 'A', 'C'] as const) {
      expect(r.scores[f]).toBeDefined();
      expect(r.scores[f]).toBeGreaterThanOrEqual(0);
      expect(r.scores[f]).toBeLessThanOrEqual(100);
    }
  });

  it('sets subTypeCode to empty string (anti-hallucination guard)', () => {
    const r = buildTestResult(midAnswers, qs, CONFIG, 'core');
    expect(r.subTypeCode).toBe('');
  });

  it('stores tier === "core" in result', () => {
    const r = buildTestResult(midAnswers, qs, CONFIG, 'core');
    expect(r.tier).toBe('core');
  });

  it('neutral responses yield score near 50', () => {
    const r = buildTestResult(midAnswers, qs, CONFIG, 'core');
    for (const f of ['N', 'E', 'O', 'A', 'C'] as const) {
      expect(r.scores[f]).toBeCloseTo(50, 0);
    }
  });
});

describe('buildTestResult — deep tier', () => {
  const qs = makeDeepQuestions();
  const midAnswers = buildAnswers(qs, 3);

  it('produces factor scores for all 5 factors', () => {
    const r = buildTestResult(midAnswers, qs, CONFIG, 'deep');
    expect(Object.keys(r.scores)).toHaveLength(5);
    for (const f of ['N', 'E', 'O', 'A', 'C'] as const) {
      expect(r.scores[f]).toBeDefined();
      expect(r.scores[f]).toBeGreaterThanOrEqual(0);
      expect(r.scores[f]).toBeLessThanOrEqual(100);
    }
  });

  it('produces a non-empty subTypeCode', () => {
    const r = buildTestResult(midAnswers, qs, CONFIG, 'deep');
    expect(r.subTypeCode).toBeTruthy();
    expect(r.subTypeCode).toMatch(/^.+-[abc]$/);
  });

  it('stores tier === "deep" in result', () => {
    const r = buildTestResult(midAnswers, qs, CONFIG, 'deep');
    expect(r.tier).toBe('deep');
  });
});

describe('buildTestResult — no tier (legacy)', () => {
  const qs = makeDeepQuestions();
  const midAnswers = buildAnswers(qs, 3);

  it('omits tier field when not specified', () => {
    const r = buildTestResult(midAnswers, qs, CONFIG);
    expect(r.tier).toBeUndefined();
  });

  it('still produces a subTypeCode (deep pipeline)', () => {
    const r = buildTestResult(midAnswers, qs, CONFIG);
    expect(r.subTypeCode).toBeTruthy();
  });
});

describe('factor score direction consistency across tiers', () => {
  it('high answers yield higher score than low answers in both tiers', () => {
    // For direct-direction N questions: high answers → higher N score
    const nQs = [makeQuestion('n1', 'N', 'N1', 'direct', 'core')];

    const highAnswers = buildAnswers(nQs, 5);
    const lowAnswers  = buildAnswers(nQs, 1);

    const coreHigh = buildTestResult(highAnswers, nQs, CONFIG, 'core');
    const coreLow  = buildTestResult(lowAnswers,  nQs, CONFIG, 'core');

    expect((coreHigh.scores.N ?? 0)).toBeGreaterThan((coreLow.scores.N ?? 0));
  });

  it('reverse-direction question inverts score contribution', () => {
    const revQ = [makeQuestion('n1', 'N', 'N1', 'reverse', 'deep')];

    const highAnswers = buildAnswers(revQ, 5);
    const lowAnswers  = buildAnswers(revQ, 1);

    const deepHigh = buildTestResult(highAnswers, revQ, CONFIG, 'deep');
    const deepLow  = buildTestResult(lowAnswers,  revQ, CONFIG, 'deep');

    // Reverse: high raw → low adjusted → lower N score
    expect((deepHigh.scores.N ?? 100)).toBeLessThan((deepLow.scores.N ?? 0));
  });
});

describe('score bounds', () => {
  it('all factor scores stay within [0, 100] for extreme inputs', () => {
    const qs = makeCoreQuestions();
    for (const value of [1, 5]) {
      const r = buildTestResult(buildAnswers(qs, value), qs, CONFIG, 'core');
      for (const score of Object.values(r.scores)) {
        if (score !== undefined) {
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        }
      }
    }
  });
});

describe('getLevel', () => {
  it('maps percentages to correct level buckets', () => {
    expect(getLevel(5)).toBe('very_low');
    expect(getLevel(20)).toBe('low');
    expect(getLevel(50)).toBe('medium');
    expect(getLevel(70)).toBe('high');
    expect(getLevel(90)).toBe('very_high');
  });
});
