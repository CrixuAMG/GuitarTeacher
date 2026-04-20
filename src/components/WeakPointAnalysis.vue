<template>
  <div class="weak-point-analysis card">
    <h2>Weak Point Analysis</h2>
    <p class="subtitle">Identify and target your struggling areas</p>

    <div v-if="weakPoints.length > 0" class="weak-points-list">
      <div
        v-for="point in weakPoints"
        :key="point.area"
        class="weak-point-card"
        :class="{ critical: point.severity === 'high' }"
      >
        <div class="weak-point-header">
          <div class="area-info">
            <span class="area-icon">{{ point.icon }}</span>
            <div>
              <div class="area-name">{{ point.name }}</div>
              <div class="area-level">Level {{ point.level }} / 10</div>
            </div>
          </div>
          <div class="severity-badge" :class="point.severity">
            {{ point.severity === 'high' ? 'Needs Work' : 'Improvement' }}
          </div>
        </div>

        <div class="weak-point-bar">
          <div class="bar-bg">
            <div
              class="bar-fill"
              :style="{ width: point.progress + '%', background: point.color }"
            ></div>
          </div>
        </div>

        <div class="recommendation">
          <strong>Focus:</strong> {{ point.recommendation }}
        </div>
      </div>
    </div>

    <div v-else class="all-good">
      <div class="all-good-icon">🌟</div>
      <h3>You're Well-Rounded!</h3>
      <p>All your skill areas are developing nicely. Keep up the great work!</p>
    </div>

    <div class="practice-balance">
      <h3>Practice Balance</h3>
      <div class="balance-grid">
        <div
          v-for="area in balanceAreas"
          :key="area.id"
          class="balance-item"
        >
          <div class="balance-label">{{ area.name }}</div>
          <div class="balance-bar">
            <div
              class="balance-fill"
              :style="{ width: area.percent + '%', background: area.color }"
            ></div>
          </div>
          <div class="balance-time">{{ formatTime(area.minutes) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGamificationStore, MASTERY_CATEGORIES } from '../stores/gamificationStore.ts'
import { useSessionTracker } from '../composables/useSessionTracker.ts'

const gamification = useGamificationStore()
const tracker = useSessionTracker()

const recommendations: Record<string, string> = {
  chords: 'Spend 10 minutes on chord transitions and new chord shapes.',
  strumming: 'Practice strumming patterns with the metronome at 60 BPM.',
  theory: 'Explore the Circle of Fifths or Scale Visualizer for 15 minutes.',
  earTraining: 'Do 10 minutes of interval recognition in Ear Training.',
  repertoire: 'Learn a new song or review one from your library.',
  technique: 'Run finger independence exercises from the Exercise Library.',
}

const masteryLevels = computed(() => gamification.masteryLevels || {})
const masteryProgress = computed(() => gamification.masteryProgress || {})

const weakPoints = computed(() => {
  const levels = masteryLevels.value
  const progress = masteryProgress.value

  const areas = MASTERY_CATEGORIES.map(cat => {
    const lvl = levels[cat.id as keyof typeof levels] || 1
    const prog = progress[cat.id as keyof typeof progress] || 0
    return {
      area: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      level: lvl,
      progress: prog,
      severity: lvl <= 3 ? 'high' : lvl <= 5 ? 'medium' : 'low',
      recommendation: recommendations[cat.id] || `Practice more ${cat.name.toLowerCase()}.`,
    }
  })

  // Return only weak areas, sorted by level
  return areas.filter(a => a.level <= 5).sort((a, b) => a.level - b.level)
})

const balanceAreas = computed(() => {
  const sinceWeek = Date.now() - 7 * 24 * 60 * 60 * 1000
  const timePerArea = tracker.getTimePerArea(sinceWeek)
  const total = tracker.getTotalTime(sinceWeek)
  const max = Math.max(...Object.values(timePerArea), 1)

  return MASTERY_CATEGORIES.map(cat => {
    const seconds = timePerArea[cat.id as keyof typeof timePerArea] || 0
    return {
      id: cat.id,
      name: cat.name,
      color: cat.color,
      minutes: Math.round(seconds / 60),
      percent: total > 0 ? Math.round((seconds / max) * 100) : 0,
    }
  })
})

import { formatMinutes as formatTime } from '../utils/timeFormat'
</script>

<style scoped>
.weak-point-analysis {
  padding: 24px;
  margin-bottom: 24px;
}

.weak-point-analysis h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-size: 14px;
}

.weak-points-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.weak-point-card {
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  border: 2px solid transparent;
  transition: all 0.2s;
}

.weak-point-card.critical {
  border-color: var(--bg-danger);
  background: rgba(239, 68, 68, 0.05);
}

.weak-point-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.area-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.area-icon {
  font-size: 24px;
}

.area-name {
  font-weight: 700;
  font-size: 15px;
}

.area-level {
  font-size: 12px;
  color: var(--text-secondary);
}

.severity-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}

.severity-badge.high {
  background: rgba(239, 68, 68, 0.1);
  color: var(--bg-danger);
}

.severity-badge.medium {
  background: rgba(245, 158, 11, 0.1);
  color: var(--bg-warning);
}

.bar-bg {
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.recommendation {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.all-good {
  text-align: center;
  padding: 32px 16px;
  margin-bottom: 24px;
}

.all-good-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.all-good h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.all-good p {
  color: var(--text-secondary);
  font-size: 14px;
}

.practice-balance h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 14px;
}

.balance-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.balance-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.balance-label {
  width: 100px;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.balance-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.balance-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.balance-time {
  width: 50px;
  text-align: right;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .weak-point-analysis {
    padding: 16px;
  }
  .weak-point-header {
    flex-wrap: wrap;
    gap: 8px;
  }
  .balance-label {
    width: 80px;
    font-size: 12px;
  }
}
</style>
