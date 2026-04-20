import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'guitar-teacher-goals'

export type GoalType =
  | 'practice_time'
  | 'chords_learned'
  | 'songs_completed'
  | 'streak_days'
  | 'lessons_completed'
  | 'ear_training_score'

export interface Goal {
  id: string
  title: string
  type: GoalType
  target: number
  current: number
  unit: string
  deadline: string | null
  createdAt: number
  completedAt: number | null
  xpReward: number
}

const GOAL_TEMPLATES: { type: GoalType; title: string; unit: string; defaultTarget: number; xpReward: number }[] = [
  { type: 'practice_time', title: 'Practice for {target} minutes', unit: 'min', defaultTarget: 120, xpReward: 100 },
  { type: 'chords_learned', title: 'Learn {target} new chords', unit: 'chords', defaultTarget: 5, xpReward: 150 },
  { type: 'songs_completed', title: 'Complete {target} songs', unit: 'songs', defaultTarget: 3, xpReward: 200 },
  { type: 'streak_days', title: 'Maintain a {target}-day practice streak', unit: 'days', defaultTarget: 7, xpReward: 250 },
  { type: 'lessons_completed', title: 'Complete {target} lessons', unit: 'lessons', defaultTarget: 5, xpReward: 150 },
  { type: 'ear_training_score', title: 'Score {target} in ear training', unit: 'points', defaultTarget: 20, xpReward: 100 },
]

export const useGoalStore = defineStore('goals', () => {
  const goals = ref<Goal[]>([])

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        goals.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to load goals:', e)
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals.value))
    } catch (e) {
      console.error('Failed to save goals:', e)
    }
  }

  const activeGoals = computed(() => goals.value.filter(g => !g.completedAt))
  const completedGoals = computed(() => goals.value.filter(g => g.completedAt).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0)))

  function createGoal(type: GoalType, target: number, deadline: string | null = null): Goal {
    const template = GOAL_TEMPLATES.find(t => t.type === type)
    if (!template) throw new Error(`Unknown goal type: ${type}`)

    const goal: Goal = {
      id: crypto.randomUUID(),
      title: template.title.replace('{target}', String(target)),
      type,
      target,
      current: 0,
      unit: template.unit,
      deadline,
      createdAt: Date.now(),
      completedAt: null,
      xpReward: template.xpReward,
    }

    goals.value.push(goal)
    saveToStorage()
    return goal
  }

  function deleteGoal(goalId: string) {
    const index = goals.value.findIndex(g => g.id === goalId)
    if (index > -1) {
      goals.value.splice(index, 1)
      saveToStorage()
    }
  }

  function updateProgress(goalId: string, current: number) {
    const goal = goals.value.find(g => g.id === goalId)
    if (!goal || goal.completedAt) return false

    goal.current = Math.min(current, goal.target)
    if (goal.current >= goal.target) {
      goal.completedAt = Date.now()
      saveToStorage()
      return true // completed
    }
    saveToStorage()
    return false
  }

  function incrementProgress(goalId: string, amount = 1) {
    const goal = goals.value.find(g => g.id === goalId)
    if (!goal) return false
    return updateProgress(goalId, goal.current + amount)
  }

  function syncGoalsFromStats(stats: {
    totalPracticeTime?: number
    chordsLearned?: string[]
    songsCompleted?: string[]
    practiceStreak?: number
    earTrainingCorrect?: number
  }) {
    let anyCompleted = false
    for (const goal of goals.value) {
      if (goal.completedAt) continue
      let current = goal.current
      switch (goal.type) {
        case 'practice_time':
          current = Math.floor((stats.totalPracticeTime || 0) / 60)
          break
        case 'chords_learned':
          current = stats.chordsLearned?.length || 0
          break
        case 'songs_completed':
          current = stats.songsCompleted?.length || 0
          break
        case 'streak_days':
          current = stats.practiceStreak || 0
          break
        case 'ear_training_score':
          current = stats.earTrainingCorrect || 0
          break
      }
      if (updateProgress(goal.id, current)) {
        anyCompleted = true
      }
    }
    return anyCompleted
  }

  function getTemplates() {
    return GOAL_TEMPLATES
  }

  loadFromStorage()

  return {
    goals,
    activeGoals,
    completedGoals,
    createGoal,
    deleteGoal,
    updateProgress,
    incrementProgress,
    syncGoalsFromStats,
    getTemplates,
  }
})
