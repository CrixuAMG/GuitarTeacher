import { getChordByName } from '../data/chords'
import type { LeadNote, SongPart } from '../types'

export interface ChordNote {
  stringIndex: number
  fret: number
  duration: number
  position: number
  chordName: string
}

interface SongChord {
  name: string
  position: number
  duration: number
}

interface SongData {
  title: string
  artist: string
  bpm: number
  chords: SongChord[]
}

/**
 * Generate note events from chord progressions using chord library
 */
export function generateNotesFromChords(songChords: SongChord[], _bpm: number = 120): ChordNote[] {
  const notes: ChordNote[] = []

  songChords.forEach((chord) => {
    const chordData = getChordByName(chord.name)

    if (chordData && chordData.strings) {
      chordData.strings.forEach((fret, stringIndex) => {
        if (fret !== -1) {
          notes.push({
            stringIndex,
            fret,
            duration: chord.duration,
            position: chord.position,
            chordName: chord.name,
          })
        }
      })
    } else {
      notes.push({
        stringIndex: 0,
        fret: 0,
        duration: chord.duration,
        position: chord.position,
        chordName: chord.name,
      })
    }
  })

  return notes.sort((a, b) => a.position - b.position)
}

/**
 * Generate tabs using OpenCode AI (with fallback to chord-based notes)
 */
export async function generateTabsWithAI(song: SongData): Promise<{ chordNotes: ChordNote[]; leadNotes: LeadNote[] | null; parts: SongPart[] | null }> {
  const chordNotes = generateNotesFromChords(song.chords, song.bpm)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch('/api/generate-tabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ song }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return { chordNotes, leadNotes: null, parts: null }
    }

    const data = await response.json()

    if (data.leadNotes?.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const leadNotes: LeadNote[] = data.leadNotes.map((n: any) => ({
        pitch: n.pitch || noteToPitch(n.stringIndex ?? 0, n.fret ?? 0),
        stringIndex: n.stringIndex ?? 0,
        fret: n.fret ?? 0,
        position: n.position ?? 0,
        duration: n.duration || 1,
        technique: n.technique || 'normal',
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parts: SongPart[] = (data.parts || []).map((p: any, i: number) => ({
        id: p.id || `part-${i + 1}`,
        type: p.type || 'riff',
        name: p.name || `Part ${i + 1}`,
        startBeat: p.startBeat ?? 0,
        endBeat: p.endBeat ?? 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        notes: (p.notes || []).map((n: any) => ({
          pitch: n.pitch || noteToPitch(n.stringIndex ?? 0, n.fret ?? 0),
          stringIndex: n.stringIndex ?? 0,
          fret: n.fret ?? 0,
          position: n.position ?? 0,
          duration: n.duration || 1,
          technique: n.technique || 'normal',
        })),
      }))

      return { chordNotes, leadNotes, parts: parts.length > 0 ? parts : null }
    }

    return { chordNotes, leadNotes: null, parts: null }
  } catch {
    clearTimeout(timeoutId)
    return { chordNotes, leadNotes: null, parts: null }
  }
}

/**
 * Convert notes to pitch notation (e.g., "E3", "G3")
 */
export function noteToPitch(stringIndex: number, fret: number): string {
  const stringNotes = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  const baseNote = stringNotes[stringIndex]
  const baseOctave = parseInt(baseNote.charAt(baseNote.length - 1))
  const baseName = baseNote.replace(/\d/g, '')

  const baseIndex = noteNames.indexOf(baseName)
  const noteIndex = (baseIndex + fret) % 12
  const octave = baseOctave + Math.floor((baseIndex + fret) / 12)

  return noteNames[noteIndex] + octave
}
