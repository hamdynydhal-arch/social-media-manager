/**
 * Demographic Modulator — evidence-based adjustments to synthesis dimension scores
 *
 * Each modulator returns a signed adjustment (Δ) per PersonaDimensionId.
 * Adjustments are ADDITIVE to the raw dimension score and capped so that
 * demographics color the picture without overriding trait data.
 *
 * Maximum contribution per source:   ±6 points
 * Maximum total adjustment:          ±15 points (enforced by applyDemographicAdjustments)
 *
 * Scientific sources
 * ──────────────────
 * [RM08]  Roberts, B.W. & Mroczek, D. (2008). Personality trait change in
 *         adulthood. Current Directions in Psychological Science, 17(1), 31–35.
 *         N decreases ~0.5 SD and C increases ~0.3 SD from 20 to 60.
 *
 * [So11]  Soto, C.J., John, O.P., Gosling, S.D., & Potter, J. (2011).
 *         Age differences in personality traits from 10 to 65.
 *         J. Personality and Social Psychology, 100(2), 330.
 *         Confirms RM08 cross-sectionally; N-decline most pronounced 25–45.
 *
 * [Ro02]  Roberts, B.W., Helson, R., & Klohnen, E.C. (2002).
 *         Personality development and growth in women across 30 years.
 *         J. Personality, 70(1), 79–102.
 *         Marriage associated with N−0.3 SD, C+0.1 SD.
 *
 * [Ne07]  Neyer, F.J. & Lehnart, J. (2007). Relationships matter in personality
 *         development: Evidence from an 8-year longitudinal study across young
 *         adulthood. J. Personality, 75(3), 535–568.
 *         Partnership stability associated with N decrease, C increase.
 *
 * [Su96]  Sulloway, F.J. (1996). Born to Rebel. Pantheon.
 *         Firstborns: higher C; lastborns: higher O/E; middle: higher A.
 *
 * [DR15]  Damian, R.I. & Roberts, B.W. (2015). The associations of birth order
 *         with personality and intelligence. J. Research in Personality, 58, 96–105.
 *         Confirms small birth-order effects (d ≈ 0.02–0.04); caution warranted.
 *
 * [Co01]  Costa, P.T., Terracciano, A., & McCrae, R.R. (2001). Gender differences
 *         in personality traits across cultures.
 *         J. Personality and Social Psychology, 81(2), 322.
 *         Women: higher N and A; men: negligible C advantage in some samples.
 */

import type { PersonaDimensionId } from './synthesisTypes';
import type { DemographicProfile, BirthOrder, MaritalStatus } from './demographicTypes';

export type DemographicAdjustment = Record<PersonaDimensionId, number>;

const ZERO: DemographicAdjustment = {
  emotional_regulation: 0,
  interpersonal_trust:  0,
  relational_closeness: 0,
  self_worth:           0,
  autonomy_achievement: 0,
};

function clampAdj(adj: DemographicAdjustment, maxAbs: number): DemographicAdjustment {
  const result = { ...adj };
  for (const k of Object.keys(result) as PersonaDimensionId[]) {
    result[k] = Math.max(-maxAbs, Math.min(maxAbs, result[k]));
  }
  return result;
}

function addAdj(a: DemographicAdjustment, b: DemographicAdjustment): DemographicAdjustment {
  return {
    emotional_regulation: a.emotional_regulation + b.emotional_regulation,
    interpersonal_trust:  a.interpersonal_trust  + b.interpersonal_trust,
    relational_closeness: a.relational_closeness + b.relational_closeness,
    self_worth:           a.self_worth           + b.self_worth,
    autonomy_achievement: a.autonomy_achievement + b.autonomy_achievement,
  };
}

/**
 * Age-based adjustments — relative to baseline age 30.
 * Source: [RM08], [So11]
 *
 * N declines ~0.017 SD/year (25–60); on 0–100 scale (1 SD ≈ 15 pts) → ~0.25 pt/year
 * C increases ~0.010 SD/year → ~0.15 pt/year
 * A increases ~0.008 SD/year → ~0.12 pt/year
 *
 * Maximal contribution capped at ±6.
 */
function ageAdjustment(age: number): DemographicAdjustment {
  const a = Math.max(15, Math.min(80, age));
  const d = a - 30; // years relative to baseline

  const er = d * 0.25;   // N↓ → ER↑
  const aa = d * 0.15;   // C↑ → AA↑
  const it = d * 0.12;   // A↑ → IT↑
  const sw = d * 0.13;   // N↓ → SW↑ (slightly smaller effect)

  return clampAdj({ emotional_regulation: er, interpersonal_trust: it, relational_closeness: 0, self_worth: sw, autonomy_achievement: aa }, 6);
}

/**
 * Marital-status adjustments.
 * Source: [Ro02], [Ne07]
 */
function maritalAdjustment(status: MaritalStatus | null): DemographicAdjustment {
  switch (status) {
    case 'married':
      // N−0.3 SD → ER+4.5; C+0.1 SD → AA+1.5; A↑ → IT+1.5; SW+2 (stability)
      return { emotional_regulation: 3, interpersonal_trust: 2, relational_closeness: 1, self_worth: 2, autonomy_achievement: 2 };
    case 'divorced':
      // N increases post-divorce [Ro02]; temporary SW reduction
      return { emotional_regulation: -2, interpersonal_trust: -1, relational_closeness: 0, self_worth: -2, autonomy_achievement: 0 };
    case 'widowed':
      return { emotional_regulation: -2, interpersonal_trust: -1, relational_closeness: -1, self_worth: -2, autonomy_achievement: -1 };
    default:
      return { ...ZERO };
  }
}

/**
 * Children-count adjustments.
 * Source: [So11] (parenthood × personality)
 * Parenthood → sense of purpose (AA+), social connection (RC+), emotional maturity (ER+).
 * Effects are small and plateau after the first child.
 */
function childrenAdjustment(count: number | null): DemographicAdjustment {
  if (!count || count <= 0) return { ...ZERO };
  const n = Math.min(count, 3);
  return clampAdj({
    emotional_regulation: n * 0.5,
    interpersonal_trust:  0,
    relational_closeness: n * 0.7,
    self_worth:           n * 0.5,
    autonomy_achievement: n * 1.0,
  }, 4);
}

/**
 * Birth-order adjustments.
 * Source: [Su96], [DR15]
 * Effects are very small (d ≈ 0.02–0.04); contributions capped at ±3.
 */
function birthOrderAdjustment(order: BirthOrder | null): DemographicAdjustment {
  switch (order) {
    case 'firstborn':
      // C↑ (responsibility), slight anxiety from dethroning → ER−
      return clampAdj({ emotional_regulation: -1, interpersonal_trust: 0, relational_closeness: 0, self_worth: 1, autonomy_achievement: 2 }, 3);
    case 'middle':
      // A↑ (negotiation role); less self-worth instability
      return clampAdj({ emotional_regulation: 0, interpersonal_trust: 2, relational_closeness: 1, self_worth: 0, autonomy_achievement: 0 }, 3);
    case 'lastborn':
      // E↑, O↑; C slightly lower; more openness to connection
      return clampAdj({ emotional_regulation: 0, interpersonal_trust: 1, relational_closeness: 2, self_worth: 0, autonomy_achievement: -1 }, 3);
    case 'only_child':
      // C↑ (achievement focus), RC slightly lower (less sibling practice)
      return clampAdj({ emotional_regulation: 0, interpersonal_trust: 0, relational_closeness: -1, self_worth: 1, autonomy_achievement: 2 }, 3);
    default:
      return { ...ZERO };
  }
}

/**
 * Parental-presence adjustments.
 * Source: Young, Klosko & Weishaar (2003) — early absence elevates
 * abandonment/deprivation schemas; [So11] finds N elevation in such contexts.
 * Both father and mother absence contribute; effects combined, capped at ±5 total.
 */
function parentalAdjustment(
  fatherPresence: DemographicProfile['fatherPresence'],
  motherPresence: DemographicProfile['motherPresence'],
): DemographicAdjustment {
  let erAdj = 0, swAdj = 0, itAdj = 0, rcAdj = 0;

  const earlyAbsence = (p: DemographicProfile['fatherPresence'] | DemographicProfile['motherPresence']) =>
    p === 'absent_early' || p === 'deceased';

  if (earlyAbsence(fatherPresence)) { erAdj -= 1.5; swAdj -= 1.5; itAdj -= 1; }
  if (earlyAbsence(motherPresence)) { erAdj -= 2; swAdj -= 2; rcAdj -= 1; }
  if (fatherPresence === 'absent_late') { erAdj -= 0.5; swAdj -= 0.5; }
  if (motherPresence === 'absent_late') { erAdj -= 0.8; rcAdj -= 0.5; }

  return clampAdj({
    emotional_regulation: erAdj,
    interpersonal_trust:  itAdj,
    relational_closeness: rcAdj,
    self_worth:           swAdj,
    autonomy_achievement: 0,
  }, 5);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Compute the total demographic adjustment per dimension.
 * Any null profile fields are treated as unknown and contribute zero adjustment
 * (strict anti-imputation — no guessing).
 */
export function computeDemographicAdjustments(
  profile: DemographicProfile,
): DemographicAdjustment {
  let total: DemographicAdjustment = { ...ZERO };

  if (profile.age !== null) {
    total = addAdj(total, ageAdjustment(profile.age));
  }
  if (profile.maritalStatus !== null) {
    total = addAdj(total, maritalAdjustment(profile.maritalStatus));
  }
  if (profile.numberOfChildren !== null) {
    total = addAdj(total, childrenAdjustment(profile.numberOfChildren));
  }
  if (profile.birthOrder !== null) {
    total = addAdj(total, birthOrderAdjustment(profile.birthOrder));
  }
  if (profile.fatherPresence !== null || profile.motherPresence !== null) {
    total = addAdj(total, parentalAdjustment(profile.fatherPresence, profile.motherPresence));
  }

  // Hard cap: total adjustment per dimension cannot exceed ±15
  return clampAdj(total, 15);
}

/**
 * Apply demographic adjustments to dimension scores, clamping results to [0, 100].
 */
export function applyDemographicAdjustments(
  scores: Record<PersonaDimensionId, number>,
  adjustments: DemographicAdjustment,
): Record<PersonaDimensionId, number> {
  const result = { ...scores };
  for (const key of Object.keys(adjustments) as PersonaDimensionId[]) {
    result[key] = Math.max(0, Math.min(100, result[key] + adjustments[key]));
  }
  return result;
}
