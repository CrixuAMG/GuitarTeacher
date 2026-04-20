<template>
  <div class="transpose-tool">
    <div class="transpose-controls card">
      <h2>Transposition Tool</h2>
      <p class="subtitle">Instantly shift any chord chart to a new key</p>

      <div class="key-row">
        <div class="key-group">
          <label>From Key</label>
          <div class="note-buttons">
            <button
              v-for="note in ROOT_NOTES"
              :key="note"
              class="note-btn"
              :class="{ active: fromKey === note }"
              @click="fromKey = note"
            >
              {{ note }}
            </button>
          </div>
        </div>

        <div class="arrow">→</div>

        <div class="key-group">
          <label>To Key</label>
          <div class="note-buttons">
            <button
              v-for="note in ROOT_NOTES"
              :key="note"
              class="note-btn"
              :class="{ active: toKey === note }"
              @click="toKey = note"
            >
              {{ note }}
            </button>
          </div>
        </div>
      </div>

      <div class="shift-badge">
        Shift: <strong>{{ shift > 0 ? '+' : '' }}{{ shift }} semitones</strong>
      </div>
    </div>

    <div class="chord-io">
      <div class="io-panel card">
        <label class="io-label">Original Chords</label>
        <textarea
          v-model="inputText"
          class="chord-textarea"
          placeholder="Paste chords here...&#10;C G Am F&#10;Or one per line:&#10;C&#10;G/B&#10;Am7&#10;Fmaj7"
          rows="8"
        />
        <div class="io-meta">{{ originalChords.length }} chords detected</div>
      </div>

      <div class="io-panel card">
        <label class="io-label">Transposed Chords</label>
        <textarea
          :value="transposedText"
          class="chord-textarea output"
          rows="8"
          readonly
        />
        <div class="io-meta">
          <button class="btn-copy" @click="copyOutput">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy
          </button>
        </div>
      </div>
    </div>

    <div class="common-shifts card">
      <h3>Common Transpositions</h3>
      <div class="shifts-grid">
        <button
          v-for="s in commonShifts"
          :key="s.label"
          class="shift-chip"
          @click="applyShift(s.semitones)"
        >
          {{ s.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_EQUIVALENTS: Record<string, string> = {
  'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb',
}

const fromKey = ref('C')
const toKey = ref('D')
const inputText = ref('C\nG\nAm\nF\nC/E\nG/B\nAm7\nFmaj7')
const copied = ref(false)

const shift = computed(() => {
  const fromIdx = ROOT_NOTES.indexOf(fromKey.value)
  const toIdx = ROOT_NOTES.indexOf(toKey.value)
  return (toIdx - fromIdx + 12) % 12
})

const commonShifts = [
  { label: 'Up 1 (semitone)', semitones: 1 },
  { label: 'Up 2 (whole step)', semitones: 2 },
  { label: 'Up 3 (minor 3rd)', semitones: 3 },
  { label: 'Up 4 (major 3rd)', semitones: 4 },
  { label: 'Up 5 (perfect 4th)', semitones: 5 },
  { label: 'Up 7 (perfect 5th)', semitones: 7 },
  { label: 'Down 1', semitones: -1 },
  { label: 'Down 2', semitones: -2 },
]

function transposeChord(chord: string, semitones: number): string {
  if (!chord.trim()) return chord

  // Match root note at start (supports C#, Db, etc.)
  const match = chord.match(/^([A-G][#b]?)(.*)/)
  if (!match) return chord

  const [, root, suffix] = match
  let rootIdx = ROOT_NOTES.indexOf(root)

  // Handle flat notation input
  if (rootIdx === -1) {
    const flatToSharp: Record<string, string> = {
      Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#',
    }
    const sharp = flatToSharp[root]
    if (sharp) rootIdx = ROOT_NOTES.indexOf(sharp)
  }

  if (rootIdx === -1) return chord

  const newIdx = (rootIdx + semitones + 12) % 12
  let newRoot = ROOT_NOTES[newIdx]

  // Prefer flats for certain keys if original used flats
  if (root.includes('b') && FLAT_EQUIVALENTS[newRoot]) {
    newRoot = FLAT_EQUIVALENTS[newRoot]
  }

  return newRoot + suffix
}

const originalChords = computed(() => {
  return inputText.value
    .split(/[\s\n]+/)
    .map(c => c.trim())
    .filter(c => c.length > 0)
})

const transposedText = computed(() => {
  const lines = inputText.value.split('\n')
  return lines
    .map(line => {
      const tokens = line.split(/\s+/)
      return tokens
        .map(token => transposeChord(token, shift.value))
        .join(' ')
    })
    .join('\n')
})

function applyShift(semitones: number) {
  const fromIdx = ROOT_NOTES.indexOf(fromKey.value)
  const newIdx = (fromIdx + semitones + 12) % 12
  toKey.value = ROOT_NOTES[newIdx]
}

function copyOutput() {
  navigator.clipboard.writeText(transposedText.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<style scoped>
.transpose-tool {
  padding: 0 24px 48px;
  max-width: 900px;
  margin: 0 auto;
}

.transpose-controls {
  padding: 24px;
  margin-bottom: 24px;
}

.transpose-controls h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.key-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.key-group {
  flex: 1;
  min-width: 200px;
}

.key-group label {
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

.arrow {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-tertiary);
  padding-bottom: 8px;
}

.shift-badge {
  display: inline-block;
  padding: 6px 14px;
  background: var(--bg-tertiary);
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-secondary);
}

.shift-badge strong {
  color: var(--bg-highlight);
}

/* Chord I/O */
.chord-io {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.io-panel {
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.io-label {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.chord-textarea {
  width: 100%;
  flex: 1;
  min-height: 160px;
  padding: 14px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 15px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
}

.chord-textarea:focus {
  border-color: var(--bg-highlight);
}

.chord-textarea.output {
  background: var(--bg-tertiary);
}

.io-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.btn-copy {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy:hover {
  border-color: var(--bg-highlight);
  color: var(--bg-highlight);
}

/* Common shifts */
.common-shifts {
  padding: 24px;
}

.common-shifts h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 14px;
}

.shifts-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.shift-chip {
  padding: 8px 14px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.shift-chip:hover {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

@media (max-width: 600px) {
  .transpose-tool {
    padding: 0 12px 32px;
  }
  .chord-io {
    grid-template-columns: 1fr;
  }
  .key-row {
    flex-direction: column;
    align-items: stretch;
  }
  .arrow {
    text-align: center;
    transform: rotate(90deg);
    padding: 0;
  }
  .note-btn {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }
}
</style>
