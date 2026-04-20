let sharedContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!sharedContext) {
    const win = window as typeof window & { webkitAudioContext?: typeof AudioContext }
    sharedContext = new (window.AudioContext || win.webkitAudioContext)()
  }
  if (sharedContext.state === 'suspended') {
    sharedContext.resume()
  }
  return sharedContext
}

export function useAudioPlayer() {
  function playBeep(frequency: number = 880, duration: number = 0.15, volume: number = 0.3) {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = frequency
      gain.gain.value = volume
      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch {
      // Audio not available
    }
  }

  function playChime(frequencies: number[] = [523, 659, 784], duration: number = 0.2, volume: number = 0.3) {
    try {
      const ctx = getAudioContext()
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = freq
        gain.gain.value = volume
        osc.start(ctx.currentTime + i * duration)
        osc.stop(ctx.currentTime + i * duration + duration * 0.8)
      })
    } catch {
      // Audio not available
    }
  }

  return { playBeep, playChime, getAudioContext }
}