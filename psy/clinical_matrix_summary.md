# Clinical Matrix Summary
## Cross-Test Correlation Engine — Nafees Psychometric Platform

---

## 1. Architecture Overview

The Nafees platform integrates four independent psychometric measurement systems into a unified trait space. The **CorrelationMatrix engine** (`src/engine/CorrelationMatrix.ts`) computes the degree of coherence across all four systems and surfaces meaningful patterns as amplifiers or tensions.

| System | Test | Dimensions | Tier Support |
|---|---|---|---|
| Big Five Personality | OCEAN (NEO-PI-R adapted) | N, E, O, A, C (0–100) | Core (25 q) / Deep (60 q) |
| Adult Attachment | ECR-R adapted | Anxiety %, Avoidance % (0–100) | Core (8 q) / Deep (36 q) |
| Early Maladaptive Schemas | YSQ-S3R adapted | S1–S7 (0–100) | Core (14 q) / Deep (49 q) |
| Social Patterns | IPC-inspired | D, Au, SA, AS % (0–100) | Core (12 q) / Deep (49 q) |

All scores are normalized to a **0–100 scale centered at 50** (neutral). Scores above 65 are considered elevated; below 35, low.

---

## 2. Mathematical Framework

### 2.1 Expected Value Formula
Given a peer-reviewed Pearson correlation *r* between trait A and trait B, the expected value of B given an observed value of A is:

```
E[B | A] = 50 + r × (A − 50)
```

Both A and B are on the 0–100 scale. The center (50) represents the population mean. The formula preserves the directional relationship encoded by *r*.

### 2.2 Pair Coherence
For each cross-test rule, pair coherence is computed as:

```
pairCoherence = max(0, min(1, 1 − |B_observed − E[B | A]| / 50))
```

A coherence of 1.0 means the two traits align perfectly with the expected correlation. A coherence of 0.0 means maximum disagreement (deviation ≥ 50 points from expectation).

### 2.3 Overall Coherence
The overall coherence score (0–100) is the mean of all applicable pair coherences:

```
overallCoherence = round(mean(pairCoherence_i) × 100)
```

Only rules where both trait values are available (test completed) are included in the mean.

### 2.4 Insight Magnitude
Magnitude measures signal strength — how far both traits deviate from neutral — independently of whether the pattern is an amplifier or tension:

```
magnitude = round((|A − 50| + |B − 50|) / 2)
```

This correctly handles both positive and negative *r* pairs. An amplifier with A=80, B=80 and *r*=+0.5 produces magnitude=30. A negative-*r* amplifier with A=80, B=20 and *r*=−0.4 also produces magnitude=30.

### 2.5 Amplifier vs. Tension Classification
A pair is classified as:
- **Amplifier**: both traits deviate in the direction predicted by *r* (strong mutual reinforcement)
- **Tension**: traits deviate in opposite directions from what *r* predicts (conflicting signals)
- **Coherent**: one or both traits are near neutral (no strong signal)

Surfacing thresholds:
- Amplifiers: `magnitude > 20`
- Tensions: `magnitude > 15`

---

## 3. Cross-Test Correlation Rules

The engine uses **21 rules** derived from five peer-reviewed sources. Rules are organized by measurement system pair.

### 3.1 OCEAN × Attachment (Noftle & Shaver, 2006)

| Rule ID | Trait A | Trait B | r | Interpretation |
|---|---|---|---|---|
| `N_anxiety` | Neuroticism | Attachment Anxiety | **+0.50** | High N predicts heightened separation anxiety and hyperactivation of attachment system |
| `E_avoidance` | Extraversion | Attachment Avoidance | **−0.35** | High E predicts lower dismissive avoidance; introverts show more deactivating strategies |
| `A_anxiety` | Agreeableness | Attachment Anxiety | **−0.20** | High A (cooperative, trusting) predicts lower anxiety in relationships |
| `C_avoidance` | Conscientiousness | Attachment Avoidance | **−0.18** | Organized, responsible individuals tend to invest more in relationship maintenance |

**Source:** Noftle, E. E., & Shaver, P. R. (2006). Attachment dimensions and the Big Five personality traits: Associations and comparative ability to predict relationship quality. *Journal of Research in Personality, 40*(2), 179–208.

---

### 3.2 OCEAN × Early Maladaptive Schemas (Thimm, 2010)

| Rule ID | Trait A | Trait B | r | Interpretation |
|---|---|---|---|---|
| `N_S1` | Neuroticism | S1 (Abandonment/Instability) | **+0.55** | High N amplifies fear of losing significant others; emotional reactivity feeds abandonment vigilance |
| `N_S4` | Neuroticism | S4 (Defectiveness/Shame) | **+0.50** | Negative affectivity fuels self-critical internal narrative; shame is emotionally activated |
| `N_S3` | Neuroticism | S3 (Mistrust/Abuse) | **+0.45** | Hypervigilance to threat generalizes to interpersonal danger perception |
| `A_S2` | Agreeableness | S2 (Social Isolation/Alienation) | **−0.40** | High A (warm, cooperative) predicts lower sense of isolation; inverse relationship |
| `C_S7` | Conscientiousness | S7 (Unrelenting Standards) | **+0.45** | High C's internal drive for order and achievement aligns with perfectionistic schema activation |
| `C_S6` | Conscientiousness | S6 (Negativity/Pessimism) | **−0.35** | High C's goal-directedness and planning buffer against pervasive negative outlook |

**Source:** Thimm, J. C. (2010). Personality and early maladaptive schemas: A five-factor model perspective. *Journal of Behavior Therapy and Experimental Psychiatry, 41*(4), 373–380.

---

### 3.3 Attachment × Early Maladaptive Schemas (Mikulincer & Shaver, 2007)

| Rule ID | Trait A | Trait B | r | Interpretation |
|---|---|---|---|---|
| `anxiety_S1` | Attachment Anxiety | S1 (Abandonment/Instability) | **+0.60** | Hyperactivating attachment strategy directly feeds abandonment schema; strongest cross-test link |
| `avoidance_S2` | Attachment Avoidance | S2 (Social Isolation/Alienation) | **+0.55** | Deactivating attachment strategy (emotional distance) reinforces schema of alienation |
| `avoidance_S3` | Attachment Avoidance | S3 (Mistrust/Abuse) | **+0.40** | Dismissive stance includes generalized distrust of others' motives |
| `anxiety_S4` | Attachment Anxiety | S4 (Defectiveness/Shame) | **+0.45** | Fear of abandonment often co-occurs with belief that one is fundamentally flawed or unlovable |

**Source:** Mikulincer, M., & Shaver, P. R. (2007). *Attachment in Adulthood: Structure, Dynamics, and Change* (Ch. 12). Guilford Press.

---

### 3.4 OCEAN × Social Patterns (McCrae & Costa, 2003; Hogan & Holland, 2003)

| Rule ID | Trait A | Trait B | r | Interpretation |
|---|---|---|---|---|
| `E_SA` | Extraversion | Social Accommodation | **+0.35** | Extraverts are more willing to adjust their behavior to social contexts |
| `A_SA` | Agreeableness | Social Accommodation | **+0.45** | Cooperative, conflict-averse individuals show higher social accommodation |
| `E_AS` | Extraversion | Attention Seeking | **+0.40** | Extraverts derive energy from social engagement and tend to seek social recognition |
| `C_D` | Conscientiousness | Dominance | **+0.30** | Goal-directed, disciplined individuals are more likely to occupy leadership and assertive roles |
| `N_SA` | Neuroticism | Social Accommodation | **+0.28** | Emotional reactivity slightly predicts people-pleasing behavior as anxiety management |

**Sources:**
- McCrae, R. R., & Costa, P. T. (2003). *Personality in Adulthood: A Five-Factor Theory Perspective* (2nd ed.). Guilford Press.
- Hogan, R., & Holland, B. (2003). Using theory to evaluate personality and job-performance relations: A socioanalytic perspective. *Journal of Applied Psychology, 88*(1), 100–112.

---

### 3.5 Attachment × Social Patterns (Mikulincer & Shaver, 2007 — estimated)

| Rule ID | Trait A | Trait B | r | Interpretation |
|---|---|---|---|---|
| `avoidance_Au` | Attachment Avoidance | Autonomy | **+0.35** | Dismissing individuals prefer self-reliance and resist social interdependence |
| `anxiety_SA` | Attachment Anxiety | Social Accommodation | **+0.30** | Preoccupied individuals may use social accommodation to prevent feared rejection |

**Note:** These two rules are extrapolated from the broader Mikulincer & Shaver (2007) framework on behavioral systems. The *r* values are conservative estimates, not direct meta-analytic figures.

---

## 4. Dual-Tier Architecture

All four test systems support a **Core** and **Deep** tier. The tier system allows users to choose between a brief screening (Core) and a comprehensive clinical assessment (Deep).

### 4.1 Core Question Selection Criteria
Core questions are selected based on:
1. **Highest factor loadings** on their respective subscale
2. **Discriminant validity** — questions that separate extreme profiles most clearly
3. **Convergent validity** — questions most strongly correlated with the parent construct
4. **Clinical precedent** — inclusion in validated short-form versions of the instrument

### 4.2 Tier Counts

| Test | Core Questions | Deep Questions | Core Est. Time | Deep Est. Time |
|---|---|---|---|---|
| OCEAN | 25 | 60 | 5 min | 15 min |
| Attachment (ECR-R) | 8 | 36 | 2 min | 10 min |
| Schema (YSQ) | 14 | 49 | 4 min | 12 min |
| Social Patterns (IPC) | 12 | 49 | 3 min | 10 min |

### 4.3 Core Question Assignments

**Attachment — Core (8 questions):**
- Anxiety subscale (4): a001, a004, a007, a016
- Avoidance subscale (4): a019, a021, a022, a035

**Schema — Core (2 per schema, 14 total):**
- S1 Abandonment: s1q1, s1q4
- S2 Mistrust: s2q1, s2q5
- S3 Emotional Deprivation: s3q3, s3q5
- S4 Defectiveness: s4q1, s4q3
- S5 Dependence: s5q1, s5q3
- S6 Vulnerability: s6q2, s6q5
- S7 Unrelenting Standards: s7q2, s7q5

**Social Patterns — Core (3 per axis, 12 total):**
- Dominance (D): sp001, sp005, sp008
- Autonomy (Au): sp015, sp016, sp022
- Social Accommodation (SA): sp027, sp029, sp033
- Attention Seeking (AS): sp038, sp042, sp046

---

## 5. TraitVector Data Model

The `TraitVector` interface carries all psychometric scores used by the correlation engine:

```typescript
interface TraitVector {
  ocean: Partial<Record<'N' | 'E' | 'O' | 'A' | 'C', number>>;
  attachmentAnxiety: number;     // ECR-R Anxiety subscale, 0–100
  attachmentAvoidance: number;   // ECR-R Avoidance subscale, 0–100
  schemas: Partial<Record<'S1'|'S2'|'S3'|'S4'|'S5'|'S6'|'S7', number>>;
  completedTests: Set<'ocean' | 'attachment' | 'schema'>;
}
```

Social Patterns axes (D, Au, SA, AS) are stored separately in `localStorage` under key `nafees_social_patterns_result` and are read on demand by `loadSocialAxis()` in the engine. This decoupling keeps `TraitVector` clean for synthesis while allowing the correlation engine to incorporate all four systems.

---

## 6. Synthesis Gate (Anti-Hallucination Protocol)

The synthesis narrative is gated by the number of completed tests:

| Completed Tests | Synthesis Output |
|---|---|
| 0 | Returns null — no data |
| 1–2 | LockedSynthesisGate (blurred ghost + lock overlay) — partial data warning |
| 3 | Full synthesis: 5 dimensions + persona + correlation matrix |

The correlation matrix itself activates with ≥2 completed tests, but the narrative Partner's Guide and coherence panel in `SynthesisPage` are gated on full 3/3 completion.

---

## 7. Key References

1. Noftle, E. E., & Shaver, P. R. (2006). Attachment dimensions and the Big Five personality traits. *Journal of Research in Personality, 40*(2), 179–208.
2. Thimm, J. C. (2010). Personality and early maladaptive schemas. *Journal of Behavior Therapy and Experimental Psychiatry, 41*(4), 373–380.
3. Mikulincer, M., & Shaver, P. R. (2007). *Attachment in Adulthood*. Guilford Press.
4. McCrae, R. R., & Costa, P. T. (2003). *Personality in Adulthood: A Five-Factor Theory Perspective* (2nd ed.). Guilford Press.
5. Hogan, R., & Holland, B. (2003). Using theory to evaluate personality and job-performance relations. *Journal of Applied Psychology, 88*(1), 100–112.
6. Young, J. E., Klosko, J. S., & Weishaar, M. E. (2003). *Schema Therapy: A Practitioner's Guide*. Guilford Press.
7. Fraley, R. C., Waller, N. G., & Brennan, K. A. (2000). An item response theory analysis of self-report measures of adult attachment. *Journal of Personality and Social Psychology, 78*(2), 350–365.
