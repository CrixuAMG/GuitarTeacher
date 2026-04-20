<template>
  <div class="smart-recommendations card">
    <div class="rec-header">
      <div>
        <h3>Recommended for You</h3>
        <p class="rec-subtitle">Based on your progress and weak areas</p>
      </div>
      <span class="rec-badge">AI</span>
    </div>

    <div v-if="recommendations.length === 0" class="rec-empty">
      Great job! You're making excellent progress. Explore the library for more challenges.
    </div>

    <div v-else class="rec-list">
      <div
        v-for="rec in recommendations.slice(0, 4)"
        :key="rec.id"
        class="rec-item"
        @click="handleClick(rec)"
      >
        <div class="rec-icon">{{ rec.icon }}</div>
        <div class="rec-info">
          <div class="rec-title">{{ rec.title }}</div>
          <div class="rec-reason">{{ rec.reason }}</div>
        </div>
        <div class="rec-action">→</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGamificationStore } from '../stores/gamificationStore.ts'
import { CHAPTERS } from '../data/chapters.js'

const router = useRouter()
const store = useGamificationStore()

const recommendations = computed(() => {
  const recs = []
  const stats = store.stats || {
    chordsLearned: [] as string[],
    strummingTime: 0,
    earTrainingCorrect: 0,
    songsCompleted: [] as string[],
    transitionsPracticed: 0,
    timesTuned: 0,
    practiceHistory: [] as string[],
    practiceStreak: 0,
    lastPracticeDate: null as string | null
  }
  const progress = store.progress || {}

  // 1. Weak mastery categories
  const masteryScores = {
    chords: stats.chordsLearned?.length || 0,
    strumming: stats.strummingTime || 0,
    theory: Object.values(progress).filter(p => p.completed).length,
    earTraining: stats.earTrainingCorrect || 0,
    repertoire: stats.songsCompleted?.length || 0,
    technique: stats.transitionsPracticed || 0
  }

  const weakest = Object.entries(masteryScores).sort((a, b) => a[1] - b[1])[0]
  if (weakest) {
    const weakMap = {
      chords: { title: 'Practice Chords', icon: '🎸', reason: 'Strengthen your chord foundation', route: '/chords' },
      strumming: { title: 'Strumming Drills', icon: '🥁', reason: 'Improve your rhythm skills', route: '/practice/strumming' },
      theory: { title: 'Learn Theory', icon: '📖', reason: 'Build your music knowledge', route: '/learn' },
      earTraining: { title: 'Ear Training', icon: '👂', reason: 'Train your musical ear', route: '/practice/ear-training' },
      repertoire: { title: 'Learn a Song', icon: '🎵', reason: 'Expand your song library', route: '/library' },
      technique: { title: 'Chord Transitions', icon: '⚡', reason: 'Speed up your changes', route: '/practice/chords' }
    }
    recs.push({ id: 'weak-' + weakest[0], ...weakMap[weakest[0]] })
  }

  // 2. Uncompleted lessons from current level
  const availableLessons = []
  CHAPTERS.forEach(ch => {
    ch.lessons.forEach(lesson => {
      if (!store.hasCompletedLesson(ch.id, lesson.id)) {
        availableLessons.push({
          chapterId: ch.id,
          chapterTitle: ch.title,
          lesson
        })
      }
    })
  })

  if (availableLessons.length > 0) {
    const nextLesson = availableLessons[0]
    recs.push({
      id: 'lesson-' + nextLesson.lesson.id,
      title: nextLesson.lesson.title,
      icon: '📚',
      reason: `Next up in ${nextLesson.chapterTitle}`,
      route: `/learn/${nextLesson.chapterId}/${nextLesson.lesson.id}`
    })
  }

  // 3. Low practice streak maintenance
  const today = new Date().toDateString()
  if (stats.lastPracticeDate !== today) {
    recs.push({
      id: 'streak',
      title: 'Keep Your Streak Alive',
      icon: '🔥',
      reason: `${stats.practiceStreak || 0} day streak - practice today!`,
      route: '/practice'
    })
  }

  // 4. Ear training if never done
  if (!stats.earTrainingCorrect || stats.earTrainingCorrect < 5) {
    recs.push({
      id: 'ear-start',
      title: 'Start Ear Training',
      icon: '🎧',
      reason: 'Essential skill for every guitarist',
      route: '/practice/ear-training'
    })
  }

  // 5. Tuner if not tuned recently
  if (!stats.timesTuned || stats.timesTuned < 3) {
    recs.push({
      id: 'tuner',
      title: 'Tune Your Guitar',
      icon: '🎯',
      reason: 'Always play in tune',
      route: '/practice/tuner'
    })
  }

  // Shuffle slightly but keep priority order
  return recs.slice(0, 5)
})

function handleClick(rec) {
  if (rec.route) {
    router.push(rec.route)
  }
}
</script>

<style scoped>
.smart-recommendations {
  padding: 24px;
  margin-bottom: 24px;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.rec-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.rec-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
}

.rec-badge {
  background: linear-gradient(135deg, var(--bg-highlight), #8b5cf6);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
}

.rec-empty {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
}

.rec-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rec-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: var(--bg-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.rec-item:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
  transform: translateX(4px);
}

.rec-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 10px;
  flex-shrink: 0;
}

.rec-info {
  flex: 1;
  min-width: 0;
}

.rec-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}

.rec-reason {
  font-size: 12px;
  color: var(--text-secondary);
}

.rec-action {
  font-size: 18px;
  color: var(--bg-highlight);
  font-weight: 700;
}
</style>
