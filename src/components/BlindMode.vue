<template>
  <div class="blind-mode">
    <div class="blind-header card">
      <h2>Blind Mode</h2>
      <p class="subtitle">Memorize the chord chart before it disappears</p>

      <div class="control-row">
        <div class="control-group">
          <label>Difficulty</label>
          <select v-model="difficulty" class="blind-select" :disabled="isPlaying">
            <option value="basic">Basic (Open Chords)</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="all">All Chords</option>
          </select>
        </div>

        <div class="control-group">
          <label>Reveal Time</label>
          <select v-model="revealTime" class="blind-select" :disabled="isPlaying">
            <option :value="3">3 seconds</option>
            <option :value="5">5 seconds</option>
            <option :value="7">7 seconds</option>
            <option :value="1">1 second (Expert)</option>
          </select>
        </div>
      </div>
    </div>

    <div class="game-area card">
      <div class="stats-bar">
        <div class="stat">
          <span class="stat-value">{{ streak }}</span>
          <span class="stat-label">Streak</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ accuracy }}%</span>
          <span class="stat-label">Accuracy</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ total }}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>

      <div v-if="!isPlaying && !currentChord" class="start-screen">
        <p class="start-text">A chord chart will appear for {{ revealTime }} seconds. Memorize it!</p>
        <button class="start-btn" @click="startRound">Start</button>
      </div>

      <div v-else-if="currentChord" class="round-area">
        <h3 class="chord-name">{{ currentChord.name }}</h3>

        <div v-if="showing" class="countdown">
          <div class="countdown-bar" :style="{ width: countdownPercent + '%' }"></div>
        </div>

        <div class="fretboard-wrap" :class="{ hidden: !showing }">
          <Fretboard :chord="currentChord" />
        </div>

        <div v-if="!showing && !answered" class="guess-prompt">
          <p class="prompt-text">Can you play it from memory?</p>
          <div class="guess-buttons">
            <button class="guess-btn correct" @click="answer(true)">Got it!</button>
            <button class="guess-btn wrong" @click="answer(false)">Missed</button>
          </div>
        </div>

        <div v-if="answered" class="answer-reveal">
          <Fretboard :chord="currentChord" />
          <p class="answer-text" :class="{ correct: wasCorrect, wrong: !wasCorrect }">
            {{ wasCorrect ? 'Nice! Keep it up.' : 'Keep practicing this one.' }}
          </p>
          <button class="next-btn" @click="startRound">Next Chord</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import Fretboard from './Fretboard.vue'
import { chordDatabase } from '../data/chords.js'

interface Chord {
  name: string
  fullName: string
  strings: number[]
  fingers: number[]
  barre: { fret: number; fromString: number; toString: number } | null
  difficulty: number
  description: string
}

const difficulty = ref<'basic' | 'intermediate' | 'advanced' | 'all'>('basic')
const revealTime = ref(3)
const isPlaying = ref(false)
const currentChord = ref<Chord | null>(null)
const showing = ref(false)
const answered = ref(false)
const wasCorrect = ref(false)

const streak = ref(0)
const correctCount = ref(0)
const totalCount = ref(0)

const total = computed(() => totalCount.value)
const accuracy = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((correctCount.value / totalCount.value) * 100)
})

const countdownPercent = ref(100)
let countdownInterval: ReturnType<typeof setInterval> | null = null
let hideTimeout: ReturnType<typeof setTimeout> | null = null

function getChordPool(): Chord[] {
  if (difficulty.value === 'all') {
    return [...chordDatabase.basic, ...chordDatabase.intermediate, ...chordDatabase.advanced]
  }
  return chordDatabase[difficulty.value] || []
}

function pickRandomChord(): Chord {
  const pool = getChordPool()
  return pool[Math.floor(Math.random() * pool.length)]
}

function startRound() {
  isPlaying.value = true
  currentChord.value = pickRandomChord()
  showing.value = true
  answered.value = false
  wasCorrect.value = false
  countdownPercent.value = 100

  const step = 100 / (revealTime.value * 10)
  countdownInterval = setInterval(() => {
    countdownPercent.value -= step
    if (countdownPercent.value <= 0) countdownPercent.value = 0
  }, 100)

  hideTimeout = setTimeout(() => {
    showing.value = false
    if (countdownInterval) clearInterval(countdownInterval)
  }, revealTime.value * 1000)
}

function answer(correct: boolean) {
  answered.value = true
  wasCorrect.value = correct
  totalCount.value++
  if (correct) {
    correctCount.value++
    streak.value++
  } else {
    streak.value = 0
  }
}

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
  if (hideTimeout) clearTimeout(hideTimeout)
})
</script>

<style scoped>
.blind-mode {
  padding: 0 24px 48px;
  max-width: 600px;
  margin: 0 auto;
}

.blind-header {
  padding: 24px;
  margin-bottom: 24px;
}

.blind-header h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 20px;
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

.blind-select {
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

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--bg-highlight);
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Start Screen */
.start-screen {
  text-align: center;
  padding: 24px 0;
}

.start-text {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 20px;
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

/* Round */
.round-area {
  text-align: center;
}

.chord-name {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 16px;
}

.countdown {
  width: 100%;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  margin-bottom: 16px;
  overflow: hidden;
}

.countdown-bar {
  height: 100%;
  background: var(--bg-highlight);
  border-radius: 3px;
  transition: width 0.1s linear;
}

.fretboard-wrap {
  transition: opacity 0.3s;
}

.fretboard-wrap.hidden {
  opacity: 0;
  pointer-events: none;
}

/* Guess */
.guess-prompt {
  padding: 24px 0;
}

.prompt-text {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
}

.guess-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.guess-btn {
  padding: 12px 32px;
  border-radius: var(--radius-xl);
  border: none;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.guess-btn.correct {
  background: var(--bg-success, #22c55e);
  color: white;
}

.guess-btn.wrong {
  background: var(--bg-danger, #ef4444);
  color: white;
}

.guess-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Answer reveal */
.answer-reveal {
  padding: 16px 0;
}

.answer-text {
  font-size: 18px;
  font-weight: 700;
  margin: 16px 0;
}

.answer-text.correct {
  color: var(--bg-success, #22c55e);
}

.answer-text.wrong {
  color: var(--bg-danger, #ef4444);
}

.next-btn {
  padding: 12px 32px;
  border-radius: var(--radius-xl);
  border: none;
  background: var(--bg-highlight);
  color: white;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 600px) {
  .blind-mode {
    padding: 0 12px 32px;
  }
  .control-row {
    flex-direction: column;
  }
  .stats-bar {
    gap: 20px;
  }
  .chord-name {
    font-size: 22px;
  }
}
</style>
