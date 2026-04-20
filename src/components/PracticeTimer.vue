<template>
  <div class="practice-timer card">
    <div class="timer-header">
      <h3 class="timer-title">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {{ $t('practiceTimer.title') }}
      </h3>
      <div v-if="completedSessions > 0" class="session-count">
        {{ completedSessions === 1 ? $t('practiceTimer.oneSessionCompleted') : $t('practiceTimer.sessionsCompleted', { count: completedSessions }) }}
      </div>
    </div>

    <!-- Timer Display -->
    <div class="timer-display" :class="timerState">
      <div class="time-remaining">{{ formattedTime }}</div>
      <div class="timer-phase">{{ phaseLabel }}</div>
    </div>

    <!-- Progress Ring -->
    <div class="progress-ring-container">
      <svg class="progress-ring" width="200" height="200">
        <circle class="progress-ring-bg" cx="100" cy="100" r="90" />
        <circle
          class="progress-ring-fill"
          cx="100"
          cy="100"
          r="90"
          :style="{ strokeDashoffset: progressOffset }"
        />
      </svg>
    </div>

    <!-- Controls -->
    <div class="timer-controls">
      <button
        class="btn btn-lg"
        :class="isRunning ? 'btn-secondary' : 'btn-primary'"
        @click="toggleTimer"
      >
        <svg v-if="!isRunning" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
        {{ isRunning ? $t('practiceTimer.pause') : timeRemaining === currentPhase.duration ? $t('practiceTimer.start') : $t('practiceTimer.resume') }}
      </button>

      <button
        class="btn btn-secondary"
        :disabled="isRunning || timeRemaining === currentPhase.duration"
        @click="resetTimer"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
{{ $t('practiceTimer.reset') }}
      </button>

      <button class="btn btn-secondary" :disabled="!isRunning" @click="skipPhase">{{ $t('practiceTimer.skip') }}</button>
    </div>

    <!-- Phase Selector -->
    <div class="phase-selector">
      <button
        v-for="phase in phases"
        :key="phase.id"
        class="phase-btn"
        :class="{ active: currentPhase.id === phase.id }"
        :disabled="isRunning"
        @click="selectPhase(phase.id)"
      >
        <span class="phase-name">{{ phase.name }}</span>
        <span class="phase-duration">{{ phase.duration / 60 }} min</span>
      </button>
    </div>

    <!-- Settings -->
    <div class="timer-settings">
      <label class="setting-row">
        <span>{{ $t('practiceTimer.autoStartBreaks') }}</span>
        <input v-model="autoStartBreaks" type="checkbox" />
      </label>
      <label class="setting-row">
        <span>{{ $t('practiceTimer.soundNotifications') }}</span>
        <input v-model="soundEnabled" type="checkbox" />
      </label>
    </div>

    <!-- Today's Stats -->
    <div v-if="todayStats.minutes > 0" class="timer-stats">
      <h4>{{ $t('practiceTimer.todaysPractice') }}</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ todayStats.minutes }}</span>
          <span class="stat-label">{{ $t('practiceTimer.minutes') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ todayStats.sessions }}</span>
          <span class="stat-label">{{ $t('practiceTimer.sessions') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ formatTime(todayStats.totalTime) }}</span>
          <span class="stat-label">{{ $t('practiceTimer.total') }}</span>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="timer-help">
      <h4>{{ $t('practiceTimer.pomodoroTitle') }}</h4>
      <ol>
        <li>{{ $t('practiceTimer.pomodoroStep1') }}</li>
        <li>{{ $t('practiceTimer.pomodoroStep2') }}</li>
        <li>{{ $t('practiceTimer.pomodoroStep3') }}</li>
        <li>{{ $t('practiceTimer.pomodoroStep4') }}</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDuration as formatTime } from '../utils/timeFormat'

const { t } = useI18n()

const phases = [
  { id: 'focus', name: t('practiceTimer.focus'), duration: 25 * 60, color: '#9333ea' },
  { id: 'short-break', name: t('practiceTimer.shortBreak'), duration: 5 * 60, color: '#22c55e' },
  { id: 'long-break', name: t('practiceTimer.longBreak'), duration: 15 * 60, color: '#3b82f6' },
]

const currentPhaseId = ref('focus')
const currentPhase = computed(() => phases.find((p) => p.id === currentPhaseId.value))

const timeRemaining = ref(phases[0].duration)
const isRunning = ref(false)
const completedSessions = ref(0)
const autoStartBreaks = ref(true)
const soundEnabled = ref(true)

// Today's stats stored in localStorage
const STORAGE_KEY = 'guitar-timer-stats'

function getStoredStats() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Reset if it's a new day
      if (parsed.date !== new Date().toDateString()) {
        return {
          date: new Date().toDateString(),
          minutes: 0,
          sessions: 0,
          totalTime: 0,
        }
      }
      return parsed
    }
  } catch (e) {
    console.error('Failed to load timer stats:', e)
  }
  return {
    date: new Date().toDateString(),
    minutes: 0,
    sessions: 0,
    totalTime: 0,
  }
}

function saveStoredStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch (e) {
    console.error('Failed to save timer stats:', e)
  }
}

const todayStats = ref(getStoredStats())

// Watch for changes and save
watch(
  todayStats,
  (newValue) => {
    saveStoredStats(newValue)
  },
  { deep: true }
)

let timerInterval = null
let audioContext = null

const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const phaseLabel = computed(() => {
  if (!isRunning.value && timeRemaining.value === currentPhase.value.duration) {
    return t('practiceTimer.readyToStart')
  }
  return currentPhase.value.name
})

const timerState = computed(() => {
  if (!isRunning.value) return 'idle'
  return currentPhaseId.value
})

// Progress ring
const circumference = 2 * Math.PI * 90
const progressOffset = computed(() => {
  const progress = (currentPhase.value.duration - timeRemaining.value) / currentPhase.value.duration
  return circumference - progress * circumference
})

function playNotificationSound() {
  if (!soundEnabled.value) return

  if (!audioContext) {
    const win = window as typeof window & { webkitAudioContext?: typeof AudioContext }
    audioContext = new (window.AudioContext || win.webkitAudioContext)()
  }

  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()

  osc.connect(gain)
  gain.connect(audioContext.destination)

  // Play a pleasant chime
  osc.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
  osc.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
  osc.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5

  gain.gain.setValueAtTime(0.3, audioContext.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

  osc.start(audioContext.currentTime)
  osc.stop(audioContext.currentTime + 0.5)
}

function startTimer() {
  if (isRunning.value) return

  isRunning.value = true

  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--

      // Update stats during focus sessions
      if (currentPhaseId.value === 'focus') {
        todayStats.value.totalTime++
        if (todayStats.value.totalTime % 60 === 0) {
          todayStats.value.minutes++
        }
      }
    } else {
      // Timer complete
      onTimerComplete()
    }
  }, 1000)
}

function stopTimer() {
  isRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function toggleTimer() {
  if (isRunning.value) {
    stopTimer()
  } else {
    startTimer()
  }
}

function resetTimer() {
  stopTimer()
  timeRemaining.value = currentPhase.value.duration
}

function onTimerComplete() {
  stopTimer()
  playNotificationSound()

  if (currentPhaseId.value === 'focus') {
    completedSessions.value++
    todayStats.value.sessions++

    // Switch to break
    if (completedSessions.value % 4 === 0) {
      selectPhase('long-break')
    } else {
      selectPhase('short-break')
    }

    if (autoStartBreaks.value) {
      startTimer()
    }
  } else {
    // Break is over, switch back to focus
    selectPhase('focus')
  }
}

function skipPhase() {
  stopTimer()
  timeRemaining.value = 0
  onTimerComplete()
}

function selectPhase(phaseId) {
  if (isRunning.value) return

  currentPhaseId.value = phaseId
  timeRemaining.value = currentPhase.value.duration
}

</script>

<style scoped>
.practice-timer {
  padding: 24px;
  max-width: 400px;
  margin: 0 auto;
}

.timer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.timer-title {
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.session-count {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: 4px 12px;
  border-radius: 20px;
}

/* Timer Display */
.timer-display {
  text-align: center;
  margin-bottom: 20px;
}

.time-remaining {
  font-size: 64px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--text-primary);
}

.timer-phase {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 8px;
  font-weight: 600;
}

.timer-display.focus .time-remaining {
  color: #9333ea;
}

.timer-display.short-break .time-remaining {
  color: #22c55e;
}

.timer-display.long-break .time-remaining {
  color: #3b82f6;
}

/* Progress Ring */
.progress-ring-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: var(--bg-tertiary);
  stroke-width: 8;
}

.progress-ring-fill {
  fill: none;
  stroke: var(--bg-highlight);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: v-bind(circumference);
  transition: stroke-dashoffset 1s linear;
}

.timer-display.focus .progress-ring-fill {
  stroke: #9333ea;
}

.timer-display.short-break .progress-ring-fill {
  stroke: #22c55e;
}

.timer-display.long-break .progress-ring-fill {
  stroke: #3b82f6;
}

/* Controls */
.timer-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.timer-controls .btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.timer-controls .btn-lg {
  flex: 2;
}

/* Phase Selector */
.phase-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.phase-btn {
  padding: 12px 8px;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.phase-btn:hover:not(:disabled) {
  background: var(--bg-card-hover);
}

.phase-btn.active {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.phase-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.phase-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.phase-duration {
  font-size: 11px;
  color: var(--text-tertiary);
}

/* Settings */
.timer-settings {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  margin-bottom: 20px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
}

.setting-row:not(:last-child) {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.setting-row input[type='checkbox'] {
  accent-color: var(--bg-highlight);
}

/* Stats */
.timer-stats {
  background: var(--bg-highlight-light);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 20px;
}

.timer-stats h4 {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--bg-highlight);
  margin: 0 0 12px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
}

.stat-label {
  font-size: 11px;
  color: var(--text-tertiary);
}

/* Help */
.timer-help {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 16px;
}

.timer-help h4 {
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: var(--text-primary);
}

.timer-help ol {
  margin: 0;
  padding-left: 20px;
}

.timer-help li {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  line-height: 1.5;
}

@media (max-width: 400px) {
  .time-remaining {
    font-size: 48px;
  }

  .phase-selector {
    grid-template-columns: 1fr;
  }

  .phase-btn {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
