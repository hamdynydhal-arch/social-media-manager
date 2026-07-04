// Romantic & Intimacy Code — مقياس الشيفرة العاطفية والحميمية
// Based on Chapman (1992) love languages + Sternberg (1986) triangular theory
// + Clinical attachment-intimacy research

export type RomanticAxis = 'WA' | 'QT' | 'AS' | 'PT' | 'PA' | 'SE';

export type RomanticArchetype =
  | 'classic_lover'      // العاشق الكلاسيكي
  | 'passionate_explorer' // المستكشف الشغوف
  | 'safe_haven'         // الملاذ الآمن
  | 'practical_romantic'  // الرومانسي العملي
  | 'emotional_dreamer'  // الحالم العاطفي
  | 'silent_knight';     // الفارس الصامت

export type RomanticIntensity = 'strong' | 'moderate' | 'mild';

export interface RomanticQuestion {
  id: string;
  text: string;
  axis: RomanticAxis;
  direction: 'direct' | 'reverse';
  tier?: 'core';
}

export interface RomanticAxisScores {
  WA: number;  // Words of Affirmation (0–100)
  QT: number;  // Quality Time (0–100)
  AS: number;  // Acts of Service (0–100)
  PT: number;  // Physical Touch (0–100)
  PA: number;  // Passion / Romance (0–100)
  SE: number;  // Security Need (0–100)
}

export interface RomanticResult {
  timestamp: number;
  answers: Record<string, number>;
  axisPcts: RomanticAxisScores;
  dominantAxis: RomanticAxis;
  secondaryAxis: RomanticAxis;
  archetype: RomanticArchetype;
  intensity: RomanticIntensity;
  tier: 'core' | 'deep';
  questionCount: number;
}

export interface RomanticArchetypeContent {
  archetype: RomanticArchetype;
  name: string;           // Arabic archetype name
  subtitle: string;       // one-line Arabic subtitle
  icon: string;           // emoji
  color: string;          // Tailwind color class
  gradientFrom: string;
  gradientTo: string;
  intro: string;          // literary opening paragraph
  dominantLang: string;   // primary love language in Arabic
  strengths: string[];    // 3–4 Arabic strengths
  challenges: string[];   // 3–4 Arabic challenges
  growthPath: string;     // paragraph about growth
  partnerGuide: {         // دليل الشريك الحميمي
    understand: string;   // how to understand this archetype
    ignite: string;       // what ignites passion
    extinguish: string;   // what kills the flame
    dailyPractice: string; // one practical daily habit
  };
  spectrumNote: string;   // compassionate note for low scorers
}

export interface RomanticContent {
  disclaimer: string;
  closingMessage: string;
  axisLabels: Record<RomanticAxis, string>;
  archetypes: Record<RomanticArchetype, RomanticArchetypeContent>;
}
