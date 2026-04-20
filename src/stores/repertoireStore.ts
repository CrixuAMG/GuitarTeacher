import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'guitar-teacher-repertoire'

export type SongStatus = 'learning' | 'ready' | 'performance'

export interface RepertoireEntry {
  songId: string
  status: SongStatus
  genre: string
  difficulty: number // 1-5
  notes: string
  lastPracticed: number | null
}

export const useRepertoireStore = defineStore('repertoire', () => {
  const entries = ref<RepertoireEntry[]>([])

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        entries.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to load repertoire:', e)
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value))
    } catch (e) {
      console.error('Failed to save repertoire:', e)
    }
  }

  function getEntry(songId: string): RepertoireEntry | undefined {
    return entries.value.find(e => e.songId === songId)
  }

  function setEntry(songId: string, data: Partial<RepertoireEntry>) {
    const existing = entries.value.find(e => e.songId === songId)
    if (existing) {
      Object.assign(existing, data)
    } else {
      entries.value.push({
        songId,
        status: data.status || 'learning',
        genre: data.genre || '',
        difficulty: data.difficulty || 3,
        notes: data.notes || '',
        lastPracticed: data.lastPracticed || null,
      })
    }
    saveToStorage()
  }

  function updateStatus(songId: string, status: SongStatus) {
    setEntry(songId, { status })
  }

  function recordPractice(songId: string) {
    setEntry(songId, { lastPracticed: Date.now() })
  }

  const stats = computed(() => {
    const total = entries.value.length
    const learning = entries.value.filter(e => e.status === 'learning').length
    const ready = entries.value.filter(e => e.status === 'ready').length
    const performance = entries.value.filter(e => e.status === 'performance').length
    return { total, learning, ready, performance }
  })

  const genreCounts = computed(() => {
    const counts: Record<string, number> = {}
    for (const e of entries.value) {
      if (e.genre) {
        counts[e.genre] = (counts[e.genre] || 0) + 1
      }
    }
    return counts
  })

  loadFromStorage()

  return {
    entries,
    getEntry,
    setEntry,
    updateStatus,
    recordPractice,
    stats,
    genreCounts,
  }
})
