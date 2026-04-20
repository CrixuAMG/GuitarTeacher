<template>
  <div class="player-view">
    <div class="player-container">
      <!-- Main Player Area -->
      <div class="player-main">
        <SongPlayer
          ref="playerRef"
          :song="song"
          :preferences="preferences"
          @progress="onProgress"
          @open-source="openSource"
          @loop-change="onLoopChange"
        />
      </div>

      <!-- Sidebar -->
      <aside v-if="song" class="player-sidebar">
        <!-- Current Chord Info -->
        <div v-if="currentChord" class="sidebar-card">
          <h4 class="sidebar-title">{{ $t('player.currentChord') }}</h4>
          <div class="current-chord-mini">
            <Fretboard :chord="currentChord" />
            <div class="mini-chord-info">
              <div class="mini-name">{{ currentChord.name }}</div>
              <div class="mini-full">{{ currentChord.fullName }}</div>
            </div>
          </div>
          <div class="string-fingerings">
            <div v-for="(fret, i) in currentChord.strings" :key="i" class="finger-row">
              <span class="string-label">{{ STRING_NAMES[5-i] }}</span>
              <span class="fret-val">{{ fret === -1 ? '✕' : fret === 0 ? '○' : fret }}</span>
              <span v-if="fret > 0" class="finger-num">{{ currentChord.fingers[i] }}</span>
            </div>
          </div>
        </div>

        <!-- Song List -->
        <div class="sidebar-card">
          <h4 class="sidebar-title">{{ $t('player.yourSongs') }}</h4>
          <div class="song-list">
            <div
              v-for="s in songs"
              :key="s.id"
              class="song-item"
              :class="{ active: s.id === song?.id }"
              @click="selectSong(s.id)"
            >
              <div class="song-item-info">
                <div class="song-item-title">{{ s.title }}</div>
                <div class="song-item-artist">{{ s.artist }}</div>
              </div>
              <div class="song-item-meta">
                <span class="meta-badge">{{ s.chords.length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Song Info -->
        <div class="sidebar-card">
          <h4 class="sidebar-title">{{ $t('player.songInfo') }}</h4>
          <div class="info-list">
            <div class="info-row">
              <span class="info-label">{{ $t('player.tempo') }}</span>
              <span class="info-value">{{ $t('library.bpm', { bpm: song?.bpm }) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('player.chords') }}</span>
              <span class="info-value">{{ song?.chords.length }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('player.source') }}</span>
              <span class="info-value">{{ getSourceLabel() }}</span>
            </div>
          </div>
          <div class="sidebar-actions">
            <button class="btn btn-sm btn-secondary" @click="showEditor = true">{{ $t('player.edit') }}</button>
            <button v-if="song?.sourceUrl" class="btn btn-sm btn-secondary" @click="openSource">{{ $t('player.openLink') }}</button>
          </div>
        </div>
      </aside>
    </div>

    <!-- No Song State -->
    <div v-if="!song" class="no-song">
      <div class="no-song-card card">
        <div class="no-song-icon">🎵</div>
        <h2>{{ $t('player.selectSong') }}</h2>
        <p>{{ $t('player.selectSongDesc') }}</p>
        <router-link to="/library" class="btn btn-primary btn-lg">{{ $t('player.browseLibrary') }}</router-link>
      </div>
    </div>

    <!-- Song Editor Modal -->
    <SongEditor
      v-if="showEditor && song"
      :song="song"
      :visible="showEditor"
      @close="showEditor = false"
      @save="onSaveSong"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SongPlayer from '../components/SongPlayer.vue'
import SongEditor from '../components/SongEditor.vue'
import Fretboard from '../components/Fretboard.vue'
import { useStore } from '../stores/useStore'
import { getChordByName, STRING_NAMES } from '../data/chords.js'
import { getPlatformLabel } from '../services/urlParserService.js'

const route = useRoute()
const router = useRouter()
const { songs, preferences, incrementPlayCount, updateSong } = useStore()

const playerRef = ref(null)
const currentChord = ref(null)
const currentBeat = ref(0)
const showEditor = ref(false)

const song = computed(() => {
  const id = route.params.id
  if (!id) return songs.value[0] || null
  return songs.value.find(s => s.id === id) || null
})

function selectSong(id) {
  router.push({ name: 'play', params: { id } })
}

function onProgress(beat) {
  currentBeat.value = beat
  if (song.value) {
    const chord = song.value.chords.find(c => beat >= c.position && beat < c.position + c.duration)
    if (chord) {
      currentChord.value = getChordByName(chord.name)
    }
  }
}

function openSource() {
  if (song.value?.sourceUrl) {
    window.open(song.value.sourceUrl, '_blank')
  }
}

function getSourceLabel() {
  if (!song.value) return ''
  return getPlatformLabel(song.value.source || 'manual')
}

function onLoopChange({ startBeat, endBeat }) {
  if (playerRef.value) {
    if (startBeat !== undefined) playerRef.value.loopStart = startBeat
    if (endBeat !== undefined) playerRef.value.loopEnd = endBeat
  }
}

function onSaveSong(updates) {
  if (song.value) {
    updateSong(song.value.id, updates)
  }
  showEditor.value = false
}

watch(song, (newSong) => {
  if (newSong) {
    incrementPlayCount(newSong.id)
    const chord = newSong.chords[0]
    if (chord) currentChord.value = getChordByName(chord.name)
  }
}, { immediate: true })
</script>

<style scoped>
.player-view {
  min-height: 100vh;
  padding: 0 0 20px;
}

.player-container {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.player-main {
  min-width: 0;
}

/* Sidebar */
.player-sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: fit-content;
  position: sticky;
  top: 76px;
}

.sidebar-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 16px;
}

.sidebar-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-tertiary);
  margin-bottom: 12px;
}

/* Current Chord Mini */
.current-chord-mini {
  text-align: center;
  margin-bottom: 12px;
}

.mini-chord-info {
  margin-top: 8px;
}

.mini-name {
  font-size: 20px;
  font-weight: 800;
  color: var(--bg-highlight);
}

.mini-full {
  font-size: 11px;
  color: var(--text-secondary);
}

.string-fingerings {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.finger-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 3px 6px;
  border-radius: var(--radius-sm);
}

.finger-row:nth-child(odd) {
  background: var(--bg-tertiary);
}

.string-label {
  font-weight: 700;
  color: var(--text-secondary);
  width: 18px;
}

.fret-val {
  font-weight: 600;
  width: 20px;
  text-align: center;
}

.finger-num {
  font-size: 10px;
  color: var(--text-tertiary);
  margin-left: auto;
}

/* Song List */
.song-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 250px;
  overflow-y: auto;
}

.song-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition);
}

.song-item:hover {
  background: var(--bg-tertiary);
}

.song-item.active {
  background: var(--bg-highlight-light);
  color: var(--bg-highlight);
}

.song-item-title {
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-item-artist {
  font-size: 11px;
  opacity: 0.7;
}

.meta-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--bg-tertiary);
  border-radius: 10px;
  font-weight: 600;
}

/* Info List */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.info-label {
  color: var(--text-secondary);
}

.info-value {
  font-weight: 600;
}

.sidebar-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

/* No Song State */
.no-song {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px;
}

.no-song-card {
  text-align: center;
  padding: 48px 32px;
  max-width: 400px;
}

.no-song-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.no-song h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}

.no-song p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

/* Responsive */
@media (max-width: 900px) {
  .player-container {
    grid-template-columns: 1fr;
  }
  
  .player-sidebar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 12px;
    position: static;
  }
}

@media (max-width: 600px) {
  .player-container {
    padding: 12px;
  }
  
  .player-sidebar {
    grid-template-columns: 1fr;
  }
}
</style>