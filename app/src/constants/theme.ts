// Neural Nexus Design System — single source of truth for all brand colors.
// NEVER hardcode hex values in screens or components. Always import from here.

export const Colors = {
  // ── Primary brand: Cyan (logo outer rings)
  cyan: {
    DEFAULT: '#06B6D4',
    light: '#22D3EE',
    lighter: '#67E8F9',
    faint: '#ECFEFF',
    glow: 'rgba(6,182,212,0.18)',
    glowStrong: 'rgba(6,182,212,0.45)',
  },

  // ── Secondary brand: Purple (logo inner rings)
  purple: {
    DEFAULT: '#9333EA',
    dark: '#7C3AED',
    deeper: '#0C1040',
    glow: 'rgba(147,51,234,0.18)',
    faint: '#F5F3FF',
  },

  // ── Accent: Pink (logo center star)
  pink: {
    DEFAULT: '#EC4899',
    glow: 'rgba(236,72,153,0.12)',
  },

  // ── Accent: Gold (logo center core)
  gold: {
    DEFAULT: '#FBBF24',
    dark: '#D97706',
    faint: '#FFFBEB',
  },

  // ── Surfaces
  background: '#F5F8FF',
  surface: '#FFFFFF',
  surfaceFaint: '#EEF9FF',

  // ── Dark canvas (headers, tab bar, login bg)
  dark: {
    header: '#0C1040',
    tabBar: '#07030F',
    loginBg: '#0C0820',
    upgrade: '#07030F',
  },

  // ── Text
  text: {
    primary: '#111827',
    secondary: '#374151',
    muted: '#6B7280',
    faint: '#9CA3AF',
    onDark: '#FFFFFF',
    onDarkSub: 'rgba(103,232,249,0.75)',
  },

  // ── Semantic
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  dangerBorder: '#FECACA',
  success: '#059669',
  successBg: '#ECFDF5',

  // ── Platform brand colors (social networks)
  platforms: {
    x: '#000000',
    instagram: '#E1306C',
    facebook: '#1877F2',
    tiktok: '#010101',
    youtube: '#FF0000',
    linkedin: '#0077B5',
    threads: '#000000',
  },

  // ── Google brand
  google: {
    blue: '#4285F4',
    red: '#EA4335',
    yellow: '#FBBC05',
    green: '#34A853',
  },
} as const;

// Gradient pairs for use with borderColor or decorative layering
export const Gradients = {
  cyanToPurple: ['#06B6D4', '#9333EA'],
  purpleToCyan: ['#9333EA', '#06B6D4'],
  darkHeader: ['#0C1040', '#1a0a3c'],
} as const;

// Shadow presets
export const Shadows = {
  cyan: { shadowColor: '#06B6D4', shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  purple: { shadowColor: '#9333EA', shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  card: { shadowColor: '#06B6D4', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  subtle: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  tab: { shadowColor: '#06B6D4', shadowOpacity: 0.25, shadowRadius: 20, elevation: 20 },
} as const;

// Border radius presets
export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 22,
  card: 22,
  header: 30,
  full: 999,
} as const;
