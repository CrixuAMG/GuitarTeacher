import { describe, it, expect } from 'vitest'
import { generateNotesFromChords, noteToPitch } from '../services/chordToNotesService'

describe('chordToNotesService', () => {
  describe('generateNotesFromChords', () => {
    it('should generate notes from simple chord progression', () => {
      const chords = [
        { name: 'Em', position: 0, duration: 4 },
        { name: 'G', position: 4, duration: 4 },
      ]

      const notes = generateNotesFromChords(chords, 120)

      expect(notes.length).toBeGreaterThan(0)
      expect(notes[0].chordName).toBe('Em')
      expect(notes[0].position).toBe(0)
    })

    it('should handle unknown chords gracefully', () => {
      const chords = [{ name: 'Xyz', position: 0, duration: 4 }]

      const notes = generateNotesFromChords(chords, 120)

      expect(notes.length).toBeGreaterThan(0)
      expect(notes[0].fret).toBe(0) // fallback
    })

    it('should return notes sorted by position', () => {
      const chords = [
        { name: 'D', position: 8, duration: 4 },
        { name: 'Em', position: 0, duration: 4 },
        { name: 'G', position: 4, duration: 4 },
      ]

      const notes = generateNotesFromChords(chords, 120)

      expect(notes[0].position).toBe(0)
    })

    it('should generate correct number of notes for Em chord', () => {
      const chords = [{ name: 'Em', position: 0, duration: 4 }]
      const notes = generateNotesFromChords(chords, 120)

      // Em uses 5 strings (all except low E which is 0/open)
      const emNotes = notes.filter((n) => n.chordName === 'Em')
      expect(emNotes.length).toBeGreaterThanOrEqual(4) // At least 4 notes
    })
  })

  describe('noteToPitch', () => {
    it('should convert low E string open note', () => {
      const pitch = noteToPitch(0, 0) // string 0 = low E
      expect(pitch).toBe('E2')
    })

    it('should convert low E string fretted note', () => {
      const pitch = noteToPitch(0, 2) // low E, fret 2 = F#
      expect(pitch).toBe('F#2')
    })

    it('should convert high E string open note', () => {
      const pitch = noteToPitch(5, 0) // string 5 = high E
      expect(pitch).toBe('E4')
    })

    it('should handle A string correctly', () => {
      const pitch = noteToPitch(1, 0) // A string open
      expect(pitch).toBe('A2')
    })

    it('should handle note across octave boundary', () => {
      const pitch = noteToPitch(0, 12) // Low E + 12 frets = E3
      expect(pitch).toBe('E3')
    })
  })
})
