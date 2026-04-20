<template>
  <div class="exercise-library">
    <!-- Category Filter -->
    <div class="category-filter">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="filter-btn"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        <span class="filter-icon">{{ cat.icon }}</span>
        <span class="filter-name">{{ cat.name }}</span>
      </button>
    </div>

    <!-- Difficulty Filter -->
    <div class="difficulty-filter">
      <span class="filter-label">Difficulty:</span>
      <button
        v-for="diff in difficulties"
        :key="diff"
        class="difficulty-btn"
        :class="{ active: activeDifficulty === diff }"
        @click="activeDifficulty = diff"
      >
        {{ diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1) }}
      </button>
    </div>

    <!-- Exercise Grid -->
    <div class="exercises-grid">
      <div
        v-for="exercise in filteredExercises"
        :key="exercise.id"
        class="exercise-card card"
        :class="{ completed: isCompleted(exercise.id) }"
        @click="selectExercise(exercise)"
      >
        <div class="exercise-header">
          <span class="exercise-icon">{{ exercise.icon }}</span>
          <div class="exercise-meta">
            <span class="difficulty-badge" :class="exercise.difficulty">
              {{ exercise.difficulty }}
            </span>
            <span class="duration-badge">{{ exercise.duration }} min</span>
          </div>
        </div>

        <h3 class="exercise-name">{{ exercise.name }}</h3>
        <p class="exercise-description">{{ exercise.description }}</p>

        <div class="exercise-stats">
          <div class="stat">
            <span class="stat-label">Target:</span>
            <span class="stat-value">{{ exercise.target }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">XP:</span>
            <span class="stat-value">+{{ exercise.xp }}</span>
          </div>
        </div>

        <div v-if="getProgress(exercise.id) > 0" class="exercise-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: getProgress(exercise.id) + '%' }"></div>
          </div>
          <span class="progress-text">{{ Math.round(getProgress(exercise.id)) }}%</span>
        </div>

        <div class="exercise-footer">
          <span v-if="isCompleted(exercise.id)" class="completed-badge">&#10003; Completed</span>
          <span v-else class="start-hint">Click to start &rarr;</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredExercises.length === 0" class="empty-state card">
      <div class="empty-icon">&#128269;</div>
      <h3>No exercises found</h3>
      <p>Try adjusting your filters</p>
    </div>

    <!-- Exercise Modal -->
    <div
      v-if="selectedExercise"
      class="exercise-modal-overlay"
      @click.self="selectedExercise = null"
    >
      <div class="exercise-modal card">
        <button class="modal-close" @click="selectedExercise = null">&times;</button>

        <div class="modal-header">
          <div class="modal-icon">{{ selectedExercise.icon }}</div>
          <h2>{{ selectedExercise.name }}</h2>
          <div class="modal-meta">
            <span class="difficulty-badge" :class="selectedExercise.difficulty">
              {{ selectedExercise.difficulty }}
            </span>
            <span class="duration-badge">{{ selectedExercise.duration }} min</span>
          </div>
        </div>

        <div class="modal-description">
          <p>{{ selectedExercise.description }}</p>
        </div>

        <div class="modal-instructions">
          <h4>Instructions:</h4>
          <ol>
            <li v-for="(step, i) in selectedExercise.steps" :key="i">{{ step }}</li>
          </ol>
        </div>

        <div v-if="selectedExercise.tips" class="modal-tips">
          <h4>Tips:</h4>
          <ul>
            <li v-for="(tip, i) in selectedExercise.tips" :key="i">{{ tip }}</li>
          </ul>
        </div>

        <div class="modal-actions">
          <button
            v-if="!isCompleted(selectedExercise.id)"
            class="btn btn-primary btn-lg"
            @click="startExercise(selectedExercise)"
          >
            Start Exercise (+{{ selectedExercise.xp }} XP)
          </button>
          <span v-else class="completed-message">&#10003; Exercise Completed!</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGamificationStore } from '../stores/gamificationStore'

interface Exercise {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  xp: number
  target: string
  icon: string
  steps: string[]
  tips?: string[]
}

const props = withDefaults(defineProps<{
  initialCategory?: string
}>(), {
  initialCategory: 'all',
})

const emit = defineEmits<{
  complete: [exercise: Exercise]
}>()

const categories = [
  { id: 'all', name: 'All Exercises', icon: '📚' },
  { id: 'finger-independence', name: 'Finger Independence', icon: '🖐️' },
  { id: 'speed', name: 'Speed & Dexterity', icon: '⚡' },
  { id: 'chords', name: 'Chord Mastery', icon: '🎸' },
  { id: 'scales', name: 'Scales & Theory', icon: '🎼' },
  { id: 'technique', name: 'Technique', icon: '✨' },
  { id: 'warmup', name: 'Warm-ups', icon: '🔥' },
]

const difficulties = ['all', 'beginner', 'intermediate', 'advanced']

const exercises: Exercise[] = [
  {
    id: 'spider-crawl',
    name: 'Spider Crawl',
    description: 'Improve finger coordination with this classic exercise',
    category: 'finger-independence',
    difficulty: 'beginner',
    duration: 5,
    xp: 50,
    target: 'Clean notes, no buzzing',
    icon: '🕷️',
    steps: [
      'Place fingers 1-4 on frets 1-4 of the low E string',
      'Play each note individually, keeping other fingers down',
      'Move to the A string and repeat',
      'Continue across all strings',
      'Reverse the pattern (4-3-2-1)',
    ],
    tips: ['Start very slowly', 'Focus on clarity over speed', 'Keep fingers close to frets'],
  },
  {
    id: 'finger-gym',
    name: 'Finger Gym',
    description: 'Strengthen fingers with targeted exercises',
    category: 'finger-independence',
    difficulty: 'intermediate',
    duration: 10,
    xp: 75,
    target: 'Smooth transitions',
    icon: '💪',
    steps: [
      'Play 1-2-3-4 pattern on each string',
      'Try 1-3-2-4 pattern (harder!)',
      'Practice 4-3-2-1 descending',
      'Mix patterns: 1-3-4-2, 2-4-1-3, etc.',
    ],
    tips: ['Use a metronome', 'Increase speed gradually', 'Focus on even timing'],
  },
  {
    id: 'speed-bursts',
    name: 'Speed Bursts',
    description: 'Build speed with short intense bursts',
    category: 'speed',
    difficulty: 'intermediate',
    duration: 8,
    xp: 75,
    target: 'Clean bursts at target speed',
    icon: '⚡',
    steps: [
      'Set metronome to comfortable speed',
      'Play 4 notes at that speed',
      'Increase by 10 BPM and play 4 notes',
      'Continue until you reach max clean speed',
      'Back down and play 8 notes at that speed',
    ],
    tips: ['Only increase when clean', 'Rest between bursts', 'Track your max speed'],
  },
  {
    id: 'alternate-picking',
    name: 'Alternate Picking Drill',
    description: 'Master the foundation of speed picking',
    category: 'speed',
    difficulty: 'beginner',
    duration: 10,
    xp: 60,
    target: 'Consistent down-up motion',
    icon: '🎸',
    steps: [
      'Play single notes on one string',
      'Focus on strict down-up alternation',
      'Keep pick angle consistent',
      'Gradually increase metronome speed',
      'Move to adjacent strings',
    ],
    tips: ['Minimize pick movement', 'Keep wrist relaxed', 'Use a metronome'],
  },
  {
    id: 'chord-switches',
    name: 'Chord Switch Challenge',
    description: 'Rapid chord transitions for fluency',
    category: 'chords',
    difficulty: 'beginner',
    duration: 5,
    xp: 40,
    target: '60 switches per minute',
    icon: '🔗',
    steps: [
      'Choose two chords to practice',
      'Set timer for 1 minute',
      'Switch between chords as fast as possible',
      'Count how many clean switches you make',
      'Try to beat your record',
    ],
    tips: ['Start with easy chord pairs', 'Focus on clean switches', 'Build muscle memory'],
  },
  {
    id: 'barre-chord-builder',
    name: 'Barre Chord Builder',
    description: 'Strengthen your barre chord technique',
    category: 'chords',
    difficulty: 'advanced',
    duration: 15,
    xp: 100,
    target: 'Clean barre across all frets',
    icon: '🎯',
    steps: [
      'Play F barre chord at fret 1',
      'Move up fret by fret to fret 5',
      'Focus on clean sound at each fret',
      'Practice minor barre chords',
      'Mix major and minor positions',
    ],
    tips: [
      'Roll finger slightly',
      'Use thumb position for leverage',
      'Check each string individually',
    ],
  },
  {
    id: 'major-scale-mastery',
    name: 'Major Scale Mastery',
    description: 'Learn the major scale in all positions',
    category: 'scales',
    difficulty: 'intermediate',
    duration: 12,
    xp: 80,
    target: '5 positions memorized',
    icon: '🎼',
    steps: [
      'Learn C major scale in open position',
      'Practice position 1 (fret 3-6)',
      'Practice position 2 (fret 5-8)',
      'Connect positions smoothly',
      'Practice in different keys',
    ],
    tips: ['Say note names out loud', 'Practice with metronome', 'Visualize the pattern'],
  },
  {
    id: 'pentatonic-power',
    name: 'Pentatonic Power',
    description: 'Master the essential soloing scale',
    category: 'scales',
    difficulty: 'beginner',
    duration: 10,
    xp: 70,
    target: 'All 5 positions',
    icon: '🎹',
    steps: [
      'Learn A minor pentatonic position 1',
      'Practice position 2',
      'Practice position 3',
      'Connect positions 1-2-3',
      'Try simple improvisation',
    ],
    tips: ['Start with position 1', 'Use backing tracks', 'Experiment with bends'],
  },
  {
    id: 'hammer-pull-workout',
    name: 'Hammer-On & Pull-Off',
    description: 'Master legato technique',
    category: 'technique',
    difficulty: 'intermediate',
    duration: 8,
    xp: 65,
    target: 'Even volume and tone',
    icon: '🔨',
    steps: [
      'Practice hammer-ons on one string',
      'Practice pull-offs on one string',
      'Combine: hammer-on then pull-off',
      'Try 3-note patterns',
      'Apply to scale runs',
    ],
    tips: ['Hammer with fingertip', 'Pull slightly downward', 'Keep fingers close to strings'],
  },
  {
    id: 'vibrato-workshop',
    name: 'Vibrato Workshop',
    description: 'Add expression to your playing',
    category: 'technique',
    difficulty: 'intermediate',
    duration: 10,
    xp: 70,
    target: 'Consistent, musical vibrato',
    icon: '〰️',
    steps: [
      'Practice wrist vibrato motion',
      'Apply to sustained notes',
      'Vary speed and width',
      'Practice on different fingers',
      'Use in context of a phrase',
    ],
    tips: [
      'Start slow and controlled',
      'Listen to violin vibrato',
      'Match vibrato to musical style',
    ],
  },
  {
    id: 'quick-warmup',
    name: '5-Minute Warm-up',
    description: 'Get your fingers ready to play',
    category: 'warmup',
    difficulty: 'beginner',
    duration: 5,
    xp: 30,
    target: 'Loose, warmed-up fingers',
    icon: '🔥',
    steps: [
      'Gentle finger stretches',
      'Slow chromatic scale (1-2-3-4)',
      'Simple open chord strumming',
      'Single string alternate picking',
      'Gradually increase speed',
    ],
    tips: ['Never stretch to pain', 'Start very slowly', 'Focus on relaxation'],
  },
  {
    id: 'stretching-routine',
    name: 'Hand Stretching Routine',
    description: 'Prevent injury with proper stretching',
    category: 'warmup',
    difficulty: 'beginner',
    duration: 5,
    xp: 25,
    target: 'Flexible, injury-free hands',
    icon: '🧘',
    steps: [
      'Gentle wrist circles',
      'Finger extension stretches',
      'Thumb stretches',
      'Forearm stretches',
      'Shake out and relax',
    ],
    tips: [
      'Stretch gently, never force',
      'Hold stretches for 10-15 seconds',
      'Do before AND after playing',
    ],
  },
]

const gamification = useGamificationStore()

const activeCategory = ref(props.initialCategory)
const activeDifficulty = ref('all')
const selectedExercise = ref<Exercise | null>(null)

const exerciseProgress = ref<Record<string, number>>({})
const completedExercises = ref<string[]>([])

onMounted(() => {
  try {
    const savedProgress = localStorage.getItem('guitar-exercise-progress')
    if (savedProgress) {
      exerciseProgress.value = JSON.parse(savedProgress)
    }
    const savedCompleted = localStorage.getItem('guitar-completed-exercises')
    if (savedCompleted) {
      completedExercises.value = JSON.parse(savedCompleted)
    }
  } catch {
    // Ignore parse errors
  }
})

function saveProgress() {
  localStorage.setItem('guitar-exercise-progress', JSON.stringify(exerciseProgress.value))
}

function saveCompleted() {
  localStorage.setItem('guitar-completed-exercises', JSON.stringify(completedExercises.value))
}

const filteredExercises = computed(() => {
  return exercises.filter((ex) => {
    const categoryMatch = activeCategory.value === 'all' || ex.category === activeCategory.value
    const difficultyMatch =
      activeDifficulty.value === 'all' || ex.difficulty === activeDifficulty.value
    return categoryMatch && difficultyMatch
  })
})

function isCompleted(exerciseId: string): boolean {
  return completedExercises.value.includes(exerciseId)
}

function getProgress(exerciseId: string): number {
  return exerciseProgress.value[exerciseId] || 0
}

function selectExercise(exercise: Exercise) {
  selectedExercise.value = exercise
}

function startExercise(exercise: Exercise) {
  exerciseProgress.value[exercise.id] = 100
  completedExercises.value.push(exercise.id)
  saveProgress()
  saveCompleted()
  gamification.addXP(exercise.xp, `Completed exercise: ${exercise.name}`)
  emit('complete', exercise)
  selectedExercise.value = null
}
</script>

<style scoped>
.exercise-library {
  max-width: 1000px;
}

/* Category Filter */
.category-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
}

.filter-btn:hover {
  border-color: var(--bg-highlight);
}

.filter-btn.active {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.filter-icon {
  font-size: 16px;
}

.filter-name {
  font-size: 13px;
  font-weight: 600;
}

/* Difficulty Filter */
.difficulty-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.filter-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 600;
}

.difficulty-btn {
  padding: 6px 12px;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all var(--transition);
}

.difficulty-btn:hover {
  background: var(--bg-card-hover);
}

.difficulty-btn.active {
  background: var(--bg-highlight);
  color: #fff;
}

/* Exercise Grid */
.exercises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.exercise-card {
  padding: 20px;
  cursor: pointer;
  transition: all var(--transition);
  border: 2px solid var(--border-color);
}

.exercise-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--bg-highlight);
}

.exercise-card.completed {
  border-color: var(--bg-success);
  background: rgba(34, 197, 94, 0.05);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.exercise-icon {
  font-size: 32px;
}

.exercise-meta {
  display: flex;
  gap: 8px;
}

.difficulty-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 10px;
}

.difficulty-badge.beginner {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.difficulty-badge.intermediate {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.difficulty-badge.advanced {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.duration-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  background: var(--bg-tertiary);
  border-radius: 10px;
  color: var(--text-secondary);
}

.exercise-name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}

.exercise-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
}

.exercise-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat {
  font-size: 12px;
}

.stat-label {
  color: var(--text-tertiary);
}

.stat-value {
  color: var(--bg-highlight);
  font-weight: 700;
  margin-left: 4px;
}

.exercise-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--bg-success);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--bg-success);
}

.exercise-footer {
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.completed-badge {
  font-size: 12px;
  font-weight: 700;
  color: var(--bg-success);
}

.start-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-secondary);
}

/* Exercise Modal */
.exercise-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.exercise-modal {
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: none;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all var(--transition);
}

.modal-close:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
}

.modal-meta {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.modal-description {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 20px;
  margin-bottom: 24px;
}

.modal-description p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.modal-instructions,
.modal-tips {
  margin-bottom: 24px;
}

.modal-instructions h4,
.modal-tips h4 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.modal-instructions ol,
.modal-tips ul {
  margin: 0;
  padding-left: 24px;
}

.modal-instructions li,
.modal-tips li {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.5;
}

.modal-actions {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.completed-message {
  font-size: 18px;
  font-weight: 700;
  color: var(--bg-success);
}

@media (max-width: 600px) {
  .exercises-grid {
    grid-template-columns: 1fr;
  }

  .category-filter {
    flex-wrap: nowrap;
  }

  .difficulty-filter {
    flex-wrap: wrap;
  }
}
</style>