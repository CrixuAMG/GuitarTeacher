import { computed } from 'vue'
import { useSessionStore } from '../stores/sessionStore'

export function useActiveSession() {
  const sessionStore = useSessionStore()

  const isActive = computed(() => sessionStore.isSessionActive)
  const activeGoal = computed(() => sessionStore.activeGoal)
  const activeSession = computed(() => sessionStore.activeSession)

  const goalTags: Record<string, string[]> = {
    learn_chords: ['learn_chords', 'theory', 'technique'],
    strumming: ['strumming', 'rhythm', 'technique'],
    fingerstyle: ['fingerstyle', 'technique', 'learn_chords'],
    songs: ['songs', 'repertoire', 'perform'],
    theory: ['theory', 'songs', 'ear_training'],
    lead: ['lead', 'technique', 'songs'],
    ear_training: ['ear_training', 'theory'],
    songwriting: ['songwriting', 'theory', 'songs'],
    perform: ['perform', 'songs', 'songs'],
    just_fun: ['learn_chords', 'strumming', 'fingerstyle', 'songs', 'theory', 'lead', 'ear_training', 'songwriting', 'perform'],
  }

  function getTagsForGoal(goal: string): string[] {
    return goalTags[goal] || [goal]
  }

  function matchesGoal(tags: string[], goal: string): boolean {
    const goalTagList = getTagsForGoal(goal)
    return tags.some(tag => goalTagList.includes(tag))
  }

  function isGoalMatch(goal: string): (tags: string[]) => boolean {
    return (tags: string[]) => matchesGoal(tags, goal)
  }

  function filterByGoal<T extends { tags?: string[]; goalTags?: string[] }>(items: T[], goal: string): T[] {
    if (!goal) return items
    return items.filter(item => {
      const itemTags = item.tags || item.goalTags || []
      return matchesGoal(itemTags, goal)
    })
  }

  function isFiltered(item: { tags?: string[]; goalTags?: string[] } | null, goal: string): boolean {
    if (!goal || !item) return false
    const itemTags = item.tags || item.goalTags || []
    return itemTags.length > 0 && !matchesGoal(itemTags, goal)
  }

  return {
    isActive,
    activeGoal,
    activeSession,
    getTagsForGoal,
    matchesGoal,
    isGoalMatch,
    filterByGoal,
    isFiltered,
  }
}