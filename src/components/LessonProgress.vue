<template>
  <div class="lesson-progress card">
    <h3>📚 Lesson Progress</h3>
    <p class="progress-summary">
      <span class="completed">{{ completedCount }}</span> of <span class="total">{{ totalCount }}</span> lessons completed
      <span class="percentage">({{ completionRate }}%)</span>
    </p>

    <div class="progress-bar-container">
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" :style="{ width: completionRate + '%' }"></div>
      </div>
    </div>

    <div class="chapter-progress">
      <div
        v-for="chapter in chapterStats"
        :key="chapter.id"
        class="chapter-row"
        @click="navigateToChapter(chapter.id)"
      >
        <div class="chapter-info">
          <span class="chapter-dot" :class="{ completed: chapter.completed === chapter.total }"></span>
          <span class="chapter-title">{{ chapter.title }}</span>
        </div>
        <div class="chapter-progress-bar">
          <div
            class="chapter-fill"
            :style="{ width: chapter.rate + '%' }"
          ></div>
        </div>
        <span class="chapter-count">{{ chapter.completed }}/{{ chapter.total }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGamificationStore } from '../stores/gamificationStore'
import { CHAPTERS } from '../data/chapters'

const router = useRouter()
const gamification = useGamificationStore()

const chapterStats = computed(() => {
  return CHAPTERS.map((chapter) => {
    const total = chapter.lessons ? chapter.lessons.length : 0
    const completed = chapter.lessons
      ? chapter.lessons.filter((lesson) =>
          gamification.hasCompletedLesson(chapter.id, lesson.id)
        ).length
      : 0
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0
    return {
      id: chapter.id,
      title: chapter.title,
      total,
      completed,
      rate,
    }
  })
})

const totalCount = computed(() => chapterStats.value.reduce((sum, c) => sum + c.total, 0))
const completedCount = computed(() => chapterStats.value.reduce((sum, c) => sum + c.completed, 0))
const completionRate = computed(() =>
  totalCount.value > 0 ? Math.round((completedCount.value / totalCount.value) * 100) : 0
)

function navigateToChapter(chapterId: string) {
  router.push(`/learn/${chapterId}`)
}
</script>

<style scoped>
.lesson-progress {
  padding: 20px;
  margin-bottom: 24px;
}

.lesson-progress h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
}

.progress-summary {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.progress-summary .completed {
  font-weight: 700;
  color: var(--bg-highlight);
}

.progress-summary .total {
  font-weight: 600;
}

.progress-summary .percentage {
  font-weight: 700;
  color: var(--bg-success);
}

.progress-bar-container {
  margin-bottom: 20px;
}

.progress-bar-bg {
  height: 10px;
  background: var(--bg-tertiary);
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--bg-success), var(--bg-highlight));
  border-radius: 5px;
  transition: width 0.5s ease;
}

.chapter-progress {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chapter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  transition: background 0.2s;
}

.chapter-row:hover {
  background: var(--bg-secondary);
}

.chapter-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  flex-shrink: 0;
}

.chapter-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  flex-shrink: 0;
}

.chapter-dot.completed {
  background: var(--bg-success);
}

.chapter-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.chapter-progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.chapter-fill {
  height: 100%;
  background: var(--bg-highlight);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.chapter-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  min-width: 36px;
  text-align: right;
}
</style>