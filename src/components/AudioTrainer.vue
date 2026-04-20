<template>
  <div class="audio-trainer">
    <div class="trainer-header">
      <h3>{{ title }}</h3>
      <div class="tempo-control">
        <button class="tempo-btn" :disabled="tempo <= minTempo" @click="decreaseTempo">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <span class="tempo-display">{{ tempo }} BPM</span>
        <button class="tempo-btn" :disabled="tempo >= maxTempo" @click="increaseTempo">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>

    <div class="progression-display">
      <div
        v-for="(chord, index) in progression"
        :key="index"
        class="chord-slot"
        :class="{
          active: currentChordIndex === index,
          completed: currentChordIndex > index,
        }"
      >
        <div class="chord-name">{{ chord.name }}</div>
        <div class="chord-timing">
          <div class="timing-bar" :style="{ width: getTimingWidth(index) + '%' }"></div>
        </div>
      </div>
    </div>

    <div class="playback-controls">
      <button class="control-btn" @click="reset">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="19 20 9 12 19 4 19 20" />
          <line x1="5" y1="19" x2="5" y2="5" />
        </svg>
      </button>

      <button class="control-btn play-btn" @click="togglePlay">
        <svg v-if="!isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      </button>

      <button class="control-btn" @click="toggleMute">
        <svg
          v-if="!isMuted"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
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
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      </button>
    </div>

    <div class="options">
      <label class="option">
        <input v-model="loopProgression" type="checkbox" />
        <span>Loop progression</span>
      </label>
      <label class="option">
        <input v-model="showCountIn" type="checkbox" />
        <span>Count-in (1, 2, 3, 4)</span>
      </label>
      <label class="option">
        <input v-model="strumPattern" type="checkbox" />
        <span>Strumming pattern</span>
      </label>
    </div>

    <div class="visual-feedback">
      <div class="beat-indicator" :class="{ active: beatActive }">
        <span class="beat-number">{{ currentBeat }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

interface Chord {
  name: string
  strings: number[]
  duration?: number
}

interface Props {
  title?: string
  progression: Chord[]
  initialTempo?: number
  minTempo?: number
  maxTempo?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Chord Progression',
  initialTempo: 80,
  minTempo: 40,
  maxTempo: 200,
})

const { playChord, initAudio } = useAudio()

const tempo = ref(props.initialTempo)
const isPlaying = ref(false)
const isMuted = ref(false)
const currentChordIndex = ref(0)
const currentBeat = ref(1)
const beatProgress = ref(0)
const loopProgression = ref(false)
const showCountIn = ref(true)
const strumPattern = ref(false)
const beatActive = ref(false)

let animationFrame: number | null = null
let lastBeatTime = 0

const beatDuration = computed(() => 60000 / tempo.value)

function increaseTempo() {
  if (tempo.value < props.maxTempo) {
    tempo.value += 5
  }
}

function decreaseTempo() {
  if (tempo.value > props.minTempo) {
    tempo.value -= 5
  }
}

function togglePlay() {
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

function play() {
  isPlaying.value = true
  initAudio()
  lastBeatTime = performance.now()
  animate()
}

function pause() {
  isPlaying.value = false
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
}

function reset() {
  pause()
  currentChordIndex.value = 0
  currentBeat.value = 1
  beatProgress.value = 0
}

function toggleMute() {
  isMuted.value = !isMuted.value
}

function getTimingWidth(index: number): number {
  if (index < currentChordIndex.value) return 100
  if (index > currentChordIndex.value) return 0
  return beatProgress.value
}

async function playCurrentChord() {
  if (isMuted.value || currentChordIndex.value >= props.progression.length) return

  const chord = props.progression[currentChordIndex.value]
  if (chord && chord.strings) {
    await playChord(chord.strings, 1.5)
  }
}

function animate() {
  if (!isPlaying.value) return

  const now = performance.now()
  const elapsed = now - lastBeatTime
  const progress = Math.min(elapsed / beatDuration.value, 1)

  beatProgress.value = progress * 100

  if (elapsed >= beatDuration.value) {
    // Beat completed
    beatActive.value = true
    setTimeout(() => (beatActive.value = false), 100)

    if (currentBeat.value === 4) {
      // Play chord on beat 4 (or 1 of next measure depending on style)
      playCurrentChord()
      currentBeat.value = 1

      // Move to next chord
      if (currentChordIndex.value < props.progression.length - 1) {
        currentChordIndex.value++
      } else if (loopProgression.value) {
        currentChordIndex.value = 0
      } else {
        pause()
        return
      }
    } else {
      currentBeat.value++
    }

    lastBeatTime = now
  }

  animationFrame = requestAnimationFrame(animate)
}

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.audio-trainer {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.trainer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.trainer-header h3 {
  font-size: 18px;
  font-weight: 700;
}

.tempo-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tempo-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.tempo-btn:hover:not(:disabled) {
  background: var(--bg-card-hover);
}

.tempo-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tempo-display {
  font-size: 16px;
  font-weight: 700;
  color: var(--bg-highlight);
  min-width: 80px;
  text-align: center;
}

.progression-display {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.chord-slot {
  flex: 1;
  min-width: 80px;
  text-align: center;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  transition: all 0.3s;
}

.chord-slot.active {
  background: var(--bg-highlight-light);
  border-color: var(--bg-highlight);
}

.chord-slot.completed {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--bg-success);
}

.chord-name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.chord-timing {
  height: 4px;
  background: var(--bg-card);
  border-radius: 2px;
  overflow: hidden;
}

.timing-bar {
  height: 100%;
  background: var(--bg-highlight);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.playback-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.control-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.play-btn {
  width: 56px;
  height: 56px;
  background: var(--bg-highlight);
  color: white;
}

.play-btn:hover {
  background: var(--bg-highlight-hover);
  transform: scale(1.05);
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  justify-content: center;
}

.option {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
}

.option input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: var(--bg-highlight);
}

.visual-feedback {
  display: flex;
  justify-content: center;
}

.beat-indicator {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
}

.beat-indicator.active {
  background: var(--bg-highlight);
  transform: scale(1.1);
}

.beat-number {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
}

.beat-indicator.active .beat-number {
  color: white;
}

@media (max-width: 600px) {
  .trainer-header {
    flex-direction: column;
    align-items: stretch;
  }

  .tempo-control {
    justify-content: center;
  }
}
</style>
