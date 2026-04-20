import { ref, onUnmounted } from 'vue'

export interface PitchData {
  frequency: number
  note: string
  octave: number
  cents: number
  confidence: number
}

export interface DetectedNote {
  stringIndex: number // 0-5 (low E to high E)
  fret: number
  note: string
  isActive: boolean
}

export function usePitchDetection() {
  const isListening = ref(false)
  const audioContext = ref<AudioContext | null>(null)
  const analyser = ref<AnalyserNode | null>(null)
  const microphone = ref<MediaStreamAudioSourceNode | null>(null)
  const currentPitch = ref<PitchData | null>(null)
  const detectedNotes = ref<DetectedNote[]>([])

  // Guitar standard tuning frequencies (approximate)
  const stringFrequencies = [
    { string: 0, note: 'E', baseFreq: 82.41 }, // Low E (6th string)
    { string: 1, note: 'A', baseFreq: 110.0 }, // A (5th string)
    { string: 2, note: 'D', baseFreq: 146.83 }, // D (4th string)
    { string: 3, note: 'G', baseFreq: 196.0 }, // G (3rd string)
    { string: 4, note: 'B', baseFreq: 246.94 }, // B (2nd string)
    { string: 5, note: 'E', baseFreq: 329.63 }, // High E (1st string)
  ]

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  function frequencyToNote(frequency: number): PitchData | null {
    if (frequency <= 0) return null

    const A4 = 440
    const semitones = 12 * Math.log2(frequency / A4)
    const noteIndex = Math.round(semitones) + 57 // 57 = A4 index
    const octave = Math.floor(noteIndex / 12) - 1
    const note = noteNames[((noteIndex % 12) + 12) % 12]
    const exactSemitones = 12 * Math.log2(frequency / A4)
    const cents = Math.round((exactSemitones - Math.round(semitones)) * 100)

    return {
      frequency,
      note,
      octave,
      cents,
      confidence: 1 - Math.abs(cents) / 100,
    }
  }

  function identifyStringAndFret(frequency: number): DetectedNote[] {
    const pitch = frequencyToNote(frequency)
    if (!pitch || pitch.confidence < 0.8) return []

    const detected: DetectedNote[] = []

    // Check which string this note could be on
    stringFrequencies.forEach(({ string, baseFreq }) => {
      // Calculate how many semitones from the open string
      const semitonesFromOpen = 12 * Math.log2(frequency / baseFreq)
      const fret = Math.round(semitonesFromOpen)

      // Valid frets are 0-24
      if (fret >= 0 && fret <= 24 && Math.abs(semitonesFromOpen - fret) < 0.5) {
        detected.push({
          stringIndex: string,
          fret,
          note: pitch.note,
          isActive: true,
        })
      }
    })

    return detected
  }

  async function startListening(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        },
      })

      const win = window as typeof window & { webkitAudioContext?: typeof AudioContext }
      audioContext.value = new (window.AudioContext || win.webkitAudioContext)()
      analyser.value = audioContext.value.createAnalyser()
      analyser.value.fftSize = 4096

      microphone.value = audioContext.value.createMediaStreamSource(stream)
      microphone.value.connect(analyser.value)

      isListening.value = true
      processAudio()

      return true
    } catch (error) {
      console.error('Failed to access microphone:', error)
      return false
    }
  }

  function processAudio() {
    if (!isListening.value || !analyser.value) return

    const bufferLength = analyser.value.frequencyBinCount
    const dataArray = new Float32Array(bufferLength)
    analyser.value.getFloatTimeDomainData(dataArray)

    // Autocorrelation for pitch detection
    const frequency = detectPitchAutocorrelation(dataArray, audioContext.value!.sampleRate)

    if (frequency > 0) {
      const pitch = frequencyToNote(frequency)
      if (pitch && pitch.confidence > 0.8) {
        currentPitch.value = pitch
        detectedNotes.value = identifyStringAndFret(frequency)
      }
    }

    requestAnimationFrame(processAudio)
  }

  function detectPitchAutocorrelation(buffer: Float32Array, sampleRate: number): number {
    const maxSamples = Math.floor(sampleRate / 65) // Lowest frequency ~65Hz
    const minSamples = Math.floor(sampleRate / 1000) // Highest frequency ~1000Hz

    let bestOffset = -1
    let bestCorrelation = 0
    let rms = 0

    // Calculate RMS
    for (let i = 0; i < buffer.length; i++) {
      rms += buffer[i] * buffer[i]
    }
    rms = Math.sqrt(rms / buffer.length)

    // Not enough signal
    if (rms < 0.01) return 0

    // Autocorrelation
    for (let offset = minSamples; offset < maxSamples; offset++) {
      let correlation = 0
      for (let i = 0; i < buffer.length - offset; i++) {
        correlation += Math.abs(buffer[i] - buffer[i + offset])
      }
      correlation = 1 - correlation / buffer.length

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation
        bestOffset = offset
      }
    }

    if (bestCorrelation > 0.9 && bestOffset > 0) {
      return sampleRate / bestOffset
    }

    return 0
  }

  function stopListening() {
    isListening.value = false

    if (microphone.value) {
      microphone.value.disconnect()
    }

    if (audioContext.value && audioContext.value.state !== 'closed') {
      audioContext.value.close()
    }

    currentPitch.value = null
    detectedNotes.value = []
  }

  function isNoteDetected(stringIndex: number, fret: number, tolerance: number = 1): boolean {
    return detectedNotes.value.some(
      (note) => note.stringIndex === stringIndex && Math.abs(note.fret - fret) <= tolerance
    )
  }

  onUnmounted(() => {
    stopListening()
  })

  return {
    isListening,
    currentPitch,
    detectedNotes,
    startListening,
    stopListening,
    isNoteDetected,
  }
}
