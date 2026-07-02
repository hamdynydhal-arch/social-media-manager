export type QuestionType = 'likert' | 'boolean' | 'single_choice' | 'multiple_choice';
export type Direction = 'direct' | 'reverse';
export type FactorKey = 'E' | 'A' | 'C' | 'N' | 'O';
export type Level = 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
export type OceanTier = 'core' | 'deep';

// NEO PI-R 30 facets (Costa & McCrae, 1992) — 6 per factor
export type FacetKey =
  | 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | 'N6'
  | 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6'
  | 'O1' | 'O2' | 'O3' | 'O4' | 'O5' | 'O6'
  | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6'
  | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';

export interface LikertOption {
  value: number;
  label: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  factor?: FactorKey;
  facet?: FacetKey;
  direction?: Direction;
  weight?: number;
  tier?: OceanTier;
  options?: { value: number | boolean; label: string }[];
}

export interface FactorScoringConfig {
  name: string;
  // Five buckets: [0,veryLow) very_low | [veryLow,low) low | [low,high) medium | [high,veryHigh) high | [veryHigh,100] very_high
  veryLowThreshold: number;
  lowThreshold: number;
  highThreshold: number;
  veryHighThreshold: number;
}

export interface ScoringConfig {
  likertMin: number;
  likertMax: number;
  factors: Partial<Record<FactorKey, FactorScoringConfig>>;
}

export interface TestMeta {
  id: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  version: string;
  scoring: ScoringConfig;
  questions: Question[];
}

export interface LevelContent {
  description: string;
  strengths: string[];
  challenges: string[];
  recommendations: {
    work: string;
    relationships: string;
    mentalHealth: string;
    growth: string;
    habits: string;
  };
}

export interface FactorContent {
  name: string;
  shortName: string;
  icon: string;
  color: string;
  levels: Record<Level, LevelContent>;
}

export interface ProfileTitle {
  title: string;
  subtitle: string;
  intro: string;
  dominantFactors: FactorKey[];
  requiredLevels: Partial<Record<FactorKey, Level[]>>;
}

// Sub-type content for the 24 personality sub-types (8 profiles × 3 facet clusters)
export interface SubTypeContent {
  code: string;
  title: string;
  subtitle: string;
  intro: string;
  dominantFacets: FacetKey[];
  strengths: string[];
  challenges: string[];
  recommendations: {
    work: string;
    relationships: string;
    mentalHealth: string;
    growth: string;
    habits: string;
  };
}

// Metadata for each NEO PI-R facet
export interface FacetMeta {
  name: string;       // Arabic name
  factor: FactorKey;
  description: string; // One-sentence Arabic description
}

export interface TestContent {
  factors: Partial<Record<FactorKey, FactorContent>>;
  facets: Record<FacetKey, FacetMeta>;
  profileTitles: ProfileTitle[];
  subTypes: SubTypeContent[];
  references: string[];
  disclaimer: string;
  closingMessage: string;
}

export interface TestResult {
  testId: string;
  timestamp: number;
  answers: Record<string, number>;
  scores: Partial<Record<FactorKey, number>>;
  levels: Partial<Record<FactorKey, Level>>;
  facetScores: Partial<Record<FacetKey, number>>;
  subTypeCode: string;
  tier?: OceanTier;
}
