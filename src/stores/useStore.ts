import { ref, watch } from 'vue'
import { createSong } from '../data/songs'
import type { Song, SongChord, LeadNote, SongPart } from '../types'

export type { Song, SongChord, LeadNote, SongPart }

export interface SectionData {
  type: string
  label?: string
  name?: string
  startBeat: number
  endBeat: number
  lines?: string[]
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.error(`Error loading ${key}:`, e)
  }
  return defaultValue
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`Error saving ${key}:`, e)
  }
}

function useStorage<T>(key: string, defaultValue: T) {
  const data = ref<T>(loadFromStorage(key, defaultValue))

  watch(
    data,
    (newValue: unknown) => {
      saveToStorage(key, newValue)
    },
    { deep: true }
  )

  return data
}

const songs = useStorage<Song[]>('guitar-teacher-songs', [])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const progress = useStorage<Record<string, any>>('guitar-teacher-progress', {})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const preferences = useStorage<Record<string, any>>('guitar-preferences', {
  theme: 'light',
  playbackSpeed: 1,
  loopEnabled: false,
  loopStart: 0,
  loopEnd: 0,
  viewMode: 'chords',
})

// Migrate legacy keys to new keys (one-time)
try {
  const legacySongs = localStorage.getItem('guitar-songs')
  if (legacySongs && !localStorage.getItem('guitar-teacher-songs')) {
    localStorage.setItem('guitar-teacher-songs', legacySongs)
  }
  const legacyProgress = localStorage.getItem('guitar-progress')
  if (legacyProgress && !localStorage.getItem('guitar-teacher-progress')) {
    localStorage.setItem('guitar-teacher-progress', legacyProgress)
  }
  if (songs.value.length === 0 && legacySongs) {
    songs.value = JSON.parse(legacySongs)
  }
} catch (e) {
  console.error('Migration failed:', e)
}

function migrateSong(song: Song): Song {
  if (!song.lyrics) song.lyrics = []
  if (!song.sections) song.sections = []
  if (!song.sectionsWithLyrics) song.sectionsWithLyrics = []
  if (!song.timing) song.timing = []
  if (!song.embedUrl) song.embedUrl = null
  if (!song.thumbnailUrl) song.thumbnailUrl = null
  if (!song.tempo) song.tempo = 1
  if (!song.loopSettings)
    song.loopSettings = { enabled: false, start: 0, end: 0 }
  if (!song.leadNotes) song.leadNotes = []
  if (!song.parts) song.parts = []
  if (!song.backgroundMusicUrl) song.backgroundMusicUrl = null
  if ((song as Song & { chordsAutoDetected?: boolean }).chordsAutoDetected === undefined) {
    (song as Song & { chordsAutoDetected: boolean }).chordsAutoDetected = (song.chords || []).some((c: SongChord) => c.autoDetected)
  }
  if (!song.parsedMetadata) {
    song.parsedMetadata = {
      platform: song.source || 'manual',
      platformId: null,
      parsedAt: song.addedAt || new Date().toISOString(),
      format: 'manual',
      autoDetected: false,
    }
  }
  return song
}

export function useStore() {
  function getAllSongs(): Song[] {
    return songs.value.map(migrateSong)
  }

  function addSong(songData: Partial<Song>): Song {
    const song = createSong(songData)
    songs.value.push(song)
    return song
  }

  function removeSong(id: string): void {
    const idx = songs.value.findIndex((s: Song) => s.id === id)
    if (idx !== -1) songs.value.splice(idx, 1)
  }

  function getSong(id: string): Song | null {
    const song = songs.value.find((s: Song) => s.id === id)
    if (song) return migrateSong(song)
    return null
  }

  function updateSong(id: string, updates: Partial<Song>): void {
    const song = songs.value.find((s: Song) => s.id === id)
    if (song) {
      Object.assign(song, updates)
    }
  }

  function updateProgress(songId: string, beats: number): void {
    if (!progress.value[songId]) {
      progress.value[songId] = {
        completedBeats: 0,
        mastered: false,
        playCount: 0,
        lastPlayed: null,
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = progress.value[songId] as any
    p.completedBeats = Math.max(p.completedBeats || 0, beats)
    p.lastPlayed = new Date().toISOString()
  }

  function incrementPlayCount(songId: string): void {
    if (!progress.value[songId]) {
      progress.value[songId] = {
        completedBeats: 0,
        mastered: false,
        playCount: 0,
        lastPlayed: null,
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = progress.value[songId] as any
    p.playCount = (p.playCount || 0) + 1
  }

  function markChordLearned(chordName: string): void {
    if (!progress.value.chords) progress.value.chords = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = progress.value.chords as Record<string, any>
    c[chordName] = { learned: true, learnedAt: new Date().toISOString() }
  }

  function isChordLearned(chordName: string): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = progress.value.chords as Record<string, any>
    return c?.[chordName]?.learned || false
  }

  function updatePracticeTime(seconds: number): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = progress.value as any
    if (!p.totalPracticeTime) p.totalPracticeTime = 0
    p.totalPracticeTime += seconds
  }

  function recordEarTrainingResult(correct: boolean): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = progress.value as any
    if (!p.earTrainingStats) {
      p.earTrainingStats = { correct: 0, total: 0 }
    }
    p.earTrainingStats.total++
    if (correct) p.earTrainingStats.correct++
    p.earTrainingScore = p.earTrainingStats.correct
  }

  function recordTransitions(count: number): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = progress.value as any
    if (!p.transitionsPracticed) p.transitionsPracticed = 0
    p.transitionsPracticed += count
  }

  function updatePracticeStreak(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = progress.value as any
    const today = new Date().toDateString()
    if (!p.lastPracticeDate) {
      p.practiceStreak = 1
    } else if (p.lastPracticeDate !== today) {
      const lastDate = new Date(p.lastPracticeDate)
      const diffDays = Math.floor(
        (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diffDays === 1) {
        p.practiceStreak = (p.practiceStreak || 0) + 1
      } else if (diffDays > 1) {
        p.practiceStreak = 1
      }
    }
    p.lastPracticeDate = today
  }

  function recordTune(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = progress.value as any
    if (!p.tuneCount) p.tuneCount = 0
    p.tuneCount++
  }

  return {
    songs,
    progress,
    preferences,
    getAllSongs,
    addSong,
    removeSong,
    getSong,
    updateSong,
    updateProgress,
    incrementPlayCount,
    markChordLearned,
    isChordLearned,
    updatePracticeTime,
    recordEarTrainingResult,
    recordTransitions,
    updatePracticeStreak,
    recordTune,
  }
}
