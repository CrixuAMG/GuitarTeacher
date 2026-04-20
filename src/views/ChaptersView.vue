<template>
  <div class="chapters-view">
    <PageHeader subtitle="Follow our structured curriculum from beginner to advanced. Complete lessons to earn XP and unlock new chapters!">Learning Path</PageHeader>

    <div v-if="activeGoal" class="session-filter-banner card">
      <span>📍 Focused on: {{ getGoalName(activeGoal) }}</span>
      <button @click="showAllContent = true">Show All Chapters</button>
    </div>

    <div v-if="totalLessons > 0" class="progress-summary card">
      <div class="summary-stats">
        <div class="stat">
          <div class="stat-value">{{ completedLessons }}</div>
          <div class="stat-label">Lessons Completed</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ Math.round((completedLessons / totalLessons) * 100) }}%</div>
          <div class="stat-label">Course Progress</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ totalXpEarned }}</div>
          <div class="stat-label">XP Earned</div>
        </div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: (completedLessons / totalLessons) * 100 + '%' }"></div>
      </div>
    </div>

    <div class="chapters-list">
      <div 
        v-for="chapter in filteredChapters" 
        :key="chapter.id"
        class="chapter-card"
        :class="{ 
          locked: !isChapterUnlocked(chapter),
          completed: isChapterCompleted(chapter),
          current: isCurrentChapter(chapter)
        }"
        :style="{ '--chapter-color': chapter.color }"
      >
        <div class="chapter-header">
          <div class="chapter-number" :style="{ background: chapter.color }">
            {{ chapter.number }}
          </div>
          <div class="chapter-info">
            <h3 class="chapter-title">{{ chapter.title }}</h3>
            <p class="chapter-subtitle">{{ chapter.subtitle }}</p>
          </div>
          <div class="chapter-status">
            <span v-if="!isChapterUnlocked(chapter)" class="status-locked">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Level {{ chapter.requiredLevel }} Required
            </span>
            <span v-else-if="isChapterCompleted(chapter)" class="status-completed">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Completed
            </span>
            <span v-else class="status-progress">
              {{ getChapterProgress(chapter) }} / {{ chapter.lessons.length }} Lessons
            </span>
          </div>
        </div>

        <p class="chapter-description">{{ chapter.description }}</p>

        <div class="lessons-preview">
          <div 
            v-for="lesson in chapter.lessons.slice(0, 4)" 
            :key="lesson.id"
            class="lesson-dot"
            :class="{ completed: isLessonCompleted(chapter.id, lesson.id) }"
            :title="lesson.title"
          ></div>
          <span v-if="chapter.lessons.length > 4" class="more-lessons">
            +{{ chapter.lessons.length - 4 }} more
          </span>
        </div>

        <div class="chapter-actions">
          <router-link 
            v-if="isChapterUnlocked(chapter)"
            :to="{ name: 'chapter', params: { chapterId: chapter.id } }"
            class="btn btn-primary"
          >
            {{ isChapterCompleted(chapter) ? 'Review Chapter' : 'Continue Learning' }}
          </router-link>
          <button v-else class="btn btn-secondary" disabled>
            Locked
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { CHAPTERS } from '../data/chapters.js'
import { useGamificationStore } from '../stores/gamificationStore.ts'
import { useActiveSession } from '../composables/useActiveSession.ts'

const gamification = useGamificationStore()
const { activeGoal, matchesGoal } = useActiveSession()

const showAllContent = ref(false)

const goalMeta: Record<string, string> = {
  learn_chords: 'Learn Chords',
  strumming: 'Strumming',
  fingerstyle: 'Fingerstyle',
  songs: 'Songs',
  theory: 'Theory',
  lead: 'Lead Guitar',
  ear_training: 'Ear Training',
  songwriting: 'Songwriting',
  perform: 'Performance',
  just_fun: 'Just Fun',
}

function getGoalName(goalId: string | null): string {
  return goalId ? goalMeta[goalId] || goalId : ''
}

const filteredChapters = computed(() => {
  if (showAllContent.value || !activeGoal.value) return CHAPTERS
  return CHAPTERS.filter(ch => {
    const lessonTags = ch.lessons.flatMap(l => l.goalTags || [])
    return matchesGoal(lessonTags, activeGoal.value)
  })
})

const progress = computed(() => gamification.progress?.value || {})

const completedLessons = computed(() => {
  return Object.values(progress).filter(p => p && p.completed).length
})

const totalLessons = computed(() => {
  return CHAPTERS.reduce((total, ch) => total + ch.lessons.length, 0)
})

const totalXpEarned = computed(() => {
  return Object.values(progress).reduce((total, p) => total + ((p && p.xpEarned) || 0), 0)
})

function isChapterUnlocked(chapter) {
  return gamification.level >= chapter.requiredLevel
}

function isChapterCompleted(chapter) {
  return chapter.lessons.every(l => isLessonCompleted(chapter.id, l.id))
}

function isCurrentChapter(chapter) {
  if (!isChapterUnlocked(chapter)) return false
  if (isChapterCompleted(chapter)) return false
  const prevChapter = CHAPTERS.find(ch => ch.number === chapter.number - 1)
  if (!prevChapter) return true
  return isChapterCompleted(prevChapter)
}

function isLessonCompleted(chapterId, lessonId) {
  return progress[`${chapterId}-${lessonId}`]?.completed || false
}

function getChapterProgress(chapter) {
  return chapter.lessons.filter(l => isLessonCompleted(chapter.id, l.id)).length
}
</script>

<style scoped>
.chapters-view {
  padding: 0 24px 48px;
}

.session-filter-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--accent-color);
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.session-filter-banner button {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.session-filter-banner button:hover {
  background: rgba(255,255,255,0.3);
}

.progress-summary {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 32px;
}

.summary-stats {
  display: flex;
  gap: 48px;
  margin-bottom: 20px;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  color: var(--bg-highlight);
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.progress-bar-container {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--bg-highlight), #818cf8);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.chapters-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chapter-card {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  transition: all var(--transition);
}

.chapter-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.chapter-card.locked {
  opacity: 0.6;
  background: var(--bg-tertiary);
}

.chapter-card.current {
  border-color: var(--chapter-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--chapter-color) 20%, transparent);
}

.chapter-card.completed {
  border-color: var(--bg-success);
}

.chapter-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.chapter-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 800;
  flex-shrink: 0;
}

.chapter-info {
  flex: 1;
}

.chapter-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 2px;
}

.chapter-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.chapter-status {
  font-size: 13px;
  font-weight: 600;
}

.status-locked {
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-completed {
  color: var(--bg-success);
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-progress {
  color: var(--bg-highlight);
}

.chapter-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}

.lessons-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.lesson-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
}

.lesson-dot.completed {
  background: var(--bg-success);
  border-color: var(--bg-success);
}

.more-lessons {
  font-size: 12px;
  color: var(--text-tertiary);
}

.chapter-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 600px) {
  .summary-stats {
    gap: 24px;
  }
  
  .stat-value {
    font-size: 28px;
  }
  
  .chapter-header {
    flex-wrap: wrap;
  }
  
  .chapter-status {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
