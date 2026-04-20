const SONGSTERR_BASE = 'https://www.songsterr.com/a/ra'

export interface SongsterrSong {
  id: number
  artist: { id: number; name: string }
  title: string
  type: string
}

export interface SongsterrTab {
  id: number
  artist: { id: number; name: string }
  title: string
  type: string
  date: string
  tracks: { id: number; name: string; instrument: number }[]
}

export interface SongsterrContent {
  title: string
  artist: string
  tracks: { name: string; content: string; instrument: number }[]
}

export interface SongsterrChord {
  chords: {
    name: string
    positions: { chordId: number; fret: number; finger: number; string: number; mute: string }[]
  }[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchWithProxy(url: string): Promise<any> {
  // Try direct first, then proxy
  try {
    const response = await fetch(url)
    if (response.ok) return await response.json()
  } catch {}

  // Direct failed - return empty
  return { code: 'ERR_NOT_FOUND' }
}

export async function searchSongs(query: string): Promise<SongsterrSong[]> {
  try {
    // Try Songsterr search
    const url = `${SONGSTERR_BASE}/songs.json?p=${encodeURIComponent(query)}`
    const data = await fetchWithProxy(url)

    if (Array.isArray(data)) {
      return data.slice(0, 10)
    }

    // Fallback: use fuzzy search via songs API
    const altUrl = `https://www.songsterr.com/a/ra/songs.json?a=${encodeURIComponent(query)}`
    const altData = await fetchWithProxy(altUrl)

    if (Array.isArray(altData)) {
      return altData.slice(0, 10)
    }

    return []
  } catch (e) {
    console.error('Songsterr search error:', e)
    return []
  }
}

export async function getTabContent(tabId: number): Promise<SongsterrContent | null> {
  try {
    const url = `${SONGSTERR_BASE}/a/ta/t/${tabId}.json`
    const data = await fetchWithProxy(url)

    if (data && data.tracks) {
      return data
    }
    return null
  } catch (e) {
    console.error('Songsterr tab error:', e)
    return null
  }
}

export async function getChords(tabId: number): Promise<SongsterrChord | null> {
  try {
    const url = `${SONGSTERR_BASE}/a/tc/t/${tabId}.json`
    const data = await fetchWithProxy(url)

    if (data && data.chords) {
      return data
    }
    return null
  } catch (e) {
    console.error('Songsterr chords error:', e)
    return null
  }
}

interface ParsedNote {
  stringIndex: number
  fret: number
  duration: number
  position: number
}

// Parse Songsterr tab content into note events
export function parseTabContent(content: string): ParsedNote[] {
  const notes: ParsedNote[] = []
  const lines = content.split('\n').filter((l) => l.trim())

  let position = 0

  for (const line of lines) {
    // Lines like "e|--0--2--3--|" are tab strings
    if (line.includes('|')) {
      const stringChar = line.charAt(0)
      const stringIndex = { e: 0, B: 1, G: 2, D: 3, A: 4, Dl: 5 }[stringChar]

      if (stringIndex !== undefined) {
        // Extract all numbers as frets
        const frets = line.match(/\d+/g)?.map(Number) || []
        frets.forEach((fret, i) => {
          if (fret >= 0 && fret < 100) {
            notes.push({
              stringIndex,
              fret,
              duration: 1,
              position: position + i,
            })
          }
        })
        position += frets.length
      }
    }
  }

  return notes
}

// Main function to get notes for a song
export async function fetchNotesForSong(title: string, artist: string): Promise<ParsedNote[]> {
  const notes: ParsedNote[] = []

  try {
    // Search for songs
    const songs = await searchSongs(`${title} ${artist}`)
    if (!songs.length) {
      // eslint-disable-next-line no-console
      console.log('Songsterr: No song found for', title, artist)
      return notes
    }

    // Get first match
    const song =
      songs.find((s) => s.title.toLowerCase().includes(title.toLowerCase().split(' ')[0])) ||
      songs[0]

    // Get tab content
    const content = await getTabContent(song.id)
    if (!content || !content.tracks?.length) {
      // eslint-disable-next-line no-console
      console.log('Songsterr: No tab content for', song.title)
      return notes
    }

    // Use guitar track
    const guitarTrack =
      content.tracks.find((t) => t.name?.toLowerCase().includes('guitar')) || content.tracks[0]

    if (guitarTrack?.content) {
      return parseTabContent(guitarTrack.content)
    }

    return notes
  } catch (e) {
    console.error('Songsterr fetch error:', e)
    return notes
  }
}

// Check if Songsterr API is available
export async function checkApiStatus(): Promise<boolean> {
  try {
    const songs = await searchSongs('test')
    return songs.length > 0
  } catch {
    return false
  }
}
