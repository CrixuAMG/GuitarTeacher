<template>
  <div class="library-view">
    <PageHeader :subtitle="$t('library.subtitle')">
      <template #actions>
        <button class="btn btn-primary" @click="showImport = true">{{ $t('library.importSong') }}</button>
      </template>
    </PageHeader>

    <SongImportModal
      v-if="showImport"
      @close="showImport = false"
      @saved="onSongImported"
    />

    <div class="filters">
      <input v-model="searchQuery" type="text" :placeholder="$t('library.searchPlaceholder')" class="search-input" />
    </div>

    <div v-if="filteredSongs.length === 0" class="empty-state card">
      <div class="empty-icon">🎶</div>
      <h3>{{ $t('library.noSongs') }}</h3>
      <p>{{ $t('library.noSongsDesc') }}</p>
      <button class="btn btn-primary" @click="showImport = true">{{ $t('library.importSongBtn') }}</button>
    </div>

    <div v-else class="songs-grid">
      <div v-for="song in filteredSongs" :key="song.id" class="song-card card" @click="goToSong(song.id)">
        <div class="song-card-header">
          <div>
            <div class="song-card-title">{{ song.title }}</div>
            <div class="song-card-artist">{{ song.artist }}</div>
          </div>
          <div v-if="song.thumbnailUrl" class="song-card-thumb">
            <img :src="song.thumbnailUrl" alt="" @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')" />
          </div>
        </div>
        <div class="song-card-chips">
          <span v-if="song.chords.length" class="chip">{{ $t('library.chordCount', { count: song.chords.length }) }}</span>
          <span class="chip">{{ $t('library.bpm', { bpm: song.bpm }) }}</span>
          <span v-if="song.chords && song.chords.length" class="chip chords-chip">{{ $t('library.chords') }}</span>
          <span v-if="song.leadNotes && song.leadNotes.length" class="chip notes-chip">{{ $t('library.notes') }}</span>
          <span v-if="song.parts && song.parts.length" class="chip riff-chip">{{ $t('library.riffs') }}</span>
          <span v-if="song.lyrics && song.lyrics.length" class="chip lyrics-chip">{{ $t('library.lyrics') }}</span>
          <span v-if="song.source === 'youtube' || song.embedUrl" class="chip youtube">{{ $t('library.youTube') }}</span>
          <span v-else-if="song.source === 'apple_music'" class="chip apple-music">{{ $t('library.appleMusic') }}</span>
          <span v-else-if="song.source === 'manual'" class="chip manual">{{ $t('library.manual') }}</span>
          <span v-else-if="song.sourceUrl" class="chip link-chip">{{ $t('library.link') }}</span>
        </div>
        <div v-if="song.lyrics && song.lyrics.length" class="song-card-lyrics-preview">
          {{ getLyricsPreview(song) }}
        </div>
        <div v-if="getSongProgress(song.id)" class="song-card-progress">
          <div class="progress-bar">
            <div class="progress-bar-fill" :style="{ width: (getSongProgress(song.id) * 100) + '%' }"></div>
          </div>
          <span class="progress-text">{{ Math.round(getSongProgress(song.id) * 100) }}%</span>
        </div>
        <div class="song-card-actions">
          <router-link :to="{ name: 'play', params: { id: song.id } }" class="btn btn-primary btn-sm" @click.stop>{{ $t('library.practice') }}</router-link>
          <button class="btn btn-secondary btn-sm" @click.stop="editSong(song)">{{ $t('library.edit') }}</button>
          <button class="btn btn-danger btn-sm" @click.stop="removeSong(song.id)">{{ $t('library.remove') }}</button>
        </div>
      </div>
    </div>

    <SongEditor
      v-if="showEditor && editingSong"
      :song="editingSong"
      :visible="showEditor"
      @close="showEditor = false"
      @save="onSongEdited"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import SongImportModal from '../components/SongImportModal.vue'
import SongEditor from '../components/SongEditor.vue'
import { useStore } from '../stores/useStore'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()
const { t } = useI18n()
const { songs, removeSong: removeSongFromStore, updateSong, progress } = useStore()

const showImport = ref(false)
const showEditor = ref(false)
const editingSong = ref(null)
const searchQuery = ref('')

const filteredSongs = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return songs.value
  return songs.value.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q)
  )
})

function onSongImported(song) {
  showImport.value = false
  if (song && song.id) {
    router.push({ name: 'play', params: { id: song.id } })
  }
}

function getLyricsPreview(song) {
  if (!song.lyrics || !song.lyrics.length) return ''
  const lines = song.lyrics.slice(0, 2).map(l => l.text || l).filter(Boolean)
  return lines.join(' / ') + (song.lyrics.length > 2 ? ' ...' : '')
}

function getSongProgress(id) {
  const p = progress.value[id]
  if (!p || !p.completedBeats) return 0
  const song = songs.value.find(s => s.id === id)
  if (!song || !song.chords.length) return 0
  const totalBeats = song.chords[song.chords.length - 1].position + song.chords[song.chords.length - 1].duration
  return totalBeats > 0 ? Math.min(p.completedBeats / totalBeats, 1) : 0
}

function goToSong(id) {
  router.push({ name: 'play', params: { id } })
}

function editSong(song) {
  editingSong.value = song
  showEditor.value = true
}

function onSongEdited(updates) {
  if (editingSong.value) {
    updateSong(editingSong.value.id, updates)
  }
  showEditor.value = false
  editingSong.value = null
}

function removeSong(id) {
  if (confirm(t('library.removeConfirm'))) {
    removeSongFromStore(id)
  }
}
</script>

<style scoped>
.library-view {
  padding: 0 24px 48px;
}
.filters {
  margin-bottom: 24px;
}
.search-input {
  width: 100%;
  max-width: 400px;
}
.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.song-card {
  cursor: pointer;
  transition: all var(--transition);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.song-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.song-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.song-card-title {
  font-size: 18px;
  font-weight: 700;
}
.song-card-artist {
  font-size: 14px;
  color: var(--text-secondary);
}
.song-card-thumb {
  flex-shrink: 0;
}
.song-card-thumb img {
  width: 80px;
  height: 45px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
.song-card-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.chip {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-weight: 500;
}
.chip.youtube {
  background: #fee2e2;
  color: #dc2626;
}
.chip.apple-music {
  background: #fce7f3;
  color: #be185d;
}
.chip.manual {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}
.chip.link-chip {
  background: #dbeafe;
  color: #2563eb;
}
.chip.lyrics-chip {
  background: var(--bg-highlight-light);
  color: var(--bg-highlight);
  font-weight: 600;
}
.chip.chords-chip {
  background: #dcfce7;
  color: #16a34a;
  font-weight: 600;
}
.chip.notes-chip {
  background: #fef3c7;
  color: #d97706;
  font-weight: 600;
}
.chip.riff-chip {
  background: #ede9fe;
  color: #7c3aed;
  font-weight: 600;
}
[data-theme="dark"] .chip.chords-chip {
  background: #14532d;
  color: #86efac;
}
[data-theme="dark"] .chip.notes-chip {
  background: #78350f;
  color: #fcd34d;
}
[data-theme="dark"] .chip.riff-chip {
  background: #4c1d95;
  color: #c4b5fd;
}
[data-theme="dark"] .chip.youtube {
  background: #7f1d1d;
  color: #fca5a5;
}
[data-theme="dark"] .chip.apple-music {
  background: #831843;
  color: #f9a8d4;
}
[data-theme="dark"] .chip.link-chip {
  background: #1e3a5f;
  color: #93c5fd;
}
.song-card-lyrics-preview {
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.song-card-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}
.song-card-progress .progress-bar {
  flex: 1;
}
.progress-text {
  font-size: 12px;
  color: var(--text-tertiary);
  white-space: nowrap;
}
.song-card-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}
.btn-danger {
  background: var(--bg-danger);
  color: #fff;
}
.btn-danger:hover {
  filter: brightness(1.1);
}
.empty-state {
  text-align: center;
  padding: 64px 24px;
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.empty-state h3 {
  font-size: 18px;
  margin-bottom: 8px;
}
.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 16px;
}
</style>