export type QuestionType = 'likert' | 'boolean' | 'single_choice' | 'multiple_choice';
export type Direction = 'direct' | 'reverse';
export type FactorKey = 'E' | 'A' | 'C' | 'N' | 'O';
export type Level = 'very_high' | 'high' | 'medium' | 'low' | 'very_low';

export interface LikertOption {
  value: number;
  label: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  factor?: FactorKey;
  direction?: Direction;
  weight?: number;
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

export interface TestContent {
  factors: Partial<Record<FactorKey, FactorContent>>;
  profileTitles: ProfileTitle[];
  disclaimer: string;
  closingMessage: string;
}

export interface TestResult {
  testId: string;
  timestamp: number;
  answers: Record<string, number>;
  scores: Partial<Record<FactorKey, number>>;
  levels: Partial<Record<FactorKey, Level>>;
}
