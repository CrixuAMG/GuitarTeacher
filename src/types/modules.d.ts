// Type declarations for JavaScript modules

declare module '@/composables/useAudio' {
  export function useAudio(): {
    playChord: (strings: number[], duration?: number) => Promise<void>
    playCorrect: () => Promise<void>
    playWrong: () => Promise<void>
    stopAll: () => void
    initAudio: () => Promise<void>
  }
}

declare module '@/data/chords' {
  export interface Chord {
    name: string
    fullName: string
    strings: number[]
    fingers: number[]
    barre: number | null
  }

  export function getChordByName(name: string): Chord | undefined
  export function getAllChords(): Chord[]
}
