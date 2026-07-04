import type { FactorKey, Level } from './types';
import type { SchemaKey } from './schemaTypes';
import type { RomanticAxis } from './romanticTypes';

export type PersonaDimensionId =
  | 'emotional_regulation'
  | 'interpersonal_trust'
  | 'relational_closeness'
  | 'self_worth'
  | 'autonomy_achievement';

export type ConfidenceLevel = 'high' | 'moderate' | 'low';

// Normalised trait scores (all on a 0–100 scale) built from completed tests
export interface TraitVector {
  ocean: Partial<Record<FactorKey, number>>;
  attachmentAnxiety: number;
  attachmentAvoidance: number;
  schemas: Partial<Record<SchemaKey, number>>;
  romanticAxes: Partial<Record<RomanticAxis, number>>;
  completedTests: Set<'ocean' | 'attachment' | 'schema' | 'romantic'>;
}

// A single entry in the SynthesisMatrix, weight sourced from published literature
export interface MatrixWeight {
  domain: 'ocean' | 'attachment_anxiety' | 'attachment_avoidance' | 'schema' | 'romantic';
  key: string;
  // Signed correlation-derived weight (+/-).  Positive = higher trait → higher dimension score.
  weight: number;
  source: string;
}

export interface DimensionRule {
  dimensionId: PersonaDimensionId;
  title: string;
  weights: MatrixWeight[];
}

// An emergent cross-test interaction pattern
export interface SynthesisPattern {
  id: string;
  label: string;
  description: string;
  primaryDomain: PersonaDimensionId;
  trigger: 'high' | 'low';
  threshold: number;
  confidence: ConfidenceLevel;
  requiredTests: ('ocean' | 'attachment' | 'schema')[];
  literatureSources: string[];
}

export interface PersonaDimension {
  id: PersonaDimensionId;
  title: string;
  score: number;   // 0–100, computed by weighted synthesis
  level: Level;
  description: string;
  patterns: SynthesisPattern[];
}

export interface SynthesisResult {
  timestamp: number;
  completedTests: ('ocean' | 'attachment' | 'schema' | 'romantic')[];
  confidence: ConfidenceLevel;
  dimensions: PersonaDimension[];
  primaryNarrative: string;
  keyInsights: string[];
  /** 0–100 overall data-quality score (tests + demographics) */
  dataCompleteness?: number;
  /** Whether demographic adjustments were applied this run */
  demographicAdjustmentsApplied?: boolean;
  /** Per-dimension adjustment amounts (for transparency) */
  demographicAdjustments?: Partial<Record<PersonaDimensionId, number>>;
  /** OCEAN tier used when the personality test was taken */
  oceanTier?: 'core' | 'deep';
}
