<template>
  <div class="tempo-tapper">
    <div class="tapper-display card">
      <h2>Tempo Tapper</h2>
      <p class="subtitle">Tap along to any song to find its BPM</p>

      <div class="bpm-display">
        <div class="bpm-value">{{ bpm || '--' }}</div>
        <div class="bpm-label">BPM</div>
      </div>

      <div class="tap-stats">
        <div class="stat">
          <span class="stat-label">Taps</span>
          <span class="stat-value">{{ tapCount }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Ms</span>
          <span class="stat-value">{{ avgMs || '--' }}</span>
        </div>
      </div>

      <button
        class="tap-button"
        :class="{ tapped: justTapped }"
        @mousedown="handleTap"
        @touchstart.prevent="handleTap"
      >
        <span class="tap-text">TAP</span>
        <span class="tap-hint">Click, tap, or press spacebar</span>
      </button>

      <div class="tapper-actions">
        <button class="btn btn-secondary" @click="reset">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Reset
        </button>
        <button v-if="bpm" class="btn btn-primary" @click="useBpm">
          Use {{ bpm }} BPM
        </button>
      </div>
    </div>

    <div class="common-tempos card">
      <h3>Common Tempos</h3>
      <div class="tempo-grid">
        <div
          v-for="t in commonTempos"
          :key="t.bpm"
          class="tempo-chip"
          @click="setBpm(t.bpm)"
        >
          <span class="chip-bpm">{{ t.bpm }}</span>
          <span class="chip-name">{{ t.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const MAX_TAPS = 8
const RESET_AFTER_MS = 2000

const bpm = ref(0)
const tapCount = ref(0)
const avgMs = ref(0)
const justTapped = ref(false)
const taps = ref<number[]>([])
let resetTimeout: ReturnType<typeof setTimeout> | null = null

const commonTempos = [
  { bpm: 60, name: 'Slow ballad' },
  { bpm: 72, name: 'Adagio' },
  { bpm: 84, name: 'Andante' },
  { bpm: 96, name: 'Moderate' },
  { bpm: 108, name: 'Allegretto' },
  { bpm: 120, name: 'Pop/Rock' },
  { bpm: 128, name: 'House' },
  { bpm: 140, name: 'Fast rock' },
]

function handleTap() {
  const now = Date.now()

  // If it's been too long since last tap, reset
  if (taps.value.length > 0 && now - taps.value[taps.value.length - 1] > RESET_AFTER_MS) {
    taps.value = []
    tapCount.value = 0
  }

  taps.value.push(now)
  if (taps.value.length > MAX_TAPS) {
    taps.value.shift()
  }

  tapCount.value = taps.value.length

  if (taps.value.length >= 2) {
    const intervals: number[] = []
    for (let i = 1; i < taps.value.length; i++) {
      intervals.push(taps.value[i] - taps.value[i - 1])
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
    avgMs.value = Math.round(avg)
    bpm.value = Math.round(60000 / avg)
  }

  // Visual feedback
  justTapped.value = true
  setTimeout(() => { justTapped.value = false }, 100)

  // Auto-reset timeout
  if (resetTimeout) clearTimeout(resetTimeout)
  resetTimeout = setTimeout(() => {
    taps.value = []
    tapCount.value = 0
    bpm.value = 0
    avgMs.value = 0
  }, RESET_AFTER_MS)
}

function reset() {
  taps.value = []
  tapCount.value = 0
  bpm.value = 0
  avgMs.value = 0
  if (resetTimeout) clearTimeout(resetTimeout)
}

function setBpm(val: number) {
  bpm.value = val
  avgMs.value = Math.round(60000 / val)
  tapCount.value = 0
  taps.value = []
}

function useBpm() {
  // Could emit or navigate to metronome with this BPM
  alert(`BPM ${bpm.value} copied! Use it in the metronome or speed trainer.`)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.code === 'Space') {
    e.preventDefault()
    handleTap()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (resetTimeout) clearTimeout(resetTimeout)
})
</script>

<style scoped>
.tempo-tapper {
  padding: 0 24px 48px;
  max-width: 600px;
  margin: 0 auto;
}

.tapper-display {
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
}

.tapper-display h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.bpm-display {
  margin-bottom: 16px;
}

.bpm-value {
  font-size: 80px;
  font-weight: 800;
  line-height: 1;
  color: var(--bg-highlight);
  font-variant-numeric: tabular-nums;
}

.bpm-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.tap-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.tap-button {
  width: 100%;
  max-width: 280px;
  height: 160px;
  border-radius: var(--radius-xl);
  background: var(--bg-tertiary);
  border: 3px solid var(--border-color);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  margin: 0 auto 20px;
  transition: all 0.1s;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.tap-button:hover {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.tap-button.tapped {
  transform: scale(0.96);
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

.tap-text {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: 4px;
}

.tap-hint {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.tap-button.tapped .tap-hint {
  color: rgba(255, 255, 255, 0.8);
}

.tapper-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* Common Tempos */
.common-tempos {
  padding: 24px;
}

.common-tempos h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}

.tempo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.tempo-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.tempo-chip:hover {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.chip-bpm {
  font-size: 18px;
  font-weight: 800;
  color: var(--bg-highlight);
}

.chip-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-align: center;
}

@media (max-width: 600px) {
  .tempo-tapper {
    padding: 0 12px 32px;
  }
  .bpm-value {
    font-size: 64px;
  }
  .tap-button {
    height: 140px;
  }
  .tempo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
