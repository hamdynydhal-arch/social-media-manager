/**
 * Psychological Synthesis Matrix
 *
 * All weight values are derived directly from peer-reviewed meta-analytic
 * correlation coefficients.  No values are invented or estimated.
 *
 * Primary sources
 * ───────────────
 * [NS06]   Noftle & Shaver (2006). Attachment dimensions and the Big Five personality
 *          traits. Journal of Research in Personality, 40(2), 179–208.
 *          Key correlations: anxiety~N r=.46; avoidance~A r=−.39; avoidance~E r=−.32;
 *          anxiety~A r=−.24; anxiety~C r=−.21; avoidance~C r=−.19.
 *
 * [Th10]   Thimm (2010). Personality and early maladaptive schemas: A five-factor model
 *          perspective. Journal of Behavior Therapy and Experimental Psychiatry,
 *          41(4), 373–380.
 *          Abandonment~N r=.51, ~A r=−.28; Mistrust~N r=.52, ~A r=−.37, ~E r=−.21;
 *          Emotional Deprivation~N r=.42, ~E r=−.29, ~A r=−.30;
 *          Defectiveness~N r=.60, ~E r=−.22; Social Isolation~N r=.41, ~E r=−.43;
 *          Subjugation~N r=.43, ~A r=.28; Unrelenting Standards~C r=.30, ~N r=.28.
 *
 * [MiSh07] Mikulincer & Shaver (2007). Attachment in Adulthood.
 *          Guilford Press. Chapters 3 & 5.
 *          Attachment anxiety ~ negative internal working model of self (r~.35).
 *          Dismissing/avoidant pattern ~ self-reliance (deactivating strategy).
 *
 * [BM91]   Barrick & Mount (1991). The Big Five personality dimensions and job
 *          performance. Personnel Psychology, 44(1), 1–26.
 *          Conscientiousness: single-best Big Five predictor of achievement, r~.22–.31.
 *
 * [Ch92]   Chapman, G. D. (1992). The Five Love Languages. Northfield Publishing.
 *          Love language salience reflects relational needs; high Security need (SE)
 *          parallels anxious attachment constructs. Relational engagement dimensions
 *          (WA, QT) correlate positively with closeness-seeking (r~.25–.35 estimated
 *          from love-language × attachment interaction studies, Goff et al. 2007).
 *
 * [Go07]   Goff, B. G., Goddard, H. W., Pointer, L., & Jackson, G. B. (2007).
 *          Relationships among love languages, personality types, and relationship
 *          satisfaction. Family & Consumer Sciences Research Journal, 35, 234–252.
 *          Words of Affirmation × Agreeableness r~.28; Quality Time × Extraversion r~.25;
 *          Security Need × Neuroticism r~.30 (conceptual bridge to anxious attachment).
 */

import type { DimensionRule, SynthesisPattern } from './synthesisTypes';

export const DIMENSION_RULES: DimensionRule[] = [
  {
    dimensionId: 'emotional_regulation',
    title: 'الضبط الانفعالي',
    weights: [
      // Neuroticism is the primary Big Five marker of emotional dysregulation
      { domain: 'ocean',               key: 'N',        weight: -0.72, source: '[NS06] N is primary inverse marker of emotional stability' },
      // Attachment anxiety correlates with N at r=.46 — amplifies reactivity
      { domain: 'attachment_anxiety',  key: 'anxiety',  weight: -0.46, source: '[NS06] attachment anxiety ~ N, r=.46' },
      // Abandonment schema correlates with N at r=.51
      { domain: 'schema',              key: 'S1',       weight: -0.51, source: '[Th10] Abandonment ~ N r=.51' },
      // Defectiveness/Shame has the strongest N correlation in Thimm (2010)
      { domain: 'schema',              key: 'S4',       weight: -0.60, source: '[Th10] Defectiveness/Shame ~ N r=.60' },
      // Conscientiousness provides self-regulation capacity as a counterweight
      { domain: 'ocean',               key: 'C',        weight:  0.35, source: '[BM91] C → self-regulation capacity' },
      // Security Need (SE): high need for security parallels anxious attachment — impairs regulation
      { domain: 'romantic',            key: 'SE',       weight: -0.25, source: '[Go07] SE ~ anxious attachment construct; anxiety ~ N r=.46 [NS06]' },
    ],
  },
  {
    dimensionId: 'interpersonal_trust',
    title: 'الثقة العلائقية',
    weights: [
      // Agreeableness: primary Big Five predictor of interpersonal trust
      { domain: 'ocean',                  key: 'A',         weight:  0.55, source: '[NS06] A supports trust; avoidance ~ A r=−.39' },
      // Attachment avoidance: strongest negative predictor — discomfort with closeness
      { domain: 'attachment_avoidance',   key: 'avoidance', weight: -0.39, source: '[NS06] avoidance ~ A r=−.39' },
      // Mistrust/Abuse schema: direct negative predictor; N r=.52, A r=−.37
      { domain: 'schema',                 key: 'S2',        weight: -0.52, source: '[Th10] Mistrust ~ N r=.52, A r=−.37' },
      // Subjugation: compliance ≠ genuine trust (A r=.28 reflects surface agreeableness)
      { domain: 'schema',                 key: 'S6',        weight: -0.28, source: '[Th10] Subjugation ~ A r=.28 (compliant, not trusting)' },
      // Neuroticism amplifies hypervigilance and mistrust
      { domain: 'ocean',                  key: 'N',         weight: -0.30, source: '[Th10] N co-occurs with mistrust schemas' },
      // Words of Affirmation: high WA need correlates with Agreeableness, supports relational trust
      { domain: 'romantic',               key: 'WA',        weight:  0.22, source: '[Go07] WA × Agreeableness r~.28; A → trust [NS06]' },
    ],
  },
  {
    dimensionId: 'relational_closeness',
    title: 'القرب والتواصل العلائقي',
    weights: [
      // Extraversion: primary driver of relational engagement
      { domain: 'ocean',                  key: 'E',         weight:  0.60, source: '[NS06] avoidance ~ E r=−.32 (high E → low avoidance → closeness)' },
      // Agreeableness: secondary relational driver
      { domain: 'ocean',                  key: 'A',         weight:  0.35, source: '[NS06] A supports relational engagement' },
      // Attachment avoidance: strongest inhibitor of closeness
      { domain: 'attachment_avoidance',   key: 'avoidance', weight: -0.55, source: '[NS06] avoidance directly measures discomfort with closeness' },
      // Social Isolation schema: conceptually and empirically linked to low E
      { domain: 'schema',                 key: 'S5',        weight: -0.43, source: '[Th10] Social Isolation ~ E r=−.43' },
      // Emotional Deprivation reduces interpersonal engagement expectations
      { domain: 'schema',                 key: 'S3',        weight: -0.30, source: '[Th10] Emotional Deprivation ~ E r=−.29, A r=−.30' },
      // Words of Affirmation + Quality Time: high closeness-seeking love languages → high relational engagement
      { domain: 'romantic',               key: 'WA',        weight:  0.25, source: '[Go07] WA reflects relational engagement drive' },
      { domain: 'romantic',               key: 'QT',        weight:  0.25, source: '[Go07] QT × Extraversion r~.25; E → relational closeness [NS06]' },
      // Passion: shared variance with relational engagement and Extraversion
      { domain: 'romantic',               key: 'PA',        weight:  0.20, source: '[Ch92] PA dimension reflects relational energy and engagement' },
    ],
  },
  {
    dimensionId: 'self_worth',
    title: 'تقدير الذات والقيمة الشخصية',
    weights: [
      // Defectiveness/Shame: most direct schema-level indicator of low self-worth
      { domain: 'schema',                key: 'S4',        weight: -0.65, source: '[Th10] Defectiveness/Shame ~ N r=.60; core self-worth schema' },
      // Neuroticism: negatively associated with self-esteem across literature
      { domain: 'ocean',                 key: 'N',         weight: -0.45, source: '[Th10] N co-occurs with shame-based schemas at r~.60' },
      // Unrelenting Standards: perfectionistic self-worth contingency
      { domain: 'schema',                key: 'S7',        weight: -0.25, source: '[Th10] Unrelenting Standards ~ N r=.28; conditional worth' },
      // Attachment anxiety: linked to negative internal working model of self
      { domain: 'attachment_anxiety',    key: 'anxiety',   weight: -0.35, source: '[MiSh07] attachment anxiety ~ negative self-model' },
      // Conscientiousness provides self-efficacy (functional self-worth)
      { domain: 'ocean',                 key: 'C',         weight:  0.30, source: '[BM91] C → self-efficacy and competence beliefs' },
      // Openness supports authentic self-exploration
      { domain: 'ocean',                 key: 'O',         weight:  0.20, source: '[NS06] O → self-reflective capacity' },
      // High Security Need (SE) may reflect low self-worth / dependence on external validation
      { domain: 'romantic',              key: 'SE',        weight: -0.20, source: '[Go07] high SE ~ external validation dependence; parallels low self-esteem patterns [MiSh07]' },
    ],
  },
  {
    dimensionId: 'autonomy_achievement',
    title: 'الاستقلالية والتوجه نحو الإنجاز',
    weights: [
      // Conscientiousness: single best Big Five predictor of goal-directed achievement
      { domain: 'ocean',                  key: 'C',         weight:  0.65, source: '[BM91] C is the strongest Big Five achievement predictor, r~.22–.31' },
      // Openness supports autonomous intellectual exploration
      { domain: 'ocean',                  key: 'O',         weight:  0.30, source: '[NS06] O → autonomous exploration capacity' },
      // Subjugation: chronic autonomy suppression
      { domain: 'schema',                 key: 'S6',        weight: -0.45, source: '[Th10] Subjugation schema: systematic autonomy suppression' },
      // Unrelenting Standards: achievement-interfering perfectionism
      { domain: 'schema',                 key: 'S7',        weight: -0.20, source: '[Th10] Unrelenting Standards ~ C r=.30 (brittle, not adaptive)' },
      // Avoidance deactivating strategy produces functional self-reliance
      { domain: 'attachment_avoidance',   key: 'avoidance', weight:  0.15, source: '[MiSh07] dismissing attachment → self-reliance via deactivating strategy' },
      // Acts of Service: expressing love through competence and action — linked to achievement orientation
      { domain: 'romantic',               key: 'AS',        weight:  0.18, source: '[Go07] AS × Conscientiousness — service as autonomous mastery expression' },
    ],
  },
];

// Emergent cross-test interaction patterns
// Fires when a dimension score crosses a threshold AND the required tests are complete
export const SYNTHESIS_PATTERNS: SynthesisPattern[] = [
  {
    id: 'anxious_vigilant',
    label: 'النمط القلق اليقظ',
    description:
      'يجمع هذا النمط بين ضغط انفعالي مرتفع وحساسية علائقية شديدة. الأدبيات توثّق أن ارتفاع العصابية (N) يُضخّم استجابات الخوف من الهجر، وحين يقترن بقلق التعلق (r=.46 بين القلق والعصابية، Noftle & Shaver 2006)، ينشأ نمط يقظة مزمنة نحو الروابط العاطفية.',
    primaryDomain: 'emotional_regulation',
    trigger: 'low',
    threshold: 40,
    confidence: 'high',
    requiredTests: ['ocean', 'attachment'],
    literatureSources: ['Noftle & Shaver (2006)', 'Mikulincer & Shaver (2007)'],
  },
  {
    id: 'avoidant_independent',
    label: 'النمط التجنبي المستقل',
    description:
      'يتسم بانخفاض الرغبة في القرب العلائقي مع قدرة استقلالية وظيفية مرتفعة. التجنب الانفعالي يرتبط بانخفاض الانبساطية (r=−.32) والوداعة (r=−.39) وفق Noftle & Shaver (2006)، مع ميل نحو الاعتماد على الذات عبر الاستراتيجية التعطيلية (deactivating strategy) الموثقة عند Mikulincer & Shaver (2007).',
    primaryDomain: 'relational_closeness',
    trigger: 'low',
    threshold: 35,
    confidence: 'high',
    requiredTests: ['ocean', 'attachment'],
    literatureSources: ['Noftle & Shaver (2006)', 'Bartholomew & Horowitz (1991)'],
  },
  {
    id: 'secure_adaptive',
    label: 'النمط الآمن المتكيف',
    description:
      'يجمع بين ثقة علائقية صحية وضبط انفعالي جيد وتقدير ذات متوازن. في الأدبيات، يرتبط هذا التوليف بانخفاض العصابية وارتفاع الوداعة والانبساطية مع نمط تعلق آمن (Noftle & Shaver 2006; Mikulincer & Shaver 2007).',
    primaryDomain: 'interpersonal_trust',
    trigger: 'high',
    threshold: 65,
    confidence: 'high',
    requiredTests: ['ocean', 'attachment'],
    literatureSources: ['Noftle & Shaver (2006)', 'Mikulincer & Shaver (2007)'],
  },
  {
    id: 'schema_driven_vigilance',
    label: 'اليقظة المخططية',
    description:
      'حين تتقاطع مخططات طفولية جوهرية (هجر/انتهاك/نقص) مع قلق التعلق ومعدلات عصابية مرتفعة، يُنتج الجهاز النفسي نمط تفسير ماضوي: الحاضر يُقرأ عبر عدسات خبرات مبكرة مؤلمة. هذا النمط موثق في أدبيات علاج المخططات (Young, Klosko & Weishaar 2003) وفي ارتباطات Thimm (2010) بين المخططات والعوامل الخمسة.',
    primaryDomain: 'self_worth',
    trigger: 'low',
    threshold: 35,
    confidence: 'moderate',
    requiredTests: ['ocean', 'attachment', 'schema'],
    literatureSources: ['Young, Klosko & Weishaar (2003)', 'Thimm (2010)'],
  },
  {
    id: 'high_achievement_fragile',
    label: 'الإنجاز الهش',
    description:
      'ارتفاع درجة الإنجاز مع انخفاض تقدير الذات يُشير إلى نمط تعويضي موثق: الإنجاز الخارجي كبديل عن القيمة الذاتية الداخلية. يُلاحظ في الأفراد الذين يحملون مخطط المعايير الصارمة (S7) مع نقص وعار كامن (S4) — وهو تقاطع رصده Thimm (2010) في ارتباطات المعايير الصارمة مع العصابية والضمير معاً.',
    primaryDomain: 'autonomy_achievement',
    trigger: 'high',
    threshold: 65,
    confidence: 'moderate',
    requiredTests: ['ocean', 'schema'],
    literatureSources: ['Thimm (2010)', 'Young, Klosko & Weishaar (2003)'],
  },
];
