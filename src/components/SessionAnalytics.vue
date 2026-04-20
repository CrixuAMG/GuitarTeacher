<template>
  <div class="session-analytics card">
    <h2>Session Analytics</h2>
    <p class="subtitle">Time spent per skill area</p>

    <div class="period-tabs">
      <button
        v-for="p in periods"
        :key="p.id"
        class="tab-btn"
        :class="{ active: period === p.id }"
        @click="period = p.id"
      >
        {{ p.label }}
      </button>
    </div>

    <div class="analytics-content">
      <div class="time-breakdown">
        <div
          v-for="area in skillAreas"
          :key="area"
          class="area-row"
        >
          <div class="area-info">
            <span class="area-color" :style="{ background: AREA_COLORS[area] }"></span>
            <span class="area-name">{{ AREA_LABELS[area] }}</span>
          </div>
          <div class="area-bar-wrapper">
            <div class="area-bar-bg">
              <div
                class="area-bar-fill"
                :style="{ width: barPercent(area) + '%', background: AREA_COLORS[area] }"
              ></div>
            </div>
          </div>
          <div class="area-time">{{ formatDuration(timePerArea[area]) }}</div>
        </div>
      </div>

      <div class="total-time">
        <span class="total-label">Total Practice Time</span>
        <span class="total-value">{{ formatDuration(totalTime) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSessionTracker, type SkillArea } from '../composables/useSessionTracker.ts'

const { getTimePerArea, getTotalTime, formatDuration, AREA_LABELS, AREA_COLORS } = useSessionTracker()

const periods = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
]

const period = ref('week')

const sinceMs = computed(() => {
  const now = new Date()
  switch (period.value) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    case 'week':
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1)
      return new Date(now.getFullYear(), now.getMonth(), diff).getTime()
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    default:
      return 0
  }
})

const timePerArea = computed(() => getTimePerArea(sinceMs.value))
const totalTime = computed(() => getTotalTime(sinceMs.value))

const skillAreas: SkillArea[] = ['chords', 'strumming', 'theory', 'earTraining', 'repertoire', 'technique']

const maxTime = computed(() => {
  const values = Object.values(timePerArea.value)
  return Math.max(...values, 1)
})

function barPercent(area: SkillArea): number {
  if (maxTime.value === 0) return 0
  return Math.min(100, (timePerArea.value[area] / maxTime.value) * 100)
}
</script>

<style scoped>
.session-analytics {
  padding: 24px;
  margin-bottom: 24px;
}

.session-analytics h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-size: 14px;
}

.period-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 6px 14px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  border-color: var(--bg-highlight);
}

.tab-btn.active {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

.time-breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.area-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.area-info {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 120px;
  flex-shrink: 0;
}

.area-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.area-name {
  font-size: 14px;
  font-weight: 600;
}

.area-bar-wrapper {
  flex: 1;
  min-width: 0;
}

.area-bar-bg {
  height: 10px;
  background: var(--bg-tertiary);
  border-radius: 5px;
  overflow: hidden;
}

.area-bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.4s ease;
}

.area-time {
  width: 60px;
  text-align: right;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.total-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.total-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.total-value {
  font-size: 18px;
  font-weight: 800;
  color: var(--bg-highlight);
}

@media (max-width: 600px) {
  .session-analytics {
    padding: 16px;
  }
  .period-tabs {
    flex-wrap: wrap;
  }
  .area-info {
    width: 90px;
  }
  .area-name {
    font-size: 12px;
  }
}
</style>
