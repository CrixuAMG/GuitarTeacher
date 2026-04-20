<template>
  <div class="daily-challenges card">
    <div class="challenges-header">
      <h3 class="challenges-title">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        Daily Challenges
      </h3>
      <div v-if="streak > 0" class="streak-badge">🔥 {{ streak }} day streak</div>
    </div>

    <div class="date-display">{{ formattedDate }}</div>

    <!-- Progress Overview -->
    <div class="progress-overview">
      <div class="progress-text">
        <span>{{ completedCount }} of {{ challenges.length }} completed</span>
        <span class="xp-reward">+{{ totalXP }} XP available</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <!-- Challenges List -->
    <div class="challenges-list">
      <div
        v-for="challenge in challenges"
        :key="challenge.id"
        class="challenge-item"
        :class="{ completed: challenge.completed }"
        @click="openChallenge(challenge)"
      >
        <div class="challenge-checkbox" :class="{ checked: challenge.completed }">
          <svg
            v-if="challenge.completed"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div class="challenge-content">
          <div class="challenge-name">{{ challenge.name }}</div>
          <div class="challenge-description">{{ challenge.description }}</div>
          <div class="challenge-meta">
            <span class="challenge-difficulty" :class="challenge.difficulty">{{
              challenge.difficulty
            }}</span>
            <span class="challenge-xp">+{{ challenge.xp }} XP</span>
          </div>
        </div>

        <div class="challenge-action">
          <button
            v-if="!challenge.completed"
            class="btn btn-sm btn-primary"
            @click.stop="startChallenge(challenge)"
          >
            Start
          </button>
          <span v-else class="completed-check">✓</span>
        </div>
      </div>
    </div>

    <!-- Refresh Notice -->
    <div class="refresh-notice">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      New challenges in {{ timeUntilRefresh }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGamificationStore } from '../stores/gamificationStore'

const router = useRouter()
const gamification = useGamificationStore()

interface Challenge {
  id: string
  name: string
  description: string
  type: 'practice' | 'learn' | 'play' | 'tune'
  difficulty: 'easy' | 'medium' | 'hard'
  xp: number
  target: number
  completed: boolean
  route?: string
}

// Challenge templates
const challengeTemplates: Omit<Challenge, 'completed'>[] = [
  {
    id: 'practice-15',
    name: 'Practice 15 Minutes',
    description: 'Use any practice tool for 15 minutes',
    type: 'practice',
    difficulty: 'easy',
    xp: 50,
    target: 15,
    route: '/practice',
  },
  {
    id: 'practice-30',
    name: 'Deep Practice',
    description: 'Practice for 30 minutes using the timer',
    type: 'practice',
    difficulty: 'medium',
    xp: 100,
    target: 30,
    route: '/practice/timer',
  },
  {
    id: 'learn-chord',
    name: 'Learn a New Chord',
    description: 'Learn one chord from the chord library',
    type: 'learn',
    difficulty: 'easy',
    xp: 75,
    target: 1,
    route: '/chords',
  },
  {
    id: 'complete-lesson',
    name: 'Complete a Lesson',
    description: 'Finish any lesson from the learning path',
    type: 'learn',
    difficulty: 'medium',
    xp: 150,
    target: 1,
    route: '/learn',
  },
  {
    id: 'play-song',
    name: 'Play a Song',
    description: 'Play through any song in your library',
    type: 'play',
    difficulty: 'easy',
    xp: 100,
    target: 1,
    route: '/library',
  },
  {
    id: 'tune-guitar',
    name: 'Tune Your Guitar',
    description: 'Use the tuner to tune your guitar',
    type: 'tune',
    difficulty: 'easy',
    xp: 25,
    target: 1,
    route: '/practice/tuner',
  },
  {
    id: 'ear-training',
    name: 'Ear Training',
    description: 'Complete 5 ear training exercises',
    type: 'practice',
    difficulty: 'medium',
    xp: 75,
    target: 5,
    route: '/practice/ear-training',
  },
  {
    id: 'note-trainer',
    name: 'Note Master',
    description: 'Complete 20 notes in the Note Trainer',
    type: 'practice',
    difficulty: 'medium',
    xp: 100,
    target: 20,
    route: '/practice/notes',
  },
  {
    id: 'strumming',
    name: 'Rhythm Practice',
    description: 'Practice strumming patterns for 10 minutes',
    type: 'practice',
    difficulty: 'easy',
    xp: 50,
    target: 10,
    route: '/practice/strumming',
  },
  {
    id: 'hero-mode',
    name: 'Guitar Hero',
    description: 'Play any song in Hero Mode',
    type: 'play',
    difficulty: 'hard',
    xp: 200,
    target: 1,
    route: '/hero',
  },
  {
    id: 'chord-transitions',
    name: 'Smooth Transitions',
    description: 'Practice 10 chord transitions',
    type: 'practice',
    difficulty: 'medium',
    xp: 75,
    target: 10,
    route: '/practice/chords',
  },
]

interface DailyChallengesState {
  date: string
  challenges: Challenge[]
  streak: number
  lastCompletedDate: string | null
}

// Simple localStorage helper
const STORAGE_KEY = 'guitar-daily-challenges'

function getStoredChallenges(): DailyChallengesState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load challenges:', e)
  }
  return {
    date: '',
    challenges: [],
    streak: 0,
    lastCompletedDate: null,
  }
}

function saveStoredChallenges(state: DailyChallengesState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save challenges:', e)
  }
}

const storedChallenges = ref<DailyChallengesState>(getStoredChallenges())

// Watch for changes and save
watch(
  storedChallenges,
  (newValue) => {
    saveStoredChallenges(newValue)
  },
  { deep: true }
)

const challenges = ref<Challenge[]>([])
const streak = computed(() => storedChallenges.value.streak)

const completedCount = computed(() => challenges.value.filter((c) => c.completed).length)
const totalXP = computed(() => challenges.value.reduce((sum, c) => sum + c.xp, 0))
const progressPercent = computed(() => challenges.value.length > 0 ? (completedCount.value / challenges.value.length) * 100 : 0)

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const timeUntilRefresh = computed(() => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const diff = tomorrow.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours}h ${minutes}m`
})

function generateDailyChallenges(): Challenge[] {
  // Shuffle and pick 3 random challenges
  const shuffled = [...challengeTemplates].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, 3)

  // Ensure at least one easy challenge
  const hasEasy = selected.some((c) => c.difficulty === 'easy')
  if (!hasEasy) {
    const easyChallenge = challengeTemplates.find((c) => c.difficulty === 'easy')
    if (easyChallenge) {
      selected[2] = easyChallenge
    }
  }

  return selected.map((c) => ({ ...c, completed: false }))
}

function loadChallenges() {
  const today = new Date().toDateString()

  if (storedChallenges.value.date !== today) {
    // Check if all challenges were completed yesterday
    const yesterdayChallenges = storedChallenges.value.challenges
    const allCompletedYesterday =
      yesterdayChallenges.length > 0 && yesterdayChallenges.every((c) => c.completed)

    // Generate new challenges
    storedChallenges.value = {
      date: today,
      challenges: generateDailyChallenges(),
      streak: allCompletedYesterday ? storedChallenges.value.streak + 1 : 0,
      lastCompletedDate: allCompletedYesterday
        ? storedChallenges.value.date
        : storedChallenges.value.lastCompletedDate,
    }
  }

  challenges.value = storedChallenges.value.challenges
}

function startChallenge(challenge: Challenge) {
  if (challenge.route) {
    router.push(challenge.route)
  }
}

function openChallenge(challenge: Challenge) {
  if (!challenge.completed && challenge.route) {
    router.push(challenge.route)
  }
}

function completeChallenge(challengeId: string) {
  const challenge = challenges.value.find((c) => c.id === challengeId)
  if (challenge && !challenge.completed) {
    challenge.completed = true
    gamification.addXP(challenge.xp, `Daily Challenge: ${challenge.name}`)

    // Update storage
    storedChallenges.value.challenges = challenges.value

    // Check if all completed
    if (challenges.value.every((c) => c.completed)) {
      storedChallenges.value.lastCompletedDate = new Date().toDateString()
      gamification.addXP(100, 'All Daily Challenges Completed!')
    }
  }
}

// Expose method for other components to mark challenges complete
defineExpose({ completeChallenge })

onMounted(() => {
  loadChallenges()
})
</script>

<style scoped>
.daily-challenges {
  padding: 20px;
}

.challenges-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.challenges-title {
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.streak-badge {
  font-size: 12px;
  font-weight: 600;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
}

.date-display {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

/* Progress Overview */
.progress-overview {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 16px;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 8px;
}

.progress-text .xp-reward {
  color: var(--bg-highlight);
  font-weight: 600;
}

.progress-bar {
  height: 6px;
  background: var(--bg-card);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--bg-highlight), #818cf8);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Challenges List */
.challenges-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.challenge-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition);
}

.challenge-item:hover {
  border-color: var(--bg-highlight);
  transform: translateX(4px);
}

.challenge-item.completed {
  opacity: 0.7;
  background: var(--bg-tertiary);
}

.challenge-item.completed .challenge-name {
  text-decoration: line-through;
}

.challenge-checkbox {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition);
}

.challenge-checkbox.checked {
  background: var(--bg-success);
  border-color: var(--bg-success);
  color: white;
}

.challenge-content {
  flex: 1;
  min-width: 0;
}

.challenge-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.challenge-description {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.challenge-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.challenge-difficulty {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 10px;
}

.challenge-difficulty.easy {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.challenge-difficulty.medium {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.challenge-difficulty.hard {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.challenge-xp {
  font-size: 11px;
  font-weight: 600;
  color: var(--bg-highlight);
}

.challenge-action {
  flex-shrink: 0;
}

.completed-check {
  font-size: 20px;
  color: var(--bg-success);
}

/* Refresh Notice */
.refresh-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-tertiary);
}

@media (max-width: 400px) {
  .challenges-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .challenge-item {
    flex-wrap: wrap;
  }

  .challenge-action {
    width: 100%;
    margin-top: 8px;
  }

  .challenge-action .btn {
    width: 100%;
  }
}
</style>
