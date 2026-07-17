const KEY = 'rukn_settings'

export const DEFAULTS = {
  breathMode: 'normal', // 'normal' | '478'
  vibration: true,
}

export function loadSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(s) {
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function getTimings(mode) {
  if (mode === '478') return { inhaleMs: 4000, holdMs: 7000, exhaleMs: 8000, targetCycles: 3 }
  return { inhaleMs: 4000, holdMs: 0, exhaleMs: 6000, targetCycles: 5 }
}
