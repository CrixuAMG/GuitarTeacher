<template>
  <div class="hero-mode-view">
    <div v-if="!isPlaying" class="setup-screen">
      <div class="setup-content card">
        <h1>{{ $t('heroMode.title') }}</h1>
        <p class="subtitle">{{ $t('heroMode.subtitle') }}</p>

        <div v-if="song" class="song-selection">
          <h3>{{ song.title }}</h3>
          <p>{{ song.artist }}</p>
          <button class="btn btn-sm btn-secondary change-song-btn" @click="showSongModal = true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20V10M12 10L18 16M12 10L6 16"/>
            </svg>
            {{ $t('heroMode.changeSong') }}
          </button>
        </div>
        <div v-else class="song-selection empty">
          <p>{{ $t('heroMode.noSong') }}</p>
          <button class="btn btn-primary" @click="showSongModal = true">
            {{ $t('heroMode.chooseSong') }}
          </button>
        </div>

        <div class="settings">
          <h4>{{ $t('heroMode.settings') }}</h4>

          <div v-if="hasLeadNotes" class="setting-row">
            <label>{{ $t('heroMode.playMode') }}</label>
            <div class="difficulty-buttons">
              <button
                class="btn btn-sm"
                :class="{ 'btn-primary': playMode === 'rhythm', 'btn-secondary': playMode !== 'rhythm' }"
                @click="playMode = 'rhythm'"
              >
                {{ $t('heroMode.rhythm') }}
              </button>
              <button
                class="btn btn-sm"
                :class="{ 'btn-primary': playMode === 'lead', 'btn-secondary': playMode !== 'lead' }"
                @click="playMode = 'lead'"
              >
{{ $t('heroMode.lead') }}
              </button>
            </div>
          </div>

          <div v-if="songParts.length > 0 && playMode === 'lead'" class="setting-row">
            <label>{{ $t('heroMode.riffSection') }}</label>
            <div class="difficulty-buttons riff-buttons">
              <button
                class="btn btn-sm"
                :class="{ 'btn-primary': selectedPart === null, 'btn-secondary': selectedPart !== null }"
                @click="selectedPart = null"
              >
                {{ $t('heroMode.all') }}
              </button>
              <button
                v-for="part in songParts"
                :key="part.id"
                class="btn btn-sm"
                :class="{ 'btn-primary': selectedPart?.id === part.id, 'btn-secondary': selectedPart?.id !== part.id }"
                @click="selectedPart = part"
              >
                {{ part.name }}
              </button>
            </div>
          </div>

          <div class="setting-row">
            <label>{{ $t('heroMode.difficulty') }}</label>
            <div class="difficulty-buttons">
              <button
                v-for="diff in difficulties"
                :key="diff.value"
                class="btn btn-sm"
                :class="{
                  'btn-primary': settings.difficulty === diff.value,
                  'btn-secondary': settings.difficulty !== diff.value,
                }"
                @click="settings.difficulty = diff.value"
              >
                {{ $t(diff.label) }}
              </button>
            </div>
          </div>

          <div class="setting-row">
            <label>{{ $t('heroMode.noteSpeed') }}</label>
            <input
              v-model.number="settings.noteSpeed"
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
            />
            <span class="speed-value">{{ settings.noteSpeed }}x</span>
          </div>

          <div class="setting-row">
            <label class="checkbox-label">
              <input v-model="settings.waitForInput" type="checkbox" />
              <span>{{ $t('heroMode.waitForInput') }}</span>
            </label>
          </div>

          <div class="setting-row">
            <label class="checkbox-label">
              <input v-model="settings.showFretNumbers" type="checkbox" />
              <span>{{ $t('heroMode.showFretNumbers') }}</span>
            </label>
          </div>

          <div class="setting-row">
            <label class="checkbox-label">
              <input v-model="settings.audioInputEnabled" type="checkbox" />
              <span>{{ $t('heroMode.enableMic') }}</span>
            </label>
          </div>
        </div>

        <div v-if="settings.audioInputEnabled" class="audio-test">
          <button class="btn btn-secondary" :disabled="isTestingAudio" @click="testMicrophone">
            {{ isTestingAudio ? $t('heroMode.testing') : $t('heroMode.testMicrophone') }}
          </button>
          <p v-if="audioTestResult" class="test-result" :class="audioTestResult.status">
            {{ audioTestResult.message }}
          </p>
        </div>

        <div class="actions">
          <button class="btn btn-primary btn-lg" :disabled="!song" @click="startGame">
            {{ $t('heroMode.startPlaying') }}
          </button>
          <button class="btn btn-secondary" @click="showSongModal = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20V10M12 10L18 16M12 10L6 16"/>
            </svg>
            {{ $t('heroMode.chooseDifferentSong') }}
          </button>
        </div>

        <div class="instructions">
          <h4>{{ $t('heroMode.howToPlay') }}</h4>
          <ul>
            <li v-if="playMode === 'rhythm'">{{ $t('heroMode.howToPlayRhythm') }}</li>
            <li v-else>{{ $t('heroMode.howToPlayLead') }}</li>
            <li>{{ $t('heroMode.pressSpace') }}</li>
            <li>{{ $t('heroMode.enableFretNumbers') }}</li>
            <li>{{ $t('heroMode.playRealChords') }}</li>
            <li>{{ $t('heroMode.perfectTiming') }}</li>
            <li>{{ $t('heroMode.comboMultiplier') }}</li>
          </ul>
        </div>
      </div>
    </div>

    <GuitarHeroView
      v-else
      :song="activeSong!"
      :difficulty="settings.difficulty"
      :note-speed="settings.noteSpeed"
      :wait-for-input="settings.waitForInput"
      :show-fret-numbers="settings.showFretNumbers"
      :play-mode="playMode"
      @complete="onGameComplete"
      @exit="onGameExit"
    />

    <SongPickerModal
      v-model="showSongModal"
      :current-song="song"
      @select="onSongSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from '@/stores/useStore'
import GuitarHeroView from '@/components/GuitarHeroView.vue'
import SongPickerModal from '@/components/SongPickerModal.vue'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import type { Song, SongPart, GameDifficulty, GuitarHeroSettings, GameStats } from '@/types'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const store = useStore()

const song = ref<Song | null>(null)
const isPlaying = ref(false)
const isTestingAudio = ref(false)
const audioTestResult = ref<{ status: 'success' | 'error'; message: string } | null>(null)
const showSongModal = ref(false)

const difficulties: { value: GameDifficulty; label: string }[] = [
  { value: 'easy', label: 'heroMode.easy' },
  { value: 'medium', label: 'heroMode.medium' },
  { value: 'hard', label: 'heroMode.hard' },
  { value: 'expert', label: 'heroMode.expert' },
]

const settings = ref<GuitarHeroSettings>({
  difficulty: 'medium',
  noteSpeed: 1.0,
  waitForInput: true,
  audioInputEnabled: true,
  showFretNumbers: false,
})

const playMode = ref<'rhythm' | 'lead'>('rhythm')
const selectedPart = ref<SongPart | null>(null)

useKeyboardShortcuts({
  onPlayPause: () => {
    if (isPlaying.value) {
      isPlaying.value = false
    } else if (song.value) {
      startGame()
    }
  },
  onEscape: () => {
    if (isPlaying.value) {
      isPlaying.value = false
    } else {
      router.back()
    }
  },
})

const songParts = computed(() => {
  if (!song.value?.parts) return []
  return song.value.parts.filter(p => ['riff', 'solo', 'lead', 'melody', 'intro'].includes(p.type))
})

const hasLeadNotes = computed(() => {
  if (!song.value) return false
  return !!(
    (song.value.leadNotes && song.value.leadNotes.length > 0) ||
    (song.value.parts && song.value.parts.some(p => p.type === 'lead' || p.type === 'solo' || p.type === 'riff' || p.type === 'melody'))
  )
})

onMounted(() => {
  const songId = route.params.id as string
  if (songId) {
    const foundSong = store.getSong(songId)
    if (foundSong) {
      song.value = foundSong as Song
    }
  }

  // If no song, use default demo song
  if (!song.value) {
    song.value = {
      id: 'demo',
      title: 'Wonderwall',
      artist: 'Oasis',
      bpm: 88,
      totalTime: 48,
      chords: [
        { name: 'Em', duration: 4, position: 0 },
        { name: 'G', duration: 4, position: 4 },
        { name: 'D', duration: 4, position: 8 },
        { name: 'A', duration: 4, position: 12 },
        { name: 'Em', duration: 4, position: 16 },
        { name: 'G', duration: 4, position: 20 },
        { name: 'D', duration: 4, position: 24 },
        { name: 'A', duration: 4, position: 28 },
        { name: 'C', duration: 4, position: 32 },
        { name: 'D', duration: 4, position: 36 },
        { name: 'Em', duration: 4, position: 40 },
        { name: 'G', duration: 4, position: 44 },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
  }
})

async function testMicrophone() {
  isTestingAudio.value = true
  audioTestResult.value = null

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((track) => track.stop())
    audioTestResult.value = {
      status: 'success',
      message: t('heroMode.micSuccess'),
    }
  } catch {
    audioTestResult.value = {
      status: 'error',
      message: t('heroMode.micError'),
    }
  } finally {
    isTestingAudio.value = false
  }
}

function startGame() {
  isPlaying.value = true
}

const activeSong = computed(() => {
  if (!song.value) return null
  if (!selectedPart.value || playMode.value !== 'lead') return song.value
  const part = selectedPart.value
  const partNotes = part.notes || []
  return {
    ...song.value,
    leadNotes: partNotes,
    parts: [part],
  }
})

function onSongSelected(selectedSong: Song) {
  song.value = selectedSong
}

function onGameComplete(_stats: GameStats) {
  // Could show a completion screen or return to setup
  isPlaying.value = false
}

function onGameExit() {
  isPlaying.value = false
}
</script>

<style scoped>
.hero-mode-view {
  min-height: 100vh;
  background: var(--bg-primary);
}

.setup-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.setup-content {
  max-width: 600px;
  width: 100%;
  padding: 40px;
}

.setup-content h1 {
  font-size: 32px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 8px;
}

.subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.song-selection {
  background: var(--bg-tertiary);
  padding: 20px;
  border-radius: var(--radius-lg);
  text-align: center;
  margin-bottom: 32px;
}

.song-selection.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.song-selection h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.song-selection p {
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.change-song-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.settings {
  margin-bottom: 32px;
}

.settings h4 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.setting-row label {
  font-weight: 600;
  min-width: 120px;
}

.difficulty-buttons {
  display: flex;
  gap: 8px;
}

input[type='range'] {
  flex: 1;
  min-width: 150px;
}

.speed-value {
  font-weight: 700;
  color: var(--bg-highlight);
  min-width: 50px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: var(--bg-highlight);
}

.audio-test {
  margin-bottom: 32px;
}

.test-result {
  margin-top: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
}

.test-result.success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--bg-success);
}

.test-result.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--bg-danger);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.actions .btn {
  justify-content: center;
}

.instructions {
  background: var(--bg-tertiary);
  padding: 20px;
  border-radius: var(--radius-lg);
}

.instructions h4 {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  color: var(--text-secondary);
}

.instructions ul {
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

@media (max-width: 600px) {
  .setup-content {
    padding: 24px;
  }

  .setting-row {
    flex-direction: column;
    align-items: flex-start;
  }

  input[type='range'] {
    width: 100%;
  }
}

.riff-buttons {
  flex-wrap: wrap;
}
</style>
