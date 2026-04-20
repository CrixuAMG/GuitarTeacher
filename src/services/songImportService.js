import { extractMetadata, getPlatformLabel } from './urlParserService.js'
import { parseChordPro, parseSimpleChords, parseTimedLyrics, parseLyricsWithChords, detectFormat } from './chordParserService.js'

export async function importFromUrl(url, options = {}) {
  const { bpm = 120, title = '', artist = '', content = '' } = options
  
  const metadata = extractMetadata(url)
  const result = {
    success: false,
    data: null,
    metadata,
    errors: [],
    warnings: []
  }
  
  const platformLabel = getPlatformLabel(metadata.platformType)
  
  let songData = {
    title: title || '',
    artist: artist || '',
    bpm,
    sourceUrl: url.trim(),
    source: metadata.platformType,
    embedUrl: metadata.embedUrl,
    thumbnailUrl: metadata.thumbnailUrl,
    backgroundMusicUrl: metadata.platformType === 'apple_music' || metadata.platformType === 'spotify' ? url.trim() : null,
    chords: [],
    lyrics: [],
    sections: [],
    sectionsWithLyrics: [],
    timing: [],
    notes: [],
    parsedMetadata: {
      platform: metadata.platform,
      platformId: metadata.id,
      parsedAt: new Date().toISOString(),
      format: 'unknown',
      autoDetected: false
    }
  }
  
  if (content && content.trim()) {
    const parsed = parseSongContent(content)
    
    if (parsed.format === 'chordpro' && parsed.data) {
      songData.title = songData.title || parsed.data.title
      songData.artist = songData.artist || parsed.data.artist
      songData.chords = parsed.data.chords
      songData.lyrics = parsed.data.lyrics
      songData.sections = parsed.data.sections
      songData.parsedMetadata.format = 'chordpro'
      songData.parsedMetadata.autoDetected = true
      result.success = true
    } else if (parsed.format === 'simple_chords' && parsed.data) {
      songData.chords = parsed.data
      songData.parsedMetadata.format = 'simple_chords'
      songData.parsedMetadata.autoDetected = true
      result.success = true
    } else if (parsed.format === 'timed_lyrics' && parsed.data) {
      songData.lyrics = parsed.data
      songData.parsedMetadata.format = 'timed_lyrics'
      songData.parsedMetadata.autoDetected = true
      result.success = true
    } else if (parsed.format === 'lyrics_with_chords' && parsed.data) {
      songData.lyrics = parsed.data
      songData.parsedMetadata.format = 'lyrics_with_chords'
      songData.parsedMetadata.autoDetected = true
      result.success = true
    } else {
      result.warnings.push('Could not detect content format. Please enter chords manually.')
    }
  }
  
  if (!songData.title) {
    songData.title = title || `Song from ${platformLabel}`
  }
  if (!songData.artist) {
    songData.artist = artist || 'Unknown'
  }
  
  if (songData.chords.length === 0 && !content.trim()) {
    result.warnings.push(`No content provided. You can add chords and lyrics manually after importing.`)
    result.success = true
  }
  
  const totalBeats = songData.chords.length > 0
    ? songData.chords[songData.chords.length - 1].position + songData.chords[songData.chords.length - 1].duration
    : 0
  
  songData.totalTime = totalBeats * (60 / bpm)
  
  result.data = songData
  return result
}

export function createManualSong(data = {}) {
  const { bpm = 120, title = 'Untitled Song', artist = 'Unknown' } = data
  
  let chords = []
  let lyrics = []
  let sections = []
  
  if (data.content && data.content.trim()) {
    const parsed = parseSongContent(data.content)
    
    if (parsed.format === 'chordpro' && parsed.data) {
      chords = parsed.data.chords || []
      lyrics = parsed.data.lyrics || []
      sections = parsed.data.sections || []
    } else if (parsed.format === 'simple_chords' && parsed.data) {
      chords = parsed.data
    } else if (parsed.format === 'timed_lyrics' && parsed.data) {
      lyrics = parsed.data
    } else if (parsed.format === 'lyrics_with_chords' && parsed.data) {
      lyrics = parsed.data
    }
  }
  
  if (chords.length === 0 && data.chords) {
    chords = data.chords
  }
  
  const totalBeats = chords.length > 0
    ? chords[chords.length - 1].position + chords[chords.length - 1].duration
    : 0
  
  return {
    title: data.title || title,
    artist: data.artist || artist,
    bpm: data.bpm || bpm,
    source: 'manual',
    sourceUrl: data.sourceUrl || '',
    embedUrl: null,
    thumbnailUrl: null,
    chords,
    lyrics,
    sections,
    sectionsWithLyrics: [],
    timing: [],
    notes: data.notes || [],
    leadNotes: data.leadNotes || [],
    parts: data.parts || [],
    backgroundMusicUrl: data.backgroundMusicUrl || null,
    totalTime: totalBeats * (60 / (data.bpm || bpm)),
    parsedMetadata: {
      platform: 'manual',
      platformId: null,
      parsedAt: new Date().toISOString(),
      format: data.content ? detectFormat(data.content) : 'manual',
      autoDetected: false
    }
  }
}

function parseSongContent(content) {
  const format = detectFormat(content)
  
  switch (format) {
    case 'chordpro':
      return { format, data: parseChordPro(content) }
    case 'simple_chords':
      return { format, data: parseSimpleChords(content) }
    case 'timed_lyrics':
      return { format, data: parseTimedLyrics(content) }
    case 'lyrics_with_chords':
      return { format, data: parseLyricsWithChords(content) }
    default:
      return { format: 'unknown', data: null }
  }
}