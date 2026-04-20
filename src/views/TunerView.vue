<template>
  <div class="tuner-view">
    <BackLink to="/practice" :label="$t('tuner.backLabel')" />
    <PageHeader>{{ $t('tuner.title') }}</PageHeader>

    <div class="tuner-container card">
      <!-- Main Display -->
      <div class="tuner-display">
        <div class="note-display" :class="{ 'in-tune': isInTune }">
          <span class="note-name">{{ detectedNote || '-' }}</span>
          <span class="octave">{{ detectedOctave || '' }}</span>
        </div>

        <div class="cents-display">
          <div class="cents-bar">
            <div class="cents-zero"></div>
            <div
              class="cents-indicator"
              :style="{ transform: `translateX(${centsPosition}px)` }"
            ></div>
          </div>
          <div class="cents-value">
            {{ cents !== null ? (cents > 0 ? '+' : '') + cents + ' ' + $t('tuner.centsUnit') : $t('tuner.playString') }}
          </div>
        </div>

        <div class="tuning-status" :class="tuningStatusClass">
          {{ tuningStatusText }}
        </div>
      </div>

      <!-- String Indicators -->
      <div class="strings-display">
        <div
          v-for="(string, index) in strings"
          :key="index"
          class="string-indicator"
          :class="{
            'string-active': activeString === index,
            'string-in-tune': inTuneStrings.has(index),
          }"
          @click="playReferenceTone(index)"
        >
          <div class="string-note">{{ string.note }}</div>
          <div class="string-freq">{{ string.freq }}Hz</div>
          <div class="string-status">
            <span v-if="inTuneStrings.has(index)">✓</span>
            <span v-else-if="activeString === index">◉</span>
            <span v-else>○</span>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="tuner-controls">
        <button
          class="btn btn-lg"
          :class="isListening ? 'btn-danger' : 'btn-primary'"
          @click="toggleListening"
        >
          <svg
            v-if="!isListening"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          <svg
            v-else
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
          {{ isListening ? $t('tuner.stop') : $t('tuner.startTuning') }}
        </button>
      </div>

      <!-- Instructions -->
      <div class="tuner-instructions">
        <h4>{{ $t('tuner.howToTune') }}</h4>
        <ol>
          <li>{{ $t('tuner.instruction1') }}</li>
          <li>{{ $t('tuner.instruction2') }}</li>
          <li>{{ $t('tuner.instruction3') }}</li>
          <li>{{ $t('tuner.instruction4') }}</li>
          <li>{{ $t('tuner.instruction5') }}</li>
          <li>{{ $t('tuner.instruction6') }}</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePitchDetection } from '@/composables/usePitchDetection'
import { useAudio } from '@/composables/useAudio'
import BackLink from '@/components/BackLink.vue'
import PageHeader from '@/components/PageHeader.vue'

const { t } = useI18n()

const strings = [
  { note: 'E2', freq: 82.41, baseNote: 'E', octave: 2 },
  { note: 'A2', freq: 110.0, baseNote: 'A', octave: 2 },
  { note: 'D3', freq: 146.83, baseNote: 'D', octave: 3 },
  { note: 'G3', freq: 196.0, baseNote: 'G', octave: 3 },
  { note: 'B3', freq: 246.94, baseNote: 'B', octave: 3 },
  { note: 'E4', freq: 329.63, baseNote: 'E', octave: 4 },
]

const { isListening, currentPitch, startListening, stopListening } = usePitchDetection()
const { playChord, initAudio } = useAudio()

const inTuneStrings = ref<Set<number>>(new Set())
const activeString = ref<number | null>(null)

const detectedNote = computed(() => currentPitch.value?.note || null)
const detectedOctave = computed(() => currentPitch.value?.octave || null)
const cents = computed(() => currentPitch.value?.cents ?? null)

const centsPosition = computed(() => {
  if (cents.value === null) return 0
  // Map -50 to +50 cents to -100 to +100 pixels
  return Math.max(-100, Math.min(100, cents.value * 2))
})

const isInTune = computed(() => {
  return cents.value !== null && Math.abs(cents.value) < 5
})

const tuningStatusText = computed(() => {
  if (!isListening.value) return t('tuner.clickStart')
  if (!currentPitch.value) return t('tuner.waiting')
  if (isInTune.value) return t('tuner.inTune')
  if (cents.value! < 0) return t('tuner.tuneUp')
  return t('tuner.tuneDown')
})

const tuningStatusClass = computed(() => {
  if (!isListening.value) return 'idle'
  if (!currentPitch.value) return 'waiting'
  if (isInTune.value) return 'in-tune'
  if (cents.value! < 0) return 'sharp'
  return 'flat'
})

async function toggleListening() {
  if (isListening.value) {
    stopListening()
  } else {
    const success = await startListening()
    if (success) {
      await initAudio()
    }
  }
}

async function playReferenceTone(stringIndex: number) {
  await initAudio()
  const stringArray = [0, 0, 0, 0, 0, 0]
  stringArray[stringIndex] = 0 // Open string
  await playChord(stringArray, 2)
}

// Watch for in-tune detection
watch(cents, (newCents) => {
  if (newCents !== null && Math.abs(newCents) < 5 && activeString.value !== null) {
    inTuneStrings.value.add(activeString.value)
  }
})

// Detect which string is being played
watch(currentPitch, (pitch) => {
  if (!pitch) {
    activeString.value = null
    return
  }

  // Find matching string
  let closestString = 0

  strings.forEach((string, index) => {
    if (string.baseNote === pitch.note && string.octave === pitch.octave) {
      closestString = index
    }
  })

  activeString.value = closestString
})

onUnmounted(() => {
  stopListening()
})
</script>

<style scoped>
.tuner-view {
  padding: 24px;
  max-width: 700px;
  margin: 0 auto;
}

.tuner-container {
  padding: 32px;
}

/* Main Display */
.tuner-display {
  text-align: center;
  margin-bottom: 32px;
}

.note-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.note-name {
  font-size: 72px;
  font-weight: 800;
  color: var(--text-primary);
  transition: color 0.3s;
}

.note-display.in-tune .note-name {
  color: #22c55e;
}

.octave {
  font-size: 24px;
  color: var(--text-secondary);
}

/* Cents Bar */
.cents-display {
  margin-bottom: 16px;
}

.cents-bar {
  position: relative;
  width: 200px;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  margin: 0 auto 12px;
}

.cents-zero {
  position: absolute;
  left: 50%;
  top: -6px;
  width: 2px;
  height: 16px;
  background: var(--text-secondary);
  transform: translateX(-50%);
}

.cents-indicator {
  position: absolute;
  left: 50%;
  top: -8px;
  width: 20px;
  height: 20px;
  background: var(--bg-highlight);
  border-radius: 50%;
  transform: translateX(-50%);
  transition: transform 0.1s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.cents-value {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 600;
}

/* Tuning Status */
.tuning-status {
  font-size: 24px;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  display: inline-block;
  transition: all 0.3s;
}

.tuning-status.idle {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.tuning-status.waiting {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  animation: pulse 1.5s ease infinite;
}

.tuning-status.in-tune {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.tuning-status.sharp {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.tuning-status.flat {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

/* String Indicators */
.strings-display {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}

.string-indicator {
  background: var(--bg-tertiary);
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  padding: 16px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.string-indicator:hover {
  background: var(--bg-card-hover);
}

.string-indicator.string-active {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.string-indicator.string-in-tune {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.string-note {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.string-freq {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}

.string-status {
  font-size: 16px;
}

/* Controls */
.tuner-controls {
  text-align: center;
  margin-bottom: 32px;
}

.tuner-controls .btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  font-size: 16px;
}

/* Instructions */
.tuner-instructions {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 20px;
}

.tuner-instructions h4 {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.tuner-instructions ol {
  margin: 0;
  padding-left: 20px;
}

.tuner-instructions li {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 600px) {
  .strings-display {
    grid-template-columns: repeat(3, 1fr);
  }

  .note-name {
    font-size: 48px;
  }
}
</style>
