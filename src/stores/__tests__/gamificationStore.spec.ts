import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGamificationStore } from '@/stores/gamificationStore'

describe('Gamification Store', () => {
  beforeEach(() => {
    // Mock localStorage to prevent state leakage between tests
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })

    setActivePinia(createPinia())
  })

  it('initializes with correct default values', () => {
    const store = useGamificationStore()

    expect(store.xp).toBe(0)
    expect(store.level).toBe(1)
    expect(store.achievements).toEqual([])
  })

  it('adds XP correctly', () => {
    const store = useGamificationStore()

    store.addXP(50, 'Test')

    expect(store.xp).toBe(50)
  })

  it('levels up when enough XP is gained', () => {
    const store = useGamificationStore()

    // Level 2 requires 100 XP
    const result = store.addXP(100, 'Level up test')

    expect(store.level).toBe(2)
    expect(result.levelUp).toBe(true)
  })

  it('tracks lesson completion correctly', () => {
    const store = useGamificationStore()

    store.saveLessonProgress('chapter-1', 'lesson-1', 25)

    expect(store.hasCompletedLesson('chapter-1', 'lesson-1')).toBe(true)
    expect(store.getCompletedLessonsCount()).toBe(1)
  })

  it('awards achievements correctly', () => {
    const store = useGamificationStore()

    const result = store.checkAchievement('first_chord')

    expect(result).toBe(true)
    expect(store.hasAchievement('first_chord')).toBe(true)

    // Should not award twice
    const result2 = store.checkAchievement('first_chord')
    expect(result2).toBe(false)
  })
})

describe('Gamification Store', () => {
  it('initializes with correct default values', () => {
    const pinia = createPinia()
    const store = useGamificationStore(pinia)

    expect(store.xp).toBe(0)
    expect(store.level).toBe(1)
    expect(store.achievements).toEqual([])
  })

  it('adds XP correctly', () => {
    const pinia = createPinia()
    const store = useGamificationStore(pinia)

    store.addXP(50, 'Test')

    expect(store.xp).toBe(50)
  })

  it('levels up when enough XP is gained', () => {
    const pinia = createPinia()
    const store = useGamificationStore(pinia)

    // Level 2 requires 100 XP
    const result = store.addXP(100, 'Level up test')

    expect(store.level).toBe(2)
    expect(result.levelUp).toBe(true)
  })

  it('tracks lesson completion correctly', () => {
    const pinia = createPinia()
    const store = useGamificationStore(pinia)

    store.saveLessonProgress('chapter-1', 'lesson-1', 25)

    expect(store.hasCompletedLesson('chapter-1', 'lesson-1')).toBe(true)
    expect(store.getCompletedLessonsCount()).toBe(1)
  })

  it('awards achievements correctly', () => {
    const pinia = createPinia()
    const store = useGamificationStore(pinia)

    const result = store.checkAchievement('first_chord')

    expect(result).toBe(true)
    expect(store.hasAchievement('first_chord')).toBe(true)

    // Should not award twice
    const result2 = store.checkAchievement('first_chord')
    expect(result2).toBe(false)
  })
})
