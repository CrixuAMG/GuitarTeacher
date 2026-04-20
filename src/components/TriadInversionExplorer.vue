<template>
  <div class="triad-explorer">
    <div class="explorer-header card">
      <h2>Triad Inversion Explorer</h2>
      <p class="subtitle">Discover triad shapes across the fretboard</p>

      <div class="control-row">
        <div class="control-group">
          <label>Root</label>
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
          <label>Quality</label>
          <div class="quality-buttons">
            <button
              v-for="q in QUALITIES"
              :key="q.id"
              class="quality-btn"
              :class="{ active: selectedQuality === q.id }"
              @click="selectedQuality = q.id"
            >
              {{ q.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="inversions-grid">
      <div
        v-for="inv in inversions"
        :key="inv.name"
        class="inversion-card card"
        :class="{ expanded: expandedInv === inv.name }"
        @click="toggleExpand(inv.name)"
      >
        <div class="inv-header">
          <h3>{{ inv.name }}</h3>
          <span class="inv-label">{{ inv.label }}</span>
        </div>

        <div class="inv-notes">
          <span
            v-for="(note, i) in inv.notes"
            :key="i"
            class="inv-note"
            :class="{ root: i === inv.rootIndex }"
          >
            {{ note }}
          </span>
        </div>

        <div class="inv-intervals">
          <span
            v-for="(interval, i) in inv.intervals"
            :key="i"
            class="inv-interval"
          >
            {{ interval }}
          </span>
        </div>

        <div v-if="inv.voicing" class="mini-fretboard">
          <div class="mf-strings">
            <div v-for="s in 3" :key="s" class="mf-string-row">
              <span class="mf-string-name">{{ inv.voicing.strings[3 - s] }}</span>
              <div class="mf-frets">
                <div
                  v-for="f in 5"
                  :key="f"
                  class="mf-fret"
                  :class="{
                    'mf-dot': inv.voicing.frets[3 - s] === f - 1,
                    'mf-root': inv.voicing.frets[3 - s] === f - 1 && inv.voicing.isRoot[3 - s],
                  }"
                >
                  <span v-if="inv.voicing.frets[3 - s] === f - 1" class="mf-fret-num">{{ f - 1 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="expandedInv === inv.name" class="inv-detail">
          <p class="inv-desc">{{ inv.description }}</p>
          <div v-if="inv.allVoicings.length" class="all-voicings">
            <h4>More Voicings</h4>
            <div class="voicing-list">
              <div
                v-for="(v, idx) in inv.allVoicings.slice(1, 4)"
                :key="idx"
                class="voicing-item"
              >
                <span class="v-strings">Strings {{ v.stringSet }}</span>
                <span class="v-frets">{{ v.fretString }}</span>
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

const STRING_OPEN = [4, 11, 7, 2, 9, 4] // high e, B, G, D, A, low E
const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']

const QUALITIES = [
  { id: 'major', name: 'Major', intervals: [0, 4, 7], desc: 'Bright, stable, happy. The foundation of all harmony.' },
  { id: 'minor', name: 'Minor', intervals: [0, 3, 7], desc: 'Dark, sad, contemplative. Just one note different from major.' },
  { id: 'dim', name: 'Diminished', intervals: [0, 3, 6], desc: 'Tense, unstable, dramatic. Two minor thirds stacked.' },
  { id: 'aug', name: 'Augmented', intervals: [0, 4, 8], desc: 'Dreamy, ambiguous, floating. Two major thirds stacked.' },
]

const selectedRoot = ref('C')
const selectedQuality = ref('major')
const expandedInv = ref<string | null>(null)

function toggleExpand(name: string) {
  expandedInv.value = expandedInv.value === name ? null : name
}

function noteToIndex(note: string): number {
  return ROOT_NOTES.indexOf(note)
}

function indexToNote(index: number): string {
  return ROOT_NOTES[((index % 12) + 12) % 12]
}

interface Voicing {
  strings: string[]
  frets: number[]
  isRoot: boolean[]
  stringSet: string
  fretString: string
}

function findVoicings(rootIdx: number, intervals: number[], inversionIndex: number): Voicing[] {
  const triadNotes = intervals.map((int) => (rootIdx + int) % 12)
  const voicings: Voicing[] = []

  // String groups to check (adjacent 3-string groups)
  const stringGroups = [
    [0, 1, 2], // e B G
    [1, 2, 3], // B G D
    [2, 3, 4], // G D A
    [3, 4, 5], // D A E
  ]

  for (const group of stringGroups) {
    for (let baseFret = 0; baseFret <= 12; baseFret++) {
      for (let f0 = 0; f0 <= 4; f0++) {
        for (let f1 = 0; f1 <= 4; f1++) {
          for (let f2 = 0; f2 <= 4; f2++) {
            const frets = [baseFret + f0, baseFret + f1, baseFret + f2]
            if (frets.some((f) => f > 14)) continue

            const notes = group.map((s, i) => (STRING_OPEN[s] + frets[i]) % 12)
            const sortedTriad = [...triadNotes].sort((a, b) => a - b)
            const sortedNotes = [...notes].sort((a, b) => a - b)

            if (sortedTriad.every((n, i) => n === sortedNotes[i])) {
              // Determine which note in the voicing is the root
              const rootNoteIdx = triadNotes[0] // root note semitone index
              const isRoot = notes.map((n) => n === rootNoteIdx)

              // Check if this matches the desired inversion (bass note)
              const bassNote = notes[2] // lowest string is last in group (index 2)
              const inversionRoot = triadNotes[inversionIndex]

              if (bassNote === inversionRoot) {
                voicings.push({
                  strings: group.map((s) => STRING_NAMES[s]),
                  frets: [...frets],
                  isRoot: [...isRoot],
                  stringSet: `${STRING_NAMES[group[2]]}-${STRING_NAMES[group[1]]}-${STRING_NAMES[group[0]]}`,
                  fretString: frets.reverse().join('-'),
                })
              }
            }
          }
        }
      }
    }
  }

  // Sort by total fret span and position
  return voicings
    .map((v) => ({
      ...v,
      span: Math.max(...v.frets) - Math.min(...v.frets),
      maxFret: Math.max(...v.frets),
    }))
    .sort((a, b) => a.span - b.span || a.maxFret - b.maxFret)
    .slice(0, 20)
    .map((v) => ({
      strings: v.strings,
      frets: v.frets,
      isRoot: v.isRoot,
      stringSet: v.stringSet,
      fretString: v.fretString,
    }))
}

const inversions = computed(() => {
  const quality = QUALITIES.find((q) => q.id === selectedQuality.value)
  if (!quality) return []

  const rootIdx = noteToIndex(selectedRoot.value)
  const inversionLabels = ['Root Position', '1st Inversion', '2nd Inversion']
  const inversionDesc = [
    'Root is the lowest note. The strongest, most stable voicing.',
    '3rd is the lowest note. Smoother voice leading from root position.',
    '5th is the lowest note. Creates a more open, suspended sound.',
  ]

  return [0, 1, 2].map((invIdx) => {
    const rotatedIntervals = [...quality.intervals.slice(invIdx), ...quality.intervals.slice(0, invIdx)]
    const notes = rotatedIntervals.map((int) => indexToNote(rootIdx + int))
    const allVoicings = findVoicings(rootIdx, quality.intervals, invIdx)
    const bestVoicing = allVoicings[0] || null

    return {
      name: inversionLabels[invIdx],
      label: `${notes[0]} in the bass`,
      notes,
      intervals: rotatedIntervals.map((int) => {
        const rel = (int - rotatedIntervals[0] + 12) % 12
        if (rel === 0) return 'R'
        if (rel === 3) return 'b3'
        if (rel === 4) return '3'
        if (rel === 6) return 'b5'
        if (rel === 7) return '5'
        if (rel === 8) return '#5'
        return String(rel)
      }),
      rootIndex: (3 - invIdx) % 3,
      voicing: bestVoicing,
      allVoicings,
      description: inversionDesc[invIdx],
    }
  })
})
</script>

<style scoped>
.triad-explorer {
  padding: 0 24px 48px;
  max-width: 900px;
  margin: 0 auto;
}

.explorer-header {
  padding: 24px;
  margin-bottom: 24px;
}

.explorer-header h2 {
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
  margin-bottom: 10px;
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

.quality-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quality-btn {
  padding: 8px 16px;
  border-radius: var(--radius-xl);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.quality-btn:hover {
  border-color: var(--bg-highlight);
  color: var(--bg-highlight);
}

.quality-btn.active {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

/* Inversions Grid */
.inversions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.inversion-card {
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.inversion-card:hover {
  border-color: var(--border-color);
}

.inversion-card.expanded {
  border-color: var(--bg-highlight);
}

.inv-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.inv-header h3 {
  font-size: 16px;
  font-weight: 800;
}

.inv-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.inv-notes {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.inv-note {
  padding: 8px 14px;
  border-radius: 20px;
  background: var(--bg-tertiary);
  font-weight: 800;
  font-size: 16px;
  border: 2px solid var(--border-color);
}

.inv-note.root {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

.inv-intervals {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.inv-interval {
  padding: 4px 10px;
  border-radius: 12px;
  background: var(--bg-secondary);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
}

/* Mini Fretboard */
.mini-fretboard {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-bottom: 8px;
}

.mf-string-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.mf-string-row:last-child {
  margin-bottom: 0;
}

.mf-string-name {
  width: 20px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  text-align: center;
}

.mf-frets {
  display: flex;
  gap: 4px;
  flex: 1;
}

.mf-fret {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: transparent;
}

.mf-fret.mf-dot {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.mf-fret.mf-dot.mf-root {
  background: #ef4444;
  border-color: #ef4444;
}

.mf-fret-num {
  font-size: 10px;
  font-weight: 800;
}

/* Detail */
.inv-detail {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border-color);
}

.inv-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.5;
}

.all-voicings h4 {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.voicing-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.voicing-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  font-size: 13px;
}

.v-strings {
  font-weight: 600;
}

.v-frets {
  color: var(--text-secondary);
  font-weight: 700;
  font-family: monospace;
}

@media (max-width: 700px) {
  .inversions-grid {
    grid-template-columns: 1fr;
  }
  .note-btn {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
}
</style>
