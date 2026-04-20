<template>
  <div class="guitar-tuner card">
    <div class="tuner-header">
      <h3 class="tuner-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Guitar Tuner
      </h3>
      <div class="tuner-status" :class="{ active: isListening }">
        {{ isListening ? 'Listening...' : 'Ready' }}
      </div>
    </div>

    <!-- Tuner Display -->
    <div class="tuner-display">
      <!-- Needle Gauge -->
      <div class="needle-gauge">
        <div class="gauge-bg">
          <div class="gauge-marks">
            <div
v-for="n in 9" :key="n" class="gauge-mark" :class="{ center: n === 5 }" 
                 :style="{ transform: `rotate(${(n - 5) * 10}deg)` }"></div>
          </div>
        </div>
        <div class="needle" :style="{ transform: `rotate(${needleAngle}deg)` }"></div>
        <div class="gauge-center"></div>
      </div>

      <!-- Note Display -->
      <div class="note-display" :class="{ inTune: isInTune }">
        <div class="detected-note">{{ displayNote || '--' }}</div>
        <div class="detected-freq">{{ detectedFreq ? detectedFreq.toFixed(1) + ' Hz' : '' }}</div>
        <div v-if="displayNote && !isInTune" class="tune-direction">
          {{ cents > 0 ? 'Too High \u2193' : 'Too Low \u2191' }}
        </div>
        <div v-else-if="isInTune" class="tune-perfect">Perfect! \u2713</div>
      </div>
    </div>

    <!-- String Visualizer -->
    <div class="strings-visualizer">
      <div 
        v-for="(string, index) in strings" 
        :key="string.note"
        class="string-row"
        :class="{ 
          active: selectedString === index,
          detected: displayNote === string.note,
          inTune: displayNote === string.note && isInTune
        }"
        @click="selectString(index)"
      >
        <div class="string-info">
          <span class="string-note">{{ string.note }}</span>
          <span class="string-freq">{{ string.freq }}Hz</span>
        </div>
        <div class="string-visual">
          <div class="string-line" :class="{ vibrating: displayNote === string.note }"></div>
          <div class="string-gauge">
            <div class="gauge-fill" :style="{ width: getStringFill(index) + '%' }"></div>
          </div>
        </div>
        <button 
          class="play-ref-btn"
          :disabled="isPlayingRef"
          @click.stop="playRef(string.freq)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Controls -->
    <div class="tuner-controls">
      <button 
        class="btn btn-lg"
        :class="isListening ? 'btn-secondary' : 'btn-primary'"
        @click="toggleListening"
      >
        <svg v-if="!isListening" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="6" y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        </svg>
        {{ isListening ? 'Stop Tuner' : 'Start Tuner' }}
      </button>

      <div class="tuner-options">
        <label class="auto-detect">
          <input v-model="autoDetectString" type="checkbox" />
          <span>Auto-detect string</span>
        </label>
      </div>
    </div>

    <!-- Calibration -->
    <div class="calibration">
      <label>Reference Pitch: {{ referencePitch }} Hz</label>
      <input 
        v-model.number="referencePitch" 
        type="range" 
        min="430" 
        max="450"
        class="pitch-slider"
      />
      <div class="pitch-presets">
        <button 
          v-for="pitch in [440, 442, 444]" 
          :key="pitch"
          class="btn btn-xs btn-secondary"
          :class="{ active: referencePitch === pitch }"
          @click="referencePitch = pitch"
        >
          {{ pitch }} Hz
        </button>
      </div>
    </div>

    <!-- Instructions -->
    <div class="tuner-help">
      <p>
        <strong>How to use:</strong> Click a string, play the note on your guitar, 
        and adjust until the needle is centered.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { usePitchDetection } from '../composables/usePitchDetection'
import { useAudioPlayer } from '../composables/useAudioPlayer'
import { useGamificationStore } from '../stores/gamificationStore.ts'

const { isListening, currentPitch, startListening, stopListening } = usePitchDetection()
const { getAudioContext } = useAudioPlayer()
const gamification = useGamificationStore()

const strings = [
  { note: 'E2', freq: 82.41, name: 'Low E' },
  { note: 'A2', freq: 110.00, name: 'A' },
  { note: 'D3', freq: 146.83, name: 'D' },
  { note: 'G3', freq: 196.00, name: 'G' },
  { note: 'B3', freq: 246.94, name: 'B' },
  { note: 'E4', freq: 329.63, name: 'High E' }
]

const referencePitch = ref(440)
const isPlayingRef = ref(false)
const autoDetectString = ref(true)
const selectedString = ref(0)

const detectedFreq = computed(() => currentPitch.value?.frequency ?? 0)
const cents = computed(() => currentPitch.value?.cents ?? 0)
const displayNote = computed(() => {
  if (!currentPitch.value) return ''
  return currentPitch.value.note + currentPitch.value.octave
})

const needleAngle = computed(() => {
  return Math.max(-45, Math.min(45, cents.value * 0.9))
})

const isInTune = computed(() => Math.abs(cents.value) < 5)

function getStringFill(index) {
  if (!detectedFreq.value) return 0
  const targetFreq = strings[index].freq * (referencePitch.value / 440)
  const diff = Math.abs(detectedFreq.value - targetFreq)
  return Math.max(0, Math.min(100, 100 - (diff / 20) * 100))
}

async function toggleListening() {
  if (isListening.value) {
    stopListening()
  } else {
    await startListening()
  }
}

function selectString(index) {
  selectedString.value = index
}

watch(currentPitch, (pitch) => {
  if (!pitch || !autoDetectString.value) return
  const detectedBase = pitch.note
  const detectedOctave = pitch.octave
  strings.forEach((s, i) => {
    const stringBase = s.note.replace(/\d/, '')
    const stringOctave = parseInt(s.note.match(/\d/)[0])
    if (detectedBase === stringBase && Math.abs(detectedOctave - stringOctave) <= 1) {
      selectedString.value = i
    }
  })
})

async function playRef(freq) {
  try {
    const ctx = getAudioContext()
    gamification.recordTuning()
    isPlayingRef.value = true
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 1.5)
    setTimeout(() => { isPlayingRef.value = false }, 1500)
  } catch {
    isPlayingRef.value = false
  }
}

onUnmounted(() => {
  if (isListening.value) stopListening()
})
</script>

<style scoped>
.guitar-tuner {
  padding: 20px;
}

.tuner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tuner-title {
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tuner-status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.tuner-status.active {
  background: var(--bg-highlight);
  color: #fff;
}

/* Tuner Display */
.tuner-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  margin-bottom: 20px;
}

/* Needle Gauge */
.needle-gauge {
  position: relative;
  width: 200px;
  height: 100px;
  overflow: hidden;
}

.gauge-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  border-radius: 100px 100px 0 0;
  background: linear-gradient(180deg, 
    rgba(16, 185, 129, 0.2) 0%, 
    rgba(16, 185, 129, 0.3) 20%,
    rgba(245, 158, 11, 0.2) 40%,
    rgba(245, 158, 11, 0.3) 50%,
    rgba(245, 158, 11, 0.2) 60%,
    rgba(239, 68, 68, 0.3) 80%,
    rgba(239, 68, 68, 0.2) 100%
  );
}

.gauge-marks {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.gauge-mark {
  position: absolute;
  width: 2px;
  height: 15px;
  background: var(--text-tertiary);
  transform-origin: center bottom;
  top: -100px;
}

.gauge-mark.center {
  height: 20px;
  background: var(--bg-success);
  width: 3px;
}

.needle {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 3px;
  height: 90px;
  background: var(--text-primary);
  transform-origin: bottom center;
  border-radius: 2px;
  transition: transform 0.1s ease-out;
}

.needle::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  background: var(--text-primary);
  border-radius: 50%;
}

.gauge-center {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  background: var(--bg-card);
  border: 3px solid var(--border-color);
  border-radius: 50%;
}

/* Note Display */
.note-display {
  text-align: center;
}

.detected-note {
  font-size: 48px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.note-display.inTune .detected-note {
  color: var(--bg-success);
}

.detected-freq {
  font-size: 14px;
  color: var(--text-tertiary);
  margin-top: 4px;
}

.tune-direction {
  font-size: 14px;
  font-weight: 600;
  color: var(--bg-warning);
  margin-top: 8px;
}

.tune-perfect {
  font-size: 14px;
  font-weight: 700;
  color: var(--bg-success);
  margin-top: 8px;
}

/* Strings Visualizer */
.strings-visualizer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.string-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition);
  border: 2px solid transparent;
}

.string-row:hover {
  background: var(--bg-card-hover);
}

.string-row.active {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.string-row.detected {
  border-color: var(--bg-warning);
}

.string-row.inTune {
  border-color: var(--bg-success);
  background: rgba(16, 185, 129, 0.1);
}

.string-info {
  display: flex;
  flex-direction: column;
  min-width: 60px;
}

.string-note {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
}

.string-freq {
  font-size: 10px;
  color: var(--text-tertiary);
}

.string-visual {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.string-line {
  height: 2px;
  background: var(--border-color);
  border-radius: 1px;
  position: relative;
  overflow: hidden;
}

.string-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-highlight);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s ease;
}

.string-row.detected .string-line::after {
  transform: scaleX(1);
}

.string-line.vibrating {
  animation: vibrate 0.1s ease-in-out infinite;
}

@keyframes vibrate {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-1px); }
  75% { transform: translateX(1px); }
}

.string-gauge {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.gauge-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--bg-danger), var(--bg-warning), var(--bg-success));
  border-radius: 2px;
  transition: width 0.2s ease;
}

.play-ref-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all var(--transition);
  flex-shrink: 0;
}

.play-ref-btn:hover {
  background: var(--bg-highlight);
  color: #fff;
}

.play-ref-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Controls */
.tuner-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.tuner-options {
  display: flex;
  justify-content: center;
}

.auto-detect {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
}

.auto-detect input {
  accent-color: var(--bg-highlight);
}

/* Calibration */
.calibration {
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}

.calibration label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.pitch-slider {
  width: 100%;
  height: 6px;
  accent-color: var(--bg-highlight);
  margin-bottom: 12px;
}

.pitch-presets {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* Help */
.tuner-help {
  padding: 12px 16px;
  background: var(--bg-highlight-light);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
}

.tuner-help strong {
  color: var(--bg-highlight);
}

@media (max-width: 500px) {
  .needle-gauge {
    width: 160px;
    height: 80px;
  }
  
  .detected-note {
    font-size: 36px;
  }
  
  .string-row {
    padding: 8px 10px;
  }
}
</style>