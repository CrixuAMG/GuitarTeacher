<template>
  <div class="strumming-trainer">
    <div class="trainer-header">
      <h3>Strumming Pattern Trainer</h3>
      <div v-if="currentPattern" class="pattern-info">
        <span class="pattern-name">{{ currentPattern.name }}</span>
        <span class="pattern-difficulty" :class="currentPattern.difficulty">
          {{ currentPattern.difficulty }}
        </span>
      </div>
    </div>

    <!-- Visual Pattern Display -->
    <div class="pattern-display">
      <div class="beats-container">
        <div
          v-for="(beat, index) in displayedBeats"
          :key="index"
          class="beat"
          :class="{
            'beat-active': currentBeatIndex === index,
            'beat-hit': beatHits[index],
            'beat-missed': beatMisses[index],
          }"
        >
          <div class="beat-indicator">
            <span v-if="beat === 'D'" class="strum-down">↓</span>
            <span v-else-if="beat === 'U'" class="strum-up">↑</span>
            <span v-else-if="beat === 'x'" class="strum-mute">✕</span>
            <span v-else class="strum-rest">-</span>
          </div>
          <div class="beat-number">{{ (index % 4) + 1 }}</div>
        </div>
      </div>
    </div>

    <!-- Pattern Legend -->
    <div class="pattern-legend">
      <div class="legend-item">
        <span class="legend-symbol strum-down">↓</span>
        <span>Down Strum</span>
      </div>
      <div class="legend-item">
        <span class="legend-symbol strum-up">↑</span>
        <span>Up Strum</span>
      </div>
      <div class="legend-item">
        <span class="legend-symbol strum-mute">✕</span>
        <span>Palm Mute</span>
      </div>
      <div class="legend-item">
        <span class="legend-symbol strum-rest">-</span>
        <span>Rest</span>
      </div>
    </div>

    <!-- Audio Visualization -->
    <div class="audio-visualizer">
      <canvas ref="visualizerCanvas" width="400" height="100"></canvas>
    </div>

    <!-- Playback Controls -->
    <div class="playback-controls">
      <div class="tempo-control">
        <button class="tempo-btn" @click="decreaseTempo">
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
        <button class="tempo-btn" @click="increaseTempo">
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

      <button class="play-btn" @click="togglePlay">
        <svg v-if="!isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      </button>

      <button class="control-btn" :class="{ active: audioInputEnabled }" @click="enableAudioInput">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        <span class="btn-label">Detect</span>
      </button>
    </div>

    <!-- Accuracy Feedback -->
    <div v-if="sessionStats.totalAttempts > 0" class="accuracy-feedback">
      <div class="stat">
        <span class="stat-value">{{ sessionStats.accuracy }}%</span>
        <span class="stat-label">Accuracy</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ sessionStats.streak }}</span>
        <span class="stat-label">Streak</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ sessionStats.perfectHits }}</span>
        <span class="stat-label">Perfect</span>
      </div>
    </div>

    <!-- Pattern Selector -->
    <div class="pattern-selector">
      <h4>Choose Pattern</h4>
      <div class="pattern-grid">
        <button
          v-for="pattern in patterns"
          :key="pattern.id"
          class="pattern-btn"
          :class="{ active: currentPattern?.id === pattern.id }"
          @click="selectPattern(pattern)"
        >
          <span class="pattern-preview">{{ pattern.pattern.join('') }}</span>
          <span class="pattern-label">{{ pattern.name }}</span>
        </button>
      </div>
    </div>

    <!-- Tips -->
    <div v-if="currentPattern" class="strumming-tips">
      <h4>Tips for this pattern</h4>
      <ul>
        <li v-for="(tip, index) in currentPattern.tips" :key="index">
          {{ tip }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

interface StrummingPattern {
  id: string
  name: string
  pattern: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tips: string[]
  bpm: number
}

const patterns: StrummingPattern[] = [
  {
    id: 'basic-down',
    name: 'Basic Down Strums',
    pattern: ['D', '-', 'D', '-', 'D', '-', 'D', '-'],
    difficulty: 'beginner',
    tips: [
      'Keep your wrist relaxed and loose',
      'Strum from the elbow, not the wrist',
      'Hit all strings evenly',
      'Practice slowly before increasing speed',
    ],
    bpm: 60,
  },
  {
    id: 'down-up',
    name: 'Down-Up Basic',
    pattern: ['D', 'U', 'D', 'U', 'D', 'U', 'D', 'U'],
    difficulty: 'beginner',
    tips: [
      'Down strums on the beat, up strums off the beat',
      'Keep the motion continuous',
      "Don't stop your hand between strums",
      'The motion should feel like waving goodbye',
    ],
    bpm: 70,
  },
  {
    id: 'country',
    name: 'Country Pattern',
    pattern: ['D', 'D', 'U', 'U', 'D', 'U', '-', '-'],
    difficulty: 'beginner',
    tips: [
      'Common in country and folk music',
      'Emphasize beats 1 and 3',
      'Keep the up strums lighter',
      'This is the "boom-chicka" pattern',
    ],
    bpm: 80,
  },
  {
    id: 'pop-rock',
    name: 'Pop Rock Pattern',
    pattern: ['D', '-', 'D', 'U', '-', 'U', 'D', '-'],
    difficulty: 'intermediate',
    tips: [
      'Very common in pop and rock',
      'Accented down strum on beat 1',
      'The rests are as important as the strums',
      'Try muting slightly on the rests',
    ],
    bpm: 90,
  },
  {
    id: 'island',
    name: 'Island Strum',
    pattern: ['D', '-', 'D', 'U', 'U', 'D', 'U', '-'],
    difficulty: 'intermediate',
    tips: [
      'Used in reggae and ukulele music',
      'The double up-strum is key',
      'Keep it light and bouncy',
      'Imagine a Hawaiian rhythm',
    ],
    bpm: 85,
  },
  {
    id: 'funk',
    name: 'Funk Pattern',
    pattern: ['x', 'D', 'x', 'D', 'x', 'D', 'x', 'D'],
    difficulty: 'intermediate',
    tips: [
      "Use palm muting for the x's",
      'Sharp, percussive strums',
      'Very rhythmic and tight',
      'Practice the palm mute technique first',
    ],
    bpm: 100,
  },
  {
    id: 'advanced-1',
    name: 'Advanced Syncopated',
    pattern: ['D', '-', 'U', 'D', 'U', '-', 'D', 'U'],
    difficulty: 'advanced',
    tips: [
      'Syncopated rhythm - feel the groove',
      'Watch the rests carefully',
      'Keep your hand moving in time',
      'This pattern creates forward momentum',
    ],
    bpm: 110,
  },
  {
    id: 'triplets',
    name: 'Triplet Feel',
    pattern: ['D', 'U', 'D', 'U', 'D', 'U', 'D', 'U'],
    difficulty: 'advanced',
    tips: [
      'Think in groups of three',
      'Swing feel - long-short pattern',
      'Common in blues and jazz',
      'Practice with a metronome',
    ],
    bpm: 120,
  },
]

const currentPattern = ref<StrummingPattern>(patterns[0])
const isPlaying = ref(false)
const tempo = ref(60)
const currentBeatIndex = ref(0)
const audioInputEnabled = ref(false)
const beatHits = ref<boolean[]>([])
const beatMisses = ref<boolean[]>([])

const sessionStats = ref({
  totalAttempts: 0,
  successfulHits: 0,
  perfectHits: 0,
  streak: 0,
  accuracy: 0,
})

const displayedBeats = computed(() => {
  return currentPattern.value?.pattern || []
})

function selectPattern(pattern: StrummingPattern) {
  currentPattern.value = pattern
  tempo.value = pattern.bpm
  resetSession()
}

function resetSession() {
  beatHits.value = new Array(8).fill(false)
  beatMisses.value = new Array(8).fill(false)
  sessionStats.value = {
    totalAttempts: 0,
    successfulHits: 0,
    perfectHits: 0,
    streak: 0,
    accuracy: 0,
  }
}

function increaseTempo() {
  if (tempo.value < 180) tempo.value += 5
}

function decreaseTempo() {
  if (tempo.value > 40) tempo.value -= 5
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    startPlayback()
  }
}

async function enableAudioInput() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true })
    audioInputEnabled.value = true
  } catch (error) {
    console.error('Failed to enable audio input:', error)
  }
}

let animationFrame: number | null = null
let lastBeatTime = 0

function startPlayback() {
  lastBeatTime = performance.now()
  animate()
}

function animate() {
  if (!isPlaying.value) return

  const now = performance.now()
  const beatDuration = 60000 / tempo.value

  if (now - lastBeatTime >= beatDuration) {
    currentBeatIndex.value = (currentBeatIndex.value + 1) % 8
    lastBeatTime = now

    // Reset hit/miss for this beat position
    beatHits.value[currentBeatIndex.value] = false
    beatMisses.value[currentBeatIndex.value] = false
  }

  animationFrame = requestAnimationFrame(animate)
}

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
})
</script>

<style scoped>
.strumming-trainer {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.trainer-header {
  margin-bottom: 24px;
}

.trainer-header h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.pattern-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pattern-name {
  font-weight: 600;
}

.pattern-difficulty {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  font-weight: 700;
}

.pattern-difficulty.beginner {
  background: #22c55e;
  color: white;
}

.pattern-difficulty.intermediate {
  background: #f59e0b;
  color: white;
}

.pattern-difficulty.advanced {
  background: #ef4444;
  color: white;
}

/* Pattern Display */
.pattern-display {
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 20px;
}

.beats-container {
  display: flex;
  justify-content: space-around;
  gap: 8px;
}

.beat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  transition: all 0.2s;
}

.beat-active {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
  transform: scale(1.1);
}

.beat-hit {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.2);
}

.beat-missed {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
}

.beat-indicator {
  font-size: 32px;
  font-weight: 700;
  height: 40px;
  display: flex;
  align-items: center;
}

.strum-down {
  color: #3b82f6;
}

.strum-up {
  color: #22c55e;
}

.strum-mute {
  color: #f59e0b;
}

.strum-rest {
  color: var(--text-tertiary);
}

.beat-number {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 600;
}

/* Legend */
.pattern-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.legend-symbol {
  font-size: 18px;
  font-weight: 700;
  width: 24px;
  text-align: center;
}

/* Audio Visualizer */
.audio-visualizer {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 20px;
  text-align: center;
}

.audio-visualizer canvas {
  max-width: 100%;
  height: 80px;
}

/* Playback Controls */
.playback-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.tempo-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tempo-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.tempo-btn:hover {
  background: var(--bg-card-hover);
}

.tempo-display {
  font-size: 18px;
  font-weight: 700;
  color: var(--bg-highlight);
  min-width: 90px;
  text-align: center;
}

.play-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: var(--bg-highlight);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.4);
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn.active {
  border-color: var(--bg-success);
  color: var(--bg-success);
}

.btn-label {
  font-size: 10px;
  font-weight: 600;
}

/* Accuracy Feedback */
.accuracy-feedback {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--bg-highlight);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Pattern Selector */
.pattern-selector {
  margin-bottom: 24px;
}

.pattern-selector h4 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}

.pattern-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.pattern-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.pattern-btn:hover {
  background: var(--bg-card-hover);
}

.pattern-btn.active {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.pattern-preview {
  font-family: monospace;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary);
}

.pattern-btn.active .pattern-preview {
  color: var(--bg-highlight);
}

.pattern-label {
  font-size: 11px;
  color: var(--text-tertiary);
}

/* Strumming Tips */
.strumming-tips {
  background: rgba(var(--primary-rgb), 0.05);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
}

.strumming-tips h4 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-secondary);
}

.strumming-tips ul {
  margin: 0;
  padding-left: 20px;
}

.strumming-tips li {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

@media (max-width: 600px) {
  .beats-container {
    gap: 4px;
  }

  .beat {
    padding: 12px 4px;
  }

  .beat-indicator {
    font-size: 24px;
  }

  .pattern-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
