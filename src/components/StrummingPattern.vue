<template>
  <div class="strumming-pattern card">
    <div class="pattern-header">
      <h3 class="pattern-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"/>
        </svg>
        Strumming Pattern
      </h3>
      <div v-if="bpm" class="pattern-bpm">@ {{ bpm }} BPM</div>
    </div>

    <div class="pattern-display" :class="{ playing: isPlaying }">
      <div
        v-for="(stroke, i) in pattern"
        :key="i"
        class="stroke"
        :class="[
          stroke.direction,
          { active: currentIndex === i, accent: stroke.accent, mute: stroke.mute }
        ]"
      >
        <div class="stroke-arrow">
          <svg v-if="stroke.direction === 'down'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
          <svg v-else-if="stroke.direction === 'up'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
          <span v-else-if="stroke.direction === 'miss'" class="miss-x">×</span>
          <span v-else class="rest">—</span>
        </div>
        <div v-if="stroke.label" class="stroke-label">{{ stroke.label }}</div>
        <div v-if="stroke.mute" class="mute-indicator">M</div>
      </div>
    </div>

    <div class="pattern-legend">
      <div class="legend-item">
        <span class="legend-arrow down"></span>
        <span>Down</span>
      </div>
      <div class="legend-item">
        <span class="legend-arrow up"></span>
        <span>Up</span>
      </div>
      <div class="legend-item">
        <span class="legend-arrow miss">×</span>
        <span>Miss</span>
      </div>
      <div class="legend-item">
        <span class="legend-arrow rest">—</span>
        <span>Rest</span>
      </div>
    </div>

    <div class="pattern-controls">
      <button
        class="btn btn-sm"
        :class="isPlaying ? 'btn-secondary' : 'btn-primary'"
        @click="togglePlay"
      >
        <svg v-if="!isPlaying" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        </svg>
        {{ isPlaying ? 'Stop' : 'Play Pattern' }}
      </button>

      <div class="speed-control">
        <label>Speed</label>
        <button
          v-for="speed in [0.5, 0.75, 1, 1.25]"
          :key="speed"
          class="btn btn-xs"
          :class="playbackSpeed === speed ? 'btn-primary' : 'btn-secondary'"
          @click="setSpeed(speed)"
        >
          {{ speed }}x
        </button>
      </div>
    </div>

    <div class="pattern-presets">
      <div class="presets-label">Common Patterns:</div>
      <div class="preset-list">
        <button
          v-for="preset in commonPatterns"
          :key="preset.name"
          class="btn btn-xs btn-secondary"
          :class="{ active: currentPatternName === preset.name }"
          @click="loadPattern(preset)"
        >
          {{ preset.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  patternString: { type: String, default: '' },
  bpm: { type: Number, default: 120 }
})

const emit = defineEmits(['pattern-change'])

const commonPatterns = [
  {
    name: 'Basic Down',
    pattern: [{ direction: 'down', accent: true }, { direction: 'down' }, { direction: 'down' }, { direction: 'down' }]
  },
  {
    name: 'Down-Up',
    pattern: [
      { direction: 'down', accent: true }, { direction: 'up' },
      { direction: 'down', accent: true }, { direction: 'up' }
    ]
  },
  {
    name: 'Folk',
    pattern: [
      { direction: 'down', accent: true }, { direction: 'down' }, { direction: 'up' },
      { direction: 'down', accent: true }, { direction: 'up' }, { direction: 'down' }, { direction: 'up' }
    ]
  },
  {
    name: 'Pop Rock',
    pattern: [
      { direction: 'down', accent: true }, { direction: 'miss' }, { direction: 'up' },
      { direction: 'down', accent: true }, { direction: 'up' }, { direction: 'miss' }, { direction: 'down' }, { direction: 'up' }
    ]
  },
  {
    name: 'Reggae',
    pattern: [
      { direction: 'miss' }, { direction: 'down', accent: true, mute: true },
      { direction: 'miss' }, { direction: 'down', accent: true, mute: true }
    ]
  },
  {
    name: 'Blues Shuffle',
    pattern: [
      { direction: 'down', accent: true }, { direction: 'down' },
      { direction: 'down', accent: true }, { direction: 'down' }
    ]
  }
]

const isPlaying = ref(false)
const currentIndex = ref(-1)
const playbackSpeed = ref(1)
const currentPatternName = ref('')

const pattern = computed(() => {
  if (props.patternString) {
    return parsePatternString(props.patternString)
  }
  return commonPatterns[0].pattern
})

let intervalId = null
let audioContext = null

function parsePatternString(str) {
  const strokes = []
  const chars = str.split('')
  for (const char of chars) {
    switch (char.toLowerCase()) {
      case 'd': strokes.push({ direction: 'down' }); break
      case 'u': strokes.push({ direction: 'up' }); break
      case 'x': strokes.push({ direction: 'miss' }); break
      case '-': strokes.push({ direction: 'rest' }); break
      case 'v': strokes.push({ direction: 'down', accent: true }); break
      case '^': strokes.push({ direction: 'up', accent: true }); break
      case 'm': strokes.push({ direction: 'down', mute: true }); break
      default: strokes.push({ direction: 'rest' })
    }
  }
  return strokes
}

function getInterval() {
  const baseInterval = (60000 / props.bpm) / (pattern.value.length / 4)
  return baseInterval / playbackSpeed.value
}

function playStrokeSound(stroke) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
  }

  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()

  osc.connect(gain)
  gain.connect(audioContext.destination)

  if (stroke.direction === 'miss') {
    osc.frequency.value = 200
    gain.gain.value = 0.1
    osc.start()
    osc.stop(audioContext.currentTime + 0.02)
  } else if (stroke.mute) {
    osc.frequency.value = stroke.direction === 'down' ? 150 : 120
    gain.gain.value = 0.2
    osc.start()
    osc.stop(audioContext.currentTime + 0.03)
  } else if (stroke.accent) {
    osc.frequency.value = stroke.direction === 'down' ? 300 : 250
    gain.gain.value = 0.3
    osc.start()
    osc.stop(audioContext.currentTime + 0.05)
  } else {
    osc.frequency.value = stroke.direction === 'down' ? 250 : 200
    gain.gain.value = 0.2
    osc.start()
    osc.stop(audioContext.currentTime + 0.04)
  }
}

function advancePattern() {
  currentIndex.value = (currentIndex.value + 1) % pattern.value.length
  const stroke = pattern.value[currentIndex.value]
  playStrokeSound(stroke)
}

function start() {
  if (isPlaying.value) return
  isPlaying.value = true
  currentIndex.value = -1
  advancePattern()
  intervalId = setInterval(advancePattern, getInterval())
}

function stop() {
  isPlaying.value = false
  currentIndex.value = -1
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function togglePlay() {
  if (isPlaying.value) stop()
  else start()
}

function setSpeed(speed) {
  playbackSpeed.value = speed
  if (isPlaying.value) {
    clearInterval(intervalId)
    intervalId = setInterval(advancePattern, getInterval())
  }
}

function loadPattern(preset) {
  currentPatternName.value = preset.name
  stop()
  emit('pattern-change', preset.pattern)
}

onUnmounted(() => {
  stop()
  if (audioContext) {
    audioContext.close()
  }
})

defineExpose({ pattern, isPlaying, start, stop, togglePlay })
</script>

<style scoped>
.strumming-pattern {
  padding: 20px;
}
.pattern-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.pattern-title {
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}
.pattern-bpm {
  font-size: 13px;
  color: var(--text-tertiary);
  font-weight: 600;
}
.pattern-display {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 24px 16px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  margin-bottom: 16px;
  overflow-x: auto;
}
.pattern-display.playing .stroke {
  opacity: 0.5;
}
.pattern-display.playing .stroke.active {
  opacity: 1;
  transform: scale(1.2);
}
.stroke {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  min-width: 40px;
  border-radius: var(--radius-md);
  transition: all 0.1s ease;
  position: relative;
}
.stroke.down {
  color: var(--bg-highlight);
}
.stroke.up {
  color: var(--bg-success);
}
.stroke.miss {
  color: var(--text-tertiary);
}
.stroke.rest {
  color: var(--border-color);
}
.stroke.accent .stroke-arrow {
  font-weight: 800;
  transform: scale(1.2);
}
.stroke-arrow {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stroke-arrow svg {
  width: 100%;
  height: 100%;
}
.miss-x {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-tertiary);
}
.rest {
  font-size: 20px;
  font-weight: 700;
}
.stroke-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-tertiary);
}
.mute-indicator {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 9px;
  font-weight: 700;
  background: var(--bg-warning);
  color: #fff;
  padding: 1px 4px;
  border-radius: 4px;
}
.pattern-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}
.legend-arrow {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.legend-arrow.down {
  color: var(--bg-highlight);
}
.legend-arrow.up {
  color: var(--bg-success);
}
.pattern-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}
.speed-control {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.speed-control label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-right: 8px;
}
.pattern-presets {
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}
.presets-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.preset-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.btn-xs {
  padding: 4px 10px;
  font-size: 11px;
}
.preset-list .active {
  background: var(--bg-highlight);
  color: #fff;
}
</style>