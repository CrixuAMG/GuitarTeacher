<template>
  <div class="speed-trainer">
    <div class="trainer-controls card">
      <h2>Speed Trainer</h2>
      <p class="subtitle">Gradually build speed with automatic tempo increases</p>

      <div class="config-row">
        <div class="config-group">
          <label>Start BPM</label>
          <input v-model.number="startBpm" type="number" min="30" max="200" class="config-input" />
        </div>
        <div class="config-group">
          <label>Target BPM</label>
          <input v-model.number="targetBpm" type="number" min="30" max="300" class="config-input" />
        </div>
        <div class="config-group">
          <label>Step (BPM)</label>
          <input v-model.number="stepSize" type="number" min="1" max="20" class="config-input" />
        </div>
        <div class="config-group">
          <label>Time per Step</label>
          <select v-model.number="secondsPerStep" class="config-select">
            <option :value="15">15 sec</option>
            <option :value="30">30 sec</option>
            <option :value="60">1 min</option>
            <option :value="120">2 min</option>
          </select>
        </div>
      </div>

      <div class="config-actions">
        <button v-if="!isRunning && !isPaused" class="btn btn-primary" @click="startSession">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Start Training
        </button>
        <button v-if="isPaused" class="btn btn-primary" @click="resumeSession">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Resume
        </button>
        <button v-if="isRunning && !isPaused" class="btn btn-secondary" @click="pauseSession">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
          Pause
        </button>
        <button v-if="isRunning || isPaused" class="btn btn-danger" @click="stopSession">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
          Stop
        </button>
      </div>
    </div>

    <!-- Session Display -->
    <div v-if="isRunning || isPaused || sessionComplete" class="session-display card">
      <div class="tempo-display">
        <div class="current-tempo">{{ currentBpm }}</div>
        <div class="tempo-label">BPM</div>
      </div>

      <div class="beat-indicator">
        <div
          v-for="i in 4"
          :key="i"
          class="beat-dot"
          :class="{ active: currentBeat === i, accent: i === 1 }"
        ></div>
      </div>

      <div class="progress-section">
        <div class="progress-header">
          <span>Progress to Target</span>
          <span>{{ currentBpm }} / {{ targetBpm }} BPM</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-bar-fill"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
      </div>

      <div class="step-timer">
        <div class="timer-header">
          <span>Time at Current Speed</span>
          <span>{{ formatTime(stepTimeRemaining) }}</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-bar-fill step"
            :style="{ width: stepProgressPercent + '%' }"
          ></div>
        </div>
      </div>

      <div v-if="sessionComplete" class="complete-message">
        <div class="complete-icon">🎉</div>
        <h3>Target Reached!</h3>
        <p>You practiced from {{ startBpm }} to {{ targetBpm }} BPM</p>
      </div>
    </div>

    <!-- Tips -->
    <div class="tips card">
      <h3>Tips for Effective Speed Training</h3>
      <ul>
        <li>Start at a tempo where you can play cleanly with no mistakes</li>
        <li>Only increase speed when the current tempo feels comfortable</li>
        <li>If you make 3+ mistakes at a tempo, go back one step</li>
        <li>Focus on relaxation — tension kills speed</li>
        <li>Use a metronome consistently to build internal timing</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { formatTime } from '../utils/timeFormat'

const startBpm = ref(60)
const targetBpm = ref(120)
const stepSize = ref(5)
const secondsPerStep = ref(60)

const isRunning = ref(false)
const isPaused = ref(false)
const sessionComplete = ref(false)
const currentBpm = ref(60)
const currentBeat = ref(0)
const stepTimeRemaining = ref(0)
const stepTimeElapsed = ref(0)

let beatInterval: ReturnType<typeof setInterval> | null = null
let stepInterval: ReturnType<typeof setInterval> | null = null

const progressPercent = computed(() => {
  if (targetBpm.value <= startBpm.value) return 100
  return Math.min(100, Math.round(((currentBpm.value - startBpm.value) / (targetBpm.value - startBpm.value)) * 100))
})

const stepProgressPercent = computed(() => {
  if (secondsPerStep.value <= 0) return 100
  return Math.min(100, Math.round((stepTimeElapsed.value / secondsPerStep.value) * 100))
})

function startSession() {
  sessionComplete.value = false
  isPaused.value = false
  isRunning.value = true
  currentBpm.value = startBpm.value
  currentBeat.value = 0
  stepTimeRemaining.value = secondsPerStep.value
  stepTimeElapsed.value = 0
  startMetronome()
  startStepTimer()
}

function resumeSession() {
  isPaused.value = false
  isRunning.value = true
  startMetronome()
  startStepTimer()
}

function pauseSession() {
  isPaused.value = true
  isRunning.value = false
  stopMetronome()
  stopStepTimer()
}

function stopSession() {
  isRunning.value = false
  isPaused.value = false
  sessionComplete.value = false
  currentBeat.value = 0
  stopMetronome()
  stopStepTimer()
}

function startMetronome() {
  stopMetronome()
  if (currentBpm.value <= 0) return
  const intervalMs = 60000 / currentBpm.value
  beatInterval = setInterval(() => {
    currentBeat.value = (currentBeat.value % 4) + 1
  }, intervalMs)
}

function stopMetronome() {
  if (beatInterval) {
    clearInterval(beatInterval)
    beatInterval = null
  }
}

function startStepTimer() {
  stopStepTimer()
  stepInterval = setInterval(() => {
    if (isPaused.value) return
    stepTimeElapsed.value++
    stepTimeRemaining.value = Math.max(0, secondsPerStep.value - stepTimeElapsed.value)

    if (stepTimeElapsed.value >= secondsPerStep.value) {
      advanceStep()
    }
  }, 1000)
}

function stopStepTimer() {
  if (stepInterval) {
    clearInterval(stepInterval)
    stepInterval = null
  }
}

function advanceStep() {
  if (currentBpm.value >= targetBpm.value) {
    completeSession()
    return
  }
  currentBpm.value = Math.min(targetBpm.value, currentBpm.value + stepSize.value)
  stepTimeElapsed.value = 0
  stepTimeRemaining.value = secondsPerStep.value
  startMetronome() // restart with new tempo
}

function completeSession() {
  isRunning.value = false
  isPaused.value = false
  sessionComplete.value = true
  stopMetronome()
  stopStepTimer()
  currentBeat.value = 0
}

onUnmounted(() => {
  stopMetronome()
  stopStepTimer()
})
</script>

<style scoped>
.speed-trainer {
  padding: 0 24px 48px;
  max-width: 900px;
  margin: 0 auto;
}

.trainer-controls {
  padding: 24px;
  margin-bottom: 24px;
}

.trainer-controls h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.config-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.config-group {
  flex: 1;
  min-width: 100px;
}

.config-group label {
  display: block;
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 6px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.config-input,
.config-select {
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
}

.config-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Session Display */
.session-display {
  padding: 32px 24px;
  margin-bottom: 24px;
  text-align: center;
}

.tempo-display {
  margin-bottom: 20px;
}

.current-tempo {
  font-size: 72px;
  font-weight: 800;
  line-height: 1;
  color: var(--bg-highlight);
}

.tempo-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.beat-indicator {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 28px;
}

.beat-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  transition: all 0.1s;
}

.beat-dot.active {
  background: var(--bg-highlight);
  transform: scale(1.3);
  box-shadow: 0 0 12px rgba(79, 70, 229, 0.5);
}

.beat-dot.active.accent {
  background: var(--bg-warning);
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.5);
}

.progress-section,
.step-timer {
  max-width: 400px;
  margin: 0 auto 16px;
}

.progress-header,
.timer-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: var(--bg-tertiary);
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--bg-highlight);
  border-radius: 5px;
  transition: width 0.3s ease;
}

.progress-bar-fill.step {
  background: var(--bg-success);
}

.complete-message {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.complete-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.complete-message h3 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 4px;
}

.complete-message p {
  color: var(--text-secondary);
}

/* Tips */
.tips {
  padding: 24px;
}

.tips h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}

.tips ul {
  padding-left: 20px;
}

.tips li {
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .speed-trainer {
    padding: 0 12px 32px;
  }
  .config-row {
    flex-direction: column;
  }
  .config-input,
  .config-select {
    padding: 12px 14px;
    min-height: 44px;
  }
  .current-tempo {
    font-size: 56px;
  }
  .session-display {
    padding: 24px 16px;
  }
  .beat-dot {
    width: 16px;
    height: 16px;
  }
}
</style>
