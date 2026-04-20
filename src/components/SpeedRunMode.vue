<template>
  <div class="speed-run">
    <div class="speed-header card">
      <h2>Speed Run</h2>
      <p class="subtitle">How many chord changes can you make in 60 seconds?</p>

      <div v-if="!running && !finished" class="control-row">
        <div class="control-group">
          <label>Chord Set</label>
          <select v-model="chordSet" class="speed-select">
            <option value="common">Common Changes</option>
            <option value="open">Open Chords</option>
            <option value="all">All Chords</option>
          </select>
        </div>
      </div>
    </div>

    <div class="game-area card">
      <!-- Timer -->
      <div v-if="running || finished" class="timer-bar">
        <div class="timer-fill" :style="{ width: timerPercent + '%' }"></div>
        <span class="timer-text">{{ remainingTime }}s</span>
      </div>

      <!-- Start Screen -->
      <div v-if="!running && !finished" class="start-screen">
        <div class="instructions">
          <p>You'll see two chords. Alternate between them cleanly.</p>
          <p>Tap <strong>Change!</strong> or press <strong>Space</strong> each time you complete a change.</p>
          <p>Do as many as you can in 60 seconds!</p>
        </div>
        <button class="start-btn" @click="startGame">Start Speed Run</button>
      </div>

      <!-- Active Game -->
      <div v-else-if="running" class="active-game">
        <div class="change-counter">
          <span class="counter-value">{{ changeCount }}</span>
          <span class="counter-label">changes</span>
        </div>

        <div class="chord-pair">
          <div class="chord-box">
            <span class="chord-label">From</span>
            <h3 class="chord-name">{{ currentPair.from }}</h3>
            <Fretboard v-if="fromChord" :chord="fromChord" />
          </div>
          <div class="chord-arrow">⇄</div>
          <div class="chord-box">
            <span class="chord-label">To</span>
            <h3 class="chord-name">{{ currentPair.to }}</h3>
            <Fretboard v-if="toChord" :chord="toChord" />
          </div>
        </div>

        <button
          class="change-btn"
          :class="{ pulse: justChanged }"
          @click="recordChange"
        >
          Change!
        </button>
        <p class="shortcut-hint">or press Spacebar</p>
      </div>

      <!-- Results -->
      <div v-else-if="finished" class="results">
        <h3 class="results-title">Time's Up!</h3>
        <div class="big-result">
          <span class="result-number">{{ changeCount }}</span>
          <span class="result-label">chord changes</span>
        </div>
        <p class="result-detail">
          That's <strong>{{ avgPerMinute }}</strong> changes per minute!
        </p>
        <div class="result-actions">
          <button class="action-btn primary" @click="startGame">Try Again</button>
          <button class="action-btn secondary" @click="reset">Change Setup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Fretboard from './Fretboard.vue'
import { chordDatabase } from '../data/chords.js'
import { useCountdownTimer } from '../composables/useCountdownTimer'

interface ChordData {
  name: string
  fullName: string
  strings: number[]
  fingers: number[]
  barre: { fret: number; fromString: number; toString: number } | null
  difficulty: number
  description: string
}

const COMMON_PAIRS = [
  ['G', 'C'], ['G', 'D'], ['G', 'Em'], ['G', 'Am'],
  ['C', 'G'], ['C', 'D'], ['C', 'Am'], ['C', 'F'],
  ['D', 'G'], ['D', 'A'], ['D', 'Em'], ['D', 'Am'],
  ['Em', 'G'], ['Em', 'C'], ['Em', 'D'], ['Em', 'Am'],
  ['Am', 'G'], ['Am', 'C'], ['Am', 'D'], ['Am', 'Em'],
  ['A', 'D'], ['A', 'E'], ['E', 'A'], ['F', 'C'],
]

const chordSet = ref<'common' | 'open' | 'all'>('common')
const running = ref(false)
const finished = ref(false)
const changeCount = ref(0)
const justChanged = ref(false)

const currentPair = ref<{ from: string; to: string }>({ from: 'G', to: 'C' })

function getAllChords(): ChordData[] {
  return [...chordDatabase.basic, ...chordDatabase.intermediate, ...chordDatabase.advanced]
}

function findChord(name: string): ChordData | undefined {
  return getAllChords().find((c) => c.name === name)
}

const fromChord = computed(() => findChord(currentPair.value.from))
const toChord = computed(() => findChord(currentPair.value.to))
const avgPerMinute = computed(() => changeCount.value)

let changeTimeout: ReturnType<typeof setTimeout> | null = null

function pickPair() {
  if (chordSet.value === 'common') {
    const pair = COMMON_PAIRS[Math.floor(Math.random() * COMMON_PAIRS.length)]
    currentPair.value = { from: pair[0], to: pair[1] }
  } else {
    const pool = chordSet.value === 'open' ? chordDatabase.basic : getAllChords()
    const names = pool.map((c) => c.name)
    const from = names[Math.floor(Math.random() * names.length)]
    let to = names[Math.floor(Math.random() * names.length)]
    while (to === from) {
      to = names[Math.floor(Math.random() * names.length)]
    }
    currentPair.value = { from, to }
  }
}

function startGame() {
  running.value = true
  finished.value = false
  changeCount.value = 0
  resetTimer(60)
  pickPair()
  startTimer()
}

function recordChange() {
  if (!running.value || finished.value) return
  changeCount.value++
  justChanged.value = true
  if (changeTimeout) clearTimeout(changeTimeout)
  changeTimeout = setTimeout(() => {
    justChanged.value = false
  }, 150)
  pickPair()
}

function endGame() {
  running.value = false
  finished.value = true
}

const { timeRemaining: remainingTime, start: startTimer, reset: resetTimer } = useCountdownTimer(60, endGame)
const timerPercent = computed(() => (remainingTime.value / 60) * 100)

function reset() {
  finished.value = false
  running.value = false
  changeCount.value = 0
}

function onKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space' && running.value) {
    e.preventDefault()
    recordChange()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  if (changeTimeout) clearTimeout(changeTimeout)
})
</script>

<style scoped>
.speed-run {
  padding: 0 24px 48px;
  max-width: 700px;
  margin: 0 auto;
}

.speed-header {
  padding: 24px;
  margin-bottom: 24px;
}

.speed-header h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.control-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.control-group {
  flex: 1;
  min-width: 160px;
}

.control-group label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.speed-select {
  width: 100%;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* Game Area */
.game-area {
  padding: 24px;
}

.timer-bar {
  position: relative;
  width: 100%;
  height: 32px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-xl);
  margin-bottom: 24px;
  overflow: hidden;
}

.timer-fill {
  height: 100%;
  background: var(--bg-highlight);
  border-radius: var(--radius-xl);
  transition: width 1s linear;
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: 800;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

/* Start */
.start-screen {
  text-align: center;
  padding: 16px 0;
}

.instructions {
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 24px;
}

.instructions p {
  margin-bottom: 6px;
}

.start-btn {
  padding: 14px 40px;
  border-radius: var(--radius-xl);
  border: none;
  background: var(--bg-highlight);
  color: white;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Active Game */
.active-game {
  text-align: center;
}

.change-counter {
  margin-bottom: 20px;
}

.counter-value {
  font-size: 48px;
  font-weight: 800;
  color: var(--bg-highlight);
  display: block;
  line-height: 1;
}

.counter-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chord-pair {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.chord-box {
  flex: 1;
  min-width: 140px;
  max-width: 260px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  padding: 16px;
}

.chord-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 4px;
}

.chord-name {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 12px;
}

.chord-arrow {
  font-size: 28px;
  color: var(--text-tertiary);
  font-weight: 700;
}

.change-btn {
  padding: 16px 48px;
  border-radius: var(--radius-xl);
  border: none;
  background: var(--bg-success, #22c55e);
  color: white;
  font-size: 20px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  user-select: none;
}

.change-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.change-btn:active {
  transform: translateY(0) scale(0.98);
}

.change-btn.pulse {
  animation: pulse 0.15s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

.shortcut-hint {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 8px;
}

/* Results */
.results {
  text-align: center;
  padding: 16px 0;
}

.results-title {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 16px;
}

.big-result {
  margin-bottom: 12px;
}

.result-number {
  font-size: 64px;
  font-weight: 800;
  color: var(--bg-highlight);
  display: block;
  line-height: 1;
}

.result-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
}

.result-detail {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  padding: 12px 28px;
  border-radius: var(--radius-xl);
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.action-btn.primary {
  background: var(--bg-highlight);
  color: white;
}

.action-btn.secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 600px) {
  .speed-run {
    padding: 0 12px 32px;
  }
  .chord-pair {
    flex-direction: column;
  }
  .chord-arrow {
    transform: rotate(90deg);
  }
  .result-number {
    font-size: 48px;
  }
}
</style>
