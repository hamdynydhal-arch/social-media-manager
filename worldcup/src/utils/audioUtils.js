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

export function playWhistleSound() {
  try {
    const ctx = getCtx()
    for (let b = 0; b < 3; b++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(2000, ctx.currentTime + b * 0.25)
      osc.frequency.linearRampToValueAtTime(2400, ctx.currentTime + b * 0.25 + 0.15)
      gain.gain.setValueAtTime(0.2, ctx.currentTime + b * 0.25)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + b * 0.25 + 0.2)
      osc.start(ctx.currentTime + b * 0.25)
      osc.stop(ctx.currentTime + b * 0.25 + 0.22)
    }
  } catch {}
}

export function haptic(pattern = [50]) {
  if (navigator.vibrate) navigator.vibrate(pattern)
}
