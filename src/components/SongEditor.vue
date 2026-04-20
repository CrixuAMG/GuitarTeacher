<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal card editor-modal">
      <div class="modal-header">
        <h2>Edit Song</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="editor-form">
        <div class="form-row">
          <div class="form-group">
            <label>Title</label>
            <input v-model="form.title" type="text" />
          </div>
          <div class="form-group">
            <label>Artist</label>
            <input v-model="form.artist" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group form-group-sm">
            <label>BPM</label>
            <input v-model.number="form.bpm" type="number" min="40" max="300" />
          </div>
          <div class="form-group" style="flex:1">
            <label>Source URL</label>
            <input v-model="form.sourceUrl" type="url" placeholder="https://..." />
          </div>
          <div class="form-group" style="flex:1">
            <label>Background Music URL</label>
            <input v-model="form.backgroundMusicUrl" type="url" placeholder="Apple Music, YouTube, etc." />
          </div>
        </div>

        <div class="form-group">
          <div class="form-label-row">
            <label>Chords <span class="hint">(name + beats per line, e.g. "Em 4")</span></label>
            <button v-if="form.lyricsText.trim()" type="button" class="btn btn-sm btn-secondary auto-detect-btn" @click="autoDetectChords">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 0 1 12 2z"/></svg>
              Auto-detect
            </button>
          </div>
          <textarea v-model="form.chordsText" rows="8" spellcheck="false"></textarea>
        </div>

        <div class="form-group">
          <label>Lyrics <span class="hint">(one line per lyric line; prefix with chords like [Em] for inline chords)</span></label>
          <textarea v-model="form.lyricsText" rows="8" spellcheck="false"></textarea>
        </div>

        <div class="form-group">
          <label>Sections <span class="hint">(one per line, format: "section_type label startBeat endBeat")</span></label>
          <textarea v-model="form.sectionsText" rows="4" spellcheck="false" :placeholder="'verse Verse 1 0 16\\nchorus Chorus 16 32'"></textarea>
        </div>

        <div class="form-group">
          <label>Lead Notes & Riffs <span class="hint">(pitch string fret position duration; use ## Riff Name (riff, beats 0-16) for section headers)</span></label>
          <textarea v-model="form.leadNotesText" rows="6" spellcheck="false" :placeholder="'E4 1 0 0 1\nB4 2 0 4 1\nG4 3 0 5 2'"></textarea>
          <div class="hint">Format: pitch string(0-5) fret position(beat) duration(beats)</div>
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
          <button class="btn btn-danger" @click="resetToDefault">Reset</button>
          <button class="btn btn-primary" @click="save">Save Changes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { detectChordsForSong, generateSectionsFromChords } from '../services/chordDetectionService.js'

const props = defineProps({
  song: { type: Object, default: null },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'save'])

const form = reactive({
  title: '',
  artist: '',
  bpm: 120,
  sourceUrl: '',
  backgroundMusicUrl: '',
  chordsText: '',
  lyricsText: '',
  sectionsText: '',
  leadNotesText: '',
})

async function autoDetectChords() {
  const lyricsLines = form.lyricsText.trim().split('\n').filter(l => l.trim())
  const lyrics = lyricsLines.map((text, i) => {
    const chordMatch = text.match(/^\[([^\]]+)\]/)
    const cleanText = text.replace(/\[([^\]]+)\]/g, '')
    return {
      text: cleanText.trim(),
      chords: chordMatch ? chordMatch[1].split('][') : [],
      time: null,
      section: null,
      beatPosition: i * 4
    }
  })
  
  const detection = await detectChordsForSong({ lyrics, bpm: form.bpm })
  
  if (detection.chords && detection.chords.length > 0) {
    form.chordsText = detection.chords.map(c => `${c.name} ${c.duration}`).join('\n')
  }
  
  const sections = generateSectionsFromChords(detection.chords, lyrics)
  if (sections.length > 0) {
    form.sectionsText = sections.map(s => `${s.type} ${s.label} ${s.startBeat} ${s.endBeat}`).join('\n')
  }
}

watch(() => props.visible, (v) => {
  if (v && props.song) populateForm()
})

function populateForm() {
  if (!props.song) return
  form.title = props.song.title || ''
  form.artist = props.song.artist || ''
  form.bpm = props.song.bpm || 120
  form.sourceUrl = props.song.sourceUrl || ''
  form.backgroundMusicUrl = props.song.backgroundMusicUrl || ''
  form.chordsText = (props.song.chords || []).map(c => `${c.name} ${c.duration}`).join('\n')
  form.lyricsText = (props.song.lyrics || []).map(l => {
    if (typeof l === 'string') return l
    const chords = l.chords && l.chords.length
      ? l.chords.map(c => typeof c === 'string' ? c : c.name).map(c => `[${c}]`).join('')
      : ''
    return chords + (l.text || '')
  }).join('\n')
  form.sectionsText = (props.song.sections || []).map(s => `${s.type} ${s.label} ${s.startBeat} ${s.endBeat}`).join('\n')

  if (props.song.leadNotes && props.song.leadNotes.length > 0) {
    form.leadNotesText = props.song.leadNotes.map(n => `${n.pitch} ${n.stringIndex} ${n.fret} ${n.position} ${n.duration}${n.technique ? ' ' + n.technique : ''}`).join('\n')
  } else if (props.song.parts && props.song.parts.length > 0) {
    const leadParts = props.song.parts.filter(p => p.type === 'lead' || p.type === 'solo' || p.type === 'riff' || p.type === 'melody')
    if (leadParts.length > 0) {
      form.leadNotesText = leadParts.map(p => {
        const header = `## ${p.name} (${p.type}, beats ${p.startBeat}-${p.endBeat})`
        const notes = p.notes.map(n => `${n.pitch} ${n.stringIndex} ${n.fret} ${n.position} ${n.duration}${n.technique ? ' ' + n.technique : ''}`).join('\n')
        return header + '\n' + notes
      }).join('\n\n')
    }
  }
}

function resetToDefault() {
  populateForm()
}

function save() {
  const chords = []
  const chordsLines = form.chordsText.trim().split('\n').filter(l => l.trim())
  let position = 0
  for (const line of chordsLines) {
    const parts = line.trim().split(/\s+/)
    const name = parts[0]
    const duration = parseInt(parts[1]) || 4
    if (name) {
      chords.push({ name, duration, position })
      position += duration
    }
  }

  const lyrics = []
  const lyricsLines = form.lyricsText.trim().split('\n')
  let lyricBeat = 0
  for (const line of lyricsLines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const inlineChords = []
    const chordRegex = /\[([^\]]+)\]/g
    let match
    while ((match = chordRegex.exec(trimmed)) !== null) {
      inlineChords.push(match[1])
    }
    const cleanText = trimmed.replace(/\[([^\]]+)\]/g, '').trim()
    lyrics.push({
      text: cleanText,
      chords: inlineChords,
      time: null,
      section: null,
      beatPosition: lyricBeat
    })
    lyricBeat += 4
  }

  const sections = []
  const sectionLines = form.sectionsText.trim().split('\n').filter(l => l.trim())
  for (const line of sectionLines) {
    const parts = line.trim().split(/\s+/)
    if (parts.length >= 4) {
      sections.push({
        type: parts[0],
        label: parts.slice(1, -2).join(' '),
        startBeat: parseInt(parts[parts.length - 2]) || 0,
        endBeat: parseInt(parts[parts.length - 1]) || 0
      })
    }
  }

  const bpm = form.bpm || 120
  const totalBeats = chords.length > 0 ? chords[chords.length - 1].position + chords[chords.length - 1].duration : 0

  const leadNotes = []
  const parts = []
  let currentPart = null
  const leadLines = form.leadNotesText.trim().split('\n')
  for (const line of leadLines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue
    if (trimmedLine.startsWith('## ')) {
      if (currentPart && currentPart.notes.length > 0) {
        parts.push(currentPart)
      }
      const headerMatch = trimmedLine.match(/^##\s+(.+?)\s*\((\w+),\s*beats\s+(\d+)-(\d+)\)/)
      if (headerMatch) {
        currentPart = {
          id: `part-${parts.length + 1}`,
          type: headerMatch[2] || 'riff',
          name: headerMatch[1] || `Part ${parts.length + 1}`,
          startBeat: parseInt(headerMatch[3]) || 0,
          endBeat: parseInt(headerMatch[4]) || 0,
          notes: [],
        }
      } else {
        currentPart = {
          id: `part-${parts.length + 1}`,
          type: 'riff',
          name: trimmedLine.replace(/^##\s+/, ''),
          startBeat: 0,
          endBeat: 0,
          notes: [],
        }
      }
      continue
    }
    if (trimmedLine.startsWith('#')) continue
    const noteParts = trimmedLine.split(/\s+/)
    if (noteParts.length >= 5) {
      const note = {
        pitch: noteParts[0],
        stringIndex: parseInt(noteParts[1]) || 0,
        fret: parseInt(noteParts[2]) || 0,
        position: parseFloat(noteParts[3]) || 0,
        duration: parseFloat(noteParts[4]) || 1,
        technique: noteParts[5] || undefined,
      }
      leadNotes.push(note)
      if (currentPart) {
        currentPart.notes.push(note)
      }
    }
  }
  if (currentPart && currentPart.notes.length > 0) {
    parts.push(currentPart)
  }

  emit('save', {
    title: form.title,
    artist: form.artist,
    bpm,
    sourceUrl: form.sourceUrl,
    backgroundMusicUrl: form.backgroundMusicUrl || null,
    chords,
    lyrics,
    sections,
    leadNotes: leadNotes.length > 0 ? leadNotes : undefined,
    parts: parts.length > 0 ? parts : undefined,
    totalTime: totalBeats * (60 / bpm)
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}
.editor-modal {
  max-width: 640px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
}
.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  border: none;
}
.close-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}
.editor-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-row {
  display: flex;
  gap: 12px;
}
.form-row .form-group {
  flex: 1;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.form-group-sm {
  max-width: 120px;
}
.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}
.form-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.form-label-row label {
  margin-bottom: 0;
}
.auto-detect-btn {
  font-size: 11px;
  padding: 3px 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.hint {
  font-weight: 400;
  color: var(--text-tertiary);
  font-size: 12px;
}
.form-group input,
.form-group textarea {
  width: 100%;
}
.form-group textarea {
  resize: vertical;
  min-height: 80px;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.5;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.btn-danger {
  background: var(--bg-danger);
  color: #fff;
}
.btn-danger:hover {
  filter: brightness(1.1);
}
</style>