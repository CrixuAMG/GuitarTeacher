<template>
  <div class="weekly-reports">
    <div class="reports-header card">
      <h2>Weekly Report</h2>
      <p class="subtitle">Your practice week at a glance</p>

      <div class="week-nav">
        <button class="nav-btn" @click="offsetWeek(-1)">← Prev</button>
        <span class="week-label">{{ weekLabel }}</span>
        <button class="nav-btn" :disabled="weekOffset === 0" @click="offsetWeek(1)">Next →</button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-grid">
      <div class="summary-card card">
        <span class="summary-icon">⏱️</span>
        <span class="summary-value">{{ formatDuration(totalTime) }}</span>
        <span class="summary-label">Total Practice Time</span>
      </div>
      <div class="summary-card card">
        <span class="summary-icon">📝</span>
        <span class="summary-value">{{ journalEntries.length }}</span>
        <span class="summary-label">Sessions Logged</span>
      </div>
      <div class="summary-card card">
        <span class="summary-icon">📅</span>
        <span class="summary-value">{{ daysPracticed }}</span>
        <span class="summary-label">Days Practiced</span>
      </div>
      <div class="summary-card card">
        <span class="summary-icon">😊</span>
        <span class="summary-value">{{ avgMood }}</span>
        <span class="summary-label">Avg Mood</span>
      </div>
    </div>

    <!-- Skill Areas -->
    <div class="report-section card">
      <h3>Time by Skill Area</h3>
      <div v-if="skillAreas.length === 0" class="empty">
        No tracked practice time this week.
      </div>
      <div v-else class="area-list">
        <div v-for="area in skillAreas" :key="area.key" class="area-row">
          <div class="area-info">
            <span class="area-dot" :style="{ background: area.color }"></span>
            <span class="area-name">{{ area.label }}</span>
          </div>
          <div class="area-bar-bg">
            <div class="area-bar-fill" :style="{ width: area.percent + '%', background: area.color }"></div>
          </div>
          <span class="area-time">{{ formatDuration(area.time) }}</span>
        </div>
      </div>
    </div>

    <!-- Focus Areas from Journal -->
    <div class="report-section card">
      <h3>Focus Areas</h3>
      <div v-if="focusAreas.length === 0" class="empty">
        No journal entries with focus areas this week.
      </div>
      <div v-else class="focus-tags">
        <div v-for="focus in focusAreas" :key="focus.name" class="focus-item">
          <span class="focus-tag">{{ focus.name }}</span>
          <span class="focus-count">{{ focus.count }} sessions</span>
        </div>
      </div>
    </div>

    <!-- Daily Mood -->
    <div class="report-section card">
      <h3>Daily Mood</h3>
      <div v-if="dailyMoods.length === 0" class="empty">
        No mood data logged this week.
      </div>
      <div v-else class="mood-row">
        <div v-for="day in dailyMoods" :key="day.date" class="mood-day">
          <span class="mood-emoji">{{ day.mood }}</span>
          <span class="mood-date">{{ day.label }}</span>
          <span v-if="day.duration" class="mood-duration">{{ day.duration }}m</span>
        </div>
      </div>
    </div>

    <!-- Comparison -->
    <div class="report-section card">
      <h3>vs Last Week</h3>
      <div class="compare-grid">
        <div class="compare-item">
          <span class="compare-label">Time</span>
          <span class="compare-value" :class="{ up: timeDiff > 0, down: timeDiff < 0 }">
            {{ timeDiff > 0 ? '+' : '' }}{{ formatDuration(timeDiff) }}
          </span>
        </div>
        <div class="compare-item">
          <span class="compare-label">Sessions</span>
          <span class="compare-value" :class="{ up: sessionsDiff > 0, down: sessionsDiff < 0 }">
            {{ sessionsDiff > 0 ? '+' : '' }}{{ sessionsDiff }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSessionTracker, AREA_LABELS, AREA_COLORS } from '../composables/useSessionTracker.ts'

const JOURNAL_KEY = 'guitar-teacher-journal'

interface JournalEntry {
  id: string
  date: string
  duration: number
  mood: string
  areas: string[]
  notes: string
}

function loadEntries(): JournalEntry[] {
  try {
    const stored = localStorage.getItem(JOURNAL_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const allEntries = ref<JournalEntry[]>(loadEntries())
const { getTimePerArea, formatDuration } = useSessionTracker()

const weekOffset = ref(0)

function getWeekBounds(offset: number) {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday start
  const monday = new Date(now.getFullYear(), now.getMonth(), diff - offset * 7)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { start: monday, end: sunday }
}

const currentWeek = computed(() => getWeekBounds(weekOffset.value))
const lastWeek = computed(() => getWeekBounds(weekOffset.value + 1))

const weekLabel = computed(() => {
  const { start, end } = currentWeek.value
  const sameMonth = start.getMonth() === end.getMonth()
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  if (sameMonth) {
    return `${start.getDate()} – ${fmt(end)}`
  }
  return `${fmt(start)} – ${fmt(end)}`
})

function isInWeek(entry: JournalEntry, week: { start: Date; end: Date }) {
  const d = new Date(entry.date + 'T00:00:00')
  return d >= week.start && d <= week.end
}

const journalEntries = computed(() =>
  allEntries.value.filter((e) => isInWeek(e, currentWeek.value))
)

const lastWeekEntries = computed(() =>
  allEntries.value.filter((e) => isInWeek(e, lastWeek.value))
)

const totalTime = computed(() =>
  journalEntries.value.reduce((sum, e) => sum + e.duration * 60, 0)
)

const lastWeekTime = computed(() =>
  lastWeekEntries.value.reduce((sum, e) => sum + e.duration * 60, 0)
)

const timeDiff = computed(() => totalTime.value - lastWeekTime.value)

const sessionsDiff = computed(() => journalEntries.value.length - lastWeekEntries.value.length)

const daysPracticed = computed(() => {
  const days = new Set(journalEntries.value.map((e) => e.date))
  return days.size
})

const avgMood = computed(() => {
  if (journalEntries.value.length === 0) return '–'
  const moods = journalEntries.value.map((e) => e.mood)
  const counts: Record<string, number> = {}
  moods.forEach((m) => { counts[m] = (counts[m] || 0) + 1 })
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return top ? top[0] : '–'
})

const skillAreas = computed(() => {
  const since = currentWeek.value.start.getTime()
  const times = getTimePerArea(since)
  const max = Math.max(...Object.values(times), 1)
  return (Object.keys(times) as Array<keyof typeof times>)
    .filter((k) => times[k] > 0)
    .map((k) => ({
      key: k,
      label: AREA_LABELS[k],
      color: AREA_COLORS[k],
      time: times[k],
      percent: (times[k] / max) * 100,
    }))
    .sort((a, b) => b.time - a.time)
})

const focusAreas = computed(() => {
  const counts: Record<string, number> = {}
  journalEntries.value.forEach((e) => {
    e.areas.forEach((a) => { counts[a] = (counts[a] || 0) + 1 })
  })
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const dailyMoods = computed(() => {
  const { start } = currentWeek.value
  const days: { date: string; label: string; mood: string; duration: number }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayEntries = journalEntries.value.filter((e) => e.date === dateStr)
    const totalMin = dayEntries.reduce((s, e) => s + e.duration, 0)
    const mood = dayEntries.length > 0 ? dayEntries[dayEntries.length - 1].mood : '–'
    days.push({
      date: dateStr,
      label: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
      mood,
      duration: totalMin,
    })
  }
  return days
})

function offsetWeek(dir: number) {
  weekOffset.value = Math.max(0, weekOffset.value + dir)
}
</script>

<style scoped>
.weekly-reports {
  padding: 0 24px 48px;
  max-width: 700px;
  margin: 0 auto;
}

.reports-header {
  padding: 24px;
  margin-bottom: 24px;
}

.reports-header h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.week-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.nav-btn {
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

.nav-btn:hover:not(:disabled) {
  border-color: var(--bg-highlight);
  color: var(--bg-highlight);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.week-label {
  font-weight: 700;
  font-size: 15px;
  min-width: 120px;
  text-align: center;
}

/* Summary Grid */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.summary-card {
  padding: 20px 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-icon {
  font-size: 24px;
}

.summary-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--bg-highlight);
}

.summary-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Report Section */
.report-section {
  padding: 24px;
  margin-bottom: 16px;
}

.report-section h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.empty {
  color: var(--text-secondary);
  font-size: 14px;
  padding: 12px 0;
}

/* Skill Areas */
.area-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.area-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.area-info {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 120px;
  flex-shrink: 0;
}

.area-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.area-name {
  font-size: 13px;
  font-weight: 600;
}

.area-bar-bg {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.area-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.area-time {
  width: 50px;
  text-align: right;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  flex-shrink: 0;
}

/* Focus Tags */
.focus-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.focus-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
}

.focus-tag {
  font-weight: 700;
  font-size: 13px;
}

.focus-count {
  font-size: 12px;
  color: var(--text-secondary);
}

/* Mood Row */
.mood-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.mood-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  padding: 10px 4px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.mood-emoji {
  font-size: 22px;
}

.mood-date {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.mood-duration {
  font-size: 11px;
  font-weight: 700;
  color: var(--bg-highlight);
}

/* Compare */
.compare-grid {
  display: flex;
  gap: 24px;
}

.compare-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.compare-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.compare-value {
  font-size: 18px;
  font-weight: 800;
}

.compare-value.up {
  color: var(--bg-success, #22c55e);
}

.compare-value.down {
  color: var(--bg-danger, #ef4444);
}

@media (max-width: 600px) {
  .weekly-reports {
    padding: 0 12px 32px;
  }
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .mood-row {
    flex-wrap: wrap;
  }
  .mood-day {
    min-width: 60px;
  }
  .area-info {
    width: 90px;
  }
}
</style>
