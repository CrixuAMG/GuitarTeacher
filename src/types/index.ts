/**
 * Type definitions for Guitar Teacher application
 */

// Chord types
export interface Chord {
  name: string
  fullName: string
  strings: number[]
  fingers: number[]
  barre: number | null
}

// Lesson types
export type LessonType = 'text' | 'chord' | 'song'

export interface Lesson {
  id: string
  number: number
  title: string
  type: LessonType
  content: string
  xpReward: number
  duration: string
  chordName?: string
  songId?: string
}

export interface Chapter {
  id: string
  number: number
  title: string
  subtitle: string
  description: string
  color: string
  requiredLevel: number
  lessons: Lesson[]
}

// Song types
export interface SongChord {
  name: string
  position: number
  duration: number
  autoDetected?: boolean
}

export type NoteTechnique = 'normal' | 'hammer-on' | 'pull-off' | 'slide' | 'bend' | 'vibrato' | 'harmonic' | 'palm-mute'

export interface LeadNote {
  pitch: string
  stringIndex: number
  fret: number
  position: number
  duration: number
  technique?: NoteTechnique
  velocity?: number
}

export interface SongPart {
  id: string
  type: 'rhythm' | 'lead' | 'bass' | 'solo' | 'intro' | 'riff' | 'melody'
  name: string
  notes: LeadNote[]
  startBeat: number
  endBeat: number
}

export interface LyricLine {
  text: string
  chords?: string[]
  beatPosition?: number
  time?: number | null
  section?: string | null
}

export interface Section {
  type: string
  label?: string
  name?: string
  startBeat: number
  endBeat: number
  lines?: string[]
}

export interface Note {
  pitch: string
  position: number
  duration: number
}

export interface Song {
  id: string
  title: string
  artist: string
  bpm: number
  chords: SongChord[]
  lyrics?: LyricLine[]
  sections?: Section[]
  notes?: Note[]
  leadNotes?: LeadNote[]
  parts?: SongPart[]
  backgroundMusicUrl?: string | null
  sourceUrl?: string
  embedUrl?: string
  source?: string
  chordsAutoDetected?: boolean
  addedAt?: string
  totalTime?: number
  sourceUrlFull?: string
  embedUrlFull?: string
  thumbnailUrl?: string | null
  tempo?: number
  loopSettings?: { enabled: boolean; start: number; end: number }
  sectionsWithLyrics?: Section[]
  timing?: Array<{ beat: number; event: string }>
  parsedMetadata?: { album?: string; year?: string; genre?: string; platform?: string; platformId?: string; parsedAt?: string; format?: string; autoDetected?: boolean }
}

// Gamification types
export interface Level {
  level: number
  title: string
  xpRequired: number
  color: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xp: number
  category: string
  unlocked?: boolean
  unlockedAt?: number | null
}

export interface DailyQuest {
  id: string
  name: string
  type: string
  target: number
  xpReward: number
  progress?: number
  completed?: boolean
  claimed?: boolean
}

export interface LessonProgress {
  completed: boolean
  completedAt: number
  xpEarned: number
}

export interface UserStats {
  totalPracticeTime: number
  chordsLearned: string[]
  songsCompleted: string[]
  earTrainingCorrect: number
  transitionsPracticed: number
  timesTuned: number
  metronomeTime: number
  strummingTime: number
  loopUses: number
  maxSpeed: number
  practiceStreak: number
  lastPracticeDate: string | null
  practiceHistory: string[]
}

export interface MasteryCategory {
  id: string
  name: string
  icon: string
  description: string
}

export interface MasteryState {
  chords: number
  strumming: number
  theory: number
  earTraining: number
  repertoire: number
  technique: number
}

export interface GamificationState {
  xp: number
  level: number
  achievements: string[]
  dailyQuests: DailyQuest[]
  lastQuestReset: string | null
  dailyBonusClaimed: boolean
  lastDailyBonus: string | null
  unlockedRewards: string[]
  progress: Record<string, LessonProgress>
  stats: UserStats
  mastery: MasteryState
}

// Audio types
export type NoteName = 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B' | 'C' | 'C#' | 'D' | 'D#'

export interface DetectedNote {
  name: NoteName
  octave: number
  frequency: number
  cents: number
}

// Component prop types
export interface FretboardProps {
  chord: Chord
  highlight?: boolean
}

export interface SongPlayerProps {
  song: Song
  preferences?: Record<string, unknown>
}

// Store types
export interface StoreState {
  songs: Song[]
  progress: Record<string, { completedBeats: number }>
  learnedChords: string[]
}

// Router types
export type RouteName =
  | 'home'
  | 'learn'
  | 'chapter'
  | 'lesson'
  | 'chords'
  | 'practice'
  | 'practice-hub'
  | 'chord-drills'
  | 'ear-training'
  | 'metronome'
  | 'strumming'
  | 'play'
  | 'library'
  | 'profile'

// Guitar Hero / Note Highway Types
export interface NoteEvent {
  id: string
  stringIndex: number
  fret: number
  time: number
  duration?: number
  hit?: boolean
  missed?: boolean
  type: 'note' | 'chord'
  isChord?: boolean
  chordName?: string
  isHOPO?: boolean // Hammer-on/pull-off
}

export interface HitResult {
  noteId: string
  quality: 'perfect' | 'good' | 'early' | 'late' | 'miss'
  timeDiff: number
  points: number
  timestamp: number
}

export interface GameStats {
  score: number
  maxCombo: number
  accuracy: number
  hits: number
  misses: number
  perfect: number
  good: number
  stars: number
  missedNotes: NoteEvent[]
}

export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface GuitarHeroSettings {
  noteSpeed: number
  difficulty: GameDifficulty
  waitForInput: boolean
  audioInputEnabled: boolean
  showFretNumbers: boolean
  playMode?: 'rhythm' | 'lead'
}

// Pitch Detection Types
export interface PitchData {
  frequency: number
  note: string
  octave: number
  cents: number
  confidence: number
}

export interface FretNote {
  stringIndex: number
  fret: number
  note: string
  isActive: boolean
}
