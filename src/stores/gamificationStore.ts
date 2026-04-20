import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useGoalStore } from './goalStore'
import type {
  Level,
  Achievement,
  DailyQuest,
  LessonProgress,
  UserStats,
  GamificationState,
  MasteryState,
} from '@/types'

const STORAGE_KEY = 'guitar-gamification-v2'

const XP_LEVELS: Level[] = [
  { level: 1, title: 'Beginner', xpRequired: 0, color: '#94a3b8' },
  { level: 2, title: 'Rookie', xpRequired: 100, color: '#22c55e' },
  { level: 3, title: 'Apprentice', xpRequired: 300, color: '#3b82f6' },
  { level: 4, title: 'Musician', xpRequired: 600, color: '#8b5cf6' },
  { level: 5, title: 'Performer', xpRequired: 1000, color: '#f59e0b' },
  { level: 6, title: 'Virtuoso', xpRequired: 1500, color: '#ef4444' },
  { level: 7, title: 'Rockstar', xpRequired: 2200, color: '#ec4899' },
  { level: 8, title: 'Legend', xpRequired: 3000, color: '#fbbf24' },
  { level: 9, title: 'Guitar God', xpRequired: 4000, color: '#a855f7' },
  { level: 10, title: 'Master', xpRequired: 5500, color: '#10b981' },
]

export const MASTERY_CATEGORIES = [
  { id: 'chords', name: 'Chords', icon: '🎸', description: 'Learn and master chords', color: '#ef4444' },
  { id: 'strumming', name: 'Strumming', icon: '🥁', description: 'Rhythm and strumming patterns', color: '#f59e0b' },
  { id: 'theory', name: 'Theory', icon: '📖', description: 'Music theory knowledge', color: '#3b82f6' },
  { id: 'earTraining', name: 'Ear Training', icon: '👂', description: 'Develop your musical ear', color: '#8b5cf6' },
  { id: 'repertoire', name: 'Repertoire', icon: '🎵', description: 'Songs and pieces learned', color: '#22c55e' },
  { id: 'technique', name: 'Technique', icon: '⚡', description: 'Technical proficiency', color: '#ec4899' },
] as const

const MASTERY_LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2250]

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_chord',
    title: 'First Steps',
    description: 'Learn your first chord',
    icon: '🎸',
    xp: 50,
    category: 'learning',
  },
  {
    id: 'chord_collector',
    title: 'Chord Collector',
    description: 'Learn 10 different chords',
    icon: '📚',
    xp: 150,
    category: 'learning',
  },
  {
    id: 'chord_master',
    title: 'Chord Master',
    description: 'Learn all basic chords',
    icon: '🏆',
    xp: 300,
    category: 'learning',
  },
  {
    id: 'first_song',
    title: 'Song Player',
    description: 'Complete your first song',
    icon: '🎵',
    xp: 100,
    category: 'playing',
  },
  {
    id: 'song_library',
    title: 'Repertoire',
    description: 'Complete 5 songs',
    icon: '📀',
    xp: 250,
    category: 'playing',
  },
  {
    id: 'perfect_play',
    title: 'Perfect Performance',
    description: 'Play through a song without stopping',
    icon: '⭐',
    xp: 200,
    category: 'playing',
  },
  {
    id: 'practice_streak_3',
    title: 'Consistency',
    description: 'Practice 3 days in a row',
    icon: '🔥',
    xp: 100,
    category: 'streak',
  },
  {
    id: 'practice_streak_7',
    title: 'Week Warrior',
    description: 'Practice 7 days in a row',
    icon: '⚡',
    xp: 300,
    category: 'streak',
  },
  {
    id: 'practice_streak_30',
    title: 'Monthly Master',
    description: 'Practice 30 days in a row',
    icon: '🌟',
    xp: 1000,
    category: 'streak',
  },
  {
    id: 'time_1h',
    title: 'Getting Serious',
    description: 'Practice for 1 hour total',
    icon: '⏱️',
    xp: 100,
    category: 'practice',
  },
  {
    id: 'time_10h',
    title: 'Dedicated',
    description: 'Practice for 10 hours total',
    icon: '🕐',
    xp: 500,
    category: 'practice',
  },
  {
    id: 'transitions_100',
    title: 'Smooth Operator',
    description: 'Practice 100 chord transitions',
    icon: '🔄',
    xp: 200,
    category: 'practice',
  },
  {
    id: 'ear_training_novice',
    title: 'Good Ear',
    description: 'Score 10 correct in ear training',
    icon: '🎧',
    xp: 150,
    category: 'skills',
  },
  {
    id: 'ear_training_pro',
    title: 'Perfect Pitch',
    description: 'Score 50 correct in ear training',
    icon: '👂',
    xp: 400,
    category: 'skills',
  },
  {
    id: 'tuner_pro',
    title: 'In Tune',
    description: 'Tune your guitar 20 times',
    icon: '🎯',
    xp: 100,
    category: 'skills',
  },
  {
    id: 'loop_master',
    title: 'Loop Master',
    description: 'Use loop mode 10 times',
    icon: '🔁',
    xp: 150,
    category: 'skills',
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Play a song at 1.5x speed',
    icon: '💨',
    xp: 200,
    category: 'skills',
  },
  {
    id: 'barre_chord',
    title: 'Barre Hero',
    description: 'Learn your first barre chord',
    icon: '💪',
    xp: 200,
    category: 'learning',
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Practice after 10 PM',
    icon: '🌙',
    xp: 50,
    category: 'special',
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Practice before 8 AM',
    icon: '🌅',
    xp: 50,
    category: 'special',
  },
]

interface Notification {
  id: number
  type: 'xp' | 'achievement' | 'levelUp' | 'quest' | 'unlock' | 'streak' | 'info'
  title: string
  message?: string
  xp?: number
  levelUp?: boolean
  newLevel?: number
  createdAt: number
}

export const useGamificationStore = defineStore('gamification', () => {
  // State
  const xp = ref(0)
  const level = ref(1)
  const achievements = ref<string[]>([])
  const dailyQuests = ref<DailyQuest[]>([])
  const lastQuestReset = ref<string | null>(null)
  const dailyBonusClaimed = ref(false)
  const lastDailyBonus = ref<string | null>(null)
  const unlockedRewards = ref<string[]>([])
  const progress = ref<Record<string, LessonProgress>>({})
  const notifications = ref<Notification[]>([])

  const stats = ref<UserStats>({
    totalPracticeTime: 0,
    chordsLearned: [],
    songsCompleted: [],
    earTrainingCorrect: 0,
    transitionsPracticed: 0,
    timesTuned: 0,
    metronomeTime: 0,
    strummingTime: 0,
    loopUses: 0,
    maxSpeed: 1,
    practiceStreak: 0,
    lastPracticeDate: null,
    practiceHistory: [],
  })

  const mastery = ref<MasteryState>({
    chords: 0,
    strumming: 0,
    theory: 0,
    earTraining: 0,
    repertoire: 0,
    technique: 0,
  })

  let notificationId = 0

  // Computed
  const currentLevel = computed(() => {
    return XP_LEVELS.find((l) => l.level === level.value) || XP_LEVELS[0]
  })

  const nextLevel = computed(() => {
    return XP_LEVELS.find((l) => l.level === level.value + 1)
  })

  const levelProgress = computed(() => {
    const curr = currentLevel.value
    const next = nextLevel.value
    if (!next) return 100
    const xpInLevel = xp.value - curr.xpRequired
    const xpNeeded = next.xpRequired - curr.xpRequired
    return Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100))
  })

  const xpToNextLevel = computed(() => {
    const next = nextLevel.value
    if (!next) return 0
    return next.xpRequired - xp.value
  })

  const allAchievements = computed(() => {
    return ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: achievements.value.includes(a.id),
      unlockedAt: achievements.value.includes(a.id) ? Date.now() : null,
    }))
  })

  const unlockedAchievements = computed(() => {
    return allAchievements.value.filter((a) => a.unlocked)
  })

  const timeUntilReset = computed(() => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const diff = tomorrow.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  })

  function getMasteryLevel(categoryXp: number): number {
    for (let i = MASTERY_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (categoryXp >= MASTERY_LEVEL_THRESHOLDS[i]) {
        return i + 1
      }
    }
    return 1
  }

  function getMasteryProgress(categoryXp: number): number {
    const lvl = getMasteryLevel(categoryXp)
    if (lvl >= 10) return 100
    const currentThreshold = MASTERY_LEVEL_THRESHOLDS[lvl - 1]
    const nextThreshold = MASTERY_LEVEL_THRESHOLDS[lvl]
    const xpInLevel = categoryXp - currentThreshold
    const xpNeeded = nextThreshold - currentThreshold
    return Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100))
  }

  const masteryLevels = computed(() => ({
    chords: getMasteryLevel(mastery.value.chords),
    strumming: getMasteryLevel(mastery.value.strumming),
    theory: getMasteryLevel(mastery.value.theory),
    earTraining: getMasteryLevel(mastery.value.earTraining),
    repertoire: getMasteryLevel(mastery.value.repertoire),
    technique: getMasteryLevel(mastery.value.technique),
  }))

  const masteryProgress = computed(() => ({
    chords: getMasteryProgress(mastery.value.chords),
    strumming: getMasteryProgress(mastery.value.strumming),
    theory: getMasteryProgress(mastery.value.theory),
    earTraining: getMasteryProgress(mastery.value.earTraining),
    repertoire: getMasteryProgress(mastery.value.repertoire),
    technique: getMasteryProgress(mastery.value.technique),
  }))

  const overallMastery = computed(() => {
    const levels = Object.values(masteryLevels.value)
    return Math.round(levels.reduce((a, b) => a + b, 0) / levels.length)
  })

  // Actions
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data: GamificationState = JSON.parse(stored)
        xp.value = data.xp ?? 0
        level.value = data.level ?? 1
        achievements.value = data.achievements ?? []
        dailyQuests.value = data.dailyQuests ?? []
        lastQuestReset.value = data.lastQuestReset
        dailyBonusClaimed.value = data.dailyBonusClaimed ?? false
        lastDailyBonus.value = data.lastDailyBonus
        unlockedRewards.value = data.unlockedRewards ?? []
        progress.value = data.progress ?? {}
        stats.value = { ...stats.value, ...data.stats }
        mastery.value = { ...mastery.value, ...data.mastery }
      }
    } catch (e) {
      console.error('Failed to load gamification data:', e)
    }
  }

  function saveToStorage() {
    try {
      const data: GamificationState = {
        xp: xp.value,
        level: level.value,
        achievements: achievements.value,
        dailyQuests: dailyQuests.value,
        lastQuestReset: lastQuestReset.value,
        dailyBonusClaimed: dailyBonusClaimed.value,
        lastDailyBonus: lastDailyBonus.value,
        unlockedRewards: unlockedRewards.value,
        progress: progress.value,
        stats: stats.value,
        mastery: mastery.value,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save gamification data:', e)
    }
  }

  function addMasteryXP(category: keyof MasteryState, amount: number) {
    mastery.value[category] += amount
    saveToStorage()
  }

  function syncMasteryFromStats() {
    mastery.value.chords = Math.min(3000, (stats.value.chordsLearned.length || 0) * 30 + mastery.value.chords * 0.1)
    mastery.value.strumming = Math.min(3000, (stats.value.strummingTime || 0) / 10 + mastery.value.strumming * 0.1)
    mastery.value.earTraining = Math.min(3000, (stats.value.earTrainingCorrect || 0) * 15 + mastery.value.earTraining * 0.1)
    mastery.value.repertoire = Math.min(3000, (stats.value.songsCompleted.length || 0) * 80 + mastery.value.repertoire * 0.1)
    mastery.value.technique = Math.min(3000, (stats.value.totalPracticeTime || 0) / 60 + mastery.value.technique * 0.1)
    mastery.value.theory = Math.min(3000, Object.values(progress.value).filter(p => p && p.completed).length * 15 + mastery.value.theory * 0.1)
    saveToStorage()
  }

  function addNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    const id = ++notificationId
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: Date.now(),
    }
    notifications.value.push(newNotification)

    setTimeout(() => {
      notifications.value = notifications.value.filter((n) => n.id !== id)
    }, 5000)
  }

  function addXP(amount: number, reason = ''): { levelUp: boolean } {
    xp.value += amount
    addNotification({
      type: 'xp',
      title: reason || 'XP Gained!',
      xp: amount,
    })

    const didLevelUp = checkLevelUp()
    saveToStorage()
    return { levelUp: didLevelUp }
  }

  function checkLevelUp(): boolean {
    const nextLvl = XP_LEVELS.find((l) => l.level === level.value + 1)
    if (nextLvl && xp.value >= nextLvl.xpRequired) {
      level.value = nextLvl.level

      addNotification({
        type: 'levelUp',
        title: 'Level Up!',
        message: `You are now level ${nextLvl.level}: ${nextLvl.title}`,
        levelUp: true,
        newLevel: nextLvl.level,
      })

      return true
    }
    return false
  }

  function checkAchievement(achievementId: string): boolean {
    if (achievements.value.includes(achievementId)) return false

    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId)
    if (!achievement) return false

    achievements.value.push(achievementId)
    addXP(achievement.xp, `Achievement: ${achievement.title}`)

    addNotification({
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: achievement.title,
      xp: achievement.xp,
    })

    saveToStorage()
    return true
  }

  function hasAchievement(achievementId: string): boolean {
    return achievements.value.includes(achievementId)
  }

  function saveLessonProgress(chapterId: string, lessonId: string, xpReward: number) {
    const key = `${chapterId}-${lessonId}`
    progress.value[key] = {
      completed: true,
      completedAt: Date.now(),
      xpEarned: xpReward,
    }
    saveToStorage()
  }

  function hasCompletedLesson(chapterId: string, lessonId: string): boolean {
    return progress.value[`${chapterId}-${lessonId}`]?.completed ?? false
  }

  function getCompletedLessonsCount(): number {
    return Object.values(progress.value).filter((p) => p && p.completed).length
  }

  function updateStat(key: keyof UserStats, value: number | string | string[]) {
    const current = stats.value[key]
    if (typeof current === 'number' && typeof value === 'number') {
      ;(stats.value[key] as number) = current + value
    } else if (Array.isArray(current) && Array.isArray(value)) {
      ;(stats.value[key] as string[]) = [...current, ...value]
    } else {
      ;(stats.value[key] as typeof value) = value
    }
    saveToStorage()
  }

  function recordPracticeTime(minutes: number) {
    updateStat('totalPracticeTime', minutes * 60)
    syncGoalsWithStats()
  }

  function syncGoalsWithStats() {
    try {
      const goalStore = useGoalStore()
      const completed = goalStore.syncGoalsFromStats({
        totalPracticeTime: stats.value.totalPracticeTime,
        chordsLearned: stats.value.chordsLearned,
        songsCompleted: stats.value.songsCompleted,
        practiceStreak: stats.value.practiceStreak,
        earTrainingCorrect: stats.value.earTrainingCorrect,
      })
      if (completed) {
        addNotification({
          type: 'achievement',
          title: 'Goal Completed!',
          message: 'You achieved a practice goal',
        })
      }
    } catch {
      // goalStore may not be available during SSR or tests
    }
  }

  function recordChordLearned(chordName: string) {
    if (!stats.value.chordsLearned.includes(chordName)) {
      const newChords = [...stats.value.chordsLearned, chordName]
      updateStat('chordsLearned', newChords)
      addMasteryXP('chords', 30)
      checkAchievement('first_chord')
      if (newChords.length >= 10) checkAchievement('chord_collector')
      syncGoalsWithStats()
    }
  }

  function recordSongCompleted(songId: string) {
    if (!stats.value.songsCompleted.includes(songId)) {
      const newSongs = [...stats.value.songsCompleted, songId]
      updateStat('songsCompleted', newSongs)
      addMasteryXP('repertoire', 80)
      addMasteryXP('technique', 20)
      checkAchievement('first_song')
      if (newSongs.length >= 5) checkAchievement('song_library')
    }
    addXP(25, 'Song Completed!')
    syncGoalsWithStats()
  }

  function recordTransition() {
    updateStat('transitionsPracticed', 1)
    addXP(2, 'Chord Transition')
    addMasteryXP('technique', 5)
    updateQuestProgress('transitions')
    checkAchievement('transitions_100')
    syncGoalsWithStats()
  }

  function recordEarTraining(correct: boolean) {
    if (correct) {
      updateStat('earTrainingCorrect', 1)
      addXP(5, 'Ear Training Correct')
      addMasteryXP('earTraining', 5)
      updateQuestProgress('ear_training')
      if (stats.value.earTrainingCorrect >= 10) checkAchievement('ear_training_novice')
      if (stats.value.earTrainingCorrect >= 50) checkAchievement('ear_training_pro')
    }
    syncGoalsWithStats()
  }

  function recordTuning() {
    updateStat('timesTuned', 1)
    addMasteryXP('technique', 2)
    updateQuestProgress('tune')
    checkAchievement('tuner_pro')
    syncGoalsWithStats()
  }

  function recordSpeed(maxSpeed: number) {
    if (maxSpeed > stats.value.maxSpeed) {
      updateStat('maxSpeed', maxSpeed)
      if (maxSpeed >= 1.5) checkAchievement('speed_demon')
    }
    addMasteryXP('technique', 2)
    syncGoalsWithStats()
  }

  function recordLoopUse() {
    updateStat('loopUses', 1)
    addMasteryXP('technique', 1)
    checkAchievement('loop_master')
    syncGoalsWithStats()
  }

  function getPracticeHistory(days: number = 30): Array<{ date: string; minutes: number }> {
    return stats.value.practiceHistory
      .filter(h => typeof h === 'string' && h.length > 0)
      .slice(-days)
      .map((h, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (days - 1 - i))
        return { date: d.toISOString().split('T')[0], minutes: 15 }
      })
  }

  function resetAllProgress() {
    xp.value = 0
    level.value = 1
    achievements.value = []
    progress.value = {}
    unlockedRewards.value = []
    stats.value = {
      totalPracticeTime: 0,
      chordsLearned: [],
      songsCompleted: [],
      earTrainingCorrect: 0,
      transitionsPracticed: 0,
      timesTuned: 0,
      metronomeTime: 0,
      strummingTime: 0,
      loopUses: 0,
      maxSpeed: 1,
      practiceStreak: 0,
      lastPracticeDate: null,
      practiceHistory: [],
    }
    mastery.value = {
      chords: 0,
      strumming: 0,
      theory: 0,
      earTraining: 0,
      repertoire: 0,
      technique: 0,
    }
    dailyQuests.value = []
    lastQuestReset.value = null
    dailyBonusClaimed.value = false
    lastDailyBonus.value = null
    saveToStorage()
  }

  function exportData(): string {
    return JSON.stringify(
      {
        xp: xp.value,
        level: level.value,
        achievements: achievements.value,
        progress: progress.value,
        stats: stats.value,
        unlockedRewards: unlockedRewards.value,
        mastery: mastery.value,
      },
      null,
      2
    )
  }

  function importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString)
      if (typeof data.xp === 'number' && typeof data.level === 'number') {
        xp.value = data.xp
        level.value = data.level
        achievements.value = data.achievements ?? []
        progress.value = data.progress ?? {}
        stats.value = { ...stats.value, ...data.stats }
        unlockedRewards.value = data.unlockedRewards ?? []
        mastery.value = { ...mastery.value, ...(data.mastery || {}) }
        saveToStorage()
        return true
      }
      return false
    } catch (e) {
      console.error('Failed to import data:', e)
      return false
    }
  }

  const DAILY_QUESTS_TEMPLATES = [
    { id: 'practice_15min', name: 'Daily Practice', type: 'practice', target: 15, xpReward: 50 },
    { id: 'learn_chord', name: 'Learn Something New', type: 'learn_chord', target: 1, xpReward: 75 },
    { id: 'play_song', name: 'Play Through', type: 'songs_played', target: 1, xpReward: 100 },
    { id: 'ear_training', name: 'Train Your Ear', type: 'ear_training', target: 5, xpReward: 60 },
    { id: 'chord_transitions', name: 'Smooth Transitions', type: 'transitions', target: 20, xpReward: 40 },
    { id: 'use_metronome', name: 'Stay in Time', type: 'metronome_time', target: 5, xpReward: 30 },
    { id: 'tune_guitar', name: 'Stay in Tune', type: 'tune', target: 1, xpReward: 25 },
    { id: 'strumming_practice', name: 'Rhythm Master', type: 'strumming_time', target: 3, xpReward: 35 },
  ]

  function checkAndResetDailyQuests() {
    const today = new Date().toDateString()

    if (dailyBonusClaimed.value === undefined || lastDailyBonus.value !== today) {
      dailyBonusClaimed.value = false
    }

    if (lastQuestReset.value === today && dailyQuests.value.length > 0) {
      return dailyQuests.value
    }

    const shuffled = [...DAILY_QUESTS_TEMPLATES].sort(() => 0.5 - Math.random())
    dailyQuests.value = shuffled.slice(0, 3).map((q: typeof DAILY_QUESTS_TEMPLATES[0]) => ({
      ...q,
      progress: 0,
      completed: false,
      claimed: false,
    })) as DailyQuest[]
    lastQuestReset.value = today
    saveToStorage()
    return dailyQuests.value
  }

  function updateQuestProgress(type: string, amount = 1) {
    dailyQuests.value.forEach((quest) => {
      if (quest.completed || quest.claimed) return
      if (quest.type === type) {
        quest.progress = Math.min(quest.target, (quest.progress || 0) + amount)
        if (quest.progress >= quest.target) {
          quest.completed = true
        }
      }
    })
    saveToStorage()
  }

  function claimQuestReward(questId: string) {
    const quest = dailyQuests.value.find((q) => q.id === questId)
    if (quest && quest.completed && !quest.claimed) {
      quest.claimed = true
      addXP(quest.xpReward, `Quest Completed: ${quest.name}`)
      addNotification({
        type: 'quest',
        title: 'Quest Completed!',
        message: quest.name,
        xp: quest.xpReward,
      })
      saveToStorage()
    }
  }

  function claimDailyBonus() {
    const today = new Date().toDateString()
    if (!dailyBonusClaimed.value) {
      dailyBonusClaimed.value = true
      lastDailyBonus.value = today
      addXP(50, 'Daily Login Bonus!')
      addNotification({
        type: 'xp',
        title: 'Daily Login Bonus!',
        message: 'Thanks for coming back!',
        xp: 50,
      })
      saveToStorage()
    }
  }

  // Initialize
  loadFromStorage()

  return {
    // State
    xp,
    level,
    achievements,
    dailyQuests,
    dailyBonusClaimed,
    notifications,
    progress,
    stats,
    mastery,

    // Constants
    XP_LEVELS,
    ACHIEVEMENTS,
    MASTERY_CATEGORIES,

    // Computed
    currentLevel,
    nextLevel,
    levelProgress,
    xpToNextLevel,
    allAchievements,
    unlockedAchievements,
    timeUntilReset,
    masteryLevels,
    masteryProgress,
    overallMastery,

    // Actions
    addXP,
    checkAchievement,
    hasAchievement,
    saveLessonProgress,
    hasCompletedLesson,
    getCompletedLessonsCount,
    updateStat,
    recordPracticeTime,
    recordChordLearned,
    recordSongCompleted,
    recordTransition,
    recordEarTraining,
    recordTuning,
    recordSpeed,
    recordLoopUse,
    getPracticeHistory,
    resetAllProgress,
    exportData,
    importData,
    addNotification,
    addMasteryXP,
    syncMasteryFromStats,
    getMasteryLevel,
    getMasteryProgress,
    checkAndResetDailyQuests,
    updateQuestProgress,
    claimQuestReward,
    claimDailyBonus,
  }
})
