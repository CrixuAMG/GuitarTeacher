<template>
  <div class="voicing-explorer">
    <div class="explorer-header card">
      <h2>Chord Voicing Explorer</h2>
      <p class="subtitle">Find every way to play the same chord</p>

      <div class="control-row">
        <div class="control-group">
          <label>Chord</label>
          <div class="chord-buttons">
            <button
              v-for="chord in ALL_CHORD_NAMES"
              :key="chord"
              class="chord-btn"
              :class="{ active: selectedChord === chord }"
              @click="selectedChord = chord"
            >
              {{ chord }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="voicings.length" class="voicings-list">
      <div
        v-for="(v, i) in voicings"
        :key="i"
        class="voicing-card card"
      >
        <div class="voicing-header">
          <span class="voicing-position">Position {{ i + 1 }}</span>
          <span class="voicing-type">{{ v.type }}</span>
        </div>
        <div class="voicing-fretboard">
          <Fretboard :chord="v.chord" :max-frets="5" />
        </div>
        <div class="voicing-meta">
          <span class="meta-tag">{{ v.difficulty }}</span>
          <span v-if="v.fretRange" class="meta-tag">Frets {{ v.fretRange }}</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-state card">
      <p>No voicings found for this chord yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Fretboard from './Fretboard.vue'
import { getAllChords } from '../data/chords.js'

const ALL_CHORD_NAMES = [
  'C', 'Cm',
  'D', 'Dm', 'D7',
  'E', 'Em', 'E7',
  'F',
  'G', 'Gm', 'G7',
  'A', 'Am', 'A7',
  'B', 'Bm', 'B7',
]

const selectedChord = ref('C')

interface ChordData {
  name: string
  fullName: string
  strings: number[]
  fingers: number[]
  barre: { fret: number; fromString: number; toString: number } | null
  difficulty: number
  description: string
}

function getDifficultyLabel(level: number): string {
  if (level <= 1) return 'Beginner'
  if (level <= 2) return 'Intermediate'
  return 'Advanced'
}

function getFretRange(strings: number[]): string {
  const frets = strings.filter((f) => f > 0)
  if (frets.length === 0) return 'Open'
  const min = Math.min(...frets)
  const max = Math.max(...frets)
  return min === max ? String(min) : `${min}-${max}`
}

const voicings = computed(() => {
  const all = getAllChords() as ChordData[]
  const matches = all.filter((c) => c.name === selectedChord.value)

  return matches.map((c) => ({
    chord: c,
    type: c.barre ? 'Barre Shape' : 'Open Shape',
    difficulty: getDifficultyLabel(c.difficulty),
    fretRange: getFretRange(c.strings),
  }))
})
</script>

<style scoped>
.voicing-explorer {
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
  gap: 16px;
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

.chord-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chord-btn {
  padding: 8px 14px;
  border-radius: var(--radius-xl);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.chord-btn:hover {
  border-color: var(--bg-highlight);
  color: var(--bg-highlight);
}

.chord-btn.active {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

/* Voicings */
.voicings-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.voicing-card {
  padding: 20px;
  text-align: center;
}

.voicing-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.voicing-position {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.voicing-type {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--bg-highlight-light);
  color: var(--bg-highlight);
}

.voicing-fretboard {
  margin-bottom: 12px;
}

.voicing-meta {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}

.meta-tag {
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--bg-tertiary);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: var(--text-secondary);
}

@media (max-width: 700px) {
  .voicings-list {
    grid-template-columns: 1fr;
  }
}
</style>
