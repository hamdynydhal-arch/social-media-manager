export type SocialAxis = 'D' | 'Au' | 'SA' | 'AS';
export type SocialPattern = 'alpha' | 'sigma' | 'beta' | 'delta';
export type PatternIntensity = 'strong' | 'moderate' | 'mild';

export interface SocialPatternsQuestion {
  id: string;
  text: string;
  axis: SocialAxis;
  direction: 'direct' | 'reverse';
}

export interface SocialPatternsResult {
  timestamp: number;
  answers: Record<string, number>;
  dominancePct: number;
  autonomyPct: number;
  accommodationPct: number;
  attentionPct: number;
  patternScores: {
    alpha: number;
    sigma: number;
    beta: number;
    delta: number;
  };
  pattern: SocialPattern;
  intensity: PatternIntensity;
}
