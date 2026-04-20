<template>
  <div class="sheet-music">
    <div class="staff-container">
      <div class="staff-label">Notes</div>
      <div class="staff">
        <div v-for="n in 5" :key="'l'+n" class="staff-line" :style="{ top: ((n-1) / 4) * 100 + '%' }"></div>
        <div
          v-for="(note, i) in visibleNotes"
          :key="'n'+i"
          class="note"
          :class="{ active: note.position <= currentBeat && note.position + note.duration > currentBeat }"
          :style="noteStyle(note)"
        >
          <span class="note-label">{{ note.pitch }}</span>
        </div>
        <div v-if="currentBeat > 0" class="playhead" :style="{ left: playheadPercent + '%' }"></div>
      </div>
    </div>
    <div class="chord-row">
      <div class="chord-label">Chords</div>
      <div class="chord-cells">
        <div
          v-for="(chord, i) in chords"
          :key="'c'+i"
          class="chord-cell"
          :class="{ active: isChordActive(i) }"
          :style="{ width: (chord.duration / totalBeats * 100) + '%' }"
        >
          {{ chord.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SheetNote {
  position: number
  duration: number
  pitch?: string
}

interface SheetChord {
  name: string
  duration: number
  position?: number
}

const props = defineProps({
  notes: { type: Array as () => SheetNote[], default: () => [] },
  chords: { type: Array as () => SheetChord[], default: () => [] },
  currentBeat: { type: Number, default: 0 },
  totalBeats: { type: Number, default: 0 }
})

const visibleNotes = computed(() => {
  if (!props.notes.length) return []
  return props.notes
})

const playheadPercent = computed(() => {
  if (props.totalBeats === 0) return 0
  return Math.min((props.currentBeat / props.totalBeats) * 100, 100)
})

const totalBeats = computed(() => {
  if (props.totalBeats > 0) return props.totalBeats
  if (props.chords.length > 0) {
    const last = props.chords[props.chords.length - 1]
    return (last.position || 0) + last.duration
  }
  return 0
})

function noteStyle(note) {
  const left = (note.position / totalBeats.value) * 100
  const width = Math.max((note.duration / totalBeats.value) * 100, 2)
  return { left: left + '%', width: width + '%' }
}

function isChordActive(i) {
  const chord = props.chords[i]
  return props.currentBeat >= chord.position && props.currentBeat < chord.position + chord.duration
}
</script>

<style scoped>
.sheet-music {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.staff-container {
  position: relative;
  padding: 24px 16px 24px 70px;
  overflow-x: auto;
  border-bottom: 1px solid var(--border-color);
}
.staff-label, .chord-label {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-tertiary);
  writing-mode: vertical-lr;
  text-orientation: mixed;
}
.staff {
  position: relative;
  height: 100px;
  min-width: 100%;
}
.staff-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border-color);
}
.playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--bg-highlight);
  z-index: 5;
  transition: left 0.1s linear;
}
.playhead::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--bg-highlight);
}
.note {
  position: absolute;
  height: 24px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  transform: translateY(-50%);
  top: 50%;
}
.note.active {
  background: var(--bg-highlight);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4);
}
.note-label {
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  padding: 0 4px;
}
.chord-row {
  position: relative;
  display: flex;
  padding: 12px 16px 12px 70px;
}
.chord-cells {
  display: flex;
  flex: 1;
  gap: 2px;
}
.chord-cell {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 4px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  transition: all 0.2s ease;
  overflow: hidden;
  white-space: nowrap;
  min-width: 30px;
}
.chord-cell.active {
  background: var(--bg-highlight);
  color: #fff;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
}
</style>