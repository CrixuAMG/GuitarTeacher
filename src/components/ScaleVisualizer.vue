<template>
  <div class="scale-visualizer">
    <div class="scale-controls card">
      <h2>Scale Visualizer</h2>
      <p class="subtitle">Explore scales and modes across the fretboard</p>

      <div class="control-row">
        <div class="control-group">
          <label>Key / Root</label>
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
          <label>Scale Type</label>
          <select v-model="selectedScale" class="scale-select">
            <option v-for="scale in SCALES" :key="scale.id" :value="scale.id">
              {{ scale.name }}
            </option>
          </select>
        </div>

        <div class="control-group">
          <label>Tuning</label>
          <select v-model="selectedTuning" class="scale-select">
            <option v-for="tuning in TUNINGS" :key="tuning.id" :value="tuning.id">
              {{ tuning.name }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="currentScale" class="scale-info">
        <h4>{{ currentScale.name }} in {{ selectedRoot }}</h4>
        <p>{{ currentScale.description }}</p>
        <div class="scale-notes">
          <span
            v-for="(note, i) in scaleNotes"
            :key="i"
            class="scale-note"
            :class="{ root: note === selectedRoot }"
          >
            {{ note }}
          </span>
        </div>
      </div>
    </div>

    <div class="fretboard-wrapper card" :class="{ 'left-handed': isLeftHanded }">
      <div class="fretboard">
        <div class="fretboard-header">
          <div class="string-labels">
            <div v-for="s in 6" :key="'sl'+s" class="string-label">
              {{ stringLabels[isLeftHanded ? s - 1 : 6 - s] }}
            </div>
          </div>
        </div>
        <div class="fretboard-body">
          <div class="nut"></div>
          <div
            v-for="fret in displayedFrets"
            :key="'fl'+fret"
            class="fret-line"
            :style="{ left: fretToPercent(fret) + '%' }"
          ></div>
          <div
            v-for="fret in displayedFrets"
            :key="'fm'+fret"
            class="fret-marker"
            :class="{ dot: isFretMarker(fret) }"
            :style="{ left: fretToPercent(fret) + '%' }"
          >
            <span v-if="isFretMarker(fret)" class="marker-dot"></span>
          </div>
          <template v-for="s in 6" :key="'str'+s">
            <div
              class="string-line"
              :style="{
                top: ((s - 0.5) / 6) * 100 + '%',
                height: s <= 2 ? '2px' : s <= 4 ? '3px' : '4px'
              }"
            ></div>
            <template v-for="fret in displayedFrets" :key="'n'+s+'-'+fret">
              <div
                v-if="getNoteAtFret(6 - s, fret)"
                class="note-marker"
                :class="getNoteClass(6 - s, fret)"
                :style="noteMarkerStyle(s, fret)"
                :title="getNoteAtFret(6 - s, fret)"
              >
                <span class="note-text">{{ getNoteAtFret(6 - s, fret) }}</span>
              </div>
            </template>
          </template>
        </div>
        <div class="fret-numbers">
          <div class="fret-zero-num">0</div>
          <div
            v-for="fret in displayedFrets"
            :key="'fn'+fret"
            class="fret-num"
            :style="{ left: fretToPercent(fret) + '%' }"
          >
            {{ fret }}
          </div>
        </div>
      </div>

      <div class="legend">
        <div class="legend-item">
          <span class="legend-dot root"></span>
          <span>Root</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot third"></span>
          <span>3rd</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot fifth"></span>
          <span>5th</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot other"></span>
          <span>Other</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSettings } from '../composables/useSettings.ts'

const { isLeftHanded } = useSettings()

const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const TUNINGS = [
  {
    id: 'standard',
    name: 'Standard (EADGBE)',
    notes: [4, 11, 7, 2, 9, 4], // high-to-low: e B G D A E
    labels: ['e', 'B', 'G', 'D', 'A', 'E'],
  },
  {
    id: 'drop_d',
    name: 'Drop D (DADGBE)',
    notes: [4, 11, 7, 2, 9, 2], // high-to-low: e B G D A D
    labels: ['e', 'B', 'G', 'D', 'A', 'D'],
  },
  {
    id: 'open_g',
    name: 'Open G (DGDGBD)',
    notes: [2, 11, 7, 2, 7, 2], // high-to-low: D B G D G D
    labels: ['D', 'B', 'G', 'D', 'G', 'D'],
  },
  {
    id: 'dadgad',
    name: 'DADGAD',
    notes: [2, 9, 7, 2, 9, 2], // high-to-low: D A G D A D
    labels: ['D', 'A', 'G', 'D', 'A', 'D'],
  },
]

const SCALES = [
  {
    id: 'major',
    name: 'Major (Ionian)',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: 'The foundational scale. Happy, bright, and resolved.',
  },
  {
    id: 'minor',
    name: 'Natural Minor (Aeolian)',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Sad, dark, and contemplative. The relative minor of major.',
  },
  {
    id: 'harmonic_minor',
    name: 'Harmonic Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    description: 'Exotic and dramatic. The raised 7th creates a powerful leading tone.',
  },
  {
    id: 'pentatonic_major',
    name: 'Major Pentatonic',
    intervals: [0, 2, 4, 7, 9],
    description: 'Five notes that sound good over almost everything. Country and pop favorite.',
  },
  {
    id: 'pentatonic_minor',
    name: 'Minor Pentatonic',
    intervals: [0, 3, 5, 7, 10],
    description: 'The most used scale in rock and blues. Essential for soloing.',
  },
  {
    id: 'blues',
    name: 'Blues Scale',
    intervals: [0, 3, 5, 6, 7, 10],
    description: 'The minor pentatonic plus the "blue note." Pure soul and tension.',
  },
  {
    id: 'dorian',
    name: 'Dorian Mode',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description: 'Minor with a raised 6th. Jazzy, bright minor sound.',
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian Mode',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    description: 'Major with a lowered 7th. Bluesy, rock sound.',
  },
  {
    id: 'phrygian',
    name: 'Phrygian Mode',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    description: 'Dark, exotic, Spanish-flavored. The lowered 2nd is its signature.',
  },
  {
    id: 'lydian',
    name: 'Lydian Mode',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    description: 'Major with a raised 4th. Dreamy, floating, modern sound.',
  },
]

const selectedRoot = ref('A')
const selectedScale = ref('pentatonic_minor')
const selectedTuning = ref('standard')

const currentTuning = computed(() => TUNINGS.find((t) => t.id === selectedTuning.value) || TUNINGS[0])
const stringTuning = computed(() => currentTuning.value.notes)
const stringLabels = computed(() => currentTuning.value.labels)
const displayedFrets = Array.from({ length: 15 }, (_, i) => i + 1)

const currentScale = computed(() => SCALES.find((s) => s.id === selectedScale.value))

function noteToIndex(note) {
  return ROOT_NOTES.indexOf(note)
}

function indexToNote(index) {
  return ROOT_NOTES[((index % 12) + 12) % 12]
}

const scaleNotes = computed(() => {
  const scale = currentScale.value
  if (!scale) return []
  const rootIdx = noteToIndex(selectedRoot.value)
  return scale.intervals.map((interval) => indexToNote(rootIdx + interval))
})

function getNoteAtFret(stringIndex, fret) {
  const openNote = stringTuning.value[stringIndex]
  const noteIdx = (openNote + fret) % 12
  return indexToNote(noteIdx)
}

function getNoteClass(stringIndex, fret) {
  const note = getNoteAtFret(stringIndex, fret)
  const scale = currentScale.value
  if (!scale) return ''

  const rootIdx = noteToIndex(selectedRoot.value)
  const noteIdx = noteToIndex(note)
  const interval = ((noteIdx - rootIdx) % 12 + 12) % 12

  if (interval === 0) return 'root'
  if (interval === 4 || interval === 3) return 'third'
  if (interval === 7) return 'fifth'
  if (scale.intervals.includes(interval)) return 'other'
  return ''
}

function isFretMarker(fret) {
  return [3, 5, 7, 9, 12].includes(fret)
}

function fretToPercent(fret) {
  return (fret / 15.5) * 100
}

function noteMarkerStyle(stringVisualIndex, fret) {
  const visualPosition = 6 - stringVisualIndex
  return {
    left: fretToPercent(fret - 0.5) + '%',
    top: ((visualPosition + 0.5) / 6) * 100 + '%',
  }
}
</script>

<style scoped>
.scale-visualizer {
  padding: 0 24px 48px;
  max-width: 900px;
  margin: 0 auto;
}

.scale-controls {
  padding: 24px;
  margin-bottom: 24px;
}

.scale-controls h2 {
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
  margin-bottom: 20px;
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

.scale-select {
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

.scale-info {
  background: var(--bg-tertiary);
  padding: 16px;
  border-radius: var(--radius-lg);
}

.scale-info h4 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
}

.scale-info p {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.scale-notes {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.scale-note {
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--bg-secondary);
  font-weight: 700;
  font-size: 14px;
  border: 2px solid var(--border-color);
}

.scale-note.root {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

.fretboard-wrapper {
  padding: 24px;
}

.fretboard {
  position: relative;
  user-select: none;
  margin-bottom: 16px;
}

.fretboard-header {
  margin-bottom: 4px;
}

.string-labels {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  text-align: center;
}

.string-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  padding: 2px 0;
}

.fretboard-body {
  position: relative;
  background: var(--bg-fretboard, #2a2a2a);
  border-radius: 8px;
  height: 200px;
  overflow: hidden;
  border: 2px solid var(--bg-fret, #444);
}

.nut {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 10px;
  background: var(--text-tertiary, #888);
  z-index: 4;
  border-radius: 2px;
}

.fret-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--bg-fret, #555);
  z-index: 1;
  transform: translateX(-50%);
}

.fret-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.fret-marker.dot .marker-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: block;
}

.string-line {
  position: absolute;
  left: 10px;
  right: 0;
  background: var(--string-color, #aaa);
  z-index: 2;
  transform: translateY(-50%);
}

.note-marker {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  z-index: 5;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  transition: all 0.2s;
  cursor: default;
}

.note-marker.root {
  background: #ef4444;
  color: white;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}

.note-marker.third {
  background: #3b82f6;
  color: white;
}

.note-marker.fifth {
  background: #22c55e;
  color: white;
}

.note-marker.other {
  background: #f59e0b;
  color: white;
}

.fret-numbers {
  position: relative;
  height: 24px;
  margin-top: 4px;
}

.fret-zero-num {
  position: absolute;
  left: 0;
  font-size: 11px;
  color: var(--text-tertiary);
  transform: translateX(3px);
}

.fret-num {
  position: absolute;
  font-size: 11px;
  color: var(--text-tertiary);
  transform: translateX(-50%);
}

.legend {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.legend-dot.root {
  background: #ef4444;
}
.legend-dot.third {
  background: #3b82f6;
}
.legend-dot.fifth {
  background: #22c55e;
}
.legend-dot.other {
  background: #f59e0b;
}

/* Left-handed mode */
.fretboard-wrapper.left-handed .fretboard-body {
  transform: scaleX(-1);
}

.fretboard-wrapper.left-handed .fretboard-header {
  transform: scaleX(-1);
}

.fretboard-wrapper.left-handed .string-label {
  transform: scaleX(-1);
}

.fretboard-wrapper.left-handed .note-marker {
  transform: translate(-50%, -50%) scaleX(-1);
}

.fretboard-wrapper.left-handed .note-text {
  display: inline-block;
  transform: scaleX(-1);
}

.fretboard-wrapper.left-handed .fret-numbers {
  transform: scaleX(-1);
}

.fretboard-wrapper.left-handed .fret-num,
.fretboard-wrapper.left-handed .fret-zero-num {
  transform: scaleX(-1);
}

@media (max-width: 600px) {
  .control-row {
    flex-direction: column;
  }
  .note-btn {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  .fretboard-body {
    height: 160px;
  }
  .note-marker {
    width: 24px;
    height: 24px;
    font-size: 9px;
  }
}
</style>
