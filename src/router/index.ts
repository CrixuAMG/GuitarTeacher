import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/onboarding', name: 'onboarding', component: () => import('../views/OnboardingView.vue') },
  { path: '/learn', name: 'learn', component: () => import('../views/ChaptersView.vue') },
  {
    path: '/learn/:chapterId',
    name: 'chapter',
    component: () => import('../views/ChapterView.vue'),
  },
  {
    path: '/learn/:chapterId/:lessonId',
    name: 'lesson',
    component: () => import('../views/LessonView.vue'),
  },
  { path: '/chords', name: 'chords', component: () => import('../views/LearnChordsView.vue') },
  { path: '/practice', name: 'practice', component: () => import('../views/PracticeHubView.vue') },
  {
    path: '/practice/chords',
    name: 'chord-drills',
    component: () => import('../views/PracticeMode.vue'),
  },
  {
    path: '/practice/ear-training',
    name: 'ear-training',
    component: () => import('../views/PracticeMode.vue'),
  },
  {
    path: '/practice/metronome',
    name: 'metronome',
    component: () => import('../views/PracticeMode.vue'),
  },
  {
    path: '/practice/strumming',
    name: 'strumming',
    component: () => import('../views/StrummingPracticeView.vue'),
  },
  {
    path: '/practice/notes',
    name: 'note-trainer',
    component: () => import('../views/NotePracticeView.vue'),
  },
  { path: '/practice/tuner', name: 'tuner', component: () => import('../views/TunerView.vue') },
  { path: '/practice/timer', name: 'timer', component: () => import('../views/TimerView.vue') },
  { path: '/play/:id?', name: 'play', component: () => import('../views/SongPlayerView.vue') },
  { path: '/hero', name: 'hero', component: () => import('../views/HeroModeView.vue') },
  { path: '/hero/:id', name: 'hero-mode', component: () => import('../views/HeroModeView.vue') },
  { path: '/library', name: 'library', component: () => import('../views/SongLibraryView.vue') },
  { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue') },
  {
    path: '/skill-trees',
    name: 'skill-trees',
    component: () => import('../views/SkillTreeView.vue'),
  },
  {
    path: '/practice/routine',
    name: 'practice-routine',
    component: () => import('../views/PracticeRoutineView.vue'),
  },
  {
    path: '/practice/exercises',
    name: 'exercise-library',
    component: () => import('../views/ExerciseLibraryView.vue'),
  },
  {
    path: '/tools/scale-visualizer',
    name: 'scale-visualizer',
    component: () => import('../views/ScaleVisualizerView.vue'),
  },
  {
    path: '/tools/circle-of-fifths',
    name: 'circle-of-fifths',
    component: () => import('../views/CircleOfFifthsView.vue'),
  },
  {
    path: '/tools/caged',
    name: 'caged',
    component: () => import('../views/CAGEDSystemView.vue'),
  },
  {
    path: '/goals',
    name: 'goals',
    component: () => import('../views/GoalTrackerView.vue'),
  },
  {
    path: '/sessions',
    name: 'sessions',
    component: () => import('../views/SessionsView.vue'),
  },
  {
    path: '/sessions/history',
    name: 'session-history',
    component: () => import('../views/SessionHistoryView.vue'),
  },
  {
    path: '/tips',
    name: 'tips',
    component: () => import('../views/TipsView.vue'),
  },
  {
    path: '/jam',
    name: 'jam',
    component: () => import('../views/JamModeView.vue'),
  },
  {
    path: '/practice/speed-trainer',
    name: 'speed-trainer',
    component: () => import('../views/SpeedTrainerView.vue'),
  },
  {
    path: '/tools/tempo-tapper',
    name: 'tempo-tapper',
    component: () => import('../views/TempoTapperView.vue'),
  },
  {
    path: '/tools/transpose',
    name: 'transpose',
    component: () => import('../views/TransposeToolView.vue'),
  },
  {
    path: '/tools/capo',
    name: 'capo',
    component: () => import('../views/CapoCalculatorView.vue'),
  },
  {
    path: '/tools/chord-scale',
    name: 'chord-scale',
    component: () => import('../views/ChordScaleMapperView.vue'),
  },
  {
    path: '/tools/technique-lottery',
    name: 'technique-lottery',
    component: () => import('../views/TechniqueLotteryView.vue'),
  },
  {
    path: '/tools/triad-inversions',
    name: 'triad-inversions',
    component: () => import('../views/TriadInversionView.vue'),
  },
  {
    path: '/tools/nashville-numbers',
    name: 'nashville-numbers',
    component: () => import('../views/NashvilleNumberView.vue'),
  },
  {
    path: '/tools/chord-voicings',
    name: 'chord-voicings',
    component: () => import('../views/ChordVoicingView.vue'),
  },
  {
    path: '/practice/blind-mode',
    name: 'blind-mode',
    component: () => import('../views/BlindModeView.vue'),
  },
  {
    path: '/practice/speed-run',
    name: 'speed-run',
    component: () => import('../views/SpeedRunModeView.vue'),
  },
  {
    path: '/practice/journal',
    name: 'journal',
    component: () => import('../views/PracticeJournalView.vue'),
  },
  {
    path: '/practice/weekly-report',
    name: 'weekly-report',
    component: () => import('../views/WeeklyReportView.vue'),
  },
  {
    path: '/repertoire',
    name: 'repertoire',
    component: () => import('../views/RepertoireView.vue'),
  },
  {
    path: '/zen',
    name: 'zen',
    component: () => import('../views/ZenModeView.vue'),
  },
  {
    path: '/setlists',
    name: 'setlists',
    component: () => import('../views/SetlistBuilderView.vue'),
  },
  {
    path: '/gig/:setlistId',
    name: 'gig-mode',
    component: () => import('../views/GigModeView.vue'),
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: () => import('../views/AnalyticsView.vue'),
  },
  {
    path: '/lesson-creator',
    name: 'lesson-creator',
    component: () => import('../views/LessonCreatorView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/HomeView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

interface Profile {
  id: string
  onboarded?: boolean
}

router.beforeEach((to) => {
  if (to.name === 'onboarding') return true
  try {
    const onboarded = localStorage.getItem('guitar-teacher-profiles')
    if (!onboarded) return { name: 'onboarding' }
    const profiles = JSON.parse(onboarded) as Profile[]
    const activeId = localStorage.getItem('guitar-teacher-active-profile')
    const active = profiles.find(p => p.id === (activeId || 'default'))
    if (active && !active.onboarded) return { name: 'onboarding' }
  } catch {
    return { name: 'onboarding' }
  }
  return true
})

export default router
