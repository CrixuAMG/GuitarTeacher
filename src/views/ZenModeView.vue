<template>
  <div class="zen-mode" :class="{ active: isRunning }">
    <div v-if="!isActive" class="zen-setup">
      <div class="setup-card card">
        <h2>{{ $t('zenMode.title') }}</h2>
        <p class="subtitle">{{ $t('zenMode.subtitle') }}</p>

        <div class="duration-picker">
          <label>{{ $t('zenMode.practiceDuration') }}</label>
          <div class="duration-options">
            <button
              v-for="d in durations"
              :key="d"
              class="duration-btn"
              :class="{ active: duration === d }"
              @click="duration = d"
            >
              {{ d }} {{ $t('zenMode.min') }}
            </button>
          </div>
        </div>

        <button class="btn btn-primary btn-lg start-btn" @click="start">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          {{ $t('zenMode.startPractice') }}
        </button>
      </div>
    </div>

    <div v-else class="zen-session" @click="togglePause">
      <div class="zen-timer">{{ formatTime(timeRemaining) }}</div>
      <div class="zen-progress">
        <div class="zen-progress-bar" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <div class="zen-hint">
        {{ isRunning ? $t('zenMode.tapToPause') : $t('zenMode.tapToResume') }}
      </div>
      <button class="zen-stop" @click.stop="stop">{{ $t('zenMode.endSession') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { formatTime } from '../utils/timeFormat'

const durations = [5, 10, 15, 20, 30, 45, 60]

const isActive = ref(false)
const isRunning = ref(false)
const duration = ref(15)
const timeRemaining = ref(0)

let interval: ReturnType<typeof setInterval> | null = null

const progressPercent = computed(() => {
  const total = duration.value * 60
  return ((total - timeRemaining.value) / total) * 100
})

function start() {
  isActive.value = true
  isRunning.value = true
  timeRemaining.value = duration.value * 60
  interval = setInterval(() => {
    if (isRunning.value) {
      timeRemaining.value--
      if (timeRemaining.value <= 0) {
        finish()
      }
    }
  }, 1000)
}

function togglePause() {
  isRunning.value = !isRunning.value
}

function stop() {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
  isActive.value = false
  isRunning.value = false
}

function finish() {
  isRunning.value = false
  if (interval) {
    clearInterval(interval)
    interval = null
  }
  // Auto-exit after a moment
  setTimeout(() => {
    isActive.value = false
  }, 3000)
}

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<style scoped>
.zen-mode {
  min-height: 100vh;
}

.zen-setup {
  padding: 48px 24px;
  max-width: 500px;
  margin: 0 auto;
}

.setup-card {
  padding: 32px;
  text-align: center;
}

.setup-card h2 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 28px;
  font-size: 15px;
}

.duration-picker {
  margin-bottom: 28px;
}

.duration-picker label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.duration-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.duration-btn {
  padding: 10px 16px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.duration-btn:hover {
  border-color: var(--bg-highlight);
}

.duration-btn.active {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

.start-btn {
  width: 100%;
}

/* Active Zen Session */
.zen-session {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  z-index: 200;
  cursor: pointer;
  user-select: none;
  animation: fadeIn 0.4s ease;
}

.zen-timer {
  font-size: 120px;
  font-weight: 200;
  letter-spacing: 4px;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.zen-progress {
  width: 200px;
  height: 3px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.zen-progress-bar {
  height: 100%;
  background: var(--bg-highlight);
  border-radius: 2px;
  transition: width 1s linear;
}

.zen-hint {
  font-size: 14px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.zen-stop {
  position: absolute;
  bottom: 40px;
  padding: 10px 24px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.zen-stop:hover {
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 600px) {
  .zen-timer {
    font-size: 80px;
  }
  .zen-setup {
    padding: 32px 16px;
  }
}
</style>
