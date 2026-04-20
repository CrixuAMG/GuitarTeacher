import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Song } from '@/types'

const SONGS_STORAGE_KEY = 'guitar-teacher-songs'
const PROGRESS_STORAGE_KEY = 'guitar-teacher-progress'
const CHORDS_STORAGE_KEY = 'guitar-teacher-chords'

interface SongProgress {
  completedBeats: number
}

export const useMainStore = defineStore('main', () => {
  // State
  const songs = ref<Song[]>([])
  const progress = ref<Record<string, SongProgress>>({})
  const learnedChords = ref<string[]>([])

  // Load from storage
  function loadFromStorage() {
    try {
      const storedSongs = localStorage.getItem(SONGS_STORAGE_KEY)
      if (storedSongs) {
        songs.value = JSON.parse(storedSongs)
      }

      const storedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY)
      if (storedProgress) {
        progress.value = JSON.parse(storedProgress)
      }

      const storedChords = localStorage.getItem(CHORDS_STORAGE_KEY)
      if (storedChords) {
        learnedChords.value = JSON.parse(storedChords)
      }
    } catch (e) {
      console.error('Failed to load store data:', e)
    }
  }

  // Save to storage
  function saveSongs() {
    try {
      localStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(songs.value))
    } catch (e) {
      console.error('Failed to save songs:', e)
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress.value))
    } catch (e) {
      console.error('Failed to save progress:', e)
    }
  }

  function saveChords() {
    try {
      localStorage.setItem(CHORDS_STORAGE_KEY, JSON.stringify(learnedChords.value))
    } catch (e) {
      console.error('Failed to save chords:', e)
    }
  }

  // Actions
  function addSong(song: Song) {
    songs.value.push({
      ...song,
      id: song.id || crypto.randomUUID(),
      addedAt: new Date().toISOString(),
    })
    saveSongs()
  }

  function removeSong(songId: string) {
    const index = songs.value.findIndex((s) => s.id === songId)
    if (index > -1) {
      songs.value.splice(index, 1)
      saveSongs()
    }
  }

  function updateSongProgress(songId: string, completedBeats: number) {
    progress.value[songId] = { completedBeats }
    saveProgress()
  }

  function markChordLearned(chordName: string) {
    if (!learnedChords.value.includes(chordName)) {
      learnedChords.value.push(chordName)
      saveChords()
    }
  }

  function isChordLearned(chordName: string): boolean {
    return learnedChords.value.includes(chordName)
  }

  function getSongProgress(songId: string): number {
    const song = songs.value.find((s) => s.id === songId)
    if (!song) return 0

    const totalBeats =
      song.chords.length > 0
        ? song.chords[song.chords.length - 1].position +
          song.chords[song.chords.length - 1].duration
        : 0

    if (totalBeats === 0) return 0

    const completed = progress.value[songId]?.completedBeats ?? 0
    return completed / totalBeats
  }

  // Initialize
  loadFromStorage()

  return {
    songs,
    progress,
    learnedChords,
    addSong,
    removeSong,
    updateSongProgress,
    markChordLearned,
    isChordLearned,
    getSongProgress,
  }
})
