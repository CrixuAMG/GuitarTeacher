<template>
  <div class="guitar-hero-view" :class="{ paused: isPaused }">
    <!-- Header / Score Display -->
    <div class="gh-header">
      <div class="score-section">
        <div class="score">
          <span class="score-label">Score</span>
          <span class="score-value">{{ formattedScore }}</span>
        </div>
        <div class="combo" :class="{ 'combo-high': combo >= 10 }">
          <span class="combo-count">{{ combo }}</span>
          <span class="combo-label">COMBO</span>
        </div>
        <div class="accuracy">
          <span class="accuracy-label">Accuracy</span>
          <span class="accuracy-value">{{ accuracy }}%</span>
        </div>
      </div>

      <div class="song-info">
        <h3>{{ song.title }}</h3>
        <p>{{ song.artist }}</p>
      </div>

      <div class="controls">
        <button class="control-btn" :title="isPaused ? 'Resume' : 'Pause'" @click="togglePause">
          <svg v-if="!isPaused" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </button>
        <button class="control-btn" title="Restart" @click="restart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
        <button class="control-btn" title="Stop" @click="stop">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Star Power / Progress -->
    <div class="star-power-container">
      <div class="star-display">
        <span v-for="n in 5" :key="n" class="star" :class="{ active: n <= currentStars }">⭐</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${songProgress}%` }"></div>
      </div>
    </div>

    <!-- Note Highway + Chord Sidebar -->
    <div class="playfield" :class="{ 'with-sidebar': showFretNumbers }">
      <div ref="highwayRef" class="highway-container" @click="handleTap">
        <div class="highway">
          <!-- Lane markers -->
          <div class="lanes">
            <div v-for="n in 6" :key="n" class="lane" :class="{ 'lane-hit': isHitLane[n - 1] }"></div>
          </div>

          <!-- Target line -->
          <div class="target-line">
            <div class="target-label">HIT</div>
          </div>

          <!-- Notes -->
          <div
            v-for="note in visibleNotes"
            :key="note.id"
            class="note"
            :class="[
              `note-string-${note.stringIndex}`,
              {
                'note-hit': note.hit,
                'note-missed': note.missed,
                'note-waiting': waitingForInput && waitingNote?.id === note.id,
              },
            ]"
            :style="getNoteStyle(note)"
          >
            <div class="note-inner">
              <span class="chord-name">{{ note.chordName }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chord Sidebar (beginner aid) -->
      <div v-if="showFretNumbers" class="chord-sidebar">
        <div class="chord-panel current">
          <span class="panel-label">Play Now</span>
          <h4 class="panel-chord">{{ currentChordNote?.chordName ?? '–' }}</h4>
          <div v-if="currentChordData" class="panel-fretboard">
            <Fretboard :chord="currentChordData" :max-frets="4" />
          </div>
        </div>
        <div class="chord-panel next">
          <span class="panel-label">Up Next</span>
          <h4 class="panel-chord">{{ nextChordName ?? '–' }}</h4>
        </div>
      </div>
    </div>

    <!-- Hit Feedback -->
    <TransitionGroup name="feedback" tag="div" class="feedback-container">
      <div
        v-for="feedback in activeFeedback"
        :key="feedback.id"
        class="hit-feedback"
        :class="feedback.type"
      >
        {{ feedback.text }}
      </div>
    </TransitionGroup>

    <!-- Input Methods -->
    <div class="input-bar">
      <div class="input-method" :class="{ active: isListening }">
        <span class="dot"></span>
        <span>{{ isListening ? 'Mic On' : 'Mic Off' }}</span>
      </div>
      <div class="input-method active">
        <span>🎹</span>
        <span>Space / Click</span>
      </div>
      <div v-if="waitingForInput" class="input-method waiting-indicator">
        <span>⏳</span>
        <span>Waiting for input...</span>
      </div>
    </div>

    <!-- Pause Overlay -->
    <div v-if="isPaused" class="pause-overlay">
      <div class="pause-content">
        <h2>PAUSED</h2>
        <div class="pause-stats">
          <div class="stat">
            <span class="stat-value">{{ score }}</span>
            <span class="stat-label">Score</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ combo }}</span>
            <span class="stat-label">Combo</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ accuracy }}%</span>
            <span class="stat-label">Accuracy</span>
          </div>
        </div>
        <div class="pause-actions">
          <button class="btn btn-primary btn-lg" @click="togglePause">Resume</button>
          <button class="btn btn-secondary" @click="restart">Restart</button>
          <button class="btn btn-secondary" @click="stop">Quit</button>
        </div>
      </div>
    </div>

    <!-- Post-Game Summary -->
    <PostGameSummary
      v-if="showSummary"
      :stats="gameStats"
      :song="song"
      @restart="restart"
      @quit="stop"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePitchDetection } from '@/composables/usePitchDetection'
import { getChordByName } from '@/data/chords'
import PostGameSummary from './PostGameSummary.vue'
import Fretboard from './Fretboard.vue'
import type { Song, SongChord, LeadNote } from '@/types'

interface NoteEvent {
  id: string
  stringIndex: number
  fret: number
  time: number
  duration?: number
  hit?: boolean
  missed?: boolean
  type: 'note' | 'chord'
  isChord?: boolean
  isHOPO?: boolean
  chordName: string
  chordFrets?: number[]
}

interface HitFeedback {
  id: number
  type: 'perfect' | 'good' | 'miss'
  text: string
}

interface GameStats {
  score: number
  maxCombo: number
  accuracy: number
  hits: number
  misses: number
  perfect: number
  good: number
  stars: number
  missedNotes: NoteEvent[]
}

interface Props {
  song: Song
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert'
  noteSpeed?: number
  waitForInput?: boolean
  showFretNumbers?: boolean
  playMode?: 'rhythm' | 'lead'
}

const props = withDefaults(defineProps<Props>(), {
  difficulty: 'medium',
  noteSpeed: 1.0,
  waitForInput: true,
  showFretNumbers: false,
  playMode: 'rhythm',
})

const emit = defineEmits<{
  complete: [stats: GameStats]
  exit: []
}>()

// Composables
const { isListening, stopListening, isNoteDetected } = usePitchDetection()

// Refs
const highwayRef = ref<HTMLElement>()
const isPaused = ref(false)
const isPlaying = ref(false)
const currentTime = ref(0)
const score = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const hits = ref(0)
const misses = ref(0)
const perfect = ref(0)
const good = ref(0)
const notes = ref<NoteEvent[]>([])
const activeFeedback = ref<HitFeedback[]>([])
const showSummary = ref(false)
const isHitLane = ref<boolean[]>([false, false, false, false, false, false])
const waitingForInput = ref(false)
const waitingNote = ref<NoteEvent | null>(null)

// Constants
const HIT_WINDOW = 250 // ms
const PERFECT_WINDOW = 80 // ms
const LEAD_IN_TIME = 3000 // ms before first note reaches target
const TARGET_Y_PCT = 75 // target line at 75% from top

// Generate notes from song data
function generateNotesFromSong(): NoteEvent[] {
  const generated: NoteEvent[] = []
  let id = 0

  const bpm = props.song.bpm || 120
  const beatDuration = (60 / bpm) * 1000 // ms per beat

  if (props.playMode === 'lead') {
    const leadNotes = getLeadNotes()
    if (leadNotes.length > 0) {
      leadNotes.forEach((note: LeadNote) => {
        const time = note.position * beatDuration + LEAD_IN_TIME
        generated.push({
          id: `note-${id++}`,
          stringIndex: note.stringIndex,
          fret: note.fret,
          time,
          duration: note.duration * beatDuration,
          type: 'note',
          chordName: note.pitch,
          isHOPO: note.technique === 'hammer-on' || note.technique === 'pull-off',
        })
      })
      return generated.sort((a, b) => a.time - b.time)
    }
  }

  // Default: rhythm mode using chords
  props.song.chords.forEach((chordEvent: SongChord) => {
    const time = chordEvent.position * beatDuration + LEAD_IN_TIME

    // Look up real chord fingering to determine lane
    const chordData = getChordByName(chordEvent.name)
    let lane = 2 // default center lane

    if (chordData && chordData.strings) {
      // Use lowest fretted string to determine lane
      const fretted = chordData.strings
        .map((fret, idx) => ({ fret, idx }))
        .filter((s) => s.fret > 0)
      if (fretted.length > 0) {
        lane = fretted[0].idx
      }
    }

    generated.push({
      id: `note-${id++}`,
      stringIndex: lane,
      fret: 0,
      time,
      chordName: chordEvent.name,
      chordFrets: chordData?.strings,
      type: 'chord',
      isChord: true,
    })
  })

  return generated.sort((a, b) => a.time - b.time)
}

function getLeadNotes(): LeadNote[] {
  if (props.song.leadNotes && props.song.leadNotes.length > 0) {
    return props.song.leadNotes
  }
  if (props.song.parts && props.song.parts.length > 0) {
    const leadParts = props.song.parts.filter(
      (p) => p.type === 'lead' || p.type === 'solo' || p.type === 'riff' || p.type === 'melody'
    )
    return leadParts.flatMap((p) => p.notes)
  }
  return []
}

// Computed
const formattedScore = computed(() => score.value.toLocaleString())

const accuracy = computed(() => {
  const total = hits.value + misses.value
  if (total === 0) return 100
  return Math.round((hits.value / total) * 100)
})

const currentStars = computed(() => {
  if (accuracy.value >= 95) return 5
  if (accuracy.value >= 85) return 4
  if (accuracy.value >= 75) return 3
  if (accuracy.value >= 60) return 2
  return 1
})

const songProgress = computed(() => {
  if (notes.value.length === 0) return 0
  const lastNoteTime = notes.value[notes.value.length - 1].time
  const totalDuration = lastNoteTime - LEAD_IN_TIME
  const elapsed = currentTime.value - LEAD_IN_TIME
  return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
})

const visibleNotes = computed(() => {
  const windowStart = currentTime.value - 500
  const windowEnd = currentTime.value + 4000

  return notes.value.filter(
    (note) => note.time >= windowStart && note.time <= windowEnd && !note.hit
  )
})

const currentChordNote = computed(() => {
  // Find the closest upcoming note that hasn't been hit or missed
  let closest: NoteEvent | null = null
  let minDiff = Infinity
  for (const note of notes.value) {
    if (note.hit || note.missed) continue
    const diff = note.time - currentTime.value
    if (diff >= -HIT_WINDOW && diff < minDiff) {
      minDiff = diff
      closest = note
    }
  }
  return closest
})

const nextChordNote = computed(() => {
  if (!currentChordNote.value) return null
  const idx = notes.value.findIndex((n) => n.id === currentChordNote.value!.id)
  for (let i = idx + 1; i < notes.value.length; i++) {
    if (!notes.value[i].hit && !notes.value[i].missed) {
      return notes.value[i]
    }
  }
  return null
})

const currentChordData = computed(() => {
  if (!currentChordNote.value) return null
  return getChordByName(currentChordNote.value.chordName)
})

const nextChordName = computed(() => nextChordNote.value?.chordName ?? null)

const gameStats = computed<GameStats>(() => ({
  score: score.value,
  maxCombo: maxCombo.value,
  accuracy: accuracy.value,
  hits: hits.value,
  misses: misses.value,
  perfect: perfect.value,
  good: good.value,
  stars: currentStars.value,
  missedNotes: notes.value.filter((n) => n.missed),
}))

// Methods
function getNoteStyle(note: NoteEvent): Record<string, string> {
  const timeDiff = note.time - currentTime.value
  // When timeDiff = LEAD_IN_TIME, note is at top (0%)
  // When timeDiff = 0, note is at target line (TARGET_Y_PCT)
  const progress = 1 - timeDiff / LEAD_IN_TIME
  const y = progress * TARGET_Y_PCT
  const x = (note.stringIndex / 5) * 100

  return {
    left: `${x}%`,
    top: `${Math.max(-10, Math.min(100, y))}%`,
    transform: 'translateX(-50%)',
  }
}

function addFeedback(type: HitFeedback['type']) {
  const texts: Record<string, string> = {
    perfect: 'PERFECT!',
    good: 'GOOD',
    miss: 'MISS',
  }

  const id = Date.now() + Math.random()
  activeFeedback.value.push({ id, type, text: texts[type] })

  setTimeout(() => {
    activeFeedback.value = activeFeedback.value.filter((f) => f.id !== id)
  }, 800)
}

function findClosestNote(): NoteEvent | null {
  let closest: NoteEvent | null = null
  let minDiff = Infinity

  for (const note of notes.value) {
    if (note.hit || note.missed) continue
    const diff = Math.abs(note.time - currentTime.value)
    if (diff < minDiff && diff <= HIT_WINDOW) {
      minDiff = diff
      closest = note
    }
  }

  return closest
}

function processHit(note: NoteEvent) {
  const timeDiff = Math.abs(note.time - currentTime.value)

  note.hit = true
  combo.value++
  if (combo.value > maxCombo.value) maxCombo.value = combo.value

  if (timeDiff <= PERFECT_WINDOW) {
    score.value += 100 * (1 + Math.min(combo.value, 50) * 0.05)
    perfect.value++
    addFeedback('perfect')
  } else {
    score.value += 50 * (1 + Math.min(combo.value, 50) * 0.03)
    good.value++
    addFeedback('good')
  }

  hits.value++

  // Flash the lane
  isHitLane.value[note.stringIndex] = true
  setTimeout(() => {
    isHitLane.value[note.stringIndex] = false
  }, 150)
}

function processMiss(note: NoteEvent) {
  note.missed = true
  combo.value = 0
  misses.value++
  addFeedback('miss')
}

function attemptHit() {
  if (!isPlaying.value || showSummary.value) return

  if (waitingForInput.value && waitingNote.value) {
    processHit(waitingNote.value)
    waitingForInput.value = false
    waitingNote.value = null
    lastFrameTime = 0
    return
  }

  if (isPaused.value) return

  const note = findClosestNote()
  if (note) {
    processHit(note)
  }
}

function handleTap() {
  attemptHit()
}

// Game loop
let lastFrameTime = 0
let animationFrame: number | null = null

function gameLoop(timestamp: number) {
  if (!isPlaying.value) return
  if (isPaused.value) {
    animationFrame = requestAnimationFrame(gameLoop)
    return
  }
  if (waitingForInput.value) {
    animationFrame = requestAnimationFrame(gameLoop)
    return
  }

  if (lastFrameTime === 0) lastFrameTime = timestamp
  const deltaTime = timestamp - lastFrameTime
  lastFrameTime = timestamp

  // Update time
  currentTime.value += deltaTime

  // Check for notes that have passed without being hit
  notes.value.forEach((note) => {
    if (note.hit || note.missed) return

    const timeDiff = note.time - currentTime.value

    if (props.waitForInput) {
      // In practice mode: pause when a note reaches the target line
      if (timeDiff < 0 && !waitingForInput.value) {
        waitingNote.value = note
        waitingForInput.value = true
      }
    } else {
      // Normal mode: mark as missed after hit window passes
      if (timeDiff < -HIT_WINDOW) {
        processMiss(note)
      }
    }
  })

  // Check audio input for hits
  if (isListening.value) {
    const note = findClosestNote()
    if (note && isNoteDetected(note.stringIndex, 0, 2)) {
      processHit(note)
    }
  }

  // Check if song is complete (all notes processed and past)
  const lastNote = notes.value[notes.value.length - 1]
  if (lastNote && currentTime.value > lastNote.time + 2000) {
    const allProcessed = notes.value.every((n) => n.hit || n.missed)
    if (allProcessed) {
      endGame()
      return
    }
  }

  animationFrame = requestAnimationFrame(gameLoop)
}

function startGame() {
  notes.value = generateNotesFromSong()
  currentTime.value = 0
  score.value = 0
  combo.value = 0
  maxCombo.value = 0
  hits.value = 0
  misses.value = 0
  perfect.value = 0
  good.value = 0
  isPlaying.value = true
  isPaused.value = false
  waitingForInput.value = false
  waitingNote.value = null
  showSummary.value = false
  lastFrameTime = 0

  animationFrame = requestAnimationFrame(gameLoop)
}

function endGame() {
  isPlaying.value = false
  showSummary.value = true
  emit('complete', gameStats.value)
}

function togglePause() {
  isPaused.value = !isPaused.value
  if (!isPaused.value) {
    lastFrameTime = 0
  }
}

function restart() {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  startGame()
}

function stop() {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  isPlaying.value = false
  showSummary.value = false
  emit('exit')
}

function onKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space' || e.code === 'Enter') {
    e.preventDefault()
    if (isPlaying.value && !showSummary.value) {
      if (waitingForInput.value) {
        attemptHit()
      } else if (isPaused.value) {
        togglePause()
      } else {
        attemptHit()
      }
    }
  }
  if (e.code === 'Escape') {
    if (isPlaying.value && !showSummary.value) {
      togglePause()
    }
  }
}

// Lifecycle
onMounted(() => {
  startGame()
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  stopListening()
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.guitar-hero-view {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header */
.gh-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.score-section {
  display: flex;
  gap: 24px;
}

.score,
.accuracy {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-label,
.accuracy-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
}

.score-value,
.accuracy-value {
  font-size: 20px;
  font-weight: 800;
}

.combo {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.combo-count {
  font-size: 24px;
  font-weight: 800;
  color: #fbbf24;
}

.combo-high .combo-count {
  color: #ef4444;
  animation: pulse 0.5s ease infinite alternate;
}

.combo-label {
  font-size: 9px;
  letter-spacing: 2px;
}

@keyframes pulse {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}

.song-info {
  text-align: center;
}

.song-info h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 2px;
}

.song-info p {
  font-size: 12px;
  opacity: 0.7;
}

.controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Star Power */
.star-power-container {
  padding: 6px 24px;
  background: rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}

.star-display {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 4px;
}

.star {
  font-size: 16px;
  opacity: 0.25;
  transition: opacity 0.3s;
}

.star.active {
  opacity: 1;
}

.progress-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  border-radius: 2px;
  transition: width 0.3s;
}

/* Playfield */
.playfield {
  position: relative;
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 16px;
  padding: 0 16px;
  overflow: hidden;
}

.playfield.with-sidebar .highway {
  width: 55%;
  max-width: 420px;
  margin: 0;
}

/* Highway */
.highway-container {
  position: relative;
  flex: 1;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  justify-content: center;
}

.highway {
  position: relative;
  height: 100%;
  width: 70%;
  max-width: 500px;
  margin: 0 auto;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(20, 20, 40, 0.8) 50%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

/* Chord Sidebar */
.chord-sidebar {
  width: 160px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
  flex-shrink: 0;
}

.chord-panel {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}

.chord-panel.current {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
}

.chord-panel.next {
  opacity: 0.7;
}

.panel-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 6px;
}

.panel-chord {
  font-size: 22px;
  font-weight: 800;
  color: #fbbf24;
  margin-bottom: 8px;
}

.panel-fretboard {
  transform: scale(0.85);
  transform-origin: top center;
}

.panel-fretboard :deep(.fretboard-container) {
  max-width: 100%;
}

.panel-fretboard :deep(.fretboard-body) {
  height: 140px;
}

.lanes {
  position: absolute;
  inset: 0;
  display: flex;
}

.lane {
  flex: 1;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  transition: background 0.1s;
}

.lane:last-child {
  border-right: none;
}

.lane-hit {
  background: rgba(255, 255, 255, 0.15);
}

/* Target Line */
.target-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 75%;
  height: 4px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 15%,
    rgba(255, 255, 255, 0.8) 50%,
    rgba(255, 255, 255, 0.4) 85%,
    transparent 100%
  );
  box-shadow: 0 0 16px rgba(255, 255, 255, 0.3);
}

.target-label {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.5);
}

/* Notes */
.note {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.note-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chord-name {
  font-size: 13px;
  font-weight: 800;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.chord-name.small {
  font-size: 10px;
}

.fret-pattern {
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.5px;
  margin-top: 1px;
}

/* String colors */
.note-string-0 { background: linear-gradient(135deg, #ef4444, #b91c1c); }
.note-string-1 { background: linear-gradient(135deg, #f97316, #c2410c); }
.note-string-2 { background: linear-gradient(135deg, #eab308, #a16207); }
.note-string-3 { background: linear-gradient(135deg, #22c55e, #15803d); }
.note-string-4 { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.note-string-5 { background: linear-gradient(135deg, #a855f7, #7e22ce); }

.note-hit {
  animation: hitPulse 0.3s ease forwards;
}

@keyframes hitPulse {
  0% { transform: translateX(-50%) scale(1); opacity: 1; }
  50% { transform: translateX(-50%) scale(1.4); opacity: 0.8; }
  100% { transform: translateX(-50%) scale(1.8); opacity: 0; }
}

.note-missed {
  background: #444 !important;
  opacity: 0.3;
}

.note-waiting {
  animation: notePulse 0.6s ease-in-out infinite alternate;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.3);
  z-index: 20;
}

@keyframes notePulse {
  0% { transform: translateX(-50%) scale(1); }
  100% { transform: translateX(-50%) scale(1.15); }
}

/* Feedback */
.feedback-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 50;
}

.hit-feedback {
  position: absolute;
  font-size: 28px;
  font-weight: 800;
  text-shadow: 0 0 20px currentColor;
  white-space: nowrap;
  animation: feedbackFloat 0.8s ease forwards;
}

.hit-feedback.perfect {
  color: #fbbf24;
}

.hit-feedback.good {
  color: #22c55e;
}

.hit-feedback.miss {
  color: #ef4444;
}

@keyframes feedbackFloat {
  0% { transform: translate(-50%, 20px) scale(0.6); opacity: 0; }
  20% { transform: translate(-50%, -10px) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%, -50px) scale(1); opacity: 0; }
}

/* Input Bar */
.input-bar {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  padding: 6px 14px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 20px;
  font-size: 11px;
  z-index: 20;
}

.input-method {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.3s;
}

.input-method.active {
  color: #22c55e;
}

.input-method .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.waiting-indicator {
  color: #fbbf24 !important;
  animation: waitingBlink 1s ease-in-out infinite alternate;
}

@keyframes waitingBlink {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

/* Pause Overlay */
.pause-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.pause-content {
  text-align: center;
}

.pause-content h2 {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 24px;
  letter-spacing: 4px;
}

.pause-stats {
  display: flex;
  justify-content: center;
  gap: 36px;
  margin-bottom: 36px;
}

.pause-stats .stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pause-stats .stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #fbbf24;
}

.pause-stats .stat-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
}

.pause-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.pause-actions .btn {
  min-width: 180px;
}

/* Feedback Transitions */
.feedback-enter-active,
.feedback-leave-active {
  transition: all 0.3s ease;
}

.feedback-enter-from,
.feedback-leave-to {
  opacity: 0;
  transform: translate(-50%, 0);
}

@media (max-width: 600px) {
  .gh-header {
    padding: 8px 12px;
  }
  .score-section {
    gap: 12px;
  }
  .score-value,
  .accuracy-value {
    font-size: 16px;
  }
  .song-info h3 {
    font-size: 13px;
  }
  .highway {
    width: 90%;
  }
  .playfield.with-sidebar .highway {
    width: 90%;
    max-width: 500px;
  }
  .chord-sidebar {
    display: none;
  }
  .note {
    width: 40px;
    height: 40px;
  }
  .chord-name {
    font-size: 11px;
  }
  .pause-content h2 {
    font-size: 32px;
  }
}
</style>
