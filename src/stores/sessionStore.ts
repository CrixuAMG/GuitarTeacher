import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const SESSIONS_KEY = 'guitar-teacher-sessions'
const MAX_SESSIONS = 100

export interface Session {
  id: string
  goal: string
  startTime: number
  endTime: number
  durationSeconds: number
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  createdAt: string
}

export const useSessionStore = defineStore('sessions', () => {
  const sessions = ref<Session[]>([])
  const activeSession = ref<Session | null>(null)
  const sessionStartTime = ref<number | null>(null)

  function loadSessions() {
    try {
      const stored = localStorage.getItem(SESSIONS_KEY)
      if (stored) {
        sessions.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to load sessions:', e)
    }
  }

  function saveSessions() {
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.value))
    } catch (e) {
      console.error('Failed to save sessions:', e)
    }
  }

  const isSessionActive = computed(() => activeSession.value !== null)

  const activeGoal = computed(() => activeSession.value?.goal || null)

  const now = ref(Date.now())

  function startDurationUpdater() {
    const interval = setInterval(() => {
      now.value = Date.now()
    }, 1000)
    return interval
  }

  let durationInterval: ReturnType<typeof setInterval> | null = null

  const sessionDuration = computed(() => {
    if (!sessionStartTime.value) return 0
    return Math.floor((now.value - sessionStartTime.value) / 1000)
  })

  function startSession(goal: string) {
    const nowTime = Date.now()
    sessionStartTime.value = nowTime
    now.value = nowTime
    activeSession.value = {
      id: crypto.randomUUID(),
      goal,
      startTime: nowTime,
      endTime: 0,
      durationSeconds: 0,
      rating: 3,
      comment: null,
      createdAt: new Date().toISOString(),
    }
    if (durationInterval) clearInterval(durationInterval)
    durationInterval = startDurationUpdater()
  }

  function endSession(rating: 1 | 2 | 3 | 4 | 5, comment: string | null = null) {
    if (!activeSession.value || sessionStartTime.value === null) return null

    const endTime = Date.now()
    const durationSeconds = Math.floor((endTime - sessionStartTime.value) / 1000)

    if (durationInterval) {
      clearInterval(durationInterval)
      durationInterval = null
    }

    const completedSession: Session = {
      ...activeSession.value,
      endTime,
      durationSeconds,
      rating,
      comment: comment?.trim() || null,
    }

    sessions.value.unshift(completedSession)
    if (sessions.value.length > MAX_SESSIONS) {
      sessions.value = sessions.value.slice(0, MAX_SESSIONS)
    }

    saveSessions()

    activeSession.value = null
    sessionStartTime.value = null

    return completedSession
  }

  function cancelSession() {
    if (durationInterval) {
      clearInterval(durationInterval)
      durationInterval = null
    }
    activeSession.value = null
    sessionStartTime.value = null
  }

  function getSessionCountForGoal(goal: string): number {
    return sessions.value.filter(s => s.goal === goal).length
  }

  function getSessionsForGoal(goal: string): Session[] {
    return sessions.value.filter(s => s.goal === goal)
  }

  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  function getGoalStats(): Record<string, { count: number; totalSeconds: number; avgRating: number }> {
    const stats: Record<string, { count: number; totalSeconds: number; avgRating: number }> = {}

    for (const session of sessions.value) {
      if (!stats[session.goal]) {
        stats[session.goal] = { count: 0, totalSeconds: 0, avgRating: 0 }
      }
      stats[session.goal].count++
      stats[session.goal].totalSeconds += session.durationSeconds
    }

    for (const goal of Object.keys(stats)) {
      const goalSessions = sessions.value.filter(s => s.goal === goal)
      const totalRating = goalSessions.reduce((sum, s) => sum + s.rating, 0)
      stats[goal].avgRating = totalRating / goalSessions.length
    }

    return stats
  }

  loadSessions()

  return {
    sessions,
    activeSession,
    isSessionActive,
    activeGoal,
    sessionDuration,
    startSession,
    endSession,
    cancelSession,
    getSessionCountForGoal,
    getSessionsForGoal,
    formatDuration,
    getGoalStats,
  }
})