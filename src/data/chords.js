const STRING_FREQUENCIES = [329.63, 246.94, 196.00, 146.83, 110.00, 82.41]

export const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']

export function getFrequency(stringIndex, fret) {
  if (fret < 0) return 0
  return STRING_FREQUENCIES[stringIndex] * Math.pow(2, fret / 12)
}

export const chordDatabase = {
  basic: [
    {
      name: 'C',
      fullName: 'C Major',
      strings: [0, 1, 0, 2, 3, -1],
      fingers: [0, 1, 0, 2, 3, 0],
      barre: null,
      difficulty: 1,
      description: 'A foundational open chord. One of the first chords every guitarist learns.'
    },
    {
      name: 'D',
      fullName: 'D Major',
      strings: [2, 3, 2, 0, -1, -1],
      fingers: [1, 3, 2, 0, 0, 0],
      barre: null,
      difficulty: 1,
      description: 'A bright, ringing open chord common in folk and country music.'
    },
    {
      name: 'E',
      fullName: 'E Major',
      strings: [0, 0, 1, 2, 2, 0],
      fingers: [0, 0, 1, 3, 2, 0],
      barre: null,
      difficulty: 1,
      description: 'A powerful open chord, great for rock and blues. Easy to play.'
    },
    {
      name: 'G',
      fullName: 'G Major',
      strings: [3, 0, 0, 0, 2, 3],
      fingers: [4, 0, 0, 0, 2, 3],
      barre: null,
      difficulty: 1,
      description: 'A full-sounding open chord. Can be fingered multiple ways.'
    },
    {
      name: 'A',
      fullName: 'A Major',
      strings: [0, 2, 2, 2, 0, -1],
      fingers: [0, 2, 3, 1, 0, 0],
      barre: null,
      difficulty: 1,
      description: 'An easy open chord. All three middle strings on the same fret.'
    },
    {
      name: 'Am',
      fullName: 'A Minor',
      strings: [0, 1, 2, 2, 0, -1],
      fingers: [0, 1, 3, 2, 0, 0],
      barre: null,
      difficulty: 1,
      description: 'The easiest minor chord. A gateway to emotional playing.'
    },
    {
      name: 'Em',
      fullName: 'E Minor',
      strings: [0, 0, 0, 2, 2, 0],
      fingers: [0, 0, 0, 2, 3, 0],
      barre: null,
      difficulty: 1,
      description: 'The simplest chord — just two fingers. Great for beginners.'
    },
    {
      name: 'Dm',
      fullName: 'D Minor',
      strings: [1, 3, 2, 0, -1, -1],
      fingers: [1, 3, 2, 0, 0, 0],
      barre: null,
      difficulty: 1,
      description: 'A melancholy-sounding chord common in ballads and jazz.'
    }
  ],
  intermediate: [
    {
      name: 'F',
      fullName: 'F Major',
      strings: [1, 1, 2, 3, 3, 1],
      fingers: [1, 1, 2, 4, 3, 1],
      barre: { fret: 1, fromString: 5, toString: 0 },
      difficulty: 2,
      description: 'The dreaded barre chord! Your first barre chord challenge.'
    },
    {
      name: 'B7',
      fullName: 'B7',
      strings: [2, 1, 2, 2, 0, -1],
      fingers: [2, 1, 3, 4, 0, 0],
      barre: null,
      difficulty: 2,
      description: 'A dominant 7th chord common in blues and country progressions.'
    },
    {
      name: 'C7',
      fullName: 'C7',
      strings: [0, 1, 3, 2, 3, -1],
      fingers: [0, 1, 4, 2, 3, 0],
      barre: null,
      difficulty: 2,
      description: 'A dominant 7th chord with a bluesy, unresolved sound.'
    },
    {
      name: 'G7',
      fullName: 'G7',
      strings: [1, 0, 0, 0, 2, 3],
      fingers: [1, 0, 0, 0, 2, 3],
      barre: null,
      difficulty: 2,
      description: 'A dominant 7th chord that resolves beautifully to C.'
    },
    {
      name: 'Am7',
      fullName: 'A Minor 7',
      strings: [0, 1, 0, 2, 0, -1],
      fingers: [0, 1, 0, 2, 0, 0],
      barre: null,
      difficulty: 2,
      description: 'A softer version of Am, common in jazz and R&B.'
    },
    {
      name: 'D7',
      fullName: 'D7',
      strings: [2, 1, 2, 0, -1, -1],
      fingers: [2, 1, 3, 0, 0, 0],
      barre: null,
      difficulty: 2,
      description: 'A dominant 7th that resolves to G. Common in blues.'
    },
    {
      name: 'E7',
      fullName: 'E7',
      strings: [0, 0, 1, 0, 2, 0],
      fingers: [0, 0, 1, 0, 2, 0],
      barre: null,
      difficulty: 2,
      description: 'A blues staple. Easy transition from E major.'
    },
    {
      name: 'A7',
      fullName: 'A7',
      strings: [0, 2, 0, 2, 0, -1],
      fingers: [0, 3, 0, 2, 0, 0],
      barre: null,
      difficulty: 2,
      description: 'A dominant 7th resolving to D. Classic blues chord.'
    }
  ],
  advanced: [
    {
      name: 'Bm',
      fullName: 'B Minor',
      strings: [2, 3, 4, 4, 2, -1],
      fingers: [1, 2, 3, 4, 1, 0],
      barre: { fret: 2, fromString: 4, toString: 0 },
      difficulty: 3,
      description: 'A barre chord based on the Am shape at the 2nd fret.'
    },
    {
      name: 'F#m',
      fullName: 'F Sharp Minor',
      strings: [2, 2, 2, 4, 4, 2],
      fingers: [1, 1, 1, 3, 4, 1],
      barre: { fret: 2, fromString: 5, toString: 0 },
      difficulty: 3,
      description: 'A minor barre chord. Common in songs in the key of A.'
    },
    {
      name: 'Cm',
      fullName: 'C Minor',
      strings: [3, 4, 5, 5, 3, -1],
      fingers: [1, 2, 3, 4, 1, 0],
      barre: { fret: 3, fromString: 4, toString: 0 },
      difficulty: 3,
      description: 'A minor barre chord. Essential for rock and pop.'
    },
    {
      name: 'Bb',
      fullName: 'B Flat Major',
      strings: [3, 3, 4, 5, 5, 3],
      fingers: [1, 1, 2, 3, 4, 1],
      barre: { fret: 3, fromString: 5, toString: 0 },
      difficulty: 3,
      description: 'A barre chord common in jazz, blues, and pop.'
    },
    {
      name: 'Dm7',
      fullName: 'D Minor 7',
      strings: [1, 1, 2, 0, -1, -1],
      fingers: [1, 1, 2, 0, 0, 0],
      barre: { fret: 1, fromString: 1, toString: 0 },
      difficulty: 3,
      description: 'A jazzy minor 7th chord with a smooth, mellow sound.'
    },
    {
      name: 'Cmaj7',
      fullName: 'C Major 7',
      strings: [0, 0, 0, 2, 3, -1],
      fingers: [0, 0, 0, 2, 3, 0],
      barre: null,
      difficulty: 3,
      description: 'A dreamy, jazz-flavored chord. Sounds beautiful in ballads.'
    },
    {
      name: 'Fmaj7',
      fullName: 'F Major 7',
      strings: [0, 1, 2, 3, 3, -1],
      fingers: [0, 1, 2, 3, 4, 0],
      barre: null,
      difficulty: 3,
      description: 'An easier alternative to F barre chord, with a dreamy quality.'
    },
    {
      name: 'Gm',
      fullName: 'G Minor',
      strings: [3, 3, 3, 5, 5, 3],
      fingers: [1, 1, 1, 3, 4, 1],
      barre: { fret: 3, fromString: 5, toString: 0 },
      difficulty: 3,
      description: 'A barre chord shape essential for minor key progressions.'
    }
  ]
}

export function getAllChords() {
  return [...chordDatabase.basic, ...chordDatabase.intermediate, ...chordDatabase.advanced]
}

export function getChordByName(name) {
  return getAllChords().find(c => c.name === name)
}

export function getChordsByCategory(category) {
  return chordDatabase[category] || []
}

export const CHORD_CATEGORIES = [
  { key: 'basic', label: 'Basic Chords', description: 'Open chords for beginners' },
  { key: 'intermediate', label: 'Intermediate Chords', description: '7th chords and more' },
  { key: 'advanced', label: 'Advanced Chords', description: 'Barre chords and jazz voicings' }
]