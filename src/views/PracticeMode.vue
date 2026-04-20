<template>
  <div class="practice-view">
    <PageHeader :subtitle="$t('practiceMode.subtitle')">{{ $t('practiceMode.title') }}</PageHeader>

    <div class="practice-grid">
      <div class="practice-section">
        <Metronome :initial-bpm="defaultBpm" @bpm-change="onBpmChange" @beat="onMetronomeBeat" />
      </div>

      <div class="practice-section">
        <GuitarTuner />
      </div>

      <div class="practice-section">
        <StrummingPattern :bpm="currentBpm" />
      </div>

      <div class="practice-section wide">
        <EarTraining ref="earTrainingRef" />
      </div>

      <div class="practice-section wide">
        <ChordTransitionTrainer ref="trainerRef" />
      </div>
    </div>

    <div v-if="dailyChallenge" class="daily-challenge card">
      <div class="challenge-header">
        <span class="challenge-badge">{{ $t('practiceMode.dailyChallenge') }}</span>
        <span class="challenge-streak">{{ $t('practiceMode.dayStreak', { count: practiceStreak }) }}</span>
      </div>
      <h3>{{ dailyChallenge.title }}</h3>
      <p>{{ dailyChallenge.description }}</p>
      <div class="challenge-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: dailyProgress + '%' }"></div>
        </div>
        <span class="progress-text">{{ $t('practiceMode.challengeProgress', { percent: dailyProgress }) }}</span>
      </div>
      <button class="btn btn-primary" @click="startDailyChallenge">
        {{ dailyProgress > 0 ? $t('practiceMode.continue') : $t('practiceMode.startChallenge') }}
      </button>
    </div>

    <div class="practice-stats card">
      <h3>{{ $t('practiceMode.yourPracticeStats') }}</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value">{{ totalPracticeTime }}</div>
          <div class="stat-label">{{ $t('practiceMode.minutesPracticed') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-value">{{ chordsLearned }}</div>
          <div class="stat-label">{{ $t('practiceMode.chordsLearned') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔄</div>
          <div class="stat-value">{{ transitionsPracticed }}</div>
          <div class="stat-label">{{ $t('practiceMode.transitions') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎧</div>
          <div class="stat-value">{{ earTrainingScore }}</div>
          <div class="stat-label">{{ $t('practiceMode.earTrainingScore') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎸</div>
          <div class="stat-value">{{ tuneCount }}</div>
          <div class="stat-label">{{ $t('practiceMode.timesTuned') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Metronome from '../components/Metronome.vue'
import GuitarTuner from '../components/GuitarTuner.vue'
import StrummingPattern from '../components/StrummingPattern.vue'
import EarTraining from '../components/EarTraining.vue'
import ChordTransitionTrainer from '../components/ChordTransitionTrainer.vue'
import { useStore } from '../stores/useStore'
import PageHeader from '../components/PageHeader.vue'

const { t } = useI18n()
const { progress } = useStore()

const defaultBpm = ref(100)
const currentBpm = ref(100)
const earTrainingRef = ref(null)
const trainerRef = ref(null)

const practiceStreak = computed(() => {
  return progress.value.practiceStreak || 0
})

const totalPracticeTime = computed(() => {
  return Math.round((progress.value.totalPracticeTime || 0) / 60)
})

const chordsLearned = computed(() => {
  return Object.keys(progress.value.chords || {}).length
})

const transitionsPracticed = computed(() => {
  return progress.value.transitionsPracticed || 0
})

const earTrainingScore = computed(() => {
  return progress.value.earTrainingScore || 0
})

const tuneCount = computed(() => {
  return progress.value.tuneCount || 0
})

const dailyChallenge = computed(() => {
  const challenges = [
    { id: 'transition', title: t('practiceMode.challengeTransitionTitle'), description: t('practiceMode.challengeTransitionDesc') },
    { id: 'ear', title: t('practiceMode.challengeEarTitle'), description: t('practiceMode.challengeEarDesc') },
    { id: 'metronome', title: t('practiceMode.challengeMetronomeTitle'), description: t('practiceMode.challengeMetronomeDesc') },
    { id: 'strumming', title: t('practiceMode.challengeStrummingTitle'), description: t('practiceMode.challengeStrummingDesc') },
  ]
  return challenges[new Date().getDay() % challenges.length]
})

const dailyProgress = ref(0)

let practiceTimer = null
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let sessionStartTime = null

function onBpmChange(bpm) {
  currentBpm.value = bpm
}

function onMetronomeBeat(_beat: number) {
  // Could sync other components to metronome beat
}

function startDailyChallenge() {
  if (dailyChallenge.value.id === 'transition') {
    if (trainerRef.value) {
      trainerRef.value.startSession()
    }
  } else if (dailyChallenge.value.id === 'ear') {
    if (earTrainingRef.value) {
      earTrainingRef.value.startGame()
    }
  }
}

onMounted(() => {
  sessionStartTime = Date.now()
  practiceTimer = setInterval(() => {
    if (!progress.value.totalPracticeTime) {
      progress.value.totalPracticeTime = 0
    }
    progress.value.totalPracticeTime += 1
  }, 1000)
})

onUnmounted(() => {
  if (practiceTimer) {
    clearInterval(practiceTimer)
  }
})
</script>

<style scoped>
.practice-view {
  padding: 0 24px 48px;
}
.practice-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.practice-section {
  min-width: 0;
}
.practice-section.wide {
  grid-column: span 3;
}
.daily-challenge {
  padding: 24px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, var(--bg-highlight-light), var(--bg-card));
  border: 2px solid var(--bg-highlight);
}
.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.challenge-badge {
  background: var(--bg-highlight);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.challenge-streak {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
}
.daily-challenge h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}
.daily-challenge p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}
.challenge-progress {
  margin-bottom: 16px;
}
.progress-bar {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}
.progress-fill {
  height: 100%;
  background: var(--bg-success);
  border-radius: 4px;
  transition: width 0.3s ease;
}
.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}
.practice-stats {
  padding: 24px;
}
.practice-stats h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.stat-card {
  text-align: center;
  padding: 20px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}
.stat-icon {
  font-size: 28px;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--bg-highlight);
  margin-bottom: 4px;
}
.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}
@media (max-width: 900px) {
  .practice-grid {
    grid-template-columns: 1fr;
  }
  .practice-section.wide {
    grid-column: span 1;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>