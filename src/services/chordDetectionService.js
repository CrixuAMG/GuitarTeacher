import { getAllChords } from '../data/chords.js'

const COMMON_PROGRESSIONS = [
  { key: 'C', chords: ['C', 'Am', 'F', 'G'] },
  { key: 'C', chords: ['C', 'F', 'G', 'C'] },
  { key: 'G', chords: ['G', 'Em', 'C', 'D'] },
  { key: 'G', chords: ['G', 'C', 'D', 'G'] },
  { key: 'D', chords: ['D', 'Bm', 'G', 'A'] },
  { key: 'D', chords: ['D', 'G', 'A', 'D'] },
  { key: 'A', chords: ['A', 'F#m', 'D', 'E'] },
  { key: 'Am', chords: ['Am', 'F', 'C', 'G'] },
  { key: 'Am', chords: ['Am', 'Dm', 'Em', 'Am'] },
  { key: 'E', chords: ['E', 'A', 'B7', 'E'] },
  { key: 'Em', chords: ['Em', 'G', 'D', 'A'] },
  { key: 'Em', chords: ['Em', 'Am', 'B7', 'Em'] },
]

// NASHVILLE_NUMBERS is reserved for future Nashville Number System support
// const NASHVILLE_NUMBERS = {

const KEY_SIGNATURES = {
  'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
  'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
  'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
  'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
  'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
  'F': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
  'Bb': ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'],
  'Am': ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'],
  'Em': ['Em', 'F#dim', 'G', 'Am', 'Bm', 'C', 'D'],
  'Dm': ['Dm', 'Edim', 'F', 'Gm', 'Am', 'Bb', 'C'],
}

const GENRE_TEMPLATES = {
  pop: {
    commonProgressions: [
      ['I', 'V', 'vi', 'IV'],
      ['I', 'IV', 'V', 'IV'],
      ['vi', 'IV', 'I', 'V'],
    ],
    defaultBpm: 120,
    beatsPerChord: 4
  },
  rock: {
    commonProgressions: [
      ['I', 'IV', 'V', 'IV'],
      ['I', 'bVII', 'IV', 'I'],
      ['i', 'bVII', 'bVI', 'bVII'],
    ],
    defaultBpm: 130,
    beatsPerChord: 4
  },
  blues: {
    commonProgressions: [
      ['I7', 'IV7', 'I7', 'V7'],
    ],
    defaultBpm: 100,
    beatsPerChord: 4
  },
  folk: {
    commonProgressions: [
      ['I', 'IV', 'V', 'I'],
      ['I', 'V', 'vi', 'IV'],
    ],
    defaultBpm: 100,
    beatsPerChord: 4
  },
  jazz: {
    commonProgressions: [
      ['IIm7', 'V7', 'Imaj7', 'Imaj7'],
      ['Imaj7', 'vim7', 'iim7', 'V7'],
    ],
    defaultBpm: 140,
    beatsPerChord: 4
  }
}

function normalizeChordName(name) {
  return name
    .replace(/maj7/gi, 'M7')
    .replace(/maj/gi, '')
    .replace(/min/gi, 'm')
    .replace(/dim/gi, 'dim')
    .replace(/aug/gi, 'aug')
    .replace(/dom7/gi, '7')
}

function detectKeyFromChords(chordNames) {
  if (!chordNames || chordNames.length === 0) return 'C'

  const chordSet = new Set(chordNames.map(normalizeChordName))
  let bestKey = 'C'
  let bestScore = -1

  for (const [key, scaleChords] of Object.entries(KEY_SIGNATURES)) {
    const normalized = scaleChords.map(normalizeChordName)
    let score = 0
    for (const chord of chordSet) {
      if (normalized.includes(chord)) score += 2
    }
    for (const chord of chordSet) {
      const root = chord.replace(/[mM7dimaug#b]/g, '').charAt(0)
      if (root === key.charAt(0)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      bestKey = key
    }
  }

  return bestKey
}

function expandProgression(key, numerals, beatsPerChord = 4) {
  const keyChords = KEY_SIGNATURES[key]
  if (!keyChords) return []

  const romanToIndex = {
    'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'VI': 5, 'VII': 6,
    'i': 0, 'ii': 1, 'iii': 2, 'iv': 3, 'v': 4, 'vi': 5, 'vii': 6,
    'I7': 0, 'IV7': 3, 'V7': 4,
    'iim7': 1, 'V7': 4, 'Imaj7': 0, 'vim7': 5,
    'bVII': 6, 'bVI': 5,
    'IIm7': 1, 'vim7': 5
  }

  const chords = []
  let position = 0

  for (const numeral of numerals) {
    const cleanNumeral = numeral.replace(/[()]/g, '')
    let chordIndex = romanToIndex[cleanNumeral]
    let chordName

    if (chordIndex !== undefined && keyChords[chordIndex]) {
      chordName = keyChords[chordIndex]
    } else {
      chordName = cleanNumeral
    }

    chords.push({
      name: chordName,
      duration: beatsPerChord,
      position,
      autoDetected: true
    })
    position += beatsPerChord
  }

  return chords
}

export function detectChordsFromLyrics(lyrics, options = {}) {
  const {
    bpm = 120,
    beatsPerChord = 4,
    genre = null
  } = options

  if (!lyrics || !lyrics.length) return { chords: [], key: 'C', confidence: 0 }

  const knownChords = new Set(getAllChords().map(c => c.name))

  const inlineChords = new Set()
  for (const line of lyrics) {
    if (line.chords && line.chords.length) {
      for (const chord of line.chords) {
        const name = typeof chord === 'string' ? chord : chord.name
        if (name && knownChords.has(name)) {
          inlineChords.add(name)
        }
      }
    }
  }

  if (inlineChords.size > 0) {
    const sortedChords = [...inlineChords].sort()
    const detectedKey = detectKeyFromChords(sortedChords)

    const chords = []
    let position = 0

    if (lyrics.length > 0) {
      const sectionProgressions = new Map()
      for (const line of lyrics) {
        const sectionKey = line.section || 'verse'
        if (line.chords && line.chords.length > 0) {
          if (!sectionProgressions.has(sectionKey)) {
            sectionProgressions.set(sectionKey, [])
          }
          const sectionChords = sectionProgressions.get(sectionKey)
          for (const chord of line.chords) {
            const name = typeof chord === 'string' ? chord : chord.name
            sectionChords.push(name)
          }

          for (const name of line.chords) {
            const cName = typeof name === 'string' ? name : name.name
            chords.push({
              name: cName,
              duration: beatsPerChord,
              position,
              autoDetected: true
            })
            position += beatsPerChord
          }
        }
      }

      if (chords.length > 0) {
        return {
          chords,
          key: detectedKey,
          confidence: 0.9,
          source: 'lyrics_inline'
        }
      }
    }
  }

  return detectChordsFromStructure(lyrics, { bpm, beatsPerChord, genre })
}

export function detectChordsFromStructure(lyrics, options = {}) {
  const {
    bpm = 120,
    beatsPerChord = 4,
    genre = null
  } = options

  if (!lyrics || !lyrics.length) {
    return { chords: [], key: 'C', confidence: 0, source: 'none' }
  }

  const lineCount = lyrics.length

  let detectedGenre = genre
  if (!detectedGenre) {
    if (bpm < 90) detectedGenre = 'blues'
    else if (bpm > 135) detectedGenre = 'rock'
    else detectedGenre = 'pop'
  }

  const template = GENRE_TEMPLATES[detectedGenre] || GENRE_TEMPLATES.pop

  const keyProgression = COMMON_PROGRESSIONS[0]
  const key = keyProgression.key

  const progression = template.commonProgressions[0]
  const chords = expandProgression(key, progression, beatsPerChord)

  const totalBeatsNeeded = lineCount * beatsPerChord
  const progressionBeats = chords.reduce((sum, c) => sum + c.duration, 0)
  const repeats = Math.ceil(totalBeatsNeeded / progressionBeats)

  const fullChords = []
  let position = 0
  for (let r = 0; r < repeats; r++) {
    for (const chord of chords) {
      fullChords.push({
        ...chord,
        position,
        autoDetected: true
      })
      position += chord.duration
    }
  }

  const uniqueChords = [...new Set(fullChords.map(c => c.name))]

  return {
    chords: fullChords,
    key,
    confidence: 0.4,
    source: 'structure_template',
    detectedGenre,
    uniqueChords
  }
}

export async function detectChordsForSong(songData) {
  const { lyrics = [], bpm = 120, chords = [] } = songData

  if (chords.length > 0) {
    const hasAutoDetected = chords.some(c => c.autoDetected)
    return {
      chords,
      key: detectKeyFromChords(chords.map(c => c.name)),
      confidence: 1,
      source: hasAutoDetected ? 'auto_detected' : 'manual',
      wasModified: false
    }
  }

  if (lyrics && lyrics.length > 0) {
    const result = detectChordsFromLyrics(lyrics, { bpm })
    result.wasModified = true
    return result
  }

  return {
    chords: [],
    key: 'C',
    confidence: 0,
    source: 'none',
    wasModified: false
  }
}

export function generateSectionsFromChords(chords, lyrics = []) {
  if (!chords || chords.length === 0) return []

  const sections = []
  const sectionSize = 4

  if (lyrics.length > 0) {
    const lyricSections = [...new Set(lyrics.map(l => l.section).filter(Boolean))]
    if (lyricSections.length > 0) {
      for (const sectionType of lyricSections) {
        const sectionLyrics = lyrics.filter(l => l.section === sectionType)
        if (sectionLyrics.length > 0) {
          const startBeat = sectionLyrics[0].beatPosition || sectionLyrics[0].position || 0
          const lastLine = sectionLyrics[sectionLyrics.length - 1]
          const endBeat = (lastLine.beatPosition || lastLine.position || 0) + 4
          sections.push({
            type: sectionType,
            label: sectionType.charAt(0).toUpperCase() + sectionType.slice(1),
            startBeat,
            endBeat
          })
        }
      }
      return sections
    }
  }

  const totalChords = chords.length
  let position = 0

  const verseEnd = Math.min(sectionSize * 2, totalChords)
  if (verseEnd > 0) {
    const startBeat = chords[0].position
    const endBeat = chords[Math.min(verseEnd - 1, totalChords - 1)].position + chords[Math.min(verseEnd - 1, totalChords - 1)].duration
    sections.push({ type: 'verse', label: 'Verse 1', startBeat, endBeat })
    position = verseEnd
  }

  if (position < totalChords - sectionSize) {
    const startChord = chords[position]
    const endChord = chords[Math.min(position + sectionSize - 1, totalChords - 1)]
    sections.push({
      type: 'chorus',
      label: 'Chorus',
      startBeat: startChord.position,
      endBeat: endChord.position + endChord.duration
    })
    position += sectionSize
  }

  while (position < totalChords) {
    const remainingChords = totalChords - position
    const sectionChords = Math.min(sectionSize, remainingChords)
    const startChord = chords[position]
    const endChord = chords[position + sectionChords - 1]
    const sectionNum = sections.filter(s => s.type === 'verse').length + 1
    sections.push({
      type: sectionNum <= 2 ? 'verse' : 'bridge',
      label: sectionNum <= 2 ? `Verse ${sectionNum}` : 'Bridge',
      startBeat: startChord.position,
      endBeat: endChord.position + endChord.duration
    })
    position += sectionChords
  }

  return sections
}

export function getLoopPresetsFromSections(sections) {
  if (!sections || sections.length === 0) return []

  return sections.map(section => ({
    label: section.label,
    startBeat: section.startBeat,
    endBeat: section.endBeat
  }))
}

export function calculateBPMFromChords(chords, totalTime) {
  if (!chords || chords.length === 0 || !totalTime) return 120

  const lastChord = chords[chords.length - 1]
  const totalBeats = lastChord.position + lastChord.duration
  const bpm = Math.round((totalBeats / totalTime) * 60)

  if (bpm < 40) return 40
  if (bpm > 300) return 300
  return bpm
}