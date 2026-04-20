<template>
  <div class="note-trainer">
    <div class="trainer-header">
      <h3>Note Trainer</h3>
      <p class="subtitle">Learn individual notes and string control</p>
    </div>

    <!-- Exercise Mode Selector -->
    <div class="mode-selector">
      <button
        v-for="mode in exerciseModes"
        :key="mode.id"
        class="mode-btn"
        :class="{ active: currentMode === mode.id }"
        @click="currentMode = mode.id"
      >
        <span class="mode-icon">{{ mode.icon }}</span>
        <span class="mode-label">{{ mode.name }}</span>
      </button>
    </div>

    <!-- Fretboard Display -->
    <div class="fretboard-section">
      <div class="fretboard">
        <!-- String labels -->
        <div class="string-labels">
          <div v-for="(string, index) in strings" :key="index" class="string-label">
            {{ string.note }}
          </div>
        </div>

        <!-- Frets -->
        <div class="frets-container">
          <div
            v-for="fret in 13"
            :key="fret - 1"
            class="fret-column"
            :class="{ 'fret-marker': isFretMarker(fret - 1) }"
          >
            <div class="fret-number">{{ fret - 1 }}</div>
            <div
              v-for="(_, stringIndex) in strings"
              :key="stringIndex"
              class="fret-position"
              :class="{
                'target-note': isTargetNote(stringIndex, fret - 1),
                'hit-note': isHitNote(stringIndex, fret - 1),
                'correct-hit': wasCorrectHit(stringIndex, fret - 1),
                'detected-note': isDetectedNote(stringIndex, fret - 1),
              }"
              @click="selectNote(stringIndex, fret - 1)"
            >
              <span v-if="isTargetNote(stringIndex, fret - 1)" class="note-indicator">
                {{ getNoteName(stringIndex, fret - 1) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Exercise -->
    <div v-if="currentExercise" class="exercise-display">
      <div class="exercise-info">
        <h4>{{ currentExercise.name }}</h4>
        <p>{{ currentExercise.description }}</p>
      </div>

      <div v-if="currentTarget && !isFreePlayMode" class="target-display">
        <div class="target-note-large">
          <span class="note-name">{{ currentTarget.note }}</span>
          <span class="string-info"
            >String {{ currentTarget.string + 1 }} ({{ strings[currentTarget.string].note }})</span
          >
          <span class="fret-info">Fret {{ currentTarget.fret }}</span>
        </div>
      </div>

      <div v-if="!isFreePlayMode" class="play-button">
        <button class="btn btn-primary btn-lg" @click="playTargetNote">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Hear Note
        </button>
      </div>

      <!-- Free Play Display -->
      <div v-if="isFreePlayMode" class="free-play-display">
        <div class="free-play-stats">
          <div class="stat-item">
            <span class="stat-value">{{ totalNotesPlayed }}</span>
            <span class="stat-label">Notes Played</span>
          </div>
        </div>
        <p class="free-play-hint">Just play any note on your guitar!</p>
      </div>
    </div>

    <!-- Progress -->
    <div v-if="!isFreePlayMode" class="progress-section">
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: `${exerciseProgress}%` }"></div>
      </div>
      <div class="progress-stats">
        <span>{{ completedNotes }} / {{ totalNotes }} notes</span>
        <span class="accuracy">{{ accuracy }}% accuracy</span>
      </div>
    </div>

    <!-- Audio Input Toggle -->
    <div class="input-section">
      <button
        class="btn"
        :class="audioInputEnabled ? 'btn-success' : 'btn-secondary'"
        @click="toggleAudioInput"
      >
        <svg
          width="16"
          height="16"
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
        {{ audioInputEnabled ? 'Listening...' : 'Enable Microphone' }}
      </button>
      <p v-if="lastDetectedNote" class="detected-note">
        Detected: {{ lastDetectedNote.note }} ({{ lastDetectedNote.string }} string, fret
        {{ lastDetectedNote.fret }})
      </p>
    </div>

    <!-- Exercise Complete -->
    <div v-if="exerciseComplete" class="completion-overlay">
      <div class="completion-content card">
        <h3>Exercise Complete! 🎉</h3>
        <div class="completion-stats">
          <div class="stat">
            <span class="stat-value">{{ accuracy }}%</span>
            <span class="stat-label">Accuracy</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ maxStreak }}</span>
            <span class="stat-label">Best Streak</span>
          </div>
        </div>
        <div class="completion-actions">
          <button class="btn btn-primary" @click="restartExercise">Try Again</button>
          <button class="btn btn-secondary" @click="nextExercise">Next Exercise</button>
        </div>
      </div>
    </div>

    <!-- Feedback Toast -->
    <TransitionGroup name="toast" tag="div" class="feedback-toast-container">
      <div
        v-for="feedback in feedbackItems"
        :key="feedback.id"
        class="feedback-toast"
        :class="feedback.type"
      >
        {{ feedback.message }}
      </div>
    </TransitionGroup>

    <!-- Tips -->
    <div class="tips-section">
      <h4>💡 Tips</h4>
      <ul>
        <li>Press firmly behind the fret, not on top of it</li>
        <li>Use the tip of your finger, not the pad</li>
        <li>Keep your finger close to the fret for cleaner sound</li>
        <li>Practice slowly and focus on clean notes</li>
        <li>Use a metronome to maintain steady rhythm</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { usePitchDetection } from '@/composables/usePitchDetection'

interface NotePosition {
  string: number
  fret: number
  note: string
}

interface Exercise {
  id: string
  mode: string
  name: string
  description: string
  notes: NotePosition[]
}

interface FeedbackItem {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
  timestamp: number
}

const exerciseModes = [
  { id: 'free-play', name: 'Free Play', icon: '🎵' },
  { id: 'open-strings', name: 'Open Strings', icon: '🎸' },
  { id: 'first-position', name: 'First Position', icon: '1️⃣' },
  { id: 'single-string', name: 'Single String', icon: '➡️' },
  { id: 'note-finding', name: 'Note Finding', icon: '🎯' },
  { id: 'chromatic', name: 'Chromatic', icon: '🌈' },
]

const strings = [
  { note: 'E', octave: 2 },
  { note: 'A', octave: 2 },
  { note: 'D', octave: 3 },
  { note: 'G', octave: 3 },
  { note: 'B', octave: 3 },
  { note: 'E', octave: 4 },
]

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const currentMode = ref('free-play')
const currentExercise = ref<Exercise | null>(null)
const currentTargetIndex = ref(0)
const completedNotes = ref(0)
const correctHits = ref(0)
const totalAttempts = ref(0)
const streak = ref(0)
const maxStreak = ref(0)
const audioInputEnabled = ref(false)
const lastDetectedNote = ref<{ note: string; string: number; fret: number } | null>(null)
const hitNotes = ref<Set<string>>(new Set())
const correctHitsSet = ref<Set<string>>(new Set())
const feedbackItems = ref<FeedbackItem[]>([])
const isNoteRinging = ref(false)
const noteRingStartTime = ref<number>(0)
const detectionDebounceTimer = ref<number | null>(null)
const consecutiveDetections = ref(0)
const lastDetectionTime = ref(0)
const totalNotesPlayed = ref(0)

const { playChord, playCorrect, playWrong, initAudio } = useAudio()
const { detectedNotes, startListening, stopListening } = usePitchDetection()

const currentTarget = computed(() => {
  if (!currentExercise.value) return null
  return currentExercise.value.notes[currentTargetIndex.value]
})

const totalNotes = computed(() => currentExercise.value?.notes.length || 0)

const exerciseProgress = computed(() => {
  if (!currentExercise.value) return 0
  return (completedNotes.value / currentExercise.value.notes.length) * 100
})

const accuracy = computed(() => {
  if (totalAttempts.value === 0) return 100
  return Math.round((correctHits.value / totalAttempts.value) * 100)
})

const exerciseComplete = computed(() => {
  if (currentMode.value === 'free-play') return false
  return completedNotes.value >= totalNotes.value
})

const isFreePlayMode = computed(() => currentMode.value === 'free-play')

// Watch for pitch detection and check against target
watch(
  detectedNotes,
  (notes) => {
    if (!audioInputEnabled.value || notes.length === 0) return

    // Free play mode: just show what was detected
    if (currentMode.value === 'free-play') {
      const now = Date.now()
      if (now - lastDetectionTime.value < 100) {
        consecutiveDetections.value++
      } else {
        consecutiveDetections.value = 1
      }
      lastDetectionTime.value = now

      if (consecutiveDetections.value < 3) return

      const detected = notes[0]
      lastDetectedNote.value = {
        note: detected.note,
        string: detected.stringIndex,
        fret: detected.fret,
      }
      totalNotesPlayed.value++
      return
    }

    if (!currentTarget.value) return

    const now = Date.now()

    // Debounce: require consecutive detections within 100ms
    if (now - lastDetectionTime.value < 100) {
      consecutiveDetections.value++
    } else {
      consecutiveDetections.value = 1
    }
    lastDetectionTime.value = now

    // Require at least 3 consecutive detections for stability
    if (consecutiveDetections.value < 3) return

    // Check if any detected note matches the target
    const target = currentTarget.value
    const matchingNote = notes.find(
      (n) => n.stringIndex === target.string && n.fret === target.fret
    )

    if (matchingNote) {
      // Note detected and matches target
      if (!isNoteRinging.value) {
        isNoteRinging.value = true
        noteRingStartTime.value = now
        lastDetectedNote.value = {
          note: matchingNote.note,
          string: matchingNote.stringIndex,
          fret: matchingNote.fret,
        }

        // Clear any pending debounce timer
        if (detectionDebounceTimer.value) {
          clearTimeout(detectionDebounceTimer.value)
        }

        // Debounce the hit registration to avoid double-triggering
        detectionDebounceTimer.value = window.setTimeout(() => {
          handleCorrectDetection()
        }, 150)
      }
    } else {
      // Note detected but doesn't match target - only show feedback if sustained
      const wrongNote = notes[0]
      if (!isNoteRinging.value && now - lastDetectionTime.value > 300) {
        lastDetectedNote.value = {
          note: wrongNote.note,
          string: wrongNote.stringIndex,
          fret: wrongNote.fret,
        }
        // Only count as wrong if held for a bit
        if (detectionDebounceTimer.value) {
          clearTimeout(detectionDebounceTimer.value)
        }
        detectionDebounceTimer.value = window.setTimeout(() => {
          handleWrongDetection(wrongNote)
        }, 400)
      }
    }
  },
  { deep: true }
)

// Handle correct note detection
function handleCorrectDetection() {
  if (!currentTarget.value) return

  checkHit(currentTarget.value.string, currentTarget.value.fret)
  isNoteRinging.value = false

  // Visual feedback
  addFeedback('success', `✓ ${currentTarget.value.note} - Perfect!`)
}

// Handle wrong note detection
function handleWrongDetection(detectedNote: { note: string; stringIndex: number; fret: number }) {
  if (!currentTarget.value) return

  totalAttempts.value++
  streak.value = 0

  // Visual feedback
  const target = currentTarget.value
  addFeedback(
    'error',
    `✗ Expected ${target.note} on string ${target.string + 1}, got ${detectedNote.note}`
  )

  // Play error sound
  playWrong()

  isNoteRinging.value = false
}

// Add feedback item
function addFeedback(type: 'success' | 'error' | 'info', message: string) {
  const id = Date.now()
  feedbackItems.value.push({ id, type, message, timestamp: Date.now() })

  // Remove after 3 seconds
  setTimeout(() => {
    const index = feedbackItems.value.findIndex((f) => f.id === id)
    if (index > -1) {
      feedbackItems.value.splice(index, 1)
    }
  }, 3000)
}

function generateExercise(): Exercise {
  const notes: NotePosition[] = []

  switch (currentMode.value) {
    case 'open-strings':
      // Open strings only
      strings.forEach((string, index) => {
        notes.push({
          string: index,
          fret: 0,
          note: string.note,
        })
      })
      break

    case 'first-position':
      // Frets 0-3 on all strings
      for (let string = 0; string < 6; string++) {
        for (let fret = 0; fret <= 3; fret++) {
          notes.push({
            string,
            fret,
            note: getNoteName(string, fret),
          })
        }
      }
      break

    case 'single-string':
      // One string at a time, all frets
      const randomString = Math.floor(Math.random() * 6)
      for (let fret = 0; fret <= 12; fret++) {
        notes.push({
          string: randomString,
          fret,
          note: getNoteName(randomString, fret),
        })
      }
      break

    case 'note-finding':
      // Find specific notes across all strings
      const targetNotes = ['C', 'D', 'E', 'G', 'A']
      targetNotes.forEach((targetNote) => {
        // Find all positions of this note
        for (let string = 0; string < 6; string++) {
          for (let fret = 0; fret <= 12; fret++) {
            if (getNoteName(string, fret) === targetNote) {
              notes.push({
                string,
                fret,
                note: targetNote,
              })
            }
          }
        }
      })
      break

    case 'chromatic':
      // Chromatic scale on one string
      const chromaticString = 0 // Low E
      for (let fret = 0; fret <= 12; fret++) {
        notes.push({
          string: chromaticString,
          fret,
          note: getNoteName(chromaticString, fret),
        })
      }
      break
  }

  // Shuffle notes
  for (let i = notes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[notes[i], notes[j]] = [notes[j], notes[i]]
  }

  return {
    id: Date.now().toString(),
    mode: currentMode.value,
    name: exerciseModes.find((m) => m.id === currentMode.value)?.name || 'Exercise',
    description: getExerciseDescription(currentMode.value),
    notes: notes.slice(0, 20), // Limit to 20 notes
  }
}

function getExerciseDescription(mode: string): string {
  const descriptions: Record<string, string> = {
    'open-strings': 'Play each open string clearly. Focus on clean sound and consistent volume.',
    'first-position':
      'Practice notes in the first 4 frets. This is where most beginner chords are played.',
    'single-string':
      'Play up and down one string. Focus on finger placement and clean transitions.',
    'note-finding':
      'Find the same note on different strings. Important for fretboard memorization.',
    chromatic: 'Play every fret in order. Great for finger independence and speed.',
  }
  return descriptions[mode] || 'Practice notes on the fretboard'
}

function getNoteName(stringIndex: number, fret: number): string {
  const openNote = strings[stringIndex].note
  const openIndex = noteNames.indexOf(openNote)
  return noteNames[(openIndex + fret) % 12]
}

function isTargetNote(stringIndex: number, fret: number): boolean {
  return currentTarget.value?.string === stringIndex && currentTarget.value?.fret === fret
}

function isHitNote(stringIndex: number, fret: number): boolean {
  return hitNotes.value.has(`${stringIndex}-${fret}`)
}

function wasCorrectHit(stringIndex: number, fret: number): boolean {
  return correctHitsSet.value.has(`${stringIndex}-${fret}`)
}

function isDetectedNote(stringIndex: number, fret: number): boolean {
  if (!audioInputEnabled.value || !lastDetectedNote.value) return false
  return lastDetectedNote.value.string === stringIndex && lastDetectedNote.value.fret === fret
}

function isFretMarker(fret: number): boolean {
  return [3, 5, 7, 9, 12].includes(fret)
}

function selectNote(stringIndex: number, fret: number) {
  // For manual selection or touch devices
  checkHit(stringIndex, fret)
}

function checkHit(stringIndex: number, fret: number) {
  if (!currentTarget.value) return

  totalAttempts.value++
  hitNotes.value.add(`${stringIndex}-${fret}`)

  if (stringIndex === currentTarget.value.string && fret === currentTarget.value.fret) {
    // Correct!
    correctHits.value++
    streak.value++
    if (streak.value > maxStreak.value) maxStreak.value = streak.value
    correctHitsSet.value.add(`${stringIndex}-${fret}`)
    completedNotes.value++

    // Move to next note
    if (currentTargetIndex.value < totalNotes.value - 1) {
      currentTargetIndex.value++
      hitNotes.value.clear()
    }

    // Play success sound
    playSuccessSound()
  } else {
    // Wrong note
    streak.value = 0
    playErrorSound()
  }
}

async function playTargetNote() {
  if (!currentTarget.value) return

  await initAudio()

  // Build array representing which strings to play
  const stringArray = [0, 0, 0, 0, 0, 0]
  stringArray[currentTarget.value.string] = currentTarget.value.fret

  await playChord(stringArray, 1)
}

function playSuccessSound() {
  playCorrect()
}

function playErrorSound() {
  playWrong()
}

async function toggleAudioInput() {
  audioInputEnabled.value = !audioInputEnabled.value

  if (audioInputEnabled.value) {
    await initAudio()
    await startListening()
  } else {
    stopListening()
    if (detectionDebounceTimer.value) {
      clearTimeout(detectionDebounceTimer.value)
    }
    isNoteRinging.value = false
  }
}

function restartExercise() {
  currentTargetIndex.value = 0
  completedNotes.value = 0
  correctHits.value = 0
  totalAttempts.value = 0
  streak.value = 0
  hitNotes.value.clear()
  correctHitsSet.value.clear()
  currentExercise.value = generateExercise()
}

function nextExercise() {
  restartExercise()
}

// Initialize
onMounted(() => {
  currentExercise.value = generateExercise()
})

// Cleanup
onUnmounted(() => {
  stopListening()
  if (detectionDebounceTimer.value) {
    clearTimeout(detectionDebounceTimer.value)
  }
})

// Watch for mode changes
watch(currentMode, () => {
  restartExercise()
})
</script>

<style scoped>
.note-trainer {
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
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

/* Mode Selector */
.mode-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.mode-btn:hover {
  background: var(--bg-card-hover);
}

.mode-btn.active {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.mode-icon {
  font-size: 20px;
}

.mode-label {
  font-size: 12px;
  font-weight: 600;
}

/* Fretboard */
.fretboard-section {
  margin-bottom: 24px;
  overflow-x: auto;
}

.fretboard {
  display: flex;
  gap: 8px;
  min-width: 600px;
}

.string-labels {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 24px;
}

.string-label {
  height: 40px;
  display: flex;
  align-items: center;
  font-weight: 700;
  color: var(--text-secondary);
}

.frets-container {
  display: flex;
  gap: 4px;
}

.fret-column {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fret-number {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  height: 20px;
}

.fret-position {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-tertiary);
}

.fret-position:hover {
  background: var(--bg-card-hover);
}

.fret-column.fret-marker .fret-position {
  border-color: var(--text-tertiary);
}

.fret-position.target-note {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
  animation: pulse 1s ease infinite;
}

.fret-position.hit-note {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

.fret-position.correct-hit {
  background: rgba(34, 197, 94, 0.3);
  border-color: #22c55e;
}

.fret-position.detected-note {
  border-color: var(--bg-highlight);
  background: rgba(147, 51, 234, 0.3);
  box-shadow: 0 0 12px rgba(147, 51, 234, 0.5);
}

.note-indicator {
  font-size: 14px;
  font-weight: 700;
  color: var(--bg-highlight);
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Exercise Display */
.exercise-display {
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
}

.exercise-info h4 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.exercise-info p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}

.target-display {
  margin-bottom: 20px;
}

.target-note-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.note-name {
  font-size: 48px;
  font-weight: 800;
  color: var(--bg-highlight);
}

.string-info,
.fret-info {
  font-size: 14px;
  color: var(--text-secondary);
}

/* Progress Section */
.progress-section {
  margin-bottom: 24px;
}

.progress-bar-container {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--bg-highlight), #818cf8);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-secondary);
}

.progress-stats .accuracy {
  font-weight: 700;
  color: var(--bg-highlight);
}

/* Free Play Display */
.free-play-display {
  padding: 16px 0;
}

.free-play-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 16px;
}

.free-play-stats .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.free-play-stats .stat-value {
  font-size: 36px;
  font-weight: 800;
  color: var(--bg-highlight);
}

.free-play-stats .stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.free-play-hint {
  color: var(--text-secondary);
  font-size: 14px;
  font-style: italic;
}

/* Input Section */
.input-section {
  margin-bottom: 24px;
  text-align: center;
}

.input-section .btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.detected-note {
  font-size: 14px;
  color: var(--text-secondary);
}

/* Completion Overlay */
.completion-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.completion-content {
  max-width: 400px;
  width: 100%;
  padding: 32px;
  text-align: center;
}

.completion-content h3 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 24px;
}

.completion-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
}

.completion-stats .stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.completion-stats .stat-value {
  font-size: 36px;
  font-weight: 800;
  color: var(--bg-highlight);
}

.completion-stats .stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.completion-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Tips Section */
.tips-section {
  background: rgba(var(--primary-rgb), 0.05);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
}

.tips-section h4 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-secondary);
}

.tips-section ul {
  margin: 0;
  padding-left: 20px;
}

.tips-section li {
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

@media (max-width: 600px) {
  .fretboard-section {
    margin: 0 -24px;
    padding: 0 24px;
  }

  .mode-selector {
    flex-wrap: nowrap;
  }

  .mode-btn {
    padding: 8px 12px;
  }
}

/* Feedback Toast */
.feedback-toast-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
  pointer-events: none;
}

.feedback-toast {
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}

.feedback-toast.success {
  background: rgba(34, 197, 94, 0.95);
  color: white;
}

.feedback-toast.error {
  background: rgba(239, 68, 68, 0.95);
  color: white;
}

.feedback-toast.info {
  background: var(--bg-highlight);
  color: white;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
