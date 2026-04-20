<template>
  <div class="capo-calculator">
    <div class="capo-controls card">
      <h2>Capo Calculator</h2>
      <p class="subtitle">Find the best capo position for any key</p>

      <div class="control-row">
        <div class="control-group">
          <label>Original Key (chord shapes you know)</label>
          <div class="note-buttons">
            <button
              v-for="note in ROOT_NOTES"
              :key="note"
              class="note-btn"
              :class="{ active: originalKey === note }"
              @click="originalKey = note"
            >
              {{ note }}
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>Target Key (key you want to play in)</label>
          <div class="note-buttons">
            <button
              v-for="note in ROOT_NOTES"
              :key="note"
              class="note-btn"
              :class="{ active: targetKey === note }"
              @click="targetKey = note"
            >
              {{ note }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="capo-result card">
      <div class="result-header">
        <h3>Capo Position</h3>
        <span v-if="capoFret > 0" class="capo-badge">Fret {{ capoFret }}</span>
        <span v-else class="capo-badge no-capo">No Capo Needed</span>
      </div>

      <div v-if="capoFret > 0" class="result-detail">
        <p class="result-text">
          Put the capo on <strong>fret {{ capoFret }}</strong> and play as if you're in <strong>{{ originalKey }}</strong>.
          The actual sound will be in <strong>{{ targetKey }}</strong>.
        </p>

        <div class="example-chords">
          <h4>Example Chords</h4>
          <div class="chord-mapping">
            <div
              v-for="map in exampleMappings"
              :key="map.original"
              class="mapping-item"
            >
              <span class="original-chord">{{ map.original }}</span>
              <span class="arrow">→</span>
              <span class="transposed-chord">{{ map.transposed }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="result-detail">
        <p class="result-text">
          No capo needed! The keys are the same, so just play normally in <strong>{{ originalKey }}</strong>.
        </p>
      </div>
    </div>

    <div class="capo-positions card">
      <h3>All Positions for {{ originalKey }} Shapes</h3>
      <p class="subtitle-small">Every fret position and what key it produces</p>
      <div class="positions-grid">
        <div
          v-for="pos in allPositions"
          :key="pos.fret"
          class="position-item"
          :class="{ active: pos.fret === capoFret }"
        >
          <span class="position-fret">{{ pos.fret }}</span>
          <span class="position-key">{{ pos.key }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const originalKey = ref('G')
const targetKey = ref('B')

const originalIdx = computed(() => ROOT_NOTES.indexOf(originalKey.value))
const targetIdx = computed(() => ROOT_NOTES.indexOf(targetKey.value))

const capoFret = computed(() => {
  let diff = targetIdx.value - originalIdx.value
  if (diff < 0) diff += 12
  return diff
})

function transposeChord(chord: string, semitones: number): string {
  const match = chord.match(/^([A-G][#b]?)(.*)/)
  if (!match) return chord
  const [, root, suffix] = match
  const idx = ROOT_NOTES.indexOf(root)
  if (idx === -1) return chord
  const newIdx = (idx + semitones) % 12
  return ROOT_NOTES[newIdx] + suffix
}

const exampleMappings = computed(() => {
  const baseShapes: Record<string, string> = {
    I: originalKey.value,
    V: ROOT_NOTES[(originalIdx.value + 7) % 12],
    vi: ROOT_NOTES[(originalIdx.value + 9) % 12] + 'm',
    IV: ROOT_NOTES[(originalIdx.value + 5) % 12],
  }
  return ['I', 'V', 'vi', 'IV'].map(roman => ({
    original: baseShapes[roman],
    transposed: transposeChord(baseShapes[roman], capoFret.value),
  }))
})

const allPositions = computed(() => {
  return Array.from({ length: 12 }, (_, i) => ({
    fret: i,
    key: ROOT_NOTES[(originalIdx.value + i) % 12],
  }))
})
</script>

<style scoped>
.capo-calculator {
  padding: 0 24px 48px;
  max-width: 700px;
  margin: 0 auto;
}

.capo-controls {
  padding: 24px;
  margin-bottom: 24px;
}

.capo-controls h2 {
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
  flex-direction: column;
  gap: 20px;
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 700;
  font-size: 14px;
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

/* Result */
.capo-result {
  padding: 24px;
  margin-bottom: 24px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.result-header h3 {
  font-size: 18px;
  font-weight: 700;
}

.capo-badge {
  padding: 4px 12px;
  border-radius: 20px;
  background: var(--bg-highlight);
  color: white;
  font-size: 13px;
  font-weight: 700;
}

.capo-badge.no-capo {
  background: var(--bg-success);
}

.result-text {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
}

.result-text strong {
  color: var(--text-primary);
}

.example-chords h4 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.chord-mapping {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.mapping-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.original-chord {
  font-weight: 700;
  font-size: 16px;
}

.arrow {
  color: var(--text-tertiary);
  font-size: 14px;
}

.transposed-chord {
  font-weight: 700;
  font-size: 16px;
  color: var(--bg-highlight);
}

/* All Positions */
.capo-positions {
  padding: 24px;
}

.capo-positions h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.subtitle-small {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 16px;
}

.positions-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.position-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  transition: all 0.2s;
}

.position-item.active {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.position-fret {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
}

.position-key {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
}

.position-item.active .position-key {
  color: var(--bg-highlight);
}

@media (max-width: 600px) {
  .capo-calculator {
    padding: 0 12px 32px;
  }
  .chord-mapping {
    grid-template-columns: repeat(2, 1fr);
  }
  .positions-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .note-btn {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }
}
</style>
