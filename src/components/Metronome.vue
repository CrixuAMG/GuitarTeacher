<template>
  <div class="metronome card">
    <div class="metronome-header">
      <h3 class="metronome-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        {{ $t('metronome.title') }}
      </h3>
      <div class="bpm-display">{{ bpm }} <span class="bpm-label">{{ $t('metronome.bpm') }}</span></div>
    </div>

    <div class="beat-visualizer">
      <div
        v-for="n in beatsPerMeasure"
        :key="n"
        class="beat-dot"
        :class="{
          active: currentBeat === n - 1,
          accent: n === 1,
          hit: currentBeat === n - 1 && isPlaying
        }"
      >
        <span class="beat-number">{{ n }}</span>
      </div>
    </div>

    <div class="metronome-controls">
      <div class="bpm-slider-row">
        <button class="btn btn-sm btn-secondary bpm-btn" @click="adjustBpm(-5)">-5</button>
        <input
          v-model.number="bpm"
          type="range"
          class="bpm-slider"
          min="40"
          max="240"
          @input="onBpmChange"
        />
        <button class="btn btn-sm btn-secondary bpm-btn" @click="adjustBpm(5)">+5</button>
      </div>

      <div class="time-signature-row">
        <label>{{ $t('metronome.timeSignature') }}</label>
        <select v-model="beatsPerMeasure" class="time-select">
          <option :value="3">3/4</option>
          <option :value="4">4/4</option>
          <option :value="6">6/8</option>
        </select>
      </div>

      <div class="sound-toggle-row">
        <label class="sound-toggle">
          <input v-model="soundEnabled" type="checkbox" />
          <span>{{ $t('metronome.sound') }}</span>
        </label>
        <div v-if="soundEnabled" class="volume-control">
          <input v-model.number="volume" type="range" min="0" max="100" class="volume-slider" />
        </div>
      </div>

      <button
        class="btn btn-lg play-btn"
        :class="isPlaying ? 'btn-secondary' : 'btn-primary'"
        @click="toggle"
      >
        <svg v-if="!isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        </svg>
        {{ isPlaying ? $t('metronome.stop') : $t('metronome.start') }}
      </button>
    </div>

    <div class="tap-tempo">
      <button class="btn btn-sm btn-secondary tap-btn" @click="tapTempo">
        {{ $t('metronome.tapTempo') }}
      </button>
      <span class="tap-hint">{{ $t('metronome.tapHint') }}</span>
    </div>

    <div class="preset-tempos">
      <button
        v-for="preset in tempoPresets"
        :key="preset.name"
        class="btn btn-xs btn-secondary preset-btn"
        :class="{ active: bpm === preset.bpm }"
        @click="bpm = preset.bpm"
      >
        {{ preset.name }} ({{ preset.bpm }})
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  initialBpm: { type: Number, default: 120 }
})

const emit = defineEmits(['beat', 'bpm-change'])

const bpm = ref(props.initialBpm)
const isPlaying = ref(false)
const currentBeat = ref(0)
const beatsPerMeasure = ref(4)
const soundEnabled = ref(true)
const volume = ref(70)

let audioContext = null
let nextNoteTime = 0
let timerID = null
const lookahead = 25.0
const scheduleAheadTime = 0.1

const tapTimes = ref([])
const TAP_TIMEOUT = 2000

const tempoPresets = [
  { name: t('metronome.presetSlow'), bpm: 60 },
  { name: t('metronome.presetModerate'), bpm: 90 },
  { name: t('metronome.presetNormal'), bpm: 120 },
  { name: t('metronome.presetFast'), bpm: 140 },
  { name: t('metronome.presetVeryFast'), bpm: 180 }
]

function getAudioContext() {
  if (!audioContext) {
    const win = window as typeof window & { webkitAudioContext?: typeof AudioContext }
    audioContext = new (window.AudioContext || win.webkitAudioContext)()
  }
  return audioContext
}

function playClick(time, isAccent) {
  if (!soundEnabled.value) return
  const ctx = getAudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.frequency.value = isAccent ? 1000 : 800
  gain.gain.value = (volume.value / 100) * (isAccent ? 1 : 0.7)

  osc.start(time)
  osc.stop(time + 0.05)
}

function scheduleNote(beatNumber, time) {
  const isAccent = beatNumber % beatsPerMeasure.value === 0
  playClick(time, isAccent)

  setTimeout(() => {
    currentBeat.value = beatNumber % beatsPerMeasure.value
    emit('beat', currentBeat.value)
  }, (time - getAudioContext().currentTime) * 1000)
}

function scheduler() {
  while (nextNoteTime < getAudioContext().currentTime + scheduleAheadTime) {
    scheduleNote(currentBeat.value, nextNoteTime)
    const secondsPerBeat = 60.0 / bpm.value
    nextNoteTime += secondsPerBeat
  }
  timerID = setTimeout(scheduler, lookahead)
}

function start() {
  if (isPlaying.value) return
  isPlaying.value = true
  currentBeat.value = 0
  nextNoteTime = getAudioContext().currentTime + 0.1
  scheduler()
}

function stop() {
  isPlaying.value = false
  if (timerID) {
    clearTimeout(timerID)
    timerID = null
  }
  currentBeat.value = 0
}

function toggle() {
  if (isPlaying.value) stop()
  else start()
}

function adjustBpm(delta) {
  bpm.value = Math.max(40, Math.min(240, bpm.value + delta))
  emit('bpm-change', bpm.value)
}

function onBpmChange() {
  emit('bpm-change', bpm.value)
}

function tapTempo() {
  const now = Date.now()

  // Remove old taps
  tapTimes.value = tapTimes.value.filter(t => now - t < TAP_TIMEOUT)

  tapTimes.value.push(now)

  if (tapTimes.value.length >= 2) {
    const intervals = []
    for (let i = 1; i < tapTimes.value.length; i++) {
      intervals.push(tapTimes.value[i] - tapTimes.value[i - 1])
    }
    const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length
    const newBpm = Math.round(60000 / avgInterval)
    bpm.value = Math.max(40, Math.min(240, newBpm))
    emit('bpm-change', bpm.value)
  }
}

onUnmounted(() => {
  stop()
  if (audioContext) {
    audioContext.close()
  }
})

defineExpose({ bpm, isPlaying, start, stop, toggle })
</script>

<style scoped>
.metronome {
  padding: 20px;
}
.metronome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.metronome-title {
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}
.bpm-display {
  font-size: 28px;
  font-weight: 800;
  color: var(--bg-highlight);
}
.bpm-label {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 600;
}
.beat-visualizer {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 20px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
}
.beat-dot {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 3px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;
}
.beat-dot.accent {
  border-color: var(--bg-highlight);
  border-width: 4px;
}
.beat-dot.active {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  transform: scale(1.1);
}
.beat-dot.hit {
  animation: beat-pulse 0.15s ease;
}
@keyframes beat-pulse {
  0% { transform: scale(1.1); }
  50% { transform: scale(1.3); box-shadow: 0 0 20px var(--bg-highlight); }
  100% { transform: scale(1.1); }
}
.beat-number {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-tertiary);
}
.beat-dot.active .beat-number {
  color: #fff;
}
.metronome-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.bpm-slider-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bpm-slider {
  flex: 1;
  height: 6px;
  accent-color: var(--bg-highlight);
}
.bpm-btn {
  min-width: 44px;
}
.time-signature-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.time-signature-row label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
}
.time-select {
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 14px;
}
.sound-toggle-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sound-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
}
.volume-control {
  flex: 1;
}
.volume-slider {
  width: 100%;
  height: 4px;
  accent-color: var(--bg-highlight);
}
.play-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}
.tap-tempo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}
.tap-btn {
  flex-shrink: 0;
}
.tap-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}
.preset-tempos {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}
.preset-btn {
  font-size: 11px;
  padding: 4px 10px;
}
.preset-btn.active {
  background: var(--bg-highlight);
  color: #fff;
}
.btn-xs {
  padding: 4px 10px;
  font-size: 11px;
}
</style>