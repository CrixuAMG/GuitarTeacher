import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'guitar-teacher-setlists'

export interface SetlistSong {
  songId: string
  order: number
}

export interface Setlist {
  id: string
  name: string
  songs: SetlistSong[]
  createdAt: number
}

export const useSetlistStore = defineStore('setlists', () => {
  const setlists = ref<Setlist[]>([])

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setlists.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to load setlists:', e)
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(setlists.value))
    } catch (e) {
      console.error('Failed to save setlists:', e)
    }
  }

  function createSetlist(name: string): Setlist {
    const setlist: Setlist = {
      id: crypto.randomUUID(),
      name: name || 'New Setlist',
      songs: [],
      createdAt: Date.now(),
    }
    setlists.value.push(setlist)
    saveToStorage()
    return setlist
  }

  function deleteSetlist(id: string) {
    const index = setlists.value.findIndex(s => s.id === id)
    if (index > -1) {
      setlists.value.splice(index, 1)
      saveToStorage()
    }
  }

  function renameSetlist(id: string, name: string) {
    const setlist = setlists.value.find(s => s.id === id)
    if (setlist) {
      setlist.name = name || setlist.name
      saveToStorage()
    }
  }

  function addSongToSetlist(setlistId: string, songId: string) {
    const setlist = setlists.value.find(s => s.id === setlistId)
    if (!setlist) return
    if (setlist.songs.find(s => s.songId === songId)) return
    setlist.songs.push({
      songId,
      order: setlist.songs.length,
    })
    saveToStorage()
  }

  function removeSongFromSetlist(setlistId: string, songId: string) {
    const setlist = setlists.value.find(s => s.id === setlistId)
    if (!setlist) return
    setlist.songs = setlist.songs.filter(s => s.songId !== songId)
    // Reorder
    setlist.songs.forEach((s, i) => { s.order = i })
    saveToStorage()
  }

  function moveSong(setlistId: string, songId: string, direction: -1 | 1) {
    const setlist = setlists.value.find(s => s.id === setlistId)
    if (!setlist) return
    const idx = setlist.songs.findIndex(s => s.songId === songId)
    if (idx === -1) return
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= setlist.songs.length) return
    const temp = setlist.songs[idx]
    setlist.songs[idx] = setlist.songs[newIdx]
    setlist.songs[newIdx] = temp
    setlist.songs.forEach((s, i) => { s.order = i })
    saveToStorage()
  }

  loadFromStorage()

  return {
    setlists,
    createSetlist,
    deleteSetlist,
    renameSetlist,
    addSongToSetlist,
    removeSongFromSetlist,
    moveSong,
  }
})
