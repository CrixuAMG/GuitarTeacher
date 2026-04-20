<template>
  <div class="jam-mode">
    <div class="jam-controls card">
      <h2>Jam Mode</h2>
      <p class="subtitle">Generate chord progressions to jam over</p>

      <div class="control-row">
        <div class="control-group">
          <label>Key</label>
          <div class="note-buttons">
            <button
              v-for="note in ROOT_NOTES"
              :key="note"
              class="note-btn"
              :class="{ active: selectedKey === note }"
              @click="selectedKey = note"
            >
              {{ note }}
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>Style</label>
          <div class="style-buttons">
            <button
              v-for="style in STYLES"
              :key="style.id"
              class="style-btn"
              :class="{ active: selectedStyle === style.id }"
              @click="selectedStyle = style.id"
            >
              {{ style.name }}
            </button>
          </div>
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label>Tempo (BPM)</label>
          <input v-model.number="tempo" type="range" min="40" max="180" class="tempo-slider" />
          <span class="tempo-value">{{ tempo }} BPM</span>
        </div>
        <button class="btn btn-primary" @click="generateProgression">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Regenerate
        </button>
      </div>
    </div>

    <!-- Progression Display -->
    <div class="progression-display card">
      <div class="progression-header">
        <h3>{{ currentStyle?.name }} in {{ selectedKey }}</h3>
        <span class="tempo-badge">{{ tempo }} BPM</span>
      </div>

      <div class="progression-chords">
        <div
          v-for="(chord, index) in progression"
          :key="index"
          class="chord-block"
          :class="{ active: activeChordIndex === index }"
          @click="activeChordIndex = index"
        >
          <div class="chord-name">{{ chord.name }}</div>
          <div class="chord-numeral">{{ chord.numeral }}</div>
          <div class="chord-bars">{{ chord.bars }} bar{{ chord.bars > 1 ? 's' : '' }}</div>
        </div>
      </div>

      <!-- Active Chord Diagram -->
      <div v-if="activeChord" class="active-chord-section">
        <h4>Chord Diagram</h4>
        <Fretboard v-if="activeChordData" :chord="activeChordData" />
        <div v-else class="no-chord">No diagram available for {{ activeChord.name }}</div>
      </div>
    </div>

    <!-- Scale Suggestion -->
    <div class="scale-suggestion card">
      <h3>Suggested Scale for Soloing</h3>
      <div class="scale-info">
        <div class="scale-name">{{ suggestedScale.name }} in {{ selectedKey }}</div>
        <div class="scale-notes">
          <span
            v-for="(note, i) in suggestedScale.notes"
            :key="note + i"
            class="scale-note"
            :class="{ root: i === 0 }"
          >
            {{ note }}
          </span>
        </div>
        <p class="scale-tip">{{ suggestedScale.tip }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Fretboard from './Fretboard.vue'
import { chordDatabase } from '../data/chords.js'

const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

interface Style {
  id: string
  name: string
  progressions: { numerals: string[]; bars: number[] }[]
  defaultScale: string
  scaleTip: string
}

const STYLES: Style[] = [
  {
    id: 'blues',
    name: '12-Bar Blues',
    progressions: [
      { numerals: ['I7', 'I7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'], bars: [1,1,1,1,1,1,1,1,1,1,1,1] },
      { numerals: ['I7', 'IV7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'I7'], bars: [1,1,1,1,1,1,1,1,1,1,1,1] },
    ],
    defaultScale: 'Blues Scale',
    scaleTip: 'Use the blues scale or minor pentatonic for authentic blues solos.',
  },
  {
    id: 'pop',
    name: 'Pop',
    progressions: [
      { numerals: ['I', 'V', 'vi', 'IV'], bars: [2,2,2,2] },
      { numerals: ['I', 'IV', 'V', 'IV'], bars: [2,2,2,2] },
      { numerals: ['vi', 'IV', 'I', 'V'], bars: [2,2,2,2] },
    ],
    defaultScale: 'Major Pentatonic',
    scaleTip: 'Major pentatonic or full major scale works great for pop melodies.',
  },
  {
    id: 'jazz',
    name: 'Jazz',
    progressions: [
      { numerals: ['ii7', 'V7', 'Imaj7', 'Imaj7'], bars: [2,2,2,2] },
      { numerals: ['Imaj7', 'vi7', 'ii7', 'V7'], bars: [2,2,2,2] },
      { numerals: ['ii7', 'V7', 'iii7', 'VI7', 'ii7', 'V7', 'Imaj7', 'Imaj7'], bars: [1,1,1,1,1,1,1,1] },
    ],
    defaultScale: 'Major Scale (Ionian)',
    scaleTip: 'Try the major scale or mixolydian over dominant chords.',
  },
  {
    id: 'rock',
    name: 'Rock',
    progressions: [
      { numerals: ['I', 'IV', 'V'], bars: [4,4,4] },
      { numerals: ['I', 'V', 'IV'], bars: [4,4,4] },
      { numerals: ['I', 'IV', 'I', 'V', 'IV', 'I'], bars: [2,2,2,2,2,2] },
    ],
    defaultScale: 'Minor Pentatonic',
    scaleTip: 'Minor pentatonic is the go-to for classic rock solos.',
  },
  {
    id: 'folk',
    name: 'Folk',
    progressions: [
      { numerals: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'], bars: [1,1,1,1,1,1,1,1] },
      { numerals: ['I', 'IV', 'I', 'V'], bars: [2,2,2,2] },
    ],
    defaultScale: 'Major Scale (Ionian)',
    scaleTip: 'The full major scale or major pentatonic fits folk perfectly.',
  },
]

const selectedKey = ref('A')
const selectedStyle = ref('blues')
const tempo = ref(100)
const activeChordIndex = ref(0)
const progressionSeed = ref(0)

const currentStyle = computed(() => STYLES.find(s => s.id === selectedStyle.value))

function noteIndex(note: string): number {
  return ROOT_NOTES.indexOf(note)
}

function romanToChord(roman: string, key: string): { name: string; numeral: string } {
  const rootIdx = noteIndex(key)
  const isMinor = roman.toLowerCase() === roman && roman !== 'I'
  const isDiminished = roman.includes('°')
  const isDominant = roman.includes('7') && !roman.includes('maj')
  const isMajor7 = roman.includes('maj7')
  const isMinor7 = roman.includes('m7') || (isMinor && roman.includes('7'))

  let degree = 0
  const cleanRoman = roman.replace(/[^IViv°]/g, '')
  if (cleanRoman === 'I' || cleanRoman === 'i') degree = 0
  else if (cleanRoman === 'II' || cleanRoman === 'ii') degree = 2
  else if (cleanRoman === 'III' || cleanRoman === 'iii') degree = 4
  else if (cleanRoman === 'IV' || cleanRoman === 'iv') degree = 5
  else if (cleanRoman === 'V' || cleanRoman === 'v') degree = 7
  else if (cleanRoman === 'VI' || cleanRoman === 'vi') degree = 9
  else if (cleanRoman === 'VII' || cleanRoman === 'vii') degree = 11

  const chordRootIdx = (rootIdx + degree) % 12
  const chordRoot = ROOT_NOTES[chordRootIdx]

  let suffix = ''
  if (isDiminished) suffix = '°'
  else if (isMinor7) suffix = 'm7'
  else if (isMajor7) suffix = 'maj7'
  else if (isDominant) suffix = '7'
  else if (isMinor) suffix = 'm'

  return { name: chordRoot + suffix, numeral: roman }
}

const progression = computed(() => {
  const style = currentStyle.value
  if (!style) return []
  void progressionSeed.value // trigger reactivity
  const progSet = style.progressions[Math.floor(Math.random() * style.progressions.length)]
  return progSet.numerals.map((num, i) => ({
    ...romanToChord(num, selectedKey.value),
    bars: progSet.bars[i] || 1,
  }))
})

const activeChord = computed(() => progression.value[activeChordIndex.value] || null)

const activeChordData = computed(() => {
  if (!activeChord.value) return null
  const name = activeChord.value.name
  // Search chord database
  for (const category of Object.values(chordDatabase)) {
    const found = category.find((c: { name: string }) => c.name === name)
    if (found) return found
  }
  // Fallback to simple major/minor
  if (name.endsWith('m')) {
    return { name, fullName: name, strings: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], barre: null }
  }
  return { name, fullName: name, strings: [-1, -1, 0, 1, 2, 0], fingers: [0, 0, 0, 1, 2, 0], barre: null }
})

const suggestedScale = computed(() => {
  const style = currentStyle.value
  const rootIdx = noteIndex(selectedKey.value)
  const majorIntervals = [0, 2, 4, 5, 7, 9, 11]
  const minorIntervals = [0, 2, 3, 5, 7, 8, 10]
  const pentatonicMajor = [0, 2, 4, 7, 9]
  const pentatonicMinor = [0, 3, 5, 7, 10]
  const bluesIntervals = [0, 3, 5, 6, 7, 10]

  let intervals = majorIntervals
  const scaleName = style?.defaultScale || 'Major Scale'
  const tip = style?.scaleTip || 'Use the major scale.'

  if (scaleName.includes('Blues') || scaleName.includes('blues')) intervals = bluesIntervals
  else if (scaleName.includes('Minor Pentatonic')) intervals = pentatonicMinor
  else if (scaleName.includes('Major Pentatonic')) intervals = pentatonicMajor
  else if (scaleName.includes('minor') || scaleName.includes('Minor')) intervals = minorIntervals

  const notes = intervals.map(i => ROOT_NOTES[(rootIdx + i) % 12])

  return { name: scaleName, notes, tip }
})

function generateProgression() {
  progressionSeed.value++
  activeChordIndex.value = 0
}

// Generate initial progression
generateProgression()
</script>

<style scoped>
.jam-mode {
  padding: 0 24px 48px;
  max-width: 900px;
  margin: 0 auto;
}

.jam-controls {
  padding: 24px;
  margin-bottom: 24px;
}

.jam-controls h2 {
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
  margin-bottom: 16px;
  align-items: flex-end;
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

.style-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.style-btn {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.style-btn:hover {
  border-color: var(--bg-highlight);
}

.style-btn.active {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

.tempo-slider {
  width: 100%;
  margin-bottom: 4px;
}

.tempo-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--bg-highlight);
}

/* Progression Display */
.progression-display {
  padding: 24px;
  margin-bottom: 24px;
}

.progression-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.progression-header h3 {
  font-size: 18px;
  font-weight: 700;
}

.tempo-badge {
  padding: 4px 12px;
  border-radius: 20px;
  background: var(--bg-tertiary);
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
}

.progression-chords {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.chord-block {
  flex: 1;
  min-width: 80px;
  max-width: 120px;
  padding: 16px 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.chord-block:hover {
  background: var(--bg-card-hover);
}

.chord-block.active {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.chord-name {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.chord-numeral {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.chord-bars {
  font-size: 11px;
  color: var(--text-tertiary);
}

.active-chord-section {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.active-chord-section h4 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.no-chord {
  color: var(--text-secondary);
  font-style: italic;
  padding: 24px;
}

/* Scale Suggestion */
.scale-suggestion {
  padding: 24px;
  margin-bottom: 24px;
}

.scale-suggestion h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

.scale-name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--bg-highlight);
}

.scale-notes {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.scale-note {
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--bg-tertiary);
  font-weight: 700;
  font-size: 14px;
  border: 2px solid var(--border-color);
}

.scale-note.root {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

.scale-tip {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

@media (max-width: 600px) {
  .jam-mode {
    padding: 0 12px 32px;
  }
  .control-row {
    flex-direction: column;
    align-items: stretch;
  }
  .note-btn {
    width: 44px;
    height: 44px;
  }
  .style-btn {
    padding: 10px 14px;
    font-size: 14px;
  }
  .progression-chords {
    justify-content: center;
  }
  .chord-block {
    max-width: none;
    flex: 1 1 calc(50% - 6px);
  }
  .progression-header {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
