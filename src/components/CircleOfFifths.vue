<template>
  <div class="circle-of-fifths">
    <div class="cof-controls card">
      <h2>Circle of Fifths</h2>
      <p class="subtitle">Explore keys, signatures, and chord relationships</p>

      <div class="mode-toggle">
        <button
          class="mode-btn"
          :class="{ active: displayMode === 'major' }"
          @click="displayMode = 'major'"
        >
          Major Keys
        </button>
        <button
          class="mode-btn"
          :class="{ active: displayMode === 'minor' }"
          @click="displayMode = 'minor'"
        >
          Minor Keys
        </button>
      </div>
    </div>

    <div class="cof-visual card">
      <svg viewBox="0 0 400 400" class="cof-svg">
        <!-- Background circles -->
        <circle cx="200" cy="200" r="180" fill="none" stroke="var(--border-color)" stroke-width="1" />
        <circle cx="200" cy="200" r="140" fill="none" stroke="var(--border-color)" stroke-width="1" />
        <circle cx="200" cy="200" r="100" fill="none" stroke="var(--border-color)" stroke-width="1" />

        <!-- Segment wedges -->
        <g v-for="(item, index) in circleItems" :key="item.key">
          <path
            :d="wedgePath(index, 12)"
            :fill="selectedKey === item.key ? 'var(--bg-highlight-light)' : 'transparent'"
            :stroke="selectedKey === item.key ? 'var(--bg-highlight)' : 'transparent'"
            stroke-width="2"
            class="wedge"
            @click="selectKey(item.key)"
          />
        </g>

        <!-- Major key labels (outer ring) -->
        <g
          v-for="(item, index) in circleItems"
          :key="'maj-'+item.key"
          class="key-label-group"
          @click="selectKey(item.key)"
        >
          <text
            :x="labelX(index, 12, 160)"
            :y="labelY(index, 12, 160)"
            text-anchor="middle"
            dominant-baseline="central"
            :fill="selectedKey === item.key ? 'var(--bg-highlight)' : 'var(--text-primary)'"
            :font-weight="selectedKey === item.key ? '800' : '600'"
            font-size="14"
            class="key-label"
          >
            {{ item.major }}
          </text>
        </g>

        <!-- Minor key labels (inner ring) -->
        <g
          v-for="(item, index) in circleItems"
          :key="'min-'+item.key"
          class="key-label-group"
          @click="selectKey(item.key)"
        >
          <text
            :x="labelX(index, 12, 120)"
            :y="labelY(index, 12, 120)"
            text-anchor="middle"
            dominant-baseline="central"
            :fill="selectedKey === item.key ? 'var(--bg-highlight)' : 'var(--text-secondary)'"
            :font-weight="selectedKey === item.key ? '700' : '500'"
            font-size="11"
            class="key-label"
          >
            {{ item.minor }}
          </text>
        </g>

        <!-- Accidental count labels -->
        <g
          v-for="(item, index) in circleItems"
          :key="'acc-'+item.key"
          @click="selectKey(item.key)"
        >
          <text
            :x="labelX(index, 12, 80)"
            :y="labelY(index, 12, 80)"
            text-anchor="middle"
            dominant-baseline="central"
            fill="var(--text-tertiary)"
            font-size="9"
          >
            {{ item.accidentals }}
          </text>
        </g>

        <!-- Center -->
        <circle cx="200" cy="200" r="45" fill="var(--bg-secondary)" stroke="var(--border-color)" stroke-width="2" />
        <text
          x="200"
          y="190"
          text-anchor="middle"
          dominant-baseline="central"
          fill="var(--text-primary)"
          font-size="11"
          font-weight="700"
        >
          {{ selectedInfo?.major || 'C' }}
        </text>
        <text
          x="200"
          y="205"
          text-anchor="middle"
          dominant-baseline="central"
          fill="var(--text-secondary)"
          font-size="9"
        >
          {{ selectedInfo?.minor || 'Am' }}
        </text>
        <text
          x="200"
          y="218"
          text-anchor="middle"
          dominant-baseline="central"
          fill="var(--text-tertiary)"
          font-size="8"
        >
          {{ selectedInfo ? selectedInfo.sharps + ' sharps' : '0 sharps' }}
        </text>
      </svg>
    </div>

    <div v-if="selectedInfo" class="key-details card">
      <div class="detail-header">
        <h3>{{ displayMode === 'major' ? selectedInfo.major : selectedInfo.minor }}</h3>
        <span class="badge" :class="selectedInfo.sharps >= 0 ? 'badge-sharps' : 'badge-flats'">
          {{ selectedInfo.sharps >= 0 ? selectedInfo.sharps + ' sharps' : Math.abs(selectedInfo.sharps) + ' flats' }}
        </span>
      </div>

      <div class="detail-section">
        <h4>Key Signature</h4>
        <div class="signature-notes">
          <span
            v-for="note in selectedInfo.signature"
            :key="note"
            class="sig-note"
          >
            {{ note }}
          </span>
          <span v-if="selectedInfo.signature.length === 0" class="sig-note empty">None (natural)</span>
        </div>
      </div>

      <div class="detail-section">
        <h4>Scale Notes</h4>
        <div class="scale-notes">
          <span
            v-for="(note, i) in selectedInfo.scaleNotes"
            :key="note + i"
            class="scale-note"
            :class="{ root: i === 0 }"
          >
            {{ note }}
          </span>
        </div>
      </div>

      <div class="detail-section">
        <h4>Diatonic Chords</h4>
        <div class="chord-grid">
          <div
            v-for="(chord, i) in selectedInfo.diatonicChords"
            :key="i"
            class="chord-item"
          >
            <span class="degree">{{ ROMAN_NUMERALS[i] }}</span>
            <span class="chord-name">{{ chord }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h4>Related Keys</h4>
        <div class="related-keys">
          <div class="related-item">
            <span class="related-label">Relative Minor</span>
            <span class="related-value">{{ selectedInfo.minor }}</span>
          </div>
          <div class="related-item">
            <span class="related-label">Relative Major</span>
            <span class="related-value">{{ selectedInfo.major }}</span>
          </div>
          <div class="related-item">
            <span class="related-label">Dominant</span>
            <span class="related-value">{{ selectedInfo.dominant }}</span>
          </div>
          <div class="related-item">
            <span class="related-label">Subdominant</span>
            <span class="related-value">{{ selectedInfo.subdominant }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface CircleItem {
  key: string
  major: string
  minor: string
  sharps: number
  accidentals: string
  signature: string[]
  scaleNotes: string[]
  diatonicChords: string[]
  dominant: string
  subdominant: string
}

const ROMAN_NUMERALS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const MAJOR_KEYS: { major: string; minor: string; sharps: number }[] = [
  { major: 'C', minor: 'Am', sharps: 0 },
  { major: 'G', minor: 'Em', sharps: 1 },
  { major: 'D', minor: 'Bm', sharps: 2 },
  { major: 'A', minor: 'F#m', sharps: 3 },
  { major: 'E', minor: 'C#m', sharps: 4 },
  { major: 'B', minor: 'G#m', sharps: 5 },
  { major: 'F#', minor: 'D#m', sharps: 6 },
  { major: 'C#', minor: 'A#m', sharps: 7 },
  { major: 'F', minor: 'Dm', sharps: -1 },
  { major: 'Bb', minor: 'Gm', sharps: -2 },
  { major: 'Eb', minor: 'Cm', sharps: -3 },
  { major: 'Ab', minor: 'Fm', sharps: -4 },
  { major: 'Db', minor: 'Bbm', sharps: -5 },
  { major: 'Gb', minor: 'Ebm', sharps: -6 },
  { major: 'Cb', minor: 'Abm', sharps: -7 },
]

// Reorder to circle of fifths clockwise starting from C at top
const CIRCLE_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 14, 13, 12, 11, 10, 9, 8]

const displayMode = ref<'major' | 'minor'>('major')
const selectedKey = ref('C')

const SHARP_ORDER = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#']
const FLAT_ORDER = ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb']

function getSignature(sharps: number): string[] {
  if (sharps === 0) return []
  if (sharps > 0) return SHARP_ORDER.slice(0, sharps)
  return FLAT_ORDER.slice(0, Math.abs(sharps))
}

function noteIndex(note: string): number {
  const idx = NOTES.indexOf(note)
  if (idx >= 0) return idx
  return FLAT_NOTES.indexOf(note)
}

function getScaleNotes(majorKey: string): string[] {
  const rootIdx = noteIndex(majorKey)
  const intervals = [0, 2, 4, 5, 7, 9, 11]
  return intervals.map(i => {
    const idx = (rootIdx + i) % 12
    // Prefer sharps for sharp keys, flats for flat keys
    const sharps = MAJOR_KEYS.find(k => k.major === majorKey)?.sharps ?? 0
    if (sharps < 0) return FLAT_NOTES[idx]
    return NOTES[idx]
  })
}

function getDiatonicChords(majorKey: string): string[] {
  const notes = getScaleNotes(majorKey)
  const qualities = ['', 'm', 'm', '', '', 'm', '°']
  return notes.map((note, i) => note + qualities[i])
}

function getDominant(majorKey: string): string {
  const rootIdx = noteIndex(majorKey)
  const domIdx = (rootIdx + 7) % 12
  const sharps = MAJOR_KEYS.find(k => k.major === majorKey)?.sharps ?? 0
  if (sharps < 0) return FLAT_NOTES[domIdx]
  return NOTES[domIdx]
}

function getSubdominant(majorKey: string): string {
  const rootIdx = noteIndex(majorKey)
  const subIdx = (rootIdx + 5) % 12
  const sharps = MAJOR_KEYS.find(k => k.major === majorKey)?.sharps ?? 0
  if (sharps < 0) return FLAT_NOTES[subIdx]
  return NOTES[subIdx]
}

const circleItems = computed<CircleItem[]>(() => {
  return CIRCLE_ORDER.map(idx => {
    const key = MAJOR_KEYS[idx]
    return {
      key: key.major,
      major: key.major,
      minor: key.minor,
      sharps: key.sharps,
      accidentals: key.sharps === 0 ? '0' : key.sharps > 0 ? `+${key.sharps}` : `${key.sharps}`,
      signature: getSignature(key.sharps),
      scaleNotes: getScaleNotes(key.major),
      diatonicChords: getDiatonicChords(key.major),
      dominant: getDominant(key.major),
      subdominant: getSubdominant(key.major),
    }
  })
})

const selectedInfo = computed<CircleItem | null>(() => {
  return circleItems.value.find(item => item.key === selectedKey.value) || null
})

function selectKey(key: string) {
  selectedKey.value = key
}

function wedgePath(index: number, total: number): string {
  const cx = 200
  const cy = 200
  const innerR = 60
  const outerR = 190
  const anglePer = (2 * Math.PI) / total
  const startAngle = index * anglePer - Math.PI / 2 - anglePer / 2
  const endAngle = startAngle + anglePer

  const x1 = cx + innerR * Math.cos(startAngle)
  const y1 = cy + innerR * Math.sin(startAngle)
  const x2 = cx + outerR * Math.cos(startAngle)
  const y2 = cy + outerR * Math.sin(startAngle)
  const x3 = cx + outerR * Math.cos(endAngle)
  const y3 = cy + outerR * Math.sin(endAngle)
  const x4 = cx + innerR * Math.cos(endAngle)
  const y4 = cy + innerR * Math.sin(endAngle)

  return `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1} Z`
}

function labelX(index: number, total: number, radius: number): number {
  const anglePer = (2 * Math.PI) / total
  const angle = index * anglePer - Math.PI / 2
  return 200 + radius * Math.cos(angle)
}

function labelY(index: number, total: number, radius: number): number {
  const anglePer = (2 * Math.PI) / total
  const angle = index * anglePer - Math.PI / 2
  return 200 + radius * Math.sin(angle)
}
</script>

<style scoped>
.circle-of-fifths {
  padding: 0 24px 48px;
  max-width: 900px;
  margin: 0 auto;
}

.cof-controls {
  padding: 24px;
  margin-bottom: 24px;
}

.cof-controls h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.mode-toggle {
  display: flex;
  gap: 8px;
}

.mode-btn {
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

.mode-btn:hover {
  border-color: var(--bg-highlight);
}

.mode-btn.active {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

.cof-visual {
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.cof-svg {
  width: 100%;
  max-width: 400px;
  height: auto;
}

.wedge {
  cursor: pointer;
  transition: all 0.2s;
}

.wedge:hover {
  fill: var(--bg-tertiary) !important;
  opacity: 0.7;
}

.key-label-group {
  cursor: pointer;
}

.key-label {
  cursor: pointer;
  transition: all 0.2s;
}

/* Key Details */
.key-details {
  padding: 24px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.detail-header h3 {
  font-size: 22px;
  font-weight: 800;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-sharps {
  background: #fef3c7;
  color: #92400e;
}

.badge-flats {
  background: #e0f2fe;
  color: #0369a1;
}

[data-theme="dark"] .badge-sharps {
  background: #78350f;
  color: #fcd34d;
}

[data-theme="dark"] .badge-flats {
  background: #0c4a6e;
  color: #7dd3fc;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.signature-notes,
.scale-notes {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sig-note,
.scale-note {
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--bg-tertiary);
  font-weight: 700;
  font-size: 14px;
  border: 2px solid var(--border-color);
}

.sig-note.empty {
  font-weight: 500;
  color: var(--text-secondary);
}

.scale-note.root {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

.chord-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.chord-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.degree {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-tertiary);
}

.chord-name {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-primary);
}

.related-keys {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.related-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.related-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.related-value {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
}

@media (max-width: 600px) {
  .circle-of-fifths {
    padding: 0 12px 32px;
  }
  .chord-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .detail-header {
    flex-wrap: wrap;
  }
  .mode-toggle {
    flex-wrap: wrap;
  }
  .cof-visual {
    padding: 12px;
  }
  .related-keys {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
