import { getFrequency } from '../data/chords.js'

let audioContext = null

export async function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }
  return audioContext
}

function getContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

export function useAudio() {
  let currentNodes = []

  async function ensureContext() {
    const ctx = getContext()
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
    return ctx
  }

  async function playChord(strings, duration = 1.5) {
    stopAll()
    const ctx = await ensureContext()
    const now = ctx.currentTime

    strings.forEach((fret, stringIndex) => {
      if (fret < 0) return
      const freq = getFrequency(stringIndex, fret)
      if (freq <= 0) return

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now)
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + duration)
      currentNodes.push({ osc, gain })
    })
  }

  async function playNote(fret, stringIndex, duration = 0.5) {
    const ctx = await ensureContext()
    const now = ctx.currentTime
    const freq = getFrequency(stringIndex, fret)
    if (freq <= 0) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + duration)
  }

  async function playString(stringIndex, duration = 0.8) {
    const ctx = await ensureContext()
    const now = ctx.currentTime
    const freq = getFrequency(stringIndex, 0)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.15, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + duration)
  }

  function playTone(freq, duration = 0.3, type = 'sine', volume = 0.3) {
    const ctx = getContext()
    const now = ctx.currentTime
    
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + duration)
  }

  function playCorrect() {
    // Play a pleasant major chord arpeggio
    playTone(523.25, 0.15, 'sine', 0.2) // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.2), 80) // E5
    setTimeout(() => playTone(783.99, 0.3, 'sine', 0.25), 160) // G5
  }

  function playWrong() {
    // Play a dissonant sound
    playTone(200, 0.3, 'sawtooth', 0.15)
    playTone(220, 0.3, 'sawtooth', 0.15)
  }

  function playClick(accent = false) {
    const ctx = getContext()
    const now = ctx.currentTime
    
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'square'
    osc.frequency.setValueAtTime(accent ? 1000 : 800, now)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(accent ? 0.3 : 0.2, now + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.05)
  }

  function stopAll() {
    currentNodes.forEach(({ osc, gain }) => {
      try {
        gain.gain.cancelScheduledValues(osc.context.currentTime)
        gain.gain.setValueAtTime(0, osc.context.currentTime)
        osc.stop()
      } catch { /* empty */ }
    })
    currentNodes = []
  }

  return { 
    playChord, 
    playNote, 
    playString, 
    playTone,
    playCorrect,
    playWrong,
    playClick,
    stopAll,
    initAudio
  }
}