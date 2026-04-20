<template>
  <div class="transition-trainer card">
    <div class="trainer-header">
      <h3 class="trainer-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        {{ $t('chordTransition.title') }}
      </h3>
      <div class="trainer-subtitle">{{ $t('chordTransition.subtitle') }}</div>
    </div>

    <div v-if="!isRunning" class="trainer-setup">
      <div class="setup-section">
        <label>{{ $t('chordTransition.selectChords') }}</label>
        <div class="chord-selector">
          <button
            v-for="chord in availableChords"
            :key="chord.name"
            class="chord-select-btn"
            :class="{ selected: selectedChords.includes(chord.name) }"
            @click="toggleChord(chord.name)"
          >
            {{ chord.name }}
          </button>
        </div>
        <div class="selection-actions">
          <button class="btn btn-xs btn-secondary" @click="selectAll">{{ $t('chordTransition.selectAllBasic') }}</button>
          <button class="btn btn-xs btn-secondary" @click="clearSelection">{{ $t('chordTransition.clear') }}</button>
        </div>
      </div>

      <div class="setup-section">
        <label>{{ $t('chordTransition.sessionDuration') }}</label>
        <div class="duration-options">
          <button
            v-for="duration in durations"
            :key="duration"
            class="btn btn-sm"
            :class="sessionDuration === duration ? 'btn-primary' : 'btn-secondary'"
            @click="sessionDuration = duration"
          >
            {{ duration }}s
          </button>
        </div>
      </div>

      <div class="setup-section">
        <label>{{ $t('chordTransition.switchSpeed') }}</label>
        <div class="speed-display">{{ $t('chordTransition.secondsPerChord', { seconds: switchInterval }) }}</div>
        <input
          v-model.number="switchInterval"
          type="range"
          min="2"
          max="10"
          step="0.5"
          class="speed-slider"
        />
        <div class="speed-labels">
          <span>{{ $t('chordTransition.fast') }}</span>
          <span>{{ $t('chordTransition.slow') }}</span>
        </div>
      </div>

      <button
        class="btn btn-primary btn-lg start-btn"
        :disabled="selectedChords.length < 2"
        @click="startSession"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        {{ $t('chordTransition.startPractice') }}
      </button>
    </div>

    <div v-else class="trainer-active">
      <div class="timer-bar">
        <div class="timer-progress" :style="{ width: timerProgress + '%' }"></div>
        <div class="timer-text">{{ remainingTime }}s</div>
      </div>

      <div class="current-chord-display">
        <div class="chord-transition" :class="{ changing: isChanging }">
          <div v-if="previousChord" class="from-chord">
            <span class="label">{{ $t('chordTransition.from') }}</span>
            <span class="name">{{ previousChord.name }}</span>
          </div>
          <div class="arrow">→</div>
          <div class="to-chord">
            <span class="label">To</span>
            <span class="name">{{ currentChord.name }}</span>
          </div>
        </div>

        <div class="fretboard-container">
          <Fretboard :chord="currentChord" :highlight="true" />
        </div>

        <div v-if="nextSwitchTime > 0" class="countdown">
          <div class="countdown-bar" :style="{ width: switchProgress + '%' }"></div>
          <span class="countdown-text">{{ Math.ceil(nextSwitchTime / 1000) }}</span>
        </div>
      </div>

      <div class="session-stats">
        <div class="stat">
          <span class="stat-value">{{ switchesCount }}</span>
          <span class="stat-label">Switches</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ uniquePairs.length }}</span>
          <span class="stat-label">Unique Pairs</span>
        </div>
      </div>

      <button class="btn btn-danger stop-btn" @click="stopSession">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="2"/>
        </svg>
        Stop
      </button>
    </div>

    <div v-if="showResults" class="trainer-results">
      <div class="results-header">
        <h4>Session Complete! 🎉</h4>
        <div class="final-score">{{ switchesCount }} switches</div>
      </div>

      <div class="results-details">
        <div class="result-item">
          <span class="result-label">Duration</span>
          <span class="result-value">{{ sessionDuration }} seconds</span>
        </div>
        <div class="result-item">
          <span class="result-label">Total Switches</span>
          <span class="result-value">{{ switchesCount }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">Unique Transitions</span>
          <span class="result-value">{{ uniquePairs.length }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">Avg Speed</span>
          <span class="result-value">{{ (sessionDuration / switchesCount).toFixed(1) }}s/switch</span>
        </div>
      </div>

      <div v-if="uniquePairs.length > 0" class="pairs-practiced">
        <label>Transitions Practiced:</label>
        <div class="pairs-list">
          <span v-for="pair in uniquePairs" :key="pair" class="pair-tag">{{ pair }}</span>
        </div>
      </div>

      <div class="results-actions">
        <button class="btn btn-primary" @click="resetAndSetup">Practice Again</button>
        <button class="btn btn-secondary" @click="showResults = false; isRunning = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { getAllChords, getChordsByCategory } from '../data/chords.js'
import Fretboard from './Fretboard.vue'
import { useAudio } from '../composables/useAudio.js'
import { useGamificationStore } from '../stores/gamificationStore.ts'

const availableChords = getAllChords()
const basicChords = getChordsByCategory('basic').map(c => c.name)

const durations = [30, 60, 120, 180]

const selectedChords = ref([])
const sessionDuration = ref(60)
const switchInterval = ref(5)

const isRunning = ref(false)
const isChanging = ref(false)
const showResults = ref(false)

const currentChord = ref(null)
const previousChord = ref(null)
const switchesCount = ref(0)
const uniquePairs = ref([])

const remainingTime = ref(0)
const nextSwitchTime = ref(0)

let sessionTimer = null
let switchTimer = null
let switchStartTime = 0

const { playChord, initAudio } = useAudio()
const gamification = useGamificationStore()

const timerProgress = computed(() => {
  return ((sessionDuration.value - remainingTime.value) / sessionDuration.value) * 100
})

const switchProgress = computed(() => {
  if (!isRunning.value || nextSwitchTime.value <= 0) return 0
  const elapsed = switchInterval.value * 1000 - nextSwitchTime.value
  return (elapsed / (switchInterval.value * 1000)) * 100
})

function toggleChord(name) {
  const index = selectedChords.value.indexOf(name)
  if (index > -1) {
    selectedChords.value.splice(index, 1)
  } else {
    selectedChords.value.push(name)
  }
}

function selectAll() {
  selectedChords.value = [...basicChords]
}

function clearSelection() {
  selectedChords.value = []
}

function getRandomChord() {
  const chords = availableChords.filter(c => selectedChords.value.includes(c.name))
  return chords[Math.floor(Math.random() * chords.length)]
}

async function switchChord() {
  isChanging.value = true
  previousChord.value = currentChord.value

  setTimeout(async () => {
    let next = getRandomChord()
    while (next && currentChord.value && next.name === currentChord.value.name && selectedChords.value.length > 1) {
      next = getRandomChord()
    }

    if (next) {
      currentChord.value = next
      switchesCount.value++

      if (previousChord.value) {
        const pair = [previousChord.value.name, next.name].sort().join(' ↔ ')
        if (!uniquePairs.value.includes(pair)) {
          uniquePairs.value.push(pair)
        }
        // Record transition for XP
        gamification.recordTransition()
      }
      
      // Play the chord audio
      await initAudio()
      playChord(next.strings, 1.2)
    }

    isChanging.value = false
    switchStartTime = Date.now()
    startSwitchTimer()
  }, 200)
}

function startSwitchTimer() {
  if (switchTimer) clearInterval(switchTimer)

  const interval = 100
  switchTimer = setInterval(() => {
    const elapsed = Date.now() - switchStartTime
    nextSwitchTime.value = Math.max(0, (switchInterval.value * 1000) - elapsed)

    if (nextSwitchTime.value <= 0) {
      switchChord()
    }
  }, interval)
}

async function startSession() {
  if (selectedChords.value.length < 2) return

  isRunning.value = true
  showResults.value = false
  switchesCount.value = 0
  uniquePairs.value = []
  remainingTime.value = sessionDuration.value
  nextSwitchTime.value = switchInterval.value * 1000

  currentChord.value = getRandomChord()
  previousChord.value = null
  
  // Initialize audio and play first chord
  await initAudio()
  if (currentChord.value) {
    playChord(currentChord.value.strings, 1.2)
  }

  switchStartTime = Date.now()
  startSwitchTimer()

  sessionTimer = setInterval(() => {
    remainingTime.value--
    if (remainingTime.value <= 0) {
      endSession()
    }
  }, 1000)
}

function stopSession() {
  endSession()
}

function endSession() {
  isRunning.value = false
  showResults.value = true

  if (sessionTimer) {
    clearInterval(sessionTimer)
    sessionTimer = null
  }
  if (switchTimer) {
    clearInterval(switchTimer)
    switchTimer = null
  }
  
  // Record practice time and award XP
  gamification.recordPracticeTime(sessionDuration.value / 60)
}

function resetAndSetup() {
  showResults.value = false
  isRunning.value = false
  selectedChords.value = []
  switchesCount.value = 0
  uniquePairs.value = []
}

onUnmounted(() => {
  if (sessionTimer) clearInterval(sessionTimer)
  if (switchTimer) clearInterval(switchTimer)
})

defineExpose({ startSession })
</script>

<style scoped>
.transition-trainer {
  padding: 20px;
}
.trainer-header {
  margin-bottom: 20px;
}
.trainer-title {
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.trainer-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
}
.setup-section {
  margin-bottom: 20px;
}
.setup-section label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.chord-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.chord-select-btn {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition);
}
.chord-select-btn:hover {
  background: var(--bg-card-hover);
}
.chord-select-btn.selected {
  background: var(--bg-highlight);
  color: #fff;
  border-color: var(--bg-highlight);
}
.selection-actions {
  display: flex;
  gap: 8px;
}
.btn-xs {
  padding: 4px 10px;
  font-size: 11px;
}
.duration-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.speed-display {
  font-size: 14px;
  font-weight: 700;
  color: var(--bg-highlight);
  margin-bottom: 8px;
}
.speed-slider {
  width: 100%;
  height: 6px;
  accent-color: var(--bg-highlight);
  margin-bottom: 4px;
}
.speed-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-tertiary);
}
.start-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
}
.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.trainer-active {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.timer-bar {
  position: relative;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}
.timer-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--bg-highlight), #818cf8);
  border-radius: 4px;
  transition: width 1s linear;
}
.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
.current-chord-display {
  text-align: center;
  padding: 24px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
}
.chord-transition {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}
.from-chord, .to-chord {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.from-chord .label, .to-chord .label {
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.from-chord .name, .to-chord .name {
  font-size: 24px;
  font-weight: 800;
}
.from-chord .name {
  color: var(--text-tertiary);
}
.to-chord .name {
  color: var(--bg-highlight);
}
.arrow {
  font-size: 24px;
  color: var(--text-secondary);
  animation: pulse-arrow 1s ease-in-out infinite;
}
@keyframes pulse-arrow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.fretboard-container {
  max-width: 280px;
  margin: 0 auto;
}
.countdown {
  margin-top: 16px;
  position: relative;
  height: 24px;
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
}
.countdown-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--bg-success);
  border-radius: 12px;
  transition: width 0.1s linear;
}
.countdown-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
}
.session-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
}
.stat {
  text-align: center;
}
.stat-value {
  display: block;
  font-size: 32px;
  font-weight: 800;
  color: var(--bg-highlight);
}
.stat-label {
  font-size: 12px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stop-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}
.trainer-results {
  text-align: center;
  padding: 24px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
}
.results-header h4 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}
.final-score {
  font-size: 36px;
  font-weight: 800;
  color: var(--bg-highlight);
  margin-bottom: 20px;
}
.results-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.result-item {
  background: var(--bg-card);
  padding: 12px;
  border-radius: var(--radius-md);
}
.result-label {
  display: block;
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  margin-bottom: 4px;
}
.result-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}
.pairs-practiced {
  margin-bottom: 20px;
}
.pairs-practiced label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.pairs-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}
.pair-tag {
  padding: 4px 10px;
  background: var(--bg-highlight-light);
  color: var(--bg-highlight);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}
.results-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>