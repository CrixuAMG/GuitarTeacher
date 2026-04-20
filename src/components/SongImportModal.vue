<template>
  <div class="modal-overlay" @click.self="handleClose">
    <div class="modal card import-modal">
      <div class="modal-header">
        <h2>{{ $t('songImport.title') }}</h2>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>

      <div class="import-tabs">
        <button class="tab-btn" :class="{ active: tab === 'ai' }" @click="tab = 'ai'">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 0 1 12 2z"
            />
            <circle cx="12" cy="6" r="1" />
          </svg>
          {{ $t('songImport.tabAi') }}
        </button>
        <button class="tab-btn" :class="{ active: tab === 'url' }" @click="tab = 'url'">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          {{ $t('songImport.tabUrl') }}
        </button>
        <button class="tab-btn" :class="{ active: tab === 'chordpro' }" @click="tab = 'chordpro'">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          {{ $t('songImport.tabChordpro') }}
        </button>
        <button class="tab-btn" :class="{ active: tab === 'manual' }" @click="tab = 'manual'">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <rect x="18" y="2" width="4" height="4" rx="1" />
          </svg>
          {{ $t('songImport.tabManual') }}
        </button>
      </div>

      <div v-if="parsing" class="parsing-state">
        <div class="spinner"></div>
        <p>{{ $t('songImport.analyzing') }}</p>
      </div>

      <div v-else-if="preview" class="preview-state">
        <h3 class="preview-title">{{ $t('songImport.preview') }}</h3>
        <div class="preview-actions-top">
          <button
            v-if="!preview.chords.length || preview.chordsAutoDetected === false"
            class="btn btn-secondary btn-sm"
            @click="runChordDetection"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 0 1 12 2z"
              />
            </svg>
            {{ $t('songImport.autoDetectChords') }}
          </button>
          <button
            v-if="!preview.sections.length && preview.lyrics.length"
            class="btn btn-secondary btn-sm"
            @click="detectSections"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            {{ $t('songImport.detectSections') }}
          </button>
        </div>
        <div class="preview-card card">
          <div class="preview-header">
            <div>
              <div class="preview-song-title">{{ preview.title }}</div>
              <div class="preview-artist">{{ preview.artist }}</div>
            </div>
            <div class="preview-badges">
              <span class="badge" :class="'badge-' + preview.source">{{
                getPlatformLabel(preview.source)
              }}</span>
              <span class="chip">{{ $t('library.bpm', { bpm: preview.bpm }) }}</span>
              <span class="chip">{{ $t('library.chordCount', { count: preview.chords.length }) }}</span>
              <span v-if="preview.lyrics.length" class="chip"
                >{{ $t('songImport.lyricLines', { count: preview.lyrics.length }) }}</span
              >
            </div>
          </div>

          <div v-if="preview.embedUrl" class="preview-embed">
            <iframe
              :src="preview.embedUrl"
              frameborder="0"
              allow="
                accelerometer;
                autoplay;
                clipboard-write;
                encrypted-media;
                gyroscope;
                picture-in-picture;
              "
              allowfullscreen
            ></iframe>
          </div>

          <div v-if="preview.chords.length" class="preview-chords">
            <span
              v-for="(chord, i) in preview.chords.slice(0, 16)"
              :key="i"
              class="preview-chord"
              >{{ chord.name }}</span
            >
            <span v-if="preview.chords.length > 16" class="preview-more"
              >{{ $t('songImport.moreChords', { count: preview.chords.length - 16 }) }}</span
            >
          </div>

          <div v-if="preview.lyrics.length" class="preview-lyrics">
            <div
              v-for="(line, i) in preview.lyrics.slice(0, 6)"
              :key="i"
              class="preview-lyric-line"
            >
              <span v-if="line.chords && line.chords.length" class="preview-line-chords">
                {{ line.chords.map((c) => c.name).join(' ') }}
              </span>
              <span class="preview-line-text">{{ line.text }}</span>
            </div>
            <div v-if="preview.lyrics.length > 6" class="preview-more">
              {{ $t('songImport.moreLines', { count: preview.lyrics.length - 6 }) }}
            </div>
          </div>

          <div v-if="parseWarnings.length" class="preview-warnings">
            <div v-for="(warning, i) in parseWarnings" :key="i" class="warning-item">
              {{ warning }}
            </div>
          </div>
        </div>

        <div class="preview-actions">
          <button class="btn btn-secondary" @click="editPreview">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
{{ $t('songImport.edit') }}
           </button>
           <button class="btn btn-primary" @click="savePreview">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <polyline points="20 6 9 17 4 12"/>
             </svg>
             {{ $t('songImport.saveToLibrary') }}
          </button>
        </div>

        <!-- Notes are automatically generated from chords -->
      </div>

      <div v-else-if="editing" class="editing-state">
        <div class="edit-form">
          <div class="form-row">
            <div class="form-group">
              <label>{{ $t('songImport.titleLabel') }}</label>
              <input v-model="editData.title" type="text" :placeholder="$t('songImport.titlePlaceholder')" />
            </div>
            <div class="form-group">
              <label>{{ $t('songImport.artistLabel') }}</label>
              <input v-model="editData.artist" type="text" :placeholder="$t('songImport.artistPlaceholder')" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group form-group-sm">
              <label>{{ $t('songImport.bpmLabel') }}</label>
              <input
                v-model.number="editData.bpm"
                type="number"
                min="40"
                max="300"
                placeholder="120"
              />
            </div>
          </div>

          <div class="form-group">
            <label>{{ $t('songImport.chordsLabel') }} <span class="hint">{{ $t('songImport.chordsHint') }}</span></label>
            <textarea
              v-model="editData.chordsText"
              rows="6"
              placeholder="G 4&#10;Em 4&#10;C 4&#10;D 4"
            ></textarea>
          </div>

          <div class="form-group">
            <label>{{ $t('songImport.lyricsLabel') }} <span class="hint">{{ $t('songImport.lyricsHint') }}</span></label>
            <textarea
              v-model="editData.lyricsText"
              rows="8"
              placeholder="Today is gonna be the day&#10;That they're gonna throw it back to you"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Source URL</label>
            <input v-model="editData.sourceUrl" type="url" placeholder="https://..." />
          </div>

          <div class="form-actions">
            <button class="btn btn-secondary" @click="cancelEdit">Cancel</button>
            <button class="btn btn-primary" @click="saveEditedSong">Save Song</button>
          </div>
        </div>
      </div>

      <div v-else>
        <div v-if="tab === 'ai'" class="ai-tab">
          <AiSongImport @generated="handleAiGenerated" @error="handleAiError" />
          <div v-if="aiError" class="ai-error-notice">{{ aiError }}</div>
        </div>

        <div v-if="tab === 'url'" class="import-form">
          <div class="form-group">
            <label>Song URL</label>
            <div class="url-input-row">
              <input
                v-model="urlInput"
                type="url"
                placeholder="Paste YouTube, Apple Music, or other link..."
                :class="{ 'input-error': urlError }"
                @input="onUrlInput"
              />
              <button
                v-if="urlInfo"
                class="btn btn-sm btn-secondary detect-btn"
                @click="fillFromUrl"
              >
                {{
                  urlInfo.platform === 'youtube'
                    ? 'YouTube'
                    : urlInfo.platform === 'apple_music'
                      ? 'Apple Music'
                      : 'Link Detected'
                }}
              </button>
            </div>
            <div v-if="urlError" class="input-hint error">{{ urlError }}</div>
            <div v-if="urlInfo && urlInfo.platform !== 'unknown'" class="input-hint success">
              Detected: {{ getPlatformLabel(urlInfo.platformType) }}
            </div>
          </div>

          <div
            v-if="urlInfo && urlInfo.platform === 'youtube' && urlInfo.id"
            class="youtube-preview"
          >
            <img
              :src="urlInfo.thumbnailUrl || ''"
              alt=""
              class="youtube-thumb"
              @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
            />
            <div class="youtube-info">
              <span class="platform-badge youtube-badge">YouTube</span>
              <span class="video-id">Video: {{ urlInfo.id }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>Title</label>
            <input v-model="urlForm.title" type="text" placeholder="Song title" />
          </div>
          <div class="form-group">
            <label>Artist</label>
            <input v-model="urlForm.artist" type="text" placeholder="Artist name" />
          </div>
          <div class="form-group">
            <label>BPM (Tempo)</label>
            <input
              v-model.number="urlForm.bpm"
              type="number"
              placeholder="120"
              min="40"
              max="300"
            />
          </div>
          <div class="form-group">
            <label
              >Chords & Lyrics
              <span class="hint">(paste ChordPro, simple chords, or lyrics below)</span></label
            >
            <textarea
              v-model="urlForm.content"
              rows="8"
              :placeholder="chordProPlaceholder"
            ></textarea>
            <div class="format-hints">
              <button
                v-for="fmt in ['ChordPro', 'Simple Chords', 'Timed Lyrics', 'Lyrics+Chords']"
                :key="fmt"
                class="hint-btn"
                @click="insertFormatExample(fmt)"
              >
                {{ fmt }}
              </button>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn btn-secondary" @click="handleClose">Cancel</button>
            <button
              class="btn btn-primary"
              :disabled="!urlForm.title.trim() && !urlForm.content.trim()"
              @click="parseFromUrl"
            >
              Parse & Preview
            </button>
          </div>
        </div>

        <div v-if="tab === 'chordpro'" class="import-form">
          <div class="form-group">
            <label
              >ChordPro Notation
              <span class="hint"
                >(supports {title}, {artist}, [Chord] inline, sections)</span
              ></label
            >
            <textarea
              v-model="chordProInput"
              rows="14"
              :placeholder="chordProFullExample"
            ></textarea>
          </div>
          <div class="form-actions">
            <button class="btn btn-secondary" @click="handleClose">Cancel</button>
            <button
              class="btn btn-primary"
              :disabled="!chordProInput.trim()"
              @click="handleChordProImport"
            >
              Parse ChordPro
            </button>
          </div>
        </div>

        <div v-if="tab === 'manual'" class="import-form">
          <div class="form-row">
            <div class="form-group">
              <label>Title</label>
              <input v-model="manualForm.title" type="text" placeholder="Song title" />
            </div>
            <div class="form-group">
              <label>Artist</label>
              <input v-model="manualForm.artist" type="text" placeholder="Artist name" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group form-group-sm">
              <label>BPM</label>
              <input
                v-model.number="manualForm.bpm"
                type="number"
                placeholder="120"
                min="40"
                max="300"
              />
            </div>
          </div>
          <div class="form-group">
            <label>Chords <span class="hint">(name + beats per line)</span></label>
            <textarea
              v-model="manualForm.chords"
              rows="6"
              placeholder="G 4&#10;Em 4&#10;C 4&#10;D 4"
            ></textarea>
          </div>
          <div class="form-group">
            <label>Lyrics <span class="hint">(optional, one line per lyric line)</span></label>
            <textarea
              v-model="manualForm.lyrics"
              rows="6"
              placeholder="Today is gonna be the day&#10;That they're gonna throw it back to you"
            ></textarea>
          </div>
          <div class="form-actions">
            <button class="btn btn-secondary" @click="handleClose">Cancel</button>
            <button class="btn btn-primary" :disabled="!manualForm.title.trim()" @click="addManual">
              Add Song
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Song } from '../stores/useStore'
import {
  validateUrl,
  getPlatformLabel,
} from '../services/urlParserService.js'
import {
  parseChordPro as parseChordProLib,
  parseSimpleChords,
  parseLyricsWithChords,
  detectFormat,
} from '../services/chordParserService.js'
import {
  detectChordsForSong,
  generateSectionsFromChords,
} from '../services/chordDetectionService.js'
import { importFromUrl, createManualSong } from '../services/songImportService.js'
import { generateNotesFromChords, generateTabsWithAI } from '../services/chordToNotesService'
import { useStore } from '../stores/useStore'
import AiSongImport from './AiSongImport.vue'

const emit = defineEmits(['close', 'saved'])

const { addSong: addSongToStore } = useStore()

const tab = ref('ai')
const parsing = ref(false)
const preview = ref(null)
const editing = ref(false)
const parseWarnings = ref([])
const aiError = ref('')
const urlInput = ref('')
const urlInfo = ref(null)
const urlError = ref('')
const urlForm = ref({ title: '', artist: '', bpm: 120, content: '' })

const chordProInput = ref('')
const manualForm = ref({ title: '', artist: '', bpm: 120, chords: '', lyrics: '' })

const editData = ref({
  title: '',
  artist: '',
  bpm: 120,
  chordsText: '',
  lyricsText: '',
  sourceUrl: '',
})

const chordProPlaceholder = `{title: Wonderwall}
{artist: Oasis}

{start_of_verse: Verse 1}
[Em]Today is gonna be the day
[G]That they're gonna throw it [D]back to you
{end_of_verse}

{start_of_chorus: Chorus}
[C]Maybe you're gonna be the [D]one that saves me
{end_of_chorus}}`

const chordProFullExample = `{title: Song Title}
{artist: Artist Name}

{start_of_verse: Verse 1}
[Am]First line of [F]lyrics
[C]Second line [G]here
{end_of_verse}

{start_of_chorus: Chorus}
[C]Chorus line [G]one
[Am]Chorus line [F]two
{end_of_chorus}}`

function handleAiGenerated(content) {
  aiError.value = ''
  const parsed = parseChordProContent(content)
  if (parsed) {
    preview.value = createManualSong({
      title: parsed.title || 'Imported Song',
      artist: parsed.artist || 'Unknown',
      bpm: 120,
      content: content,
      chords: parsed.chords,
      lyrics: parsed.lyrics,
      sections: parsed.sections,
    })
    parseWarnings.value = []
  } else {
    preview.value = createManualSong({
      title: 'Imported Song',
      artist: 'Unknown',
      bpm: 120,
      content: content,
    })
    parseWarnings.value = ['Could not fully parse AI output. You can edit the song after saving.']
  }
}

function handleAiError(err) {
  aiError.value = err
}

async function runChordDetection() {
  if (!preview.value) return
  const result = await detectChordsForSong({
    lyrics: preview.value.lyrics,
    bpm: preview.value.bpm,
    chords: preview.value.chords,
  })
  if (result.chords && result.chords.length > 0) {
    preview.value.chords = result.chords
    preview.value.chordsAutoDetected = result.confidence < 1
    preview.value.sections = preview.value.sections.length
      ? preview.value.sections
      : generateSectionsFromChords(result.chords, preview.value.lyrics)
  }
}

function detectSections() {
  if (!preview.value || !preview.value.chords.length) return
  const sections = generateSectionsFromChords(preview.value.chords, preview.value.lyrics)
  preview.value.sections = sections
}

function onUrlInput() {
  if (!urlInput.value.trim()) {
    urlInfo.value = null
    urlError.value = ''
    return
  }
  const result = validateUrl(urlInput.value)
  if (result.valid && result.info) {
    urlInfo.value = result.info
    urlError.value = ''
  } else if (result.error) {
    urlInfo.value = null
    urlError.value = result.error
  }
}

function fillFromUrl() {}

function insertFormatExample(format) {
  switch (format) {
    case 'ChordPro':
      urlForm.value.content = `{title: Song Title}\n{artist: Artist}\n\n[Am]First line [F]here\n[C]Second line [G]here`
      break
    case 'Simple Chords':
      urlForm.value.content = 'G 4\nEm 4\nC 4\nD 4'
      break
    case 'Timed Lyrics':
      urlForm.value.content = '[0:00] First line\n[0:05] Second line\n[0:10] Third line'
      break
    case 'Lyrics+Chords':
      urlForm.value.content = 'G          Em\nFirst line here\nC          D\nSecond line here'
      break
  }
}

async function parseFromUrl() {
  parsing.value = true
  parseWarnings.value = []
  try {
    const result = await importFromUrl(urlInput.value, {
      title: urlForm.value.title,
      artist: urlForm.value.artist,
      bpm: urlForm.value.bpm,
      content: urlForm.value.content,
    })
    if (result.warnings.length) parseWarnings.value = result.warnings
    preview.value = result.data
  } catch {
    parseWarnings.value = ['Failed to parse song data. You can edit manually.']
    preview.value = createManualSong({
      title: urlForm.value.title || 'Untitled Song',
      artist: urlForm.value.artist || 'Unknown',
      bpm: urlForm.value.bpm,
      sourceUrl: urlInput.value,
      content: urlForm.value.content,
    })
  }
  parsing.value = false
}

function parseChordProContent(input) {
  if (!input || !input.trim()) return null
  const format = detectFormat(input)
  if (format === 'chordpro') {
    const result = parseChordProLib(input)
    if (result) return result
  }
  if (format === 'simple_chords') {
    const chords = parseSimpleChords(input)
    if (chords) return { chords, lyrics: [], sections: [], title: '', artist: '' }
  }
  if (format === 'lyrics_with_chords') {
    const lyrics = parseLyricsWithChords(input)
    if (lyrics) return { chords: [], lyrics, sections: [], title: '', artist: '' }
  }
  const lines = input
    .trim()
    .split('\n')
    .filter((l) => l.trim())
  if (lines.length > 0) {
    return {
      chords: [],
      lyrics: lines.map((text, i) => ({
        text: text.trim(),
        chords: [],
        time: null,
        section: null,
        beatPosition: i * 4,
      })),
      sections: [],
      title: '',
      artist: '',
    }
  }
  return null
}

function handleChordProImport() {
  const parsed = parseChordProContent(chordProInput.value)
  if (parsed) {
    preview.value = createManualSong({
      title: parsed.title || 'Imported Song',
      artist: parsed.artist || 'Unknown',
      bpm: 120,
      content: chordProInput.value,
      chords: parsed.chords,
      lyrics: parsed.lyrics,
      sections: parsed.sections,
    })
    parseWarnings.value = []
  } else {
    parseWarnings.value = ['Could not parse the input. Please check the format.']
    preview.value = createManualSong({
      title: 'Imported Song',
      artist: 'Unknown',
      bpm: 120,
      content: chordProInput.value,
    })
  }
}

function addManual() {
  if (!manualForm.value.title.trim()) return
  const parsed = createManualSong({
    title: manualForm.value.title,
    artist: manualForm.value.artist,
    bpm: manualForm.value.bpm,
    content: manualForm.value.chords,
    sourceUrl: '',
  })
  if (manualForm.value.lyrics.trim()) {
    const lines = manualForm.value.lyrics
      .trim()
      .split('\n')
      .filter((l) => l.trim())
    parsed.lyrics = lines.map((text, i) => ({
      text: text.trim(),
      chords: [],
      time: null,
      section: null,
      beatPosition: i * 4,
    }))
  }
  preview.value = parsed
  parseWarnings.value = []
}

function editPreview() {
  if (!preview.value) return
  editing.value = true
  editData.value = {
    title: preview.value.title,
    artist: preview.value.artist,
    bpm: preview.value.bpm,
    chordsText: preview.value.chords.map((c) => `${c.name} ${c.duration}`).join('\n'),
    lyricsText: (preview.value.lyrics || [])
      .map((l) => {
        const chordStr = l.chords && l.chords.length ? `[${l.chords.join('][')}]` : ''
        return chordStr ? `${chordStr}${l.text || l}` : l.text || l
      })
      .join('\n'),
    sourceUrl: preview.value.sourceUrl || '',
  }
}

function cancelEdit() {
  editing.value = false
}

function saveEditedSong() {
  const chordsLines = editData.value.chordsText
    .trim()
    .split('\n')
    .filter((l) => l.trim())
  const chords = []
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

  const lyricsLines = editData.value.lyricsText
    .trim()
    .split('\n')
    .filter((l) => l.trim())
  const lyrics = lyricsLines.map((text, i) => {
    const chordMatch = text.match(/^\[([^\]]+)\]/)
    const cleanText = text.replace(/\[([^\]]+)\]/g, '')
    return {
      text: cleanText.trim(),
      chords: chordMatch ? chordMatch[1].split('][') : [],
      time: null,
      section: null,
      beatPosition: i * 4,
    }
  })

  const songData = {
    ...preview.value,
    title: editData.value.title,
    artist: editData.value.artist,
    bpm: editData.value.bpm,
    chords,
    lyrics,
    sourceUrl: editData.value.sourceUrl,
    totalTime:
      chords.length > 0
        ? (chords[chords.length - 1].position + chords[chords.length - 1].duration) *
          (60 / editData.value.bpm)
        : 0,
  }

  if (!songData.sections || songData.sections.length === 0) {
    songData.sections = generateSectionsFromChords(chords, lyrics)
  }

  const song = addSongToStore(songData)
  emit('saved', song)
  handleClose()
}

// Notes are automatically generated from chords when saving
// See savePreview() function below

async function savePreview() {
  if (!preview.value) return

  const songData = { ...preview.value }

  if (
    (!songData.chords || songData.chords.length === 0) &&
    songData.lyrics &&
    songData.lyrics.length > 0
  ) {
    const detection = await detectChordsForSong({
      lyrics: songData.lyrics,
      bpm: songData.bpm,
    })
    songData.chords = detection.chords
    songData.chordsAutoDetected = detection.wasModified
    parseWarnings.value.push('Chords auto-detected from lyrics')
  }

  if (
    (!songData.sections || songData.sections.length === 0) &&
    songData.chords &&
    songData.chords.length > 0
  ) {
    songData.sections = generateSectionsFromChords(songData.chords, songData.lyrics)
  }

  if (!songData.notes || songData.notes.length === 0) {
    songData.notes = generateNotesFromChords(songData.chords, songData.bpm)
  }

  // Try to generate lead notes and parts via AI. This is async but we save synchronously -
  // lead notes and parts will be fetched separately if the AI call succeeds.
  if (!songData.leadNotes || songData.leadNotes.length === 0) {
    const songForAI = {
      title: songData.title,
      artist: songData.artist,
      bpm: songData.bpm,
      chords: songData.chords || [],
    }
    generateTabsWithAI(songForAI).then((result: { leadNotes?: Song['leadNotes']; parts?: Song['parts'] }) => {
      const updates: Partial<Song> = {}
      if (result.leadNotes && result.leadNotes.length > 0) updates.leadNotes = result.leadNotes
      if (result.parts && result.parts.length > 0) updates.parts = result.parts
      if (Object.keys(updates).length > 0) {
        const store = useStore()
        store.updateSong(songData.id, updates)
      }
    }).catch(() => {})
  }

  const song = addSongToStore(songData)
  emit('saved', song)
  handleClose()
}

function handleClose() {
  tab.value = 'ai'
  parsing.value = false
  preview.value = null
  editing.value = false
  parseWarnings.value = []
  aiError.value = ''
  urlInput.value = ''
  urlInfo.value = null
  urlError.value = ''
  urlForm.value = { title: '', artist: '', bpm: 120, content: '' }
  chordProInput.value = ''
  manualForm.value = { title: '', artist: '', bpm: 120, chords: '', lyrics: '' }
  emit('close')
}
</script>

<style scoped>
.import-modal {
  max-width: 640px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}
.modal {
  animation: fadeIn 0.2s ease;
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
.import-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  border: none;
  transition: all var(--transition);
}
.tab-btn:hover {
  background: var(--bg-card-hover);
}
.tab-btn.active {
  background: var(--bg-highlight);
  color: #fff;
}
.ai-tab {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ai-error-notice {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  color: #f87171;
  font-size: 13px;
}
.import-form {
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
.hint {
  font-weight: 400;
  color: var(--text-tertiary);
  font-size: 12px;
}
.form-group input,
.form-group textarea,
.form-group select {
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
  margin-top: 8px;
}
.url-input-row {
  display: flex;
  gap: 8px;
}
.url-input-row input {
  flex: 1;
}
.input-error {
  border-color: var(--bg-danger) !important;
}
.input-hint {
  font-size: 12px;
  margin-top: 2px;
}
.input-hint.error {
  color: var(--bg-danger);
}
.input-hint.success {
  color: var(--bg-success);
}
.detect-btn {
  white-space: nowrap;
}
.youtube-preview {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: 4px;
}
.youtube-thumb {
  width: 120px;
  height: 67px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
}
.youtube-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.platform-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.youtube-badge {
  background: #fee2e2;
  color: #dc2626;
}
[data-theme='dark'] .youtube-badge {
  background: #7f1d1d;
  color: #fca5a5;
}
.video-id {
  font-size: 12px;
  color: var(--text-tertiary);
}
.format-hints {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.hint-btn {
  padding: 3px 8px;
  font-size: 11px;
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  cursor: pointer;
  border: 1px solid var(--border-color);
  transition: all var(--transition);
}
.hint-btn:hover {
  background: var(--bg-highlight-light);
  color: var(--bg-highlight);
  border-color: var(--bg-highlight);
}
.parsing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  gap: 16px;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--bg-highlight);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.parsing-state p {
  color: var(--text-secondary);
  font-size: 14px;
}
.preview-state {
  animation: fadeIn 0.2s ease;
}
.preview-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}
.preview-actions-top {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.preview-actions-top .btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.preview-card {
  margin-bottom: 16px;
}
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.preview-song-title {
  font-size: 18px;
  font-weight: 700;
}
.preview-artist {
  font-size: 14px;
  color: var(--text-secondary);
}
.preview-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}
.preview-embed {
  margin: 12px 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  aspect-ratio: 16/9;
}
.preview-embed iframe {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
.preview-chords {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.preview-chord {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}
.preview-more {
  font-size: 12px;
  color: var(--text-tertiary);
  padding: 3px 8px;
}
.preview-lyrics {
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: 12px;
  max-height: 160px;
  overflow-y: auto;
}
.preview-lyric-line {
  margin-bottom: 4px;
  font-size: 13px;
  line-height: 1.5;
}
.preview-line-chords {
  color: var(--bg-highlight);
  font-weight: 600;
  margin-right: 8px;
}
.preview-line-text {
  color: var(--text-secondary);
}
.preview-warnings {
  padding: 12px;
  background: #fef3c7;
  border-radius: var(--radius-md);
  margin-bottom: 12px;
}
[data-theme='dark'] .preview-warnings {
  background: #78350f;
}
.warning-item {
  font-size: 13px;
  color: #92400e;
}
[data-theme='dark'] .warning-item {
  color: #fcd34d;
}
.preview-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.editing-state {
  animation: fadeIn 0.2s ease;
}
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.badge {
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.badge-manual {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}
.badge-youtube {
  background: #fee2e2;
  color: #dc2626;
}
.badge-apple_music {
  background: #fce7f3;
  color: #be185d;
}
.badge-link {
  background: #dbeafe;
  color: #2563eb;
}
[data-theme='dark'] .badge-youtube {
  background: #7f1d1d;
  color: #fca5a5;
}
[data-theme='dark'] .badge-apple_music {
  background: #831843;
  color: #f9a8d4;
}
[data-theme='dark'] .badge-link {
  background: #1e3a5f;
  color: #93c5fd;
}
.chip {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-weight: 500;
}
</style>
