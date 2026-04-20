import { computed } from 'vue'
import { useProfileStore } from '../stores/profileStore.ts'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export interface FeatureUnlock {
  id: string
  level: ExperienceLevel
}

const FEATURE_UNLOCK_MAP: Record<string, ExperienceLevel> = {
  // Core - always visible
  '/practice': 'beginner',
  '/practice/notes': 'beginner',
  '/practice/chords': 'beginner',
  '/practice/strumming': 'beginner',
  '/practice/tuner': 'beginner',
  '/practice/metronome': 'beginner',
  '/practice/ear-training': 'beginner',
  '/learn': 'beginner',
  '/chords': 'beginner',
  '/library': 'beginner',
  '/profile': 'beginner',

  // Intermediate
  '/practice/timer': 'intermediate',
  '/practice/blind-mode': 'intermediate',
  '/practice/speed-run': 'intermediate',
  '/practice/exercises': 'intermediate',
  '/practice/speed-trainer': 'intermediate',
  '/practice/journal': 'intermediate',
  '/hero': 'intermediate',
  '/jam': 'intermediate',
  '/zen': 'intermediate',
  '/practice/weekly-report': 'intermediate',
  '/goals': 'intermediate',
  '/sessions': 'beginner',
  '/sessions/history': 'beginner',
  '/skill-trees': 'intermediate',
  '/lesson-creator': 'intermediate',
  '/analytics': 'intermediate',

  // Tools - Intermediate
  '/tools/scale-visualizer': 'intermediate',
  '/tools/circle-of-fifths': 'intermediate',
  '/tools/capo': 'intermediate',
  '/tools/transpose': 'intermediate',
  '/tools/tempo-tapper': 'beginner',

  // Advanced
  '/practice/chord-drills': 'intermediate',
  '/tools/caged': 'advanced',
  '/tools/chord-scale': 'advanced',
  '/tools/triad-inversions': 'advanced',
  '/tools/nashville-numbers': 'advanced',
  '/tools/chord-voicings': 'advanced',
  '/tools/technique-lottery': 'advanced',
  '/repertoire': 'advanced',
  '/setlists': 'advanced',
  '/gig': 'advanced',
}

const LEVEL_ORDER: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced']

export function useProgressiveUnlock() {
  const profileStore = useProfileStore()

  const userLevel = computed<ExperienceLevel>(() => {
    return (profileStore.activeProfile?.experienceLevel as ExperienceLevel) || 'beginner'
  })

  const levelIndex = computed(() => LEVEL_ORDER.indexOf(userLevel.value))

  function isFeatureVisible(featurePath: string): boolean {
    const requiredLevel = FEATURE_UNLOCK_MAP[featurePath]
    if (!requiredLevel) return true
    const requiredIndex = LEVEL_ORDER.indexOf(requiredLevel)
    return levelIndex.value >= requiredIndex
  }

  function isLevelVisible(level: ExperienceLevel): boolean {
    const requiredIndex = LEVEL_ORDER.indexOf(level)
    return levelIndex.value >= requiredIndex
  }

  const visiblePracticeTools = computed(() => {
    const allTools = [
      { to: '/practice/routine', icon: '📋', label: 'Practice Routine', desc: 'Guided daily practice sequence', level: 'beginner' as ExperienceLevel },
      { to: '/practice/notes', icon: '🎯', label: 'Note Trainer', desc: 'Learn the fretboard with real-time pitch detection', level: 'beginner' as ExperienceLevel },
      { to: '/practice/strumming', icon: '🎵', label: 'Strumming Trainer', desc: 'Master rhythm patterns with visual beat display', level: 'beginner' as ExperienceLevel },
      { to: '/practice/chords', icon: '🎸', label: 'Chord Drills', desc: 'Practice chord transitions with timing', level: 'beginner' as ExperienceLevel },
      { to: '/practice/tuner', icon: '🎛️', label: 'Tuner', desc: 'Visual tuner with pitch detection', level: 'beginner' as ExperienceLevel },
      { to: '/practice/metronome', icon: '⏱️', label: 'Metronome', desc: 'Perfect your timing', level: 'beginner' as ExperienceLevel },
      { to: '/practice/ear-training', icon: '👂', label: 'Ear Training', desc: 'Train your ear to recognize chords', level: 'beginner' as ExperienceLevel },
      { to: '/practice/timer', icon: '⏲️', label: 'Practice Timer', desc: 'Pomodoro timer for focused practice', level: 'intermediate' as ExperienceLevel },
      { to: '/zen', icon: '🧘', label: 'Zen Mode', desc: 'Minimalist full-screen practice timer', level: 'intermediate' as ExperienceLevel },
      { to: '/practice/blind-mode', icon: '🙈', label: 'Blind Mode', desc: 'Memorize chords before they vanish', level: 'intermediate' as ExperienceLevel },
      { to: '/practice/speed-run', icon: '⚡', label: 'Speed Run', desc: '60-second chord change challenge', level: 'intermediate' as ExperienceLevel },
      { to: '/practice/exercises', icon: '📖', label: 'Exercise Library', desc: 'Guided exercises for all skill levels', level: 'intermediate' as ExperienceLevel },
      { to: '/practice/speed-trainer', icon: '💨', label: 'Speed Trainer', desc: 'Gradual tempo increases for speed building', level: 'intermediate' as ExperienceLevel },
      { to: '/practice/journal', icon: '📓', label: 'Practice Journal', desc: 'Log sessions and track your progress', level: 'intermediate' as ExperienceLevel },
      { to: '/practice/weekly-report', icon: '📊', label: 'Weekly Report', desc: 'Review your practice week', level: 'intermediate' as ExperienceLevel },
    ]
    return allTools.filter(tool => isLevelVisible(tool.level))
  })

  const visibleToolItems = computed(() => {
    const allTools = [
      { to: '/tools/scale-visualizer', icon: '🎼', label: 'Scale Visualizer', desc: 'Explore scales and modes on the fretboard', level: 'intermediate' as ExperienceLevel },
      { to: '/tools/circle-of-fifths', icon: '🔄', label: 'Circle of Fifths', desc: 'Interactive key signatures and chord relationships', level: 'intermediate' as ExperienceLevel },
      { to: '/tools/tempo-tapper', icon: '👆', label: 'Tempo Tapper', desc: 'Tap to detect BPM of any song', level: 'beginner' as ExperienceLevel },
      { to: '/tools/transpose', icon: '🔀', label: 'Transposition Tool', desc: 'Shift chord charts to any key', level: 'intermediate' as ExperienceLevel },
      { to: '/tools/capo', icon: '🧷', label: 'Capo Calculator', desc: 'Find the best capo position', level: 'intermediate' as ExperienceLevel },
      { to: '/tools/caged', icon: '🧱', label: 'CAGED System', desc: 'Movable chord shapes across the fretboard', level: 'advanced' as ExperienceLevel },
      { to: '/tools/chord-scale', icon: '🔗', label: 'Chord-Scale Mapper', desc: 'Find scales that work over any chord', level: 'advanced' as ExperienceLevel },
      { to: '/tools/triad-inversions', icon: '🔺', label: 'Triad Inversions', desc: 'Explore triad shapes across the neck', level: 'advanced' as ExperienceLevel },
      { to: '/tools/nashville-numbers', icon: '🔢', label: 'Nashville Numbers', desc: 'Learn the number system for any key', level: 'advanced' as ExperienceLevel },
      { to: '/tools/chord-voicings', icon: '🔊', label: 'Chord Voicings', desc: 'Every fingering for the same chord', level: 'advanced' as ExperienceLevel },
      { to: '/tools/technique-lottery', icon: '🎡', label: 'Technique Lottery', desc: 'Spin for a random practice focus', level: 'advanced' as ExperienceLevel },
    ]
    return allTools.filter(tool => isLevelVisible(tool.level))
  })

  const visiblePlayItems = computed(() => {
    const allItems = [
      { to: '/library', icon: '🎵', label: 'Song Library', level: 'beginner' as ExperienceLevel },
      { to: '/hero', icon: '🎮', label: 'Guitar Hero', level: 'intermediate' as ExperienceLevel },
      { to: '/jam', icon: '🎷', label: 'Jam Mode', level: 'intermediate' as ExperienceLevel },
      { to: '/setlists', icon: '📋', label: 'Setlist Builder', level: 'advanced' as ExperienceLevel },
    ]
    return allItems.filter(item => isLevelVisible(item.level))
  })

  const visibleNavGroups = computed(() => {
    const allGroups = [
      {
        labelKey: 'navBar.groupAcademy',
        items: [
          { label: 'navBar.navLearn', to: '/learn', icon: '📚', level: 'beginner' as ExperienceLevel },
          { label: 'navBar.navChords', to: '/chords', icon: '🔤', level: 'beginner' as ExperienceLevel },
          { label: 'navBar.navCreate', to: '/lesson-creator', icon: '✏️', level: 'intermediate' as ExperienceLevel },
        ],
      },
      {
        labelKey: 'navBar.groupPractice',
        items: [
          { label: 'navBar.navPracticeHub', to: '/practice', icon: '🎸', level: 'beginner' as ExperienceLevel },
          { label: 'navBar.navNoteTrainer', to: '/practice/notes', icon: '🎯', level: 'beginner' as ExperienceLevel },
          { label: 'navBar.navChordDrills', to: '/practice/chords', icon: '🔤', level: 'beginner' as ExperienceLevel },
          { label: 'navBar.navStrumming', to: '/practice/strumming', icon: '🥁', level: 'beginner' as ExperienceLevel },
          { label: 'navBar.navTuner', to: '/practice/tuner', icon: '🎛️', level: 'beginner' as ExperienceLevel },
          { label: 'navBar.navMetronome', to: '/practice/metronome', icon: '⏱️', level: 'beginner' as ExperienceLevel },
          { label: 'navBar.navMoreTools', to: '/practice', icon: '→', level: 'beginner' as ExperienceLevel },
          { label: 'navBar.navTips', to: '/tips', icon: '💡', level: 'beginner' as ExperienceLevel },
        ],
      },
      {
        labelKey: 'navBar.groupPlay',
        items: [
          { label: 'navBar.navSongLibrary', to: '/library', icon: '🎵', level: 'beginner' as ExperienceLevel },
          { label: 'navBar.navGuitarHero', to: '/hero', icon: '🎮', level: 'intermediate' as ExperienceLevel },
          { label: 'navBar.navJamMode', to: '/jam', icon: '🎷', level: 'intermediate' as ExperienceLevel },
        ],
      },
      {
        labelKey: 'navBar.groupTools',
        items: [
          { label: 'navBar.navScaleVisualizer', to: '/tools/scale-visualizer', icon: '🎼', level: 'intermediate' as ExperienceLevel },
          { label: 'navBar.navCircleOfFifths', to: '/tools/circle-of-fifths', icon: '🔄', level: 'intermediate' as ExperienceLevel },
          { label: 'navBar.navTunerTool', to: '/practice/tuner', icon: '🎛️', level: 'beginner' as ExperienceLevel },
          { label: 'navBar.navTempoTapper', to: '/tools/tempo-tapper', icon: '👆', level: 'beginner' as ExperienceLevel },
          { label: 'navBar.navAllTools', to: '/practice', icon: '→', level: 'beginner' as ExperienceLevel },
        ],
      },
      {
        labelKey: 'navBar.groupSession',
        items: [
          { label: 'navBar.navSessions', to: '/sessions', icon: '🎯', level: 'beginner' as ExperienceLevel },
          { label: 'navBar.navSessionHistory', to: '/sessions/history', icon: '📋', level: 'beginner' as ExperienceLevel },
        ],
      },
    ]

    return allGroups.map(group => ({
      ...group,
      items: group.items.filter(item => isLevelVisible(item.level)),
    })).filter(group => group.items.length > 0)
  })

  return {
    userLevel,
    levelIndex,
    isFeatureVisible,
    isLevelVisible,
    visiblePracticeTools,
    visibleToolItems,
    visiblePlayItems,
    visibleNavGroups,
  }
}