import { ref, readonly } from 'vue'

const SESSION_STORAGE_KEY = 'guitar-teacher-sessions'

export type SkillArea = 'chords' | 'strumming' | 'theory' | 'earTraining' | 'repertoire' | 'technique'

export interface SessionEntry {
  area: SkillArea
  startTime: number
  endTime: number
  duration: number // seconds
}

export const AREA_LABELS: Record<SkillArea, string> = {
  chords: 'Chords',
  strumming: 'Strumming',
  theory: 'Theory',
  earTraining: 'Ear Training',
  repertoire: 'Repertoire',
  technique: 'Technique',
}

export const AREA_COLORS: Record<SkillArea, string> = {
  chords: '#ef4444',
  strumming: '#f59e0b',
  theory: '#3b82f6',
  earTraining: '#8b5cf6',
  repertoire: '#22c55e',
  technique: '#ec4899',
}

const sessions = ref<SessionEntry[]>([])
const currentSession = ref<{ area: SkillArea; startTime: number } | null>(null)

function loadSessions() {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    if (stored) {
      sessions.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load sessions:', e)
  }
}

function saveSessions() {
  try {
    // Keep last 90 days to avoid storage bloat
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000
    const trimmed = sessions.value.filter(s => s.startTime > cutoff)
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(trimmed))
  } catch (e) {
    console.error('Failed to save sessions:', e)
  }
}

function startSession(area: SkillArea) {
  // End any existing session first
  endSession()
  currentSession.value = { area, startTime: Date.now() }
}

function endSession() {
  if (!currentSession.value) return
  const endTime = Date.now()
  const duration = Math.floor((endTime - currentSession.value.startTime) / 1000)
  if (duration >= 5) { // Only count sessions of 5+ seconds
    sessions.value.push({
      area: currentSession.value.area,
      startTime: currentSession.value.startTime,
      endTime,
      duration,
    })
    saveSessions()
  }
  currentSession.value = null
}

function getTimePerArea(sinceMs: number): Record<SkillArea, number> {
  const result: Record<string, number> = {
    chords: 0,
    strumming: 0,
    theory: 0,
    earTraining: 0,
    repertoire: 0,
    technique: 0,
  }
  for (const session of sessions.value) {
    if (session.startTime >= sinceMs) {
      result[session.area] = (result[session.area] || 0) + session.duration
    }
  }
  return result as Record<SkillArea, number>
}

function getTotalTime(sinceMs: number): number {
  return Object.values(getTimePerArea(sinceMs)).reduce((a, b) => a + b, 0)
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

loadSessions()

export function useSessionTracker() {
  return {
    sessions: readonly(sessions),
    currentSession: readonly(currentSession),
    startSession,
    endSession,
    getTimePerArea,
    getTotalTime,
    formatDuration,
    AREA_LABELS,
    AREA_COLORS,
  }
}
