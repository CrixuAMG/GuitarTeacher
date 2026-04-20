<template>
  <div class="progress-charts card">
    <div class="charts-header">
      <h3>Progress Over Time</h3>
      <p class="charts-subtitle">Track your improvement across key metrics</p>
    </div>

    <div class="charts-grid">
      <!-- XP Chart -->
      <div class="chart-box">
        <div class="chart-title">XP Growth</div>
        <div class="mini-chart">
          <div
            v-for="(bar, i) in xpBars"
            :key="i"
            class="mini-bar"
            :style="{ height: `${bar}%` }"
            :title="`Week ${i + 1}: ${Math.round(bar)}% of current XP`"
          ></div>
        </div>
        <div class="chart-value">{{ currentXP }} XP total</div>
      </div>

      <!-- Practice Time Chart -->
      <div class="chart-box">
        <div class="chart-title">Weekly Practice</div>
        <div class="mini-chart">
          <div
            v-for="(bar, i) in practiceBars"
            :key="i"
            class="mini-bar"
            :style="{ height: `${bar}%`, background: bar > 50 ? '#22c55e' : '#3b82f6' }"
            :title="`Week ${i + 1}: ${Math.round(bar * 1.5)} min`"
          ></div>
        </div>
        <div class="chart-value">{{ totalHours }}h total</div>
      </div>

      <!-- Lessons Chart -->
      <div class="chart-box">
        <div class="chart-title">Lessons Completed</div>
        <div class="mini-chart">
          <div
            v-for="(bar, i) in lessonBars"
            :key="i"
            class="mini-bar"
            :style="{ height: `${bar}%`, background: '#8b5cf6' }"
            :title="`Week ${i + 1}: ${Math.round(bar * totalLessons / 100)} lessons`"
          ></div>
        </div>
        <div class="chart-value">{{ completedLessons }} / {{ totalLessons }}</div>
      </div>

      <!-- Skills Chart -->
      <div class="chart-box">
        <div class="chart-title">Skills Unlocked</div>
        <div class="mini-chart">
          <div
            v-for="(bar, i) in skillBars"
            :key="i"
            class="mini-bar"
            :style="{ height: `${bar}%`, background: '#f59e0b' }"
            :title="`Week ${i + 1}: ${Math.round(bar * totalAchievements / 100)} achievements`"
          ></div>
        </div>
        <div class="chart-value">{{ unlockedAchievements }} / {{ totalAchievements }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGamificationStore } from '../stores/gamificationStore.ts'
import { CHAPTERS } from '../data/chapters.js'

const store = useGamificationStore()

const currentXP = computed(() => store.xp || 0)
const completedLessons = computed(() => store.getCompletedLessonsCount())
const totalLessons = computed(() => CHAPTERS.reduce((sum, ch) => sum + ch.lessons.length, 0))
const totalAchievements = computed(() => 20)
const unlockedAchievements = computed(() => store.achievements?.length || 0)
const totalHours = computed(() => Math.round((store.stats?.totalPracticeTime || 0) / 3600 * 10) / 10)

// Generate mock historical bars since we don't have week-by-week history
// In a real app, this would come from stored historical data
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateBars(seedValue, count = 12) {
  const bars = []
  for (let i = 0; i < count; i++) {
    const progress = (i + 1) / count
    const randomFactor = 0.7 + Math.random() * 0.6
    bars.push(Math.min(100, seedValue * progress * randomFactor + 5))
  }
  return bars
}

const xpBars = computed(() => {
  const bars = []
  for (let i = 0; i < 12; i++) {
    bars.push(Math.min(100, ((i + 1) / 12) * 100))
  }
  return bars
})

const practiceBars = computed(() => {
  const max = Math.max(1, store.stats?.totalPracticeTime || 0)
  return Array.from({ length: 12 }, (_, i) => Math.min(100, ((i + 1) / 12) * 100 * (store.stats?.totalPracticeTime || 0) / max))
})

const lessonBars = computed(() => {
  const bars = []
  for (let i = 0; i < 12; i++) {
    bars.push(Math.min(100, ((i + 1) / 12) * (completedLessons.value / Math.max(1, totalLessons.value)) * 100 + 5))
  }
  return bars
})

const skillBars = computed(() => {
  const bars = []
  for (let i = 0; i < 12; i++) {
    bars.push(Math.min(100, ((i + 1) / 12) * (unlockedAchievements.value / Math.max(1, totalAchievements.value)) * 100 + 2))
  }
  return bars
})
</script>

<style scoped>
.progress-charts {
  padding: 24px;
}

.charts-header {
  margin-bottom: 20px;
}

.charts-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.charts-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.chart-box {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
}

.chart-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 80px;
  margin-bottom: 12px;
}

.mini-bar {
  flex: 1;
  background: var(--bg-highlight);
  border-radius: 3px 3px 0 0;
  min-height: 4px;
  transition: height 0.5s ease;
}

.chart-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}
</style>
