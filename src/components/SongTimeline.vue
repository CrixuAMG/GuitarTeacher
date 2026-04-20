<template>
  <div class="timeline">
    <div v-if="sections.length" class="timeline-sections">
      <div
        v-for="section in sections"
        :key="section.label"
        class="section-marker"
        :class="{ active: currentBeat >= section.startBeat && currentBeat < section.endBeat, 'in-loop': loopEnabled && section.startBeat >= loopStart && section.endBeat <= loopEnd }"
        @click="$emit('seek', section.startBeat)"
      >
        <span class="section-label">{{ section.label }}</span>
      </div>
    </div>

    <div class="timeline-progress" @click="seek" @mousedown="startDrag">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        <div class="progress-cursor" :style="{ left: progressPercent + '%' }"></div>
        <div v-if="loopEnabled && loopEnd > loopStart" class="loop-region" :style="loopRegionStyle">
          <div class="loop-handle left" @mousedown.stop="startLoopDrag($event, 'start')"></div>
          <div class="loop-handle right" @mousedown.stop="startLoopDrag($event, 'end')"></div>
          <div class="loop-label">Loop</div>
        </div>
      </div>
    </div>

    <div class="timeline-chords">
      <div
        v-for="(chord, i) in chords"
        :key="i"
        class="timeline-chord"
        :class="{
          active: isChordActive(i),
          past: isChordPast(i),
          upcoming: isChordUpcoming(i),
          'in-loop': loopEnabled && chord.position >= loopStart && chord.position + chord.duration <= loopEnd,
          'auto-detected': chord.autoDetected
        }"
        @click="$emit('seek', chord.position)"
      >
        <span class="chord-name">{{ chord.name }}</span>
        <span class="chord-duration">{{ chord.duration }}b</span>
      </div>
    </div>

    <div v-if="loopEnabled && loopEnd > loopStart" class="loop-info">
      <span class="loop-info-label">Loop:</span>
      <span class="loop-info-range">Beat {{ loopStart }} – {{ loopEnd }}</span>
      <span class="loop-info-duration">({{ formatTime((loopEnd - loopStart) * beatDuration) }})</span>
    </div>

    <div class="timeline-time">
      <span>{{ formatTime(currentBeat * beatDuration) }}</span>
      <span>{{ formatTime(totalTime) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatTime } from '../utils/timeFormat'

interface Chord {
  name: string
  position: number
  duration: number
  autoDetected?: boolean
}

interface Section {
  label: string
  startBeat: number
  endBeat: number
}

const props = defineProps({
  chords: { type: Array as () => Chord[], default: () => [] },
  sections: { type: Array as () => Section[], default: () => [] },
  currentBeat: { type: Number, default: 0 },
  totalBeats: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
  beatDuration: { type: Number, default: 0.5 },
  loopEnabled: { type: Boolean, default: false },
  loopStart: { type: Number, default: 0 },
  loopEnd: { type: Number, default: 0 }
})

const emit = defineEmits(['seek', 'loop-change'])

const progressPercent = computed(() => {
  if (props.totalBeats === 0) return 0
  return Math.min((props.currentBeat / props.totalBeats) * 100, 100)
})

const loopRegionStyle = computed(() => {
  if (!props.loopEnabled || props.totalBeats === 0) return { display: 'none' }
  const left = (props.loopStart / props.totalBeats) * 100
  const width = ((props.loopEnd - props.loopStart) / props.totalBeats) * 100
  return { left: left + '%', width: width + '%' }
})

function isChordActive(i) {
  const chord = props.chords[i]
  return props.currentBeat >= chord.position && props.currentBeat < chord.position + chord.duration
}
function isChordPast(i) {
  return props.chords[i].position + props.chords[i].duration <= props.currentBeat
}
function isChordUpcoming(i) {
  return props.chords[i].position > props.currentBeat
}

function seek(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  emit('seek', percent * props.totalBeats)
}

const dragging = ref(false)
const dragType = ref(null)

function startDrag(_e: MouseEvent) {
  dragging.value = false
}

function startLoopDrag(e, type) {
  dragType.value = type
  const onMove = (moveEvent) => {
    const progressEl = e.target.closest('.timeline-progress')
    if (!progressEl) return
    const rect = progressEl.getBoundingClientRect()
    let percent = (moveEvent.clientX - rect.left) / rect.width
    percent = Math.max(0, Math.min(1, percent))
    const beat = Math.round(percent * props.totalBeats)
    if (type === 'start') {
      emit('loop-change', { startBeat: beat, endBeat: props.loopEnd })
    } else {
      emit('loop-change', { startBeat: props.loopStart, endBeat: beat })
    }
  }
  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    dragType.value = null
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}
</script>

<style scoped>
.timeline {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 16px;
}
.timeline-sections {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.section-marker {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.section-marker:hover {
  background: var(--bg-card-hover);
  color: var(--text-secondary);
}
.section-marker.active {
  background: var(--bg-highlight);
  color: #fff;
}
.section-marker.in-loop {
  background: var(--bg-highlight-light);
  color: var(--bg-highlight);
  border: 1px solid var(--bg-highlight);
}
.timeline-progress {
  position: relative;
  cursor: pointer;
  padding: 8px 0;
  margin: 4px 0;
}
.progress-track {
  position: relative;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: visible;
}
.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--bg-highlight);
  border-radius: 3px;
  transition: width 0.1s linear;
}
.progress-cursor {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  background: var(--bg-highlight);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: left 0.1s linear;
  z-index: 2;
}
.loop-region {
  position: absolute;
  top: -2px;
  height: 10px;
  background: rgba(79, 70, 229, 0.2);
  border-radius: 5px;
  border: 2px solid rgba(79, 70, 229, 0.5);
  z-index: 1;
}
.loop-handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 16px;
  background: var(--bg-highlight);
  border-radius: 3px;
  cursor: ew-resize;
  z-index: 3;
  transition: transform 0.1s ease;
}
.loop-handle:hover {
  transform: translateY(-50%) scaleX(1.2);
}
.loop-handle.left {
  left: -6px;
}
.loop-handle.right {
  right: -6px;
}
.loop-label {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 700;
  color: var(--bg-highlight);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.timeline-chords {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding: 12px 0;
}
.timeline-chord {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 48px;
  position: relative;
}
.timeline-chord:hover {
  background: var(--bg-card-hover);
  transform: translateY(-1px);
}
.timeline-chord.active {
  background: var(--bg-highlight);
  color: #fff;
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}
.timeline-chord.past {
  background: var(--bg-highlight-light);
  color: var(--bg-highlight);
}
.timeline-chord.in-loop {
  outline: 2px solid rgba(79, 70, 229, 0.3);
  outline-offset: -2px;
}
.timeline-chord.auto-detected::after {
  content: '';
  position: absolute;
  top: 3px;
  right: 3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--bg-warning);
}
.timeline-chord .chord-duration {
  font-size: 10px;
  opacity: 0.7;
}
.loop-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--bg-highlight);
  margin-bottom: 4px;
}
.loop-info-label {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.5px;
}
.loop-info-range {
  font-weight: 600;
}
.loop-info-duration {
  color: var(--text-tertiary);
}
.timeline-time {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 4px;
}
</style>