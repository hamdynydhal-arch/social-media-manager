// Attachment Theory — Bowlby (1969, 1988) & Ainsworth et al. (1978)
// ECR-R — Fraley, Waller, & Brennan (2000)

export type AttachmentAxis = 'anxiety' | 'avoidance';
export type AttachmentPattern = 'secure' | 'anxious' | 'dismissing' | 'fearful';

export interface AttachmentQuestion {
  id: string;
  text: string;
  axis: AttachmentAxis;
  direction: 'direct' | 'reverse';
  tier?: 'core' | 'deep';
}

export interface AttachmentTestData {
  id: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  version: string;
  likertMin: number;
  likertMax: number;
  questions: AttachmentQuestion[];
}

export interface AttachmentResult {
  anxietyScore: number;    // mean 1–7
  avoidanceScore: number;  // mean 1–7
  anxietyPct: number;      // 0–100 for display
  avoidancePct: number;    // 0–100 for display
  pattern: AttachmentPattern;
  answers: Record<string, number>;
  tier?: 'core' | 'deep';
  questionCount?: number;
}

export interface PatternRecommendations {
  selfAwareness: string;
  communication: string;
  therapy: string;
  growth: string;
}

export interface PatternContent {
  pattern: AttachmentPattern;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  intro: string;
  strengths: string[];
  challenges: string[];
  strategies: string[];
  recommendations: PatternRecommendations;
}

export interface AttachmentContent {
  disclaimer: string;
  closingMessage: string;
  references: string[];
  patterns: Record<AttachmentPattern, PatternContent>;
}
