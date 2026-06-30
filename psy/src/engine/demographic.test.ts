/**
 * Unit tests for Demographic Modulators
 *
 * Covers:
 *  1. Individual modulator functions (age, marital, children, birth order)
 *  2. Combined adjustment is bounded within ±15 per dimension
 *  3. Zero imputation enforcement — null fields contribute zero
 *  4. KEY TEST CASE: male, 39, married, one child
 *     → ER and AA must be higher than a young-single-childless baseline
 *  5. Pro-rating: adjustments only applied for non-null fields
 */

import { describe, it, expect } from 'vitest';
import {
  computeDemographicAdjustments,
  applyDemographicAdjustments,
} from './demographicModulators';
import type { DemographicProfile } from './demographicTypes';
import { EMPTY_PROFILE } from './demographicTypes';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeProfile(overrides: Partial<DemographicProfile> = {}): DemographicProfile {
  return { ...EMPTY_PROFILE, ...overrides };
}

const DIMS = [
  'emotional_regulation',
  'interpersonal_trust',
  'relational_closeness',
  'self_worth',
  'autonomy_achievement',
] as const;

// ── 1. Empty profile → zero adjustments ──────────────────────────────────────

describe('Empty profile produces zero adjustments', () => {
  const adj = computeDemographicAdjustments(EMPTY_PROFILE);

  for (const dim of DIMS) {
    it(`${dim} adjustment is 0 with no data`, () => {
      expect(adj[dim]).toBe(0);
    });
  }
});

// ── 2. Age effects ────────────────────────────────────────────────────────────

describe('Age modulator (Roberts & Mroczek 2008; Soto et al. 2011)', () => {
  it('age 39 raises emotional_regulation above age-30 baseline', () => {
    const adj39 = computeDemographicAdjustments(makeProfile({ age: 39 }));
    const adj30 = computeDemographicAdjustments(makeProfile({ age: 30 }));
    expect(adj39.emotional_regulation).toBeGreaterThan(adj30.emotional_regulation);
  });

  it('age 39 raises autonomy_achievement above age-30 baseline (C matures)', () => {
    const adj39 = computeDemographicAdjustments(makeProfile({ age: 39 }));
    const adj30 = computeDemographicAdjustments(makeProfile({ age: 30 }));
    expect(adj39.autonomy_achievement).toBeGreaterThan(adj30.autonomy_achievement);
  });

  it('age 22 produces negative ER adjustment (N higher in youth)', () => {
    const adj = computeDemographicAdjustments(makeProfile({ age: 22 }));
    expect(adj.emotional_regulation).toBeLessThan(0);
  });

  it('age adjustment stays within ±6 per dimension', () => {
    for (const age of [15, 25, 39, 55, 80]) {
      const adj = computeDemographicAdjustments(makeProfile({ age }));
      for (const dim of DIMS) {
        expect(Math.abs(adj[dim])).toBeLessThanOrEqual(6 + 1e-9); // age cap is ±6
      }
    }
  });
});

// ── 3. Marital status effects ─────────────────────────────────────────────────

describe('Marital status modulator (Roberts et al. 2002; Neyer & Lehnart 2007)', () => {
  it('married produces positive ER adjustment', () => {
    const adj = computeDemographicAdjustments(makeProfile({ maritalStatus: 'married' }));
    expect(adj.emotional_regulation).toBeGreaterThan(0);
  });

  it('married produces positive AA adjustment', () => {
    const adj = computeDemographicAdjustments(makeProfile({ maritalStatus: 'married' }));
    expect(adj.autonomy_achievement).toBeGreaterThan(0);
  });

  it('divorced produces negative ER adjustment (post-divorce N elevation)', () => {
    const adj = computeDemographicAdjustments(makeProfile({ maritalStatus: 'divorced' }));
    expect(adj.emotional_regulation).toBeLessThan(0);
  });

  it('married ER > single ER', () => {
    const married = computeDemographicAdjustments(makeProfile({ maritalStatus: 'married' }));
    const single  = computeDemographicAdjustments(makeProfile({ maritalStatus: 'single' }));
    expect(married.emotional_regulation).toBeGreaterThan(single.emotional_regulation);
  });
});

// ── 4. Children effects ───────────────────────────────────────────────────────

describe('Children modulator (Soto et al. 2011 — parenthood × personality)', () => {
  it('1 child produces positive AA adjustment (sense of purpose)', () => {
    const adj = computeDemographicAdjustments(makeProfile({ numberOfChildren: 1 }));
    expect(adj.autonomy_achievement).toBeGreaterThan(0);
  });

  it('0 children produces zero adjustments', () => {
    const adj = computeDemographicAdjustments(makeProfile({ numberOfChildren: 0 }));
    expect(adj.autonomy_achievement).toBe(0);
  });

  it('3 children does not exceed cap', () => {
    const adj = computeDemographicAdjustments(makeProfile({ numberOfChildren: 3 }));
    expect(Math.abs(adj.relational_closeness)).toBeLessThanOrEqual(4);
  });
});

// ── 5. Birth order ────────────────────────────────────────────────────────────

describe('Birth order modulator (Sulloway 1996; Damian & Roberts 2015)', () => {
  it('firstborn produces higher AA than lastborn (C advantage)', () => {
    const first = computeDemographicAdjustments(makeProfile({ birthOrder: 'firstborn' }));
    const last  = computeDemographicAdjustments(makeProfile({ birthOrder: 'lastborn' }));
    expect(first.autonomy_achievement).toBeGreaterThan(last.autonomy_achievement);
  });

  it('lastborn produces higher RC than firstborn (E/social advantage)', () => {
    const first = computeDemographicAdjustments(makeProfile({ birthOrder: 'firstborn' }));
    const last  = computeDemographicAdjustments(makeProfile({ birthOrder: 'lastborn' }));
    expect(last.relational_closeness).toBeGreaterThan(first.relational_closeness);
  });

  it('middle child produces positive IT adjustment (A from negotiation role)', () => {
    const adj = computeDemographicAdjustments(makeProfile({ birthOrder: 'middle' }));
    expect(adj.interpersonal_trust).toBeGreaterThan(0);
  });
});

// ── 6. Global cap ─────────────────────────────────────────────────────────────

describe('Global cap: total adjustment ≤ ±15 per dimension', () => {
  it('maximally positive profile does not exceed +15', () => {
    const profile = makeProfile({
      age: 55,
      maritalStatus: 'married',
      numberOfChildren: 3,
      birthOrder: 'firstborn',
      fatherPresence: 'present',
      motherPresence: 'present',
    });
    const adj = computeDemographicAdjustments(profile);
    for (const dim of DIMS) {
      expect(adj[dim]).toBeLessThanOrEqual(15);
    }
  });

  it('maximally negative profile does not exceed −15', () => {
    const profile = makeProfile({
      age: 16,
      maritalStatus: 'divorced',
      numberOfChildren: 0,
      fatherPresence: 'absent_early',
      motherPresence: 'absent_early',
    });
    const adj = computeDemographicAdjustments(profile);
    for (const dim of DIMS) {
      expect(adj[dim]).toBeGreaterThanOrEqual(-15);
    }
  });
});

// ── 7. applyDemographicAdjustments bounds ────────────────────────────────────

describe('applyDemographicAdjustments keeps scores in [0, 100]', () => {
  it('does not push a 100-score above 100', () => {
    const scores = { emotional_regulation: 100, interpersonal_trust: 100, relational_closeness: 100, self_worth: 100, autonomy_achievement: 100 };
    const adj    = { emotional_regulation: 15,  interpersonal_trust: 15,  relational_closeness: 15,  self_worth: 15,  autonomy_achievement: 15 };
    const result = applyDemographicAdjustments(scores, adj);
    for (const dim of DIMS) expect(result[dim]).toBeLessThanOrEqual(100);
  });

  it('does not push a 0-score below 0', () => {
    const scores = { emotional_regulation: 0, interpersonal_trust: 0, relational_closeness: 0, self_worth: 0, autonomy_achievement: 0 };
    const adj    = { emotional_regulation: -15, interpersonal_trust: -15, relational_closeness: -15, self_worth: -15, autonomy_achievement: -15 };
    const result = applyDemographicAdjustments(scores, adj);
    for (const dim of DIMS) expect(result[dim]).toBeGreaterThanOrEqual(0);
  });
});

// ── 8. KEY TEST CASE: male, 39, married, one child ───────────────────────────
//
//  Scientific rationale:
//  • Age 39: N has declined ~2.3 pts below peak-youth levels (Roberts & Mroczek 2008),
//    C has matured ~1.4 pts above baseline (Soto et al. 2011).
//  • Married: N further −3 pts, C +2 pts in long-term stable partnership (Roberts 2002).
//  • 1 child: purpose/responsibility → AA +1, ER +0.5, RC +0.7.
//  Combined → ER and AA should clearly exceed adjustments for a young, single, childless peer.
// ─────────────────────────────────────────────────────────────────────────────

describe('KEY TEST CASE — male, 39, married, one child', () => {
  const targetProfile = makeProfile({
    age:              39,
    gender:           'male',
    maritalStatus:    'married',
    numberOfChildren: 1,
  });

  const youngSingleProfile = makeProfile({
    age:              22,
    gender:           'male',
    maritalStatus:    'single',
    numberOfChildren: 0,
  });

  const targetAdj   = computeDemographicAdjustments(targetProfile);
  const youngAdj    = computeDemographicAdjustments(youngSingleProfile);

  it('emotional_regulation adjustment is positive (N stabilises with age + marriage)', () => {
    expect(targetAdj.emotional_regulation).toBeGreaterThan(0);
  });

  it('autonomy_achievement adjustment is positive (C matures + responsibility)', () => {
    expect(targetAdj.autonomy_achievement).toBeGreaterThan(0);
  });

  it('interpersonal_trust adjustment is positive (A increases with age)', () => {
    expect(targetAdj.interpersonal_trust).toBeGreaterThan(0);
  });

  it('self_worth adjustment is positive (N decline → fewer shame-driven cognitions)', () => {
    expect(targetAdj.self_worth).toBeGreaterThan(0);
  });

  it('ER adjustment for 39/married/child is strictly greater than for 22/single/childless', () => {
    expect(targetAdj.emotional_regulation).toBeGreaterThan(youngAdj.emotional_regulation);
  });

  it('AA adjustment for 39/married/child is strictly greater than for 22/single/childless', () => {
    expect(targetAdj.autonomy_achievement).toBeGreaterThan(youngAdj.autonomy_achievement);
  });

  it('neutral trait vector (all 50) receives positive ER adjustment for target profile', () => {
    const neutralScores = {
      emotional_regulation: 50, interpersonal_trust: 50,
      relational_closeness: 50, self_worth: 50, autonomy_achievement: 50,
    };
    const adjusted = applyDemographicAdjustments(neutralScores, targetAdj);
    expect(adjusted.emotional_regulation).toBeGreaterThan(50);
    expect(adjusted.autonomy_achievement).toBeGreaterThan(50);
  });

  it('all adjustments remain within ±15 global cap', () => {
    for (const dim of DIMS) {
      expect(Math.abs(targetAdj[dim])).toBeLessThanOrEqual(15);
    }
  });
});

// ── 9. Zero imputation enforcement ───────────────────────────────────────────

describe('Zero imputation forbidden — null fields contribute nothing', () => {
  it('profile with only age contributes exactly age-derived adjustment', () => {
    const ageOnly   = computeDemographicAdjustments(makeProfile({ age: 39 }));
    const fullMatch = computeDemographicAdjustments(makeProfile({ age: 39, maritalStatus: null }));
    expect(ageOnly.emotional_regulation).toBeCloseTo(fullMatch.emotional_regulation, 10);
  });

  it('profile with only maritalStatus contributes exactly marital adjustment', () => {
    const marriedOnly = computeDemographicAdjustments(makeProfile({ maritalStatus: 'married' }));
    // Should equal the married-only contribution (no age drift, no children, etc.)
    expect(marriedOnly.emotional_regulation).toBeGreaterThan(0);
    // Verify it does NOT include age adjustment (age is null → should be 0 contribution)
    const withAge = computeDemographicAdjustments(makeProfile({ maritalStatus: 'married', age: 45 }));
    expect(withAge.emotional_regulation).toBeGreaterThan(marriedOnly.emotional_regulation);
  });
});
