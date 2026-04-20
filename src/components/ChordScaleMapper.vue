<template>
  <div class="chord-scale-mapper">
    <div class="mapper-controls card">
      <h2>Chord-Scale Compatibility</h2>
      <p class="subtitle">Find scales that work over any chord</p>

      <div class="control-row">
        <div class="control-group">
          <label>Chord Root</label>
          <div class="note-buttons">
            <button
              v-for="note in ROOT_NOTES"
              :key="note"
              class="note-btn"
              :class="{ active: selectedRoot === note }"
              @click="selectedRoot = note"
            >
              {{ note }}
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>Chord Quality</label>
          <select v-model="selectedQuality" class="quality-select">
            <option v-for="q in CHORD_QUALITIES" :key="q.id" :value="q.id">
              {{ q.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="currentQuality" class="result-card card">
      <div class="result-header">
        <h3>{{ selectedRoot }} {{ currentQuality.name }}</h3>
        <p class="quality-desc">{{ currentQuality.description }}</p>
      </div>

      <div class="compatible-scales">
        <div
          v-for="scale in compatibleScales"
          :key="scale.id"
          class="scale-card"
          :class="{ expanded: expandedScale === scale.id }"
          @click="toggleScale(scale.id)"
        >
          <div class="scale-header">
            <div class="scale-title">
              <h4>{{ scale.name }}</h4>
              <span class="scale-reason">{{ scale.reason }}</span>
            </div>
            <span class="expand-icon">{{ expandedScale === scale.id ? '−' : '+' }}</span>
          </div>

          <div v-if="expandedScale === scale.id" class="scale-detail">
            <p class="scale-desc">{{ scale.description }}</p>
            <div class="scale-notes">
              <span
                v-for="(note, i) in getScaleNotes(scale.intervals)"
                :key="i"
                class="scale-note"
                :class="{ root: note === selectedRoot }"
              >
                {{ note }}
              </span>
            </div>
            <div class="chord-tones-match">
              <h5>Chord Tones Highlighted</h5>
              <div class="match-notes">
                <span
                  v-for="note in chordTones"
                  :key="note"
                  class="match-note"
                  :class="{ inScale: getScaleNotes(scale.intervals).includes(note) }"
                >
                  {{ note }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const SCALES = [
  { id: 'major', name: 'Major (Ionian)', intervals: [0, 2, 4, 5, 7, 9, 11], description: 'Happy, bright, resolved. The most fundamental scale.' },
  { id: 'minor', name: 'Natural Minor (Aeolian)', intervals: [0, 2, 3, 5, 7, 8, 10], description: 'Sad, dark, contemplative. Rock and metal staple.' },
  { id: 'pentatonic_major', name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9], description: 'Five safe notes. Works over almost any major-friendly progression.' },
  { id: 'pentatonic_minor', name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10], description: 'The most used scale in rock and blues soloing.' },
  { id: 'blues', name: 'Blues Scale', intervals: [0, 3, 5, 6, 7, 10], description: 'Minor pentatonic plus the blue note. Adds tension and soul.' },
  { id: 'dorian', name: 'Dorian Mode', intervals: [0, 2, 3, 5, 7, 9, 10], description: 'Minor with a raised 6th. Jazzy, bright minor sound.' },
  { id: 'mixolydian', name: 'Mixolydian Mode', intervals: [0, 2, 4, 5, 7, 9, 10], description: 'Major with a lowered 7th. Bluesy, rock, and dominant chord sound.' },
  { id: 'lydian', name: 'Lydian Mode', intervals: [0, 2, 4, 6, 7, 9, 11], description: 'Major with a raised 4th. Dreamy, floating, modern sound.' },
  { id: 'phrygian', name: 'Phrygian Mode', intervals: [0, 1, 3, 5, 7, 8, 10], description: 'Dark, exotic, Spanish-flavored minor. Lowered 2nd is key.' },
  { id: 'harmonic_minor', name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11], description: 'Exotic and dramatic. Raised 7th creates a strong leading tone.' },
]

const CHORD_QUALITIES = [
  {
    id: 'major',
    name: 'Major',
    description: 'A stable, happy chord built from root, major 3rd, and perfect 5th.',
    compatible: [
      { scaleId: 'major', reason: 'Direct match — every chord tone is in the scale' },
      { scaleId: 'pentatonic_major', reason: 'Safe, melodic, great for hooks and solos' },
      { scaleId: 'lydian', reason: 'Adds a dreamy #4 for a modern color' },
      { scaleId: 'mixolydian', reason: 'Adds a bluesy b7; great over dominant-flavored major chords' },
    ],
    chordTones: [0, 4, 7],
  },
  {
    id: 'minor',
    name: 'Minor',
    description: 'A somber chord built from root, minor 3rd, and perfect 5th.',
    compatible: [
      { scaleId: 'minor', reason: 'Direct match — the natural home scale' },
      { scaleId: 'pentatonic_minor', reason: 'The go-to scale for minor chord soloing' },
      { scaleId: 'dorian', reason: 'Brightens the minor with a raised 6th' },
      { scaleId: 'blues', reason: 'Adds the blue note for extra grit and tension' },
      { scaleId: 'phrygian', reason: 'Dark, exotic flavor with a lowered 2nd' },
    ],
    chordTones: [0, 3, 7],
  },
  {
    id: 'dom7',
    name: 'Dominant 7',
    description: 'A tense, unresolved chord with root, major 3rd, 5th, and minor 7th.',
    compatible: [
      { scaleId: 'mixolydian', reason: 'Perfect match — built for dominant 7th chords' },
      { scaleId: 'blues', reason: 'Classic blues soloing over a V7 chord' },
      { scaleId: 'pentatonic_major', reason: 'Safe pentatonic option with a b7 flavor' },
      { scaleId: 'major', reason: 'The major scale works, but avoid emphasizing the natural 7' },
    ],
    chordTones: [0, 4, 7, 10],
  },
  {
    id: 'maj7',
    name: 'Major 7',
    description: 'A lush, sophisticated chord with root, major 3rd, 5th, and major 7th.',
    compatible: [
      { scaleId: 'major', reason: 'Direct match — every chord tone is in the scale' },
      { scaleId: 'lydian', reason: 'Jazz-fusion favorite: adds the #4 over a maj7 chord' },
      { scaleId: 'pentatonic_major', reason: 'Safe, melodic choice; omits the 7 entirely' },
    ],
    chordTones: [0, 4, 7, 11],
  },
  {
    id: 'min7',
    name: 'Minor 7',
    description: 'A relaxed, jazzy chord with root, minor 3rd, 5th, and minor 7th.',
    compatible: [
      { scaleId: 'dorian', reason: 'The classic minor 7 scale — raised 6th adds brightness' },
      { scaleId: 'minor', reason: 'Natural minor works; the 7th is a b7, which fits' },
      { scaleId: 'pentatonic_minor', reason: 'Rock and blues standard over m7 chords' },
      { scaleId: 'blues', reason: 'Adds tension with the blue note over a jazzy minor 7' },
    ],
    chordTones: [0, 3, 7, 10],
  },
  {
    id: 'dim',
    name: 'Diminished',
    description: 'A tense, unstable chord with root, minor 3rd, and diminished 5th.',
    compatible: [
      { scaleId: 'harmonic_minor', reason: 'The harmonic minor contains a diminished triad on the 7th degree' },
      { scaleId: 'phrygian', reason: 'Dark, tense flavor that complements diminished harmony' },
      { scaleId: 'minor', reason: 'Natural minor shares the b3 and b5 is close to the 4' },
    ],
    chordTones: [0, 3, 6],
  },
  {
    id: 'sus2',
    name: 'Sus2',
    description: 'An open, airy chord replacing the 3rd with a 2nd.',
    compatible: [
      { scaleId: 'pentatonic_major', reason: 'No 3rd conflicts — pentatonic is perfectly safe' },
      { scaleId: 'major', reason: 'The major scale contains the 2nd and fits the open sound' },
      { scaleId: 'mixolydian', reason: 'Adds a bluesy, open dominant color' },
    ],
    chordTones: [0, 2, 7],
  },
  {
    id: 'sus4',
    name: 'Sus4',
    description: 'A suspended chord replacing the 3rd with a 4th, creating tension.',
    compatible: [
      { scaleId: 'mixolydian', reason: 'Contains the 4th and b7; classic sus4 resolution sound' },
      { scaleId: 'pentatonic_major', reason: 'Safe choice; emphasizes root, 2nd, 4th, 5th' },
      { scaleId: 'major', reason: 'Works as the 4th is part of the major scale' },
    ],
    chordTones: [0, 5, 7],
  },
]

const selectedRoot = ref('C')
const selectedQuality = ref('major')
const expandedScale = ref<string | null>(null)

function toggleScale(id: string) {
  expandedScale.value = expandedScale.value === id ? null : id
}

function noteToIndex(note: string): number {
  return ROOT_NOTES.indexOf(note)
}

function indexToNote(index: number): string {
  return ROOT_NOTES[((index % 12) + 12) % 12]
}

const currentQuality = computed(() => CHORD_QUALITIES.find((q) => q.id === selectedQuality.value))

const compatibleScales = computed(() => {
  const quality = currentQuality.value
  if (!quality) return []
  return quality.compatible.map((c) => {
    const scale = SCALES.find((s) => s.id === c.scaleId)
    if (!scale) return null
    return { ...scale, reason: c.reason }
  }).filter(Boolean) as (typeof SCALES[number] & { reason: string })[]
})

const chordTones = computed(() => {
  const quality = currentQuality.value
  if (!quality) return []
  const rootIdx = noteToIndex(selectedRoot.value)
  return quality.chordTones.map((interval) => indexToNote(rootIdx + interval))
})

function getScaleNotes(intervals: number[]): string[] {
  const rootIdx = noteToIndex(selectedRoot.value)
  return intervals.map((interval) => indexToNote(rootIdx + interval))
}
</script>

<style scoped>
.chord-scale-mapper {
  padding: 0 24px 48px;
  max-width: 700px;
  margin: 0 auto;
}

.mapper-controls {
  padding: 24px;
  margin-bottom: 24px;
}

.mapper-controls h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.control-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.control-group {
  flex: 1;
  min-width: 200px;
}

.control-group label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.note-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.note-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.note-btn:hover {
  border-color: var(--bg-highlight);
  color: var(--bg-highlight);
}

.note-btn.active {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

.quality-select {
  width: 100%;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* Result */
.result-card {
  padding: 24px;
}

.result-header {
  margin-bottom: 20px;
}

.result-header h3 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 6px;
}

.quality-desc {
  color: var(--text-secondary);
  font-size: 14px;
}

.scale-card {
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.scale-card:hover {
  border-color: var(--border-color);
}

.scale-card.expanded {
  border-color: var(--bg-highlight);
}

.scale-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.scale-title h4 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 2px;
}

.scale-reason {
  font-size: 13px;
  color: var(--text-secondary);
}

.expand-icon {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-tertiary);
}

.scale-detail {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border-color);
}

.scale-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.scale-notes {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.scale-note {
  padding: 6px 12px;
  border-radius: 20px;
  background: var(--bg-secondary);
  font-weight: 700;
  font-size: 13px;
  border: 2px solid var(--border-color);
}

.scale-note.root {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

.chord-tones-match h5 {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.match-notes {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.match-note {
  padding: 6px 12px;
  border-radius: 20px;
  background: var(--bg-secondary);
  font-weight: 700;
  font-size: 13px;
  border: 2px solid var(--border-color);
  color: var(--text-tertiary);
}

.match-note.inScale {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

@media (max-width: 600px) {
  .chord-scale-mapper {
    padding: 0 12px 32px;
  }
  .control-row {
    flex-direction: column;
  }
  .note-btn {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
}
</style>
