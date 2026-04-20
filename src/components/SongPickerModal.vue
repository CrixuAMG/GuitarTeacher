<template>
  <Teleport to="body">
    <div v-if="showSongModal" class="song-modal-overlay" @click.self="showSongModal = false">
      <div class="song-modal card">
        <div class="modal-header">
          <h2>Select a Song</h2>
          <button class="modal-close" @click="showSongModal = false">&times;</button>
        </div>

        <div class="modal-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search songs by title or artist..."
            class="search-input"
          />
        </div>

        <div class="modal-filters">
          <button
            v-for="filter in sourceFilters"
            :key="filter.value"
            class="filter-chip"
            :class="{ active: activeFilter === filter.value }"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>

        <div class="songs-list">
          <div v-if="filteredSongs.length === 0" class="empty-state">
            <div class="empty-icon">🎵</div>
            <p>No songs found. Try a different search.</p>
          </div>

          <div
            v-for="s in filteredSongs"
            :key="s.id"
            class="song-row"
            :class="{ selected: currentSong?.id === s.id }"
            @click="selectSong(s)"
          >
            <div class="song-info">
              <div class="song-title">{{ s.title }}</div>
              <div class="song-artist">{{ s.artist }}</div>
              <div class="song-meta">
                <span class="meta-chip">{{ s.chords?.length || 0 }} chords</span>
                <span class="meta-chip">{{ s.bpm || 120 }} BPM</span>
                <span v-if="s.chords && s.chords.length" class="meta-chip chords">Chords</span>
                <span v-if="s.leadNotes && s.leadNotes.length" class="meta-chip notes">Notes</span>
                <span v-if="s.parts && s.parts.length" class="meta-chip riffs">Riffs</span>
                <span v-if="s.source" class="meta-chip source">{{ formatSource(s.source) }}</span>
              </div>
            </div>
            <button
              class="btn btn-sm select-btn"
              :class="currentSong?.id === s.id ? 'btn-success' : 'btn-primary'"
              @click.stop="selectSong(s)"
            >
              <span v-if="currentSong?.id === s.id">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Selected
              </span>
              <span v-else>Select</span>
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showSongModal = false">Cancel</button>
          <button class="btn btn-primary" :disabled="!currentSong" @click="confirmSongSelection">
            Play Selected Song
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from '@/stores/useStore'
import type { Song } from '@/types'

const props = defineProps<{
  modelValue: boolean
  currentSong: Song | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [song: Song]
}>()

const store = useStore()
const searchQuery = ref('')
const activeFilter = ref('all')

const showSongModal = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const sourceFilters = [
  { value: 'all', label: 'All Songs' },
  { value: 'demo', label: 'Demo' },
  { value: 'manual', label: 'Manual' },
  { value: 'youtube', label: 'YouTube' },
]

const allSongs = computed(() => {
  const list = store.getAllSongs()
  // Always include the built-in demo song if library is empty
  if (list.length === 0) {
    return [{
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
      source: 'demo',
    } as Song]
  }
  return list
})

const filteredSongs = computed(() => {
  let list = allSongs.value

  if (activeFilter.value !== 'all') {
    list = list.filter((s) => (s.source || 'manual') === activeFilter.value)
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.chords?.some((c) => c.name.toLowerCase().includes(q))
    )
  }

  return list
})

function formatSource(source: string) {
  const map: Record<string, string> = {
    demo: 'Demo',
    manual: 'Manual',
    youtube: 'YouTube',
    apple_music: 'Apple Music',
  }
  return map[source] || source
}

function selectSong(s: Song) {
  emit('select', s)
}

function confirmSongSelection() {
  showSongModal.value = false
}
</script>

<style scoped>
.song-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 24px;
}

.song-modal {
  width: 100%;
  max-width: 560px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 800;
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.modal-search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.modal-search svg {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.modal-filters {
  display: flex;
  gap: 8px;
  padding: 12px 24px;
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
  flex-shrink: 0;
}

.filter-chip {
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--bg-tertiary);
  border: 1px solid transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.filter-chip:hover {
  background: var(--bg-card-hover);
}

.filter-chip.active {
  background: var(--bg-highlight);
  color: white;
}

.songs-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.song-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 4px;
}

.song-row:hover {
  background: var(--bg-tertiary);
}

.song-row.selected {
  background: var(--bg-highlight-light);
  border: 1px solid var(--bg-highlight);
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.song-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.meta-chip {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  font-weight: 600;
}

.meta-chip.source {
  background: var(--bg-highlight-light);
  color: var(--bg-highlight);
}

.meta-chip.chords {
  background: #dcfce7;
  color: #16a34a;
}

.meta-chip.notes {
  background: #fef3c7;
  color: #d97706;
}

.meta-chip.riffs {
  background: #ede9fe;
  color: #7c3aed;
}

[data-theme="dark"] .meta-chip.chords {
  background: #14532d;
  color: #86efac;
}

[data-theme="dark"] .meta-chip.notes {
  background: #78350f;
  color: #fcd34d;
}

[data-theme="dark"] .meta-chip.riffs {
  background: #4c1d95;
  color: #c4b5fd;
}

.select-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 40px 24px;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 14px;
}

@media (max-width: 600px) {
  .song-modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .song-modal {
    max-height: 90vh;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}
</style>
