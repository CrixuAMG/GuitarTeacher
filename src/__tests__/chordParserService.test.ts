import { describe, it, expect } from 'vitest'
import { parseChordPro, detectFormat } from '../services/chordParserService'

describe('chordParserService', () => {
  describe('detectFormat', () => {
    it('should detect ChordPro format with title tag', () => {
      const content = `{title: Test Song}`
      expect(detectFormat(content)).toBe('chordpro')
    })

    it('should detect ChordPro format with chord markers', () => {
      const content = `[Am]Hello[G]World`
      expect(detectFormat(content)).toBe('chordpro')
    })

    it('should return unknown for single line chord lists', () => {
      // Single line of chords doesn't match simple_chords pattern
      const content = `Am G F E`
      expect(detectFormat(content)).toBe('unknown')
    })

    it('should detect simple chord format with multiple lines', () => {
      const content = `Am
G
F
E`
      expect(detectFormat(content)).toBe('simple_chords')
    })

    it('should return unknown for unrecognized formats', () => {
      const content = `Some random text without chords or markers`
      expect(detectFormat(content)).toBe('unknown')
    })

    it('should return unknown for empty content', () => {
      expect(detectFormat('')).toBe('unknown')
    })
  })

  describe('parseChordPro', () => {
    it('should parse ChordPro with title and artist', () => {
      const content = `{title: Wonderwall}
{artist: Oasis}
[Em]Today is [G]gonna be the day`

      const result = parseChordPro(content)

      expect(result).toBeDefined()
      expect(result.title).toBe('Wonderwall')
      expect(result.artist).toBe('Oasis')
    })

    it('should extract chords from ChordPro', () => {
      const content = `[Am]Hello [G]World`

      const result = parseChordPro(content)

      expect(result).toBeDefined()
      expect(result.chords).toBeDefined()
      expect(result.chords.length).toBe(2)
      expect(result.chords[0].name).toBe('Am')
      expect(result.chords[1].name).toBe('G')
    })

    it('should return empty object for empty content', () => {
      const result = parseChordPro('')
      expect(result).toBeDefined()
      expect(result.title).toBe('')
      expect(result.artist).toBe('')
      expect(result.chords).toEqual([])
    })

    it('should parse sections', () => {
      const content = `{title: Test}
{start_of_verse: Verse 1}
[Am]Line 1
{end_of_verse}`

      const result = parseChordPro(content)

      expect(result.sections.length).toBe(1)
      expect(result.sections[0].type).toBe('verse')
    })

    it('should parse metadata', () => {
      const content = `{bpm: 120}
{key: Am}
[Am]Test`

      const result = parseChordPro(content)

      expect(result.metadata.bpm).toBe('120')
      expect(result.metadata.key).toBe('Am')
    })
  })

  describe('parseSongContent integration', async () => {
    const { parseSongContent } = await import('../services/chordParserService')

    it('should return correct format for ChordPro', () => {
      const content = `{title: Test}[Am]Chord`
      const result = parseSongContent(content)
      expect(result.format).toBe('chordpro')
      expect(result.data).toBeDefined()
    })

    it('should return unknown for invalid content', () => {
      const result = parseSongContent('random text')
      expect(result.format).toBe('unknown')
      expect(result.data).toBeNull()
    })
  })
})
