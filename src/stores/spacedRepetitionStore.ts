import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ReviewItem {
  id: string
  type: 'chord' | 'lesson' | 'technique'
  name: string
  lastReviewed: number | null
  reviewCount: number
  interval: number // Days until next review
  easeFactor: number // Multiplier for interval (default 2.5)
  isNew: boolean
}

interface ReviewSession {
  itemId: string
  quality: 0 | 1 | 2 | 3 | 4 | 5 // 0=again, 5=perfect
  timestamp: number
}

const STORAGE_KEY = 'guitar-spaced-repetition'

export const useSpacedRepetitionStore = defineStore('spacedRepetition', () => {
  // State
  const reviewItems = ref<ReviewItem[]>([])
  const sessions = ref<ReviewSession[]>([])
  const dailyGoal = ref(10)
  const streak = ref(0)
  const lastStudyDate = ref<string | null>(null)

  // Initialize with default chords to review
  const defaultChords = [
    'E',
    'Em',
    'A',
    'Am',
    'D',
    'Dm',
    'G',
    'C',
    'F',
    'Bm',
    'B',
    'E7',
    'A7',
    'D7',
    'G7',
  ]

  // Computed
  const dueItems = computed(() => {
    const now = Date.now()
    return reviewItems.value
      .filter((item) => {
        if (item.isNew) return true
        if (!item.lastReviewed) return true
        const nextReview = item.lastReviewed + item.interval * 24 * 60 * 60 * 1000
        return nextReview <= now
      })
      .sort((a, b) => {
        // New items first, then by interval
        if (a.isNew && !b.isNew) return -1
        if (!a.isNew && b.isNew) return 1
        return a.interval - b.interval
      })
  })

  const dueCount = computed(() => dueItems.value.length)

  const todayCompleted = computed(() => {
    const today = new Date().toDateString()
    return sessions.value.filter((s) => new Date(s.timestamp).toDateString() === today).length
  })

  const progressPercent = computed(() => {
    return Math.min(100, (todayCompleted.value / dailyGoal.value) * 100)
  })

  const currentStreak = computed(() => streak.value)

  const difficultItems = computed(() => {
    // Items with ease factor below 2.0 (struggling)
    return reviewItems.value
      .filter((item) => item.easeFactor < 2.0 && !item.isNew)
      .sort((a, b) => a.easeFactor - b.easeFactor)
      .slice(0, 5)
  })

  // Actions
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        reviewItems.value = data.reviewItems || []
        sessions.value = data.sessions || []
        dailyGoal.value = data.dailyGoal || 10
        streak.value = data.streak || 0
        lastStudyDate.value = data.lastStudyDate || null
      } else {
        initializeDefaultItems()
      }

      checkAndUpdateStreak()
    } catch (e) {
      console.error('Failed to load spaced repetition data:', e)
      initializeDefaultItems()
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          reviewItems: reviewItems.value,
          sessions: sessions.value,
          dailyGoal: dailyGoal.value,
          streak: streak.value,
          lastStudyDate: lastStudyDate.value,
        })
      )
    } catch (e) {
      console.error('Failed to save spaced repetition data:', e)
    }
  }

  function initializeDefaultItems() {
    reviewItems.value = defaultChords.map((chord) => ({
      id: `chord-${chord}`,
      type: 'chord',
      name: chord,
      lastReviewed: null,
      reviewCount: 0,
      interval: 0,
      easeFactor: 2.5,
      isNew: true,
    }))
    saveToStorage()
  }

  function checkAndUpdateStreak() {
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

    if (lastStudyDate.value === today) {
      // Already studied today
      return
    } else if (lastStudyDate.value === yesterday) {
      // Studied yesterday, maintain streak
      return
    } else if (lastStudyDate.value) {
      // Missed a day, reset streak
      streak.value = 0
    }
  }

  function addItem(
    item: Omit<ReviewItem, 'lastReviewed' | 'reviewCount' | 'interval' | 'easeFactor' | 'isNew'>
  ) {
    const newItem: ReviewItem = {
      ...item,
      lastReviewed: null,
      reviewCount: 0,
      interval: 0,
      easeFactor: 2.5,
      isNew: true,
    }
    reviewItems.value.push(newItem)
    saveToStorage()
  }

  function recordReview(itemId: string, quality: 0 | 1 | 2 | 3 | 4 | 5) {
    const item = reviewItems.value.find((i) => i.id === itemId)
    if (!item) return

    // Record session
    sessions.value.push({
      itemId,
      quality,
      timestamp: Date.now(),
    })

    // Update streak
    const today = new Date().toDateString()
    if (lastStudyDate.value !== today) {
      lastStudyDate.value = today
      streak.value++
    }

    // Calculate new interval using SM-2 algorithm (simplified)
    if (quality < 3) {
      // Failed, reset interval
      item.interval = 0
      item.reviewCount = 0
    } else {
      item.reviewCount++

      if (item.reviewCount === 1) {
        item.interval = 1
      } else if (item.reviewCount === 2) {
        item.interval = 3
      } else {
        item.interval = Math.round(item.interval * item.easeFactor)
      }

      // Update ease factor
      item.easeFactor = Math.max(
        1.3,
        item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      )
    }

    item.lastReviewed = Date.now()
    item.isNew = false

    saveToStorage()
  }

  function resetItem(itemId: string) {
    const item = reviewItems.value.find((i) => i.id === itemId)
    if (item) {
      item.interval = 0
      item.reviewCount = 0
      item.easeFactor = 2.5
      item.isNew = true
      item.lastReviewed = null
      saveToStorage()
    }
  }

  function setDailyGoal(goal: number) {
    dailyGoal.value = goal
    saveToStorage()
  }

  function getItemStats(itemId: string) {
    const item = reviewItems.value.find((i) => i.id === itemId)
    if (!item) return null

    const itemSessions = sessions.value.filter((s) => s.itemId === itemId)
    const averageQuality =
      itemSessions.length > 0
        ? itemSessions.reduce((sum, s) => sum + s.quality, 0) / itemSessions.length
        : 0

    return {
      reviewCount: item.reviewCount,
      averageQuality: Math.round(averageQuality * 10) / 10,
      nextReview: item.lastReviewed
        ? new Date(item.lastReviewed + item.interval * 24 * 60 * 60 * 1000)
        : null,
      easeFactor: Math.round(item.easeFactor * 100) / 100,
    }
  }

  // Initialize
  loadFromStorage()

  return {
    // State
    reviewItems,
    sessions,
    dailyGoal,

    // Computed
    dueItems,
    dueCount,
    todayCompleted,
    progressPercent,
    currentStreak,
    difficultItems,

    // Actions
    addItem,
    recordReview,
    resetItem,
    setDailyGoal,
    getItemStats,
    initializeDefaultItems,
  }
})
