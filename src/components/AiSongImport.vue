<template>
  <div class="ai-import">
    <div class="ai-import-header">
      <h3 class="ai-import-title">AI Song Import</h3>
      <span class="ai-import-badge">OpenCode</span>
    </div>

    <p class="ai-import-desc">
      Paste a song link or lyrics. OpenCode will generate chords, melody notes, strumming pattern, and BPM.
    </p>
    <p class="ai-import-hint">Note: If AI is unavailable, use "Manual" or "URL" tab to import.</p>

    <div class="ai-import-fields">
      <div class="form-group">
        <label>Song Link</label>
        <input
          v-model="songLink"
          type="url"
          placeholder="YouTube, Apple Music, or Spotify URL"
          :disabled="generating"
        />
        <span class="field-hint">Optional — helps identify the song</span>
      </div>

      <div class="form-group">
        <label>Lyrics</label>
        <textarea
          v-model="lyrics"
          rows="6"
          placeholder="Paste lyrics here to improve chord accuracy..."
          :disabled="generating"
        />
        <span class="field-hint">Adding lyrics produces better results</span>
      </div>

      <button class="ai-import-generate" :disabled="!canGenerate || generating" @click="generate">
        <span v-if="generating" class="spinner"></span>
        {{ generating ? 'Generating...' : 'Generate ChordPro' }}
      </button>

      <div v-if="generating" class="ai-import-progress">
        <div class="progress-bar-indeterminate">
          <div class="progress-fill-indeterminate"></div>
        </div>
        <p class="progress-message">{{ currentMessage }}</p>
      </div>

      <div v-if="error" class="ai-import-error">{{ error }}</div>

      <div v-if="searchResults.length" class="search-results">
        <h4>Found ChordPro Files</h4>
        <div
          v-for="(url, i) in searchResults"
          :key="i"
          class="search-result"
          @click="fetchChordPro(url)"
        >
          {{ url }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const emit = defineEmits(['generated', 'error'])

const songLink = ref('')
const lyrics = ref('')
const generating = ref(false)
const error = ref('')
const currentMessage = ref('')
const searchResults = ref([])

const canGenerate = computed(() => songLink.value.trim() || lyrics.value.trim())

const MESSAGES = [
  'Analyzing song structure...',
  'Identifying chord progressions...',
  'Matching chords to lyrics...',
  'Determining strumming pattern...',
  'Calculating BPM and key...',
  'Generating ChordPro markup...',
  'Verifying musical accuracy...',
  'Almost there, finalizing...',
]

let messageInterval = null

function startMessages() {
  let i = 0
  currentMessage.value = MESSAGES[0]
  messageInterval = setInterval(() => {
    i = (i + 1) % MESSAGES.length
    currentMessage.value = MESSAGES[i]
  }, 3000)
}

function stopMessages() {
  if (messageInterval) {
    clearInterval(messageInterval)
    messageInterval = null
  }
  currentMessage.value = ''
}

onUnmounted(() => stopMessages())

async function fetchChordPro(url) {
  try {
    const response = await fetch('/api/fetch-chordpro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    const data = await response.json()
    if (data.content) {
      emit('generated', data.content)
    } else if (data.error) {
      error.value = data.error
    }
  } catch (e) {
    error.value = e.message || 'Failed to fetch ChordPro file.'
  }
}

async function generate() {
  error.value = ''
  generating.value = true
  startMessages()

  try {
    const response = await fetch('/api/generate-chords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        link: songLink.value.trim(),
        lyrics: lyrics.value.trim(),
      }),
    })

    const data = await response.json()

    if (data.error) {
      error.value = data.error
      return
    }

    if (data.content) {
      emit('generated', data.content)
    } else {
      error.value = 'No content returned from OpenCode.'
    }
  } catch {
    error.value = 'AI service unavailable. Try importing manually or use URL import.'
    generating.value = false
    stopMessages()
  }
}
</script>

<style scoped>
.ai-import {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
}
.ai-import-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.ai-import-title {
  font-size: 16px;
  font-weight: 700;
}
.ai-import-badge {
  background: linear-gradient(135deg, var(--bg-highlight), #818cf8);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 3px 10px;
  border-radius: 4px;
}
.ai-import-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 16px;
}
.ai-import-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}
.form-group input,
.form-group textarea {
  width: 100%;
}
.form-group textarea {
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  min-height: 100px;
}
.field-hint {
  font-size: 11px;
  color: var(--text-tertiary);
}
.ai-import-generate {
  background: linear-gradient(135deg, var(--bg-highlight), #818cf8);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  padding: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    opacity 0.2s,
    transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.ai-import-generate:not(:disabled):hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
.ai-import-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
.ai-import-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.progress-bar-indeterminate {
  width: 100%;
  height: 3px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}
.progress-fill-indeterminate {
  height: 100%;
  width: 40%;
  background: linear-gradient(90deg, var(--bg-highlight), #818cf8);
  border-radius: 2px;
  animation: progress-slide 2s ease-in-out infinite;
}
.progress-message {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  animation: pulse-text 3s ease-in-out infinite;
}
.ai-import-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  color: #f87171;
  font-size: 13px;
}
.ai-import-hint {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-bottom: 16px;
  font-style: italic;
}
.search-results {
  margin-top: 8px;
}
.search-results h4 {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}
.search-result {
  padding: 8px 12px;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  font-size: 12px;
  color: var(--bg-highlight);
  cursor: pointer;
  word-break: break-all;
  transition: background var(--transition);
  margin-bottom: 4px;
}
.search-result:hover {
  background: var(--bg-card-hover);
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes progress-slide {
  0% {
    width: 10%;
    margin-left: 0;
  }
  50% {
    width: 50%;
    margin-left: 25%;
  }
  100% {
    width: 10%;
    margin-left: 90%;
  }
}
@keyframes pulse-text {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>
