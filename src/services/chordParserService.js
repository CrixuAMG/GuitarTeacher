const CHORD_NAME_REGEX =
  /^[A-G][#b]?(m|maj|min|dim|aug|sus|add|7|9|11|13|6|sus2|sus4)*(\/[A-G][#b]?)?$/

const TIME_STAMP_REGEX = /^\[([\d]{1,2}):([\d]{2})(?:\.(\d{1,3}))?\]/

// SECTION_REGEX is reserved for future section parsing support
// const SECTION_REGEX = /^\{(?:start_of_|end_of_)?(\w+)(?::\s*([^\}]+))?\}/

export function parseChordPro(input) {
  const lines = input.split('\n')
  const result = {
    title: '',
    artist: '',
    sections: [],
    lyrics: [],
    chords: [],
    metadata: {},
  }

  let currentSection = null
  let beatPosition = 0

  for (const line of lines) {
    const trimmed = line.trim()

    const titleMatch = trimmed.match(/^\{title:\s*([^\}]+)\}/i)
    if (titleMatch) {
      result.title = titleMatch[1].trim()
      continue
    }

    const artistMatch = trimmed.match(/^\{artist:\s*([^\}]+)\}/i)
    if (artistMatch) {
      result.artist = artistMatch[1].trim()
      continue
    }

    const metaMatch = trimmed.match(/^\{(\w+):\s*([^\}]+)\}/i)
    if (metaMatch && !trimmed.match(/^\{start_of/) && !trimmed.match(/^\{end_of/)) {
      result.metadata[metaMatch[1].toLowerCase()] = metaMatch[2].trim()
      continue
    }

    const sectionStartMatch = trimmed.match(/^\{start_of_(\w+)(?::\s*([^\}]+))?\}/i)
    if (sectionStartMatch) {
      currentSection = {
        type: sectionStartMatch[1].toLowerCase(),
        label:
          sectionStartMatch[2]?.trim() ||
          sectionStartMatch[1].charAt(0).toUpperCase() + sectionStartMatch[1].slice(1),
        startBeat: beatPosition,
        lines: [],
      }
      continue
    }

    const sectionEndMatch = trimmed.match(/^\{end_of_(\w+)\}/i)
    if (sectionEndMatch) {
      if (currentSection) {
        currentSection.endBeat = beatPosition
        result.sections.push(currentSection)
        currentSection = null
      }
      continue
    }

    if (trimmed === '' || trimmed.startsWith('{')) continue

    const lineChords = []
    let lyricText = ''
    let i = 0

    while (i < trimmed.length) {
      if (trimmed[i] === '[') {
        const endBracket = trimmed.indexOf(']', i)
        if (endBracket !== -1) {
          const chordName = trimmed.substring(i + 1, endBracket)
          if (CHORD_NAME_REGEX.test(chordName)) {
            lineChords.push({
              name: chordName,
              position: lyricText.length,
              beatPosition: beatPosition,
            })
          }
          i = endBracket + 1
          continue
        }
      }
      lyricText += trimmed[i]
      i++
    }

    if (lineChords.length === 0 && lyricText.trim() === '') continue

    const lyricLine = {
      text: lyricText.trim(),
      chords: lineChords,
      beatPosition: beatPosition,
      section: currentSection?.type || null,
    }

    result.lyrics.push(lyricLine)

    for (const chord of lineChords) {
      result.chords.push({
        name: chord.name,
        duration: 4,
        position: chord.beatPosition,
        lyricOffset: chord.position,
      })
    }

    if (lineChords.length === 0 && lyricText.trim() && result.chords.length > 0) {
      // keep beat position advancing even for lines without chords
    }
    beatPosition += 4
  }

  if (currentSection) {
    currentSection.endBeat = beatPosition
    result.sections.push(currentSection)
  }

  return result
}

export function parseSimpleChords(input) {
  const lines = input
    .trim()
    .split('\n')
    .filter((l) => l.trim())
  const chords = []
  let position = 0

  for (const line of lines) {
    const trimmed = line.trim()
    const parts = trimmed.split(/\s+/)
    const chordName = parts[0]
    const duration = parseInt(parts[1]) || 4

    if (CHORD_NAME_REGEX.test(chordName)) {
      chords.push({
        name: chordName,
        duration,
        position,
      })
      position += duration
    }
  }

  return chords.length > 0 ? chords : null
}

export function parseTimedLyrics(input) {
  const lines = input.trim().split('\n')
  const lyrics = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const timeMatch = trimmed.match(TIME_STAMP_REGEX)
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1])
      const seconds = parseInt(timeMatch[2])
      const ms = timeMatch[3] ? parseInt(timeMatch[3].padEnd(3, '0')) : 0
      const timeInSeconds = minutes * 60 + seconds + ms / 1000

      const text = trimmed.replace(TIME_STAMP_REGEX, '').trim()
      lyrics.push({
        text,
        time: timeInSeconds,
        chords: [],
      })
    } else {
      lyrics.push({
        text: trimmed,
        time: null,
        chords: [],
      })
    }
  }

  return lyrics
}

export function parseLyricsWithChords(input) {
  const lines = input.trim().split('\n')
  const result = []
  let currentChordLine = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const isChordLine = trimmed
      .split(/\s+/)
      .every(
        (token) => CHORD_NAME_REGEX.test(token) || token === '|' || token === '–' || token === '-'
      )

    if (isChordLine) {
      const chords = trimmed.split(/\s+/).filter((t) => CHORD_NAME_REGEX.test(t))
      currentChordLine = chords
      continue
    }

    if (currentChordLine) {
      result.push({
        text: trimmed,
        chords: currentChordLine,
        time: null,
      })
      currentChordLine = null
    } else {
      result.push({
        text: trimmed,
        chords: [],
        time: null,
      })
    }
  }

  return result
}

export function detectFormat(input) {
  if (!input || typeof input !== 'string') return 'unknown'
  const trimmed = input.trim()

  if (trimmed.includes('{title') || trimmed.includes('{start_of') || /\[[A-G][#b]?/.test(trimmed)) {
    return 'chordpro'
  }

  if (trimmed.match(/\[\d{1,2}:\d{2}/)) {
    return 'timed_lyrics'
  }

  const lines = trimmed.split('\n').filter((l) => l.trim())
  if (lines.length >= 2) {
    const firstLine = lines[0].trim()
    const secondLine = lines[1].trim()
    const firstIsChords = firstLine
      .split(/\s+/)
      .every((t) => CHORD_NAME_REGEX.test(t) || t === '|' || t === '-' || t === '–')
    const secondIsChords = secondLine
      .split(/\s+/)
      .every((t) => CHORD_NAME_REGEX.test(t) || t === '|' || t === '-' || t === '–')

    if (firstIsChords && !secondIsChords) {
      return 'lyrics_with_chords'
    }
  }

  const simpleMatch = lines.every((l) => {
    const parts = l.trim().split(/\s+/)
    return parts.length <= 2 && CHORD_NAME_REGEX.test(parts[0])
  })

  if (simpleMatch) {
    return 'simple_chords'
  }

  return 'unknown'
}

export function parseSongContent(input) {
  const format = detectFormat(input)

  switch (format) {
    case 'chordpro':
      return { format, data: parseChordPro(input) }
    case 'simple_chords':
      return { format, data: parseSimpleChords(input) }
    case 'timed_lyrics':
      return { format, data: parseTimedLyrics(input) }
    case 'lyrics_with_chords':
      return { format, data: parseLyricsWithChords(input) }
    default:
      return { format: 'unknown', data: null }
  }
}
