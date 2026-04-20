<template>
  <div class="chapter-view">
    <div v-if="chapter" class="chapter-content">
      <!-- Header -->
      <div class="chapter-header-section" :style="{ '--chapter-color': chapter.color }">
        <BackLink to="/learn" label="Back to Chapters" />
        
        <div class="chapter-title-block">
          <div class="chapter-badge" :style="{ background: chapter.color }">
            Chapter {{ chapter.number }}
          </div>
          <h1>{{ chapter.title }}</h1>
          <p class="subtitle">{{ chapter.subtitle }}</p>
        </div>

        <div class="chapter-progress-bar">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: chapterProgressPercent + '%', background: chapter.color }"></div>
          </div>
          <span class="progress-text">{{ completedLessons }} / {{ chapter.lessons.length }} Lessons Complete</span>
        </div>
      </div>

      <!-- Lessons List -->
      <div class="lessons-container">
        <div 
          v-for="lesson in chapter.lessons" 
          :key="lesson.id"
          class="lesson-item"
          :class="{ 
            completed: isLessonCompleted(lesson.id),
            current: isCurrentLesson(lesson.id),
            locked: isLessonLocked(lesson.id)
          }"
          :style="{ '--chapter-color': chapter.color }"
        >
          <div class="lesson-number">{{ lesson.number }}</div>
          
          <div class="lesson-content">
            <div class="lesson-header">
              <h3 class="lesson-title">{{ lesson.title }}</h3>
              <div class="lesson-meta">
                <span class="lesson-type" :class="lesson.type">
                  {{ typeLabel(lesson.type) }}
                </span>
                <span class="lesson-duration">{{ lesson.duration }}</span>
                <span class="lesson-xp">+{{ lesson.xpReward }} XP</span>
              </div>
            </div>
            
            <p class="lesson-preview">{{ getPreview(lesson.content) }}</p>
          </div>

          <div class="lesson-status">
            <div v-if="isLessonCompleted(lesson.id)" class="status-icon completed">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div v-else-if="isLessonLocked(lesson.id)" class="status-icon locked">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div v-else class="status-icon current">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
          </div>

          <router-link 
            v-if="!isLessonLocked(lesson.id)"
            :to="{ name: 'lesson', params: { chapterId: chapter.id, lessonId: lesson.id } }"
            class="lesson-link"
          ></router-link>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <h2>Chapter Not Found</h2>
      <router-link to="/learn" class="btn btn-primary">Back to Learning</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getChapterById } from '../data/chapters.js'
import { useGamificationStore } from '../stores/gamificationStore.ts'
import BackLink from '../components/BackLink.vue'

const route = useRoute()
const gamification = useGamificationStore()

const chapter = computed(() => getChapterById(route.params.chapterId))

const completedLessons = computed(() => {
  if (!chapter.value) return 0
  return chapter.value.lessons.filter(l => isLessonCompleted(l.id)).length
})

const chapterProgressPercent = computed(() => {
  if (!chapter.value) return 0
  return (completedLessons.value / chapter.value.lessons.length) * 100
})

function isLessonCompleted(lessonId) {
  return gamification.hasCompletedLesson(chapter.value.id, lessonId)
}

function isCurrentLesson(lessonId) {
  // First uncompleted lesson is current
  const lessonIndex = chapter.value.lessons.findIndex(l => l.id === lessonId)
  const prevLessons = chapter.value.lessons.slice(0, lessonIndex)
  return prevLessons.every(l => isLessonCompleted(l.id)) && !isLessonCompleted(lessonId)
}

function isLessonLocked(lessonId) {
  // A lesson is locked if the previous one isn't completed
  const lessonIndex = chapter.value.lessons.findIndex(l => l.id === lessonId)
  if (lessonIndex === 0) return false
  const prevLesson = chapter.value.lessons[lessonIndex - 1]
  return !isLessonCompleted(prevLesson.id)
}

function typeLabel(type) {
  const labels = {
    text: 'Reading',
    chord: 'Chord Lesson',
    song: 'Song Practice'
  }
  return labels[type] || type
}

function getPreview(content) {
  // Get first sentence or first 100 characters
  const text = content.replace(/\*\*|\*/g, '').replace(/```[\s\S]*?```/g, '')
  const firstSentence = text.split('.')[0]
  if (firstSentence.length > 120) {
    return firstSentence.substring(0, 120) + '...'
  }
  return firstSentence + '.'
}
</script>

<style scoped>
.chapter-view {
  padding: 0 24px 48px;
}

.chapter-header-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.chapter-title-block {
  margin-bottom: 20px;
}

.chapter-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  color: white;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.chapter-title-block h1 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 18px;
  color: var(--text-secondary);
}

.chapter-progress-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-track {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
}

.lessons-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  position: relative;
  transition: all var(--transition);
}

.lesson-item:hover:not(.locked) {
  transform: translateX(4px);
  border-color: var(--chapter-color);
}

.lesson-item.completed {
  border-color: var(--bg-success);
  background: rgba(16, 185, 129, 0.05);
}

.lesson-item.current {
  border-color: var(--chapter-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--chapter-color) 15%, transparent);
}

.lesson-item.locked {
  opacity: 0.6;
  background: var(--bg-tertiary);
}

.lesson-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.lesson-item.completed .lesson-number {
  background: var(--bg-success);
  color: white;
}

.lesson-item.current .lesson-number {
  background: var(--chapter-color);
  color: white;
}

.lesson-content {
  flex: 1;
  min-width: 0;
}

.lesson-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.lesson-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.lesson-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.lesson-type {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.lesson-type.text {
  background: #3b82f6;
  color: white;
}

.lesson-type.chord {
  background: #22c55e;
  color: white;
}

.lesson-type.song {
  background: #f59e0b;
  color: white;
}

.lesson-duration {
  font-size: 12px;
  color: var(--text-tertiary);
}

.lesson-xp {
  font-size: 11px;
  font-weight: 700;
  color: var(--bg-highlight);
  background: var(--bg-highlight-light);
  padding: 2px 6px;
  border-radius: 8px;
}

.lesson-preview {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.lesson-status {
  flex-shrink: 0;
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon.completed {
  background: var(--bg-success);
  color: white;
}

.status-icon.current {
  background: var(--chapter-color);
  color: white;
}

.status-icon.locked {
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
}

.lesson-link {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.not-found {
  text-align: center;
  padding: 64px 24px;
}

.not-found h2 {
  margin-bottom: 16px;
}

@media (max-width: 600px) {
  .chapter-header-section h1 {
    font-size: 24px;
  }
  
  .chapter-progress-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .lesson-item {
    padding: 16px;
  }
  
  .lesson-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
