export type SchemaKey = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7';
export type SchemaMode = 'vulnerable' | 'rejected' | 'abused' | 'subjugated' | 'critic' | 'healthy';
export type SchemaDomain = 'family' | 'peers' | 'experiential' | 'general';

export interface SchemaQuestion {
  id: string;
  text: string;
  domain: SchemaDomain;
  weights: Partial<Record<SchemaKey, number>>;
  tier?: 'core' | 'deep';
}

export interface SchemaResult {
  testId: string;
  completedAt: string;
  scores: Record<SchemaKey, number>;
  percentages: Record<SchemaKey, number>;
  activeSchemas: SchemaKey[];
  primarySchema: SchemaKey;
  mode: SchemaMode;
  tier?: 'core' | 'deep';
  questionCount?: number;
}

export interface SchemaPatternContent {
  id: SchemaKey;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  barColor: string;
  gradientFrom: string;
  gradientTo: string;
  coreNeed: string;
  childhoodOrigin: string;
  adultTriggers: string[];
  description: string;
  strengths: string[];
  challenges: string[];
  somatic: string;
  mindfulness: string;
  therapyNote: string;
  growth: string[];
}

export interface SchemaModeContent {
  id: SchemaMode;
  name: string;
  icon: string;
  description: string;
}

export interface SchemaContent {
  schemas: Record<SchemaKey, SchemaPatternContent>;
  modes: Record<SchemaMode, SchemaModeContent>;
  closingMessage: string;
  disclaimer: string;
  references: string[];
}
