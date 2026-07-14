let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

export function resumeAudio() {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
}

let wakaState = false

export function playWaka() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'square'

  // Classic Pac-Man waka alternates between two frequencies
  const freq = wakaState ? 260 : 330
  wakaState = !wakaState

  osc.frequency.setValueAtTime(freq, now)
  osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 0.06)

  gain.gain.setValueAtTime(0.18, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.07)
}

export function playPowerPill() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  for (let i = 0; i < 4; i++) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(200 + i * 150, now + i * 0.08)

    gain.gain.setValueAtTime(0.25, now + i * 0.08)
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + i * 0.08)
    osc.stop(now + i * 0.08 + 0.15)
  }
}

export function playEatGhost() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(freq, now + i * 0.06)

    gain.gain.setValueAtTime(0.3, now + i * 0.06)
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + i * 0.06)
    osc.stop(now + i * 0.06 + 0.12)
  })
}

export function playDeath() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'square'
  osc.frequency.setValueAtTime(800, now)
  osc.frequency.exponentialRampToValueAtTime(100, now + 1.5)

  gain.gain.setValueAtTime(0.3, now)
  gain.gain.linearRampToValueAtTime(0.01, now + 1.5)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 1.5)
}

export function playLevelComplete() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  const melody = [523, 659, 784, 1047, 784, 1047]
  melody.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(freq, now + i * 0.12)

    gain.gain.setValueAtTime(0.25, now + i * 0.12)
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.2)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + i * 0.12)
    osc.stop(now + i * 0.12 + 0.2)
  })
}

export function playGameOver() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  const notes = [392, 330, 262, 196]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(freq, now + i * 0.2)

    gain.gain.setValueAtTime(0.25, now + i * 0.2)
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + i * 0.2)
    osc.stop(now + i * 0.2 + 0.3)
  })
}

export function playStartGame() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  const melody = [262, 330, 392, 523]
  melody.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(freq, now + i * 0.1)

    gain.gain.setValueAtTime(0.2, now + i * 0.1)
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.15)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + i * 0.1)
    osc.stop(now + i * 0.1 + 0.15)
  })
}

export function playPause() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'square'
  osc.frequency.setValueAtTime(200, now)

  gain.gain.setValueAtTime(0.15, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.1)
}

export function playAchievement() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  const melody = [523, 659, 784, 1047, 1319]
  melody.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now + i * 0.08)

    gain.gain.setValueAtTime(0.2, now + i * 0.08)
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + i * 0.08)
    osc.stop(now + i * 0.08 + 0.15)
  })
}
