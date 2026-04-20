<template>
  <div class="practice-heatmap">
    <div class="heatmap-header">
      <h3>Practice Heatmap</h3>
      <div class="heatmap-legend">
        <span>Less</span>
        <div class="legend-box level-0"></div>
        <div class="legend-box level-1"></div>
        <div class="legend-box level-2"></div>
        <div class="legend-box level-3"></div>
        <div class="legend-box level-4"></div>
        <span>More</span>
      </div>
    </div>

    <div class="heatmap-grid">
      <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="heatmap-week">
        <div
          v-for="day in week"
          :key="day.date"
          class="heatmap-day"
          :class="`level-${day.level}`"
          :title="`${day.date}: ${day.minutes} min`"
        ></div>
      </div>
    </div>

    <div class="heatmap-stats">
      <div class="heatmap-stat">
        <span class="stat-value">{{ totalDays }}</span>
        <span class="stat-label">days practiced</span>
      </div>
      <div class="heatmap-stat">
        <span class="stat-value">{{ totalMinutes }}</span>
        <span class="stat-label">total minutes</span>
      </div>
      <div class="heatmap-stat">
        <span class="stat-value">{{ longestStreak }}</span>
        <span class="stat-label">longest streak</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGamificationStore } from '../stores/gamificationStore.ts'

const store = useGamificationStore()

const history = computed(() => store.getPracticeHistory(365))

const dayMap = computed(() => {
  const map: Record<string, number> = {}
  history.value.forEach(session => {
    const date = session.date
    if (!map[date]) map[date] = 0
    map[date] += session.minutes || 0
  })
  return map
})

const weeks = computed(() => {
  const result = []
  const today = new Date()
  const daysToShow = 112 // 16 weeks

  let currentWeek = []
  for (let i = daysToShow; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const minutes = dayMap.value[dateStr] || 0

    let level = 0
    if (minutes > 0) level = 1
    if (minutes >= 15) level = 2
    if (minutes >= 30) level = 3
    if (minutes >= 60) level = 4

    currentWeek.push({ date: dateStr, minutes, level })

    if (currentWeek.length === 7) {
      result.push(currentWeek)
      currentWeek = []
    }
  }

  if (currentWeek.length > 0) {
    result.push(currentWeek)
  }

  return result
})

const totalDays = computed(() => Object.keys(dayMap.value).length)

const totalMinutes = computed(() => {
  return Object.values(dayMap.value).reduce((a, b) => a + b, 0)
})

const longestStreak = computed(() => {
  const dates = Object.keys(dayMap.value).sort()
  let maxStreak = 0
  let currentStreak = 0
  let lastDate: Date | null = null

  dates.forEach(dateStr => {
    const d = new Date(dateStr)
    if (lastDate) {
      const diff = (d.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        currentStreak++
      } else {
        currentStreak = 1
      }
    } else {
      currentStreak = 1
    }
    lastDate = d
    maxStreak = Math.max(maxStreak, currentStreak)
  })

  return maxStreak
})
</script>

<style scoped>
.practice-heatmap {
  padding: 24px;
}

.heatmap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.heatmap-header h3 {
  font-size: 18px;
  font-weight: 700;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-secondary);
}

.legend-box {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-box.level-0 { background: var(--bg-tertiary); }
.legend-box.level-1 { background: rgba(34, 197, 94, 0.3); }
.legend-box.level-2 { background: rgba(34, 197, 94, 0.5); }
.legend-box.level-3 { background: rgba(34, 197, 94, 0.7); }
.legend-box.level-4 { background: rgba(34, 197, 94, 1); }

.heatmap-grid {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.heatmap-week {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.heatmap-day {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: var(--bg-tertiary);
  transition: transform 0.15s;
}

.heatmap-day:hover {
  transform: scale(1.4);
  outline: 1px solid var(--text-primary);
}

.heatmap-day.level-1 { background: rgba(34, 197, 94, 0.3); }
.heatmap-day.level-2 { background: rgba(34, 197, 94, 0.5); }
.heatmap-day.level-3 { background: rgba(34, 197, 94, 0.7); }
.heatmap-day.level-4 { background: rgba(34, 197, 94, 1); }

.heatmap-stats {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.heatmap-stat {
  display: flex;
  flex-direction: column;
}

.heatmap-stat .stat-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--bg-highlight);
}

.heatmap-stat .stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
