<template>
  <div class="nashville-trainer">
    <div class="trainer-header card">
      <h2>Nashville Number System Trainer</h2>
      <p class="subtitle">Learn to think in numbers — the pro session player's language</p>

      <div class="control-row">
        <div class="control-group">
          <label>Key</label>
          <div class="note-buttons">
            <button
              v-for="note in ROOT_NOTES"
              :key="note"
              class="note-btn"
              :class="{ active: selectedKey === note }"
              @click="selectedKey = note"
            >
              {{ note }}
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>Mode</label>
          <div class="mode-buttons">
            <button
              v-for="m in MODES"
              :key="m.id"
              class="mode-btn"
              :class="{ active: selectedMode === m.id }"
              @click="selectedMode = m.id"
            >
              {{ m.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Number Chart -->
    <div class="number-chart card">
      <h3>Number Chart in {{ selectedKey }} {{ currentMode.name }}</h3>
      <div class="chart-grid">
        <div
          v-for="(degree, i) in degrees"
          :key="i"
          class="degree-card"
          :class="{ active: selectedDegree === i + 1 }"
          @click="selectedDegree = i + 1"
        >
          <span class="degree-num">{{ i + 1 }}</span>
          <span class="degree-chord">{{ degree.chord }}</span>
          <span class="degree-quality">{{ degree.quality }}</span>
        </div>
      </div>
    </div>

    <!-- Progression Converter -->
    <div class="converter card">
      <h3>Progression Converter</h3>
      <p class="converter-hint">Type a number progression (e.g., 1 5 6 4) to see the chords in {{ selectedKey }}</p>

      <div class="converter-input-row">
        <input
          v-model="numberInput"
          class="converter-input"
          placeholder="1 5 6 4"
          @keyup.enter="convertProgression"
        />
        <button class="convert-btn" @click="convertProgression">Convert</button>
      </div>

      <div v-if="convertedChords.length" class="converted-result">
        <div class="chord-strip">
          <div
            v-for="(chord, i) in convertedChords"
            :key="i"
            class="strip-chord"
          >
            <span class="strip-num">{{ chord.num }}</span>
            <span class="strip-name">{{ chord.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Common Progressions -->
    <div class="progressions card">
      <h3>Common Progressions</h3>
      <div class="progression-list">
        <div
          v-for="prog in commonProgressions"
          :key="prog.name"
          class="progression-item"
          @click="loadProgression(prog)"
        >
          <div class="prog-info">
            <span class="prog-name">{{ prog.name }}</span>
            <span class="prog-numbers">{{ prog.numbers.join(' ') }}</span>
          </div>
          <div class="prog-chords">
            <span
              v-for="(chord, i) in prog.chordsInKey"
              :key="i"
              class="prog-chord"
            >
              {{ chord }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Mode -->
    <div class="quiz-section card">
      <h3>Quick Quiz</h3>
      <div v-if="quizActive" class="quiz-active">
        <p class="quiz-question">What chord is the <strong>{{ quizQuestion.num }}</strong> in <strong>{{ selectedKey }} {{ currentMode.name }}</strong>?</p>
        <div class="quiz-options">
          <button
            v-for="opt in quizOptions"
            :key="opt"
            class="quiz-option"
            :class="{ correct: quizAnswered && opt === quizCorrect, wrong: quizAnswered && opt === quizSelected && opt !== quizCorrect }"
            :disabled="quizAnswered"
            @click="answerQuiz(opt)"
          >
            {{ opt }}
          </button>
        </div>
        <p v-if="quizAnswered" class="quiz-feedback">
          {{ quizSelected === quizCorrect ? 'Correct!' : `The answer is ${quizCorrect}` }}
        </p>
        <button v-if="quizAnswered" class="next-quiz-btn" @click="nextQuiz">Next Question</button>
      </div>
      <div v-else class="quiz-start">
        <p>Test your knowledge of the Nashville Number System.</p>
        <button class="start-quiz-btn" @click="startQuiz">Start Quiz</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const MODES = [
  { id: 'major', name: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11], qualities: ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'] },
  { id: 'minor', name: 'Natural Minor', intervals: [0, 2, 3, 5, 7, 8, 10], qualities: ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'] },
]

const COMMON_PROGRESSIONS = [
  { name: 'Pop Standard', numbers: [1, 5, 6, 4] },
  { name: 'Doo-Wop', numbers: [1, 6, 4, 5] },
  { name: 'Jazz Turnaround', numbers: [2, 5, 1] },
  { name: 'Blues Shuffle', numbers: [1, 4, 1, 5] },
  { name: 'Sensitive Female', numbers: [6, 4, 1, 5] },
  { name: 'Axis of Awesome', numbers: [1, 5, 6, 4] },
  { name: 'Canon', numbers: [1, 5, 6, 3, 4, 1, 4, 5] },
  { name: 'Andalusian Cadence', numbers: [1, 7, 6, 5] },
]

const selectedKey = ref('C')
const selectedMode = ref('major')
const selectedDegree = ref(1)
const numberInput = ref('')
const convertedChords = ref<{ num: string; name: string }[]>([])

const currentMode = computed(() => MODES.find((m) => m.id === selectedMode.value) || MODES[0])

const keyIndex = computed(() => ROOT_NOTES.indexOf(selectedKey.value))

const degrees = computed(() => {
  const mode = currentMode.value
  return mode.intervals.map((interval, i) => {
    const rootIdx = (keyIndex.value + interval) % 12
    const rootName = ROOT_NOTES[rootIdx]
    const quality = mode.qualities[i]
    const chordName = quality === 'maj' ? rootName : `${rootName}${quality}`
    return { chord: chordName, quality }
  })
})

function convertProgression() {
  const nums = numberInput.value.trim().split(/\s+/).filter(Boolean)
  convertedChords.value = nums.map((n) => {
    const idx = parseInt(n) - 1
    if (idx >= 0 && idx < degrees.value.length) {
      return { num: n, name: degrees.value[idx].chord }
    }
    return { num: n, name: '?' }
  })
}

const commonProgressions = computed(() => {
  return COMMON_PROGRESSIONS.map((prog) => ({
    ...prog,
    chordsInKey: prog.numbers.map((n) => {
      const idx = n - 1
      return idx >= 0 && idx < degrees.value.length ? degrees.value[idx].chord : '?'
    }),
  }))
})

function loadProgression(prog: typeof commonProgressions.value[number]) {
  numberInput.value = prog.numbers.join(' ')
  convertProgression()
}

// Quiz
const quizActive = ref(false)
const quizQuestion = ref({ num: '' })
const quizOptions = ref<string[]>([])
const quizCorrect = ref('')
const quizSelected = ref('')
const quizAnswered = ref(false)

function startQuiz() {
  nextQuiz()
}

function nextQuiz() {
  quizActive.value = true
  quizAnswered.value = false
  quizSelected.value = ''

  const num = Math.floor(Math.random() * 7) + 1
  quizQuestion.value = { num: `${num}${getOrdinalSuffix(num)}` }
  quizCorrect.value = degrees.value[num - 1].chord

  // Generate 4 options including the correct one
  const opts = new Set<string>()
  opts.add(quizCorrect.value)
  while (opts.size < 4) {
    const randomDeg = Math.floor(Math.random() * 7)
    opts.add(degrees.value[randomDeg].chord)
  }
  quizOptions.value = Array.from(opts).sort(() => Math.random() - 0.5)
}

function answerQuiz(opt: string) {
  quizSelected.value = opt
  quizAnswered.value = true
}

function getOrdinalSuffix(n: number): string {
  if (n === 1) return 'st'
  if (n === 2) return 'nd'
  if (n === 3) return 'rd'
  return 'th'
}
</script>

<style scoped>
.nashville-trainer {
  padding: 0 24px 48px;
  max-width: 800px;
  margin: 0 auto;
}

.trainer-header {
  padding: 24px;
  margin-bottom: 24px;
}

.trainer-header h2 {
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
  gap: 24px;
  flex-wrap: wrap;
}

.control-group {
  flex: 1;
  min-width: 200px;
}

.control-group label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 10px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.note-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.note-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.note-btn:hover {
  border-color: var(--bg-highlight);
  color: var(--bg-highlight);
}

.note-btn.active {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

.mode-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.mode-btn {
  padding: 8px 16px;
  border-radius: var(--radius-xl);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  border-color: var(--bg-highlight);
  color: var(--bg-highlight);
}

.mode-btn.active {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

/* Number Chart */
.number-chart {
  padding: 24px;
  margin-bottom: 16px;
}

.number-chart h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.degree-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 4px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.degree-card:hover {
  border-color: var(--border-color);
}

.degree-card.active {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.degree-num {
  font-size: 12px;
  font-weight: 800;
  color: var(--text-secondary);
}

.degree-chord {
  font-size: 16px;
  font-weight: 800;
}

.degree-quality {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
}

/* Converter */
.converter {
  padding: 24px;
  margin-bottom: 16px;
}

.converter h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.converter-hint {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 14px;
}

.converter-input-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.converter-input {
  flex: 1;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 700;
  font-family: inherit;
}

.converter-input:focus {
  outline: none;
  border-color: var(--bg-highlight);
}

.convert-btn {
  padding: 10px 24px;
  border-radius: var(--radius-xl);
  border: none;
  background: var(--bg-highlight);
  color: white;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.convert-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.chord-strip {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.strip-chord {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 16px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  min-width: 60px;
}

.strip-num {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
}

.strip-name {
  font-size: 18px;
  font-weight: 800;
  color: var(--bg-highlight);
}

/* Progressions */
.progressions {
  padding: 24px;
  margin-bottom: 16px;
}

.progressions h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.progression-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progression-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
}

.progression-item:hover {
  background: var(--bg-secondary);
}

.prog-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.prog-name {
  font-size: 14px;
  font-weight: 700;
}

.prog-numbers {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  font-family: monospace;
}

.prog-chords {
  display: flex;
  gap: 6px;
}

.prog-chord {
  padding: 4px 10px;
  border-radius: 10px;
  background: var(--bg-secondary);
  font-size: 13px;
  font-weight: 700;
}

/* Quiz */
.quiz-section {
  padding: 24px;
}

.quiz-section h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.quiz-start {
  text-align: center;
  padding: 16px 0;
}

.quiz-start p {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.start-quiz-btn {
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

.start-quiz-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.quiz-active {
  text-align: center;
  padding: 8px 0;
}

.quiz-question {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.quiz-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  max-width: 320px;
  margin: 0 auto 16px;
}

.quiz-option {
  padding: 14px;
  border-radius: var(--radius-xl);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.quiz-option:hover:not(:disabled) {
  border-color: var(--bg-highlight);
}

.quiz-option.correct {
  background: var(--bg-success, #22c55e);
  border-color: var(--bg-success, #22c55e);
  color: white;
}

.quiz-option.wrong {
  background: var(--bg-danger, #ef4444);
  border-color: var(--bg-danger, #ef4444);
  color: white;
}

.quiz-feedback {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}

.next-quiz-btn {
  padding: 10px 28px;
  border-radius: var(--radius-xl);
  border: none;
  background: var(--bg-highlight);
  color: white;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.next-quiz-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 600px) {
  .nashville-trainer {
    padding: 0 12px 32px;
  }
  .chart-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .progression-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .prog-chords {
    flex-wrap: wrap;
  }
  .note-btn {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
}
</style>
