<template>
  <div class="ear-training card">
    <div class="training-header">
      <h3 class="training-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
        {{ $t('earTraining.title') }}
      </h3>
      <div class="score-display">{{ $t('earTraining.score', { score, total: totalAttempts }) }}</div>
    </div>

    <div class="training-mode-selector">
      <button
        v-for="mode in modes"
        :key="mode.id"
        class="btn btn-sm"
        :class="currentMode === mode.id ? 'btn-primary' : 'btn-secondary'"
        @click="setMode(mode.id)"
      >
        {{ $t(mode.labelKey) }}
      </button>
    </div>

    <div class="training-area">
      <div v-if="!gameState.playing" class="start-screen">
        <div class="start-icon">🎧</div>
        <h4>{{ $t('earTraining.chordRecognition') }}</h4>
        <p>{{ $t('earTraining.description') }}</p>
        <button class="btn btn-primary btn-lg" @click="startGame">{{ $t('earTraining.startTraining') }}</button>
      </div>

      <div v-else class="game-active">
        <div class="playback-section">
          <button
            class="btn btn-lg play-chord-btn"
            :class="{ playing: isPlaying }"
            :disabled="isPlaying"
            @click="playCurrentChord"
          >
            <span v-if="isPlaying" class="playing-animation">
              <span></span><span></span><span></span>
            </span>
            <template v-else>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              {{ $t('earTraining.playChord') }}
            </template>
          </button>
          <div class="play-hint">{{ $t('earTraining.clickToHear') }}</div>
        </div>

        <div class="options-grid">
          <button
            v-for="option in currentOptions"
            :key="option"
            class="option-btn"
            :class="{
              selected: selectedAnswer === option,
              correct: showResult && option === currentChord.name,
              wrong: showResult && selectedAnswer === option && option !== currentChord.name
            }"
            :disabled="showResult"
            @click="selectAnswer(option)"
          >
            <span class="option-name">{{ option }}</span>
            <span v-if="showResult && option === currentChord.name" class="correct-icon">✓</span>
            <span v-if="showResult && selectedAnswer === option && option !== currentChord.name" class="wrong-icon">✗</span>
          </button>
        </div>

        <div v-if="showResult" class="result-feedback" :class="{ correct: isCorrect, wrong: !isCorrect }">
          <div class="result-message">
            <span v-if="isCorrect">{{ $t('earTraining.correct') }}</span>
            <span v-else>{{ $t('earTraining.tryAgain') }}</span>
          </div>
          <div v-if="!isCorrect" class="correct-answer">
            {{ $t('earTraining.theChordWas') }} <strong>{{ currentChord.name }}</strong>
          </div>
          <Fretboard v-if="currentChord" :chord="currentChord" class="mini-fretboard" />
          <button class="btn btn-primary" @click="nextQuestion">
            {{ isCorrect ? $t('earTraining.nextChord') : $t('earTraining.tryAnother') }}
          </button>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <div class="stat-item">
        <span class="stat-value">{{ accuracy }}%</span>
        <span class="stat-label">{{ $t('earTraining.accuracy') }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ streak }}</span>
        <span class="stat-label">{{ $t('earTraining.streak') }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ bestStreak }}</span>
        <span class="stat-label">{{ $t('earTraining.best') }}</span>
      </div>
    </div>

    <div class="difficulty-selector">
      <label>{{ $t('earTraining.difficulty') }}</label>
      <button
        v-for="diff in difficulties"
        :key="diff.id"
        class="btn btn-xs"
        :class="difficulty === diff.id ? 'btn-primary' : 'btn-secondary'"
        @click="difficulty = diff.id"
      >
        {{ $t(diff.labelKey) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { getAllChords, getChordsByCategory } from '../data/chords.js'
import Fretboard from './Fretboard.vue'
import { useAudio } from '../composables/useAudio.js'
import { useGamificationStore } from '../stores/gamificationStore.ts'

const modes = [
  { id: 'single', labelKey: 'earTraining.singleChords' },
  { id: 'progression', labelKey: 'earTraining.progressions' }
]

const difficulties = [
  { id: 'easy', labelKey: 'earTraining.easy' },
  { id: 'medium', labelKey: 'earTraining.medium' },
  { id: 'hard', labelKey: 'earTraining.hard' }
]

const currentMode = ref('single')
const difficulty = ref('easy')

const gameState = ref({
  playing: false,
  level: 1
})

const currentChord = ref(null)
const currentOptions = ref([])
const selectedAnswer = ref(null)
const showResult = ref(false)
const isCorrect = ref(false)
const isPlaying = ref(false)

const score = ref(0)
const totalAttempts = ref(0)
const streak = ref(0)
const bestStreak = ref(0)

const { playChord, playCorrect, playWrong, stopAll, initAudio } = useAudio()
const gamification = useGamificationStore()

function getChordPool() {
  switch (difficulty.value) {
    case 'easy':
      return getChordsByCategory('basic')
    case 'medium':
      return [...getChordsByCategory('basic'), ...getChordsByCategory('intermediate')]
    case 'hard':
    default:
      return getAllChords()
  }
}

function generateQuestion() {
  const pool = getChordPool()
  const chord = pool[Math.floor(Math.random() * pool.length)]
  currentChord.value = chord

  const options = new Set([chord.name])
  while (options.size < 4) {
    const randomChord = pool[Math.floor(Math.random() * pool.length)]
    options.add(randomChord.name)
  }
  currentOptions.value = [...options].sort()

  selectedAnswer.value = null
  showResult.value = false
}

async function playCurrentChord() {
  if (!currentChord.value || isPlaying.value) return
  isPlaying.value = true
  await initAudio()
  await playChord(currentChord.value.strings, 1.5)
  setTimeout(() => {
    isPlaying.value = false
  }, 1500)
}

async function selectAnswer(answer) {
  if (showResult.value) return
  selectedAnswer.value = answer
  showResult.value = true
  totalAttempts.value++

  if (answer === currentChord.value.name) {
    isCorrect.value = true
    score.value++
    streak.value++
    if (streak.value > bestStreak.value) {
      bestStreak.value = streak.value
    }
    gamification.recordEarTraining(true)
    playCorrect()
  } else {
    isCorrect.value = false
    streak.value = 0
    playWrong()
    // Also play the correct chord so they can hear what it should be
    setTimeout(() => {
      playCurrentChord()
    }, 400)
  }
}

function nextQuestion() {
  generateQuestion()
  // Auto-play the next chord after a short delay
  setTimeout(() => {
    playCurrentChord()
  }, 300)
}

async function startGame() {
  gameState.value.playing = true
  score.value = 0
  totalAttempts.value = 0
  streak.value = 0
  await initAudio()
  generateQuestion()
  // Auto-play the first chord after a short delay
  setTimeout(() => {
    playCurrentChord()
  }, 500)
}

function setMode(mode) {
  currentMode.value = mode
  gameState.value.playing = false
  streak.value = 0
}

const accuracy = computed(() => {
  if (totalAttempts.value === 0) return 0
  return Math.round((score.value / totalAttempts.value) * 100)
})

onUnmounted(() => {
  stopAll()
})

defineExpose({ startGame })
</script>

<style scoped>
.ear-training {
  padding: 20px;
}
.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.training-title {
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}
.score-display {
  font-size: 14px;
  font-weight: 600;
  color: var(--bg-highlight);
}
.training-mode-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.training-area {
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 16px;
  min-height: 300px;
}
.start-screen {
  text-align: center;
  padding: 40px 20px;
}
.start-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.start-screen h4 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}
.start-screen p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}
.game-active {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.playback-section {
  text-align: center;
}
.play-chord-btn {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto;
  background: linear-gradient(135deg, var(--bg-highlight), #818cf8);
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.2s ease;
}
.play-chord-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4);
}
.play-chord-btn.playing {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}
.playing-animation {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  height: 24px;
}
.playing-animation span {
  width: 6px;
  height: 20px;
  background: var(--bg-highlight);
  border-radius: 3px;
  animation: sound-bar 0.4s ease-in-out infinite;
}
.playing-animation span:nth-child(2) {
  animation-delay: 0.1s;
}
.playing-animation span:nth-child(3) {
  animation-delay: 0.2s;
}
@keyframes sound-bar {
  0%, 100% { height: 10px; }
  50% { height: 24px; }
}
.play-hint {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 12px;
}
.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-width: 400px;
  margin: 0 auto;
}
.option-btn {
  padding: 16px 24px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.option-btn:hover:not(:disabled) {
  border-color: var(--bg-highlight);
  transform: translateY(-2px);
}
.option-btn.selected {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}
.option-btn.correct {
  border-color: var(--bg-success);
  background: #dcfce7;
  color: #166534;
}
.option-btn.wrong {
  border-color: var(--bg-danger);
  background: #fee2e2;
  color: #991b1b;
}
.option-name {
  font-size: 18px;
  font-weight: 700;
}
.correct-icon {
  font-size: 16px;
}
.wrong-icon {
  font-size: 16px;
}
.result-feedback {
  text-align: center;
  padding: 20px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 2px solid var(--border-color);
}
.result-feedback.correct {
  border-color: var(--bg-success);
  background: rgba(16, 185, 129, 0.1);
}
.result-feedback.wrong {
  border-color: var(--bg-danger);
  background: rgba(239, 68, 68, 0.1);
}
.result-message {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
}
.result-feedback.correct .result-message {
  color: var(--bg-success);
}
.result-feedback.wrong .result-message {
  color: var(--bg-danger);
}
.correct-answer {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}
.mini-fretboard {
  max-width: 200px;
  margin: 0 auto 16px;
}
.stats-section {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}
.stat-item {
  text-align: center;
}
.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: var(--bg-highlight);
}
.stat-label {
  font-size: 12px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.difficulty-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.difficulty-selector label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
  margin-right: 8px;
}
</style>