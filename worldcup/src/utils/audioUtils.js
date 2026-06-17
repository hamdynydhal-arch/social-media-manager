let audioCtx = null

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

export function playGoalSound() {
  try {
    const ctx = getCtx()
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12)
      gain.gain.setValueAtTime(0.4, ctx.currentTime + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3)
      osc.start(ctx.currentTime + i * 0.12)
      osc.stop(ctx.currentTime + i * 0.12 + 0.35)
    })
  } catch {}
}

export function playNotificationSound() {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1)
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch {}
}

// Try to play the pre-generated WAV file first; fall back to synthesised sound
let whistleAudio = null
const WHISTLE_SRC = (import.meta.env.BASE_URL || '/') + 'sounds/whistle.wav'

function loadWhistle() {
  if (whistleAudio) return whistleAudio
  try {
    whistleAudio = new Audio(WHISTLE_SRC)
    whistleAudio.preload = 'auto'
  } catch { whistleAudio = null }
  return whistleAudio
}

// Pre-load on first import so it's ready when needed
loadWhistle()

function synthesiseWhistle() {
  try {
    const ctx = getCtx()
    const BURSTS = [
      { t0: 0.00, dur: 0.28 },
      { t0: 0.42, dur: 0.28 },
      { t0: 0.84, dur: 0.75 },
    ]
    BURSTS.forEach(({ t0, dur }) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(2800, ctx.currentTime + t0)
      osc.frequency.linearRampToValueAtTime(2950, ctx.currentTime + t0 + dur * 0.3)
      osc.frequency.linearRampToValueAtTime(2800, ctx.currentTime + t0 + dur)
      gain.gain.setValueAtTime(0, ctx.currentTime + t0)
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + t0 + 0.02)
      gain.gain.setValueAtTime(0.35, ctx.currentTime + t0 + dur - 0.05)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + t0 + dur)
      osc.start(ctx.currentTime + t0)
      osc.stop(ctx.currentTime + t0 + dur + 0.05)
    })
  } catch {}
}

export function playWhistleSound() {
  // 1. Vibration — referee whistle pattern (short-short-long)
  haptic([300, 100, 300, 100, 800])

  // 2. Audio — try WAV file first, synthesise as fallback
  const audio = loadWhistle()
  if (audio) {
    audio.currentTime = 0
    audio.play().catch(() => synthesiseWhistle())
  } else {
    synthesiseWhistle()
  }
}

export function playBreakingNewsSound() {
  // Urgent staccato vibration: 3 short bursts + 1 sustained
  haptic([100, 80, 100, 80, 200, 80, 500])
  try {
    const ctx = getCtx()
    // 3 sharp alarm pips then a lower sustained tone
    const BURSTS = [
      { t0: 0.00, freq: 1380, dur: 0.13 },
      { t0: 0.24, freq: 1380, dur: 0.13 },
      { t0: 0.48, freq: 1380, dur: 0.13 },
      { t0: 0.72, freq:  960, dur: 0.35 },
    ]
    BURSTS.forEach(({ t0, freq, dur }) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + t0)
      osc.frequency.linearRampToValueAtTime(freq * 0.88, ctx.currentTime + t0 + dur)
      gain.gain.setValueAtTime(0.38, ctx.currentTime + t0)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t0 + dur)
      osc.start(ctx.currentTime + t0)
      osc.stop(ctx.currentTime + t0 + dur + 0.02)
    })
  } catch {}
}

export function haptic(pattern = [50]) {
  if (navigator.vibrate) navigator.vibrate(pattern)
}
