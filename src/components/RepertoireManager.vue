<template>
  <div class="repertoire-manager">
    <div class="repertoire-header card">
      <h2>Repertoire Manager</h2>
      <p class="subtitle">Organize your songs by readiness, genre, and difficulty</p>

      <div class="stats-bar">
        <div class="stat-chip learning">
          <span class="stat-num">{{ stats.learning }}</span>
          <span class="stat-label">Learning</span>
        </div>
        <div class="stat-chip ready">
          <span class="stat-num">{{ stats.ready }}</span>
          <span class="stat-label">Ready</span>
        </div>
        <div class="stat-chip performance">
          <span class="stat-num">{{ stats.performance }}</span>
          <span class="stat-label">Gig Ready</span>
        </div>
        <div class="stat-chip total">
          <span class="stat-num">{{ stats.total }}</span>
          <span class="stat-label">Total Tracked</span>
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <button
          v-for="f in filters"
          :key="f.id"
          class="filter-btn"
          :class="{ active: activeFilter === f.id }"
          @click="activeFilter = f.id"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <div v-if="sortedSongs.length > 0" class="song-list">
      <div
        v-for="song in sortedSongs"
        :key="song.id"
        class="song-row card"
      >
        <div class="song-main">
          <div class="song-info">
            <div class="song-title">{{ song.title }}</div>
            <div class="song-artist">{{ song.artist }}</div>
          </div>
          <div class="song-status">
            <button
              v-for="s in statuses"
              :key="s.id"
              class="status-btn"
              :class="[s.id, { active: getStatus(song.id) === s.id }]"
              @click="repertoire.updateStatus(song.id, s.id)"
            >
              {{ s.label }}
            </button>
          </div>
        </div>
        <div class="song-meta">
          <select
            class="meta-select genre"
            :value="getEntry(song.id)?.genre || ''"
            @change="e => setGenre(song.id, (e.target as HTMLSelectElement).value)"
          >
            <option value="">Genre...</option>
            <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
          </select>
          <select
            class="meta-select difficulty"
            :value="getEntry(song.id)?.difficulty || 3"
            @change="e => setDifficulty(song.id, parseInt((e.target as HTMLSelectElement).value))"
          >
            <option v-for="d in 5" :key="d" :value="d">{{ '★'.repeat(d) }}{{ '☆'.repeat(5 - d) }}</option>
          </select>
          <input
            class="meta-input notes"
            :value="getEntry(song.id)?.notes || ''"
            placeholder="Notes..."
            @change="e => setNotes(song.id, (e.target as HTMLInputElement).value)"
          />
          <router-link :to="`/play/${song.id}`" class="btn btn-sm btn-secondary">Play</router-link>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🎵</div>
      <p>No songs in your library yet.</p>
      <router-link to="/library" class="btn btn-primary">Go to Song Library</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMainStore } from '../stores/mainStore.ts'
import { useRepertoireStore, type SongStatus } from '../stores/repertoireStore.ts'

const mainStore = useMainStore()
const repertoire = useRepertoireStore()

const activeFilter = ref('all')
const filters = [
  { id: 'all', label: 'All Songs' },
  { id: 'learning', label: 'Learning' },
  { id: 'ready', label: 'Ready' },
  { id: 'performance', label: 'Gig Ready' },
  { id: 'untracked', label: 'Untracked' },
]

const statuses: { id: SongStatus; label: string }[] = [
  { id: 'learning', label: 'Learning' },
  { id: 'ready', label: 'Ready' },
  { id: 'performance', label: 'Gig Ready' },
]

const genres = ['Rock', 'Pop', 'Blues', 'Jazz', 'Folk', 'Country', 'Metal', 'Classical', 'Reggae', 'Funk']

const stats = computed(() => repertoire.stats)

function getStatus(songId: string): SongStatus {
  return repertoire.getEntry(songId)?.status || 'learning'
}

function getEntry(songId: string) {
  return repertoire.getEntry(songId)
}

function setGenre(songId: string, genre: string) {
  repertoire.setEntry(songId, { genre })
}

function setDifficulty(songId: string, difficulty: number) {
  repertoire.setEntry(songId, { difficulty })
}

function setNotes(songId: string, notes: string) {
  repertoire.setEntry(songId, { notes })
}

const sortedSongs = computed(() => {
  let songs = [...mainStore.songs]
  if (activeFilter.value === 'untracked') {
    songs = songs.filter(s => !repertoire.getEntry(s.id))
  } else if (activeFilter.value !== 'all') {
    songs = songs.filter(s => repertoire.getEntry(s.id)?.status === activeFilter.value)
  }
  return songs.sort((a, b) => a.title.localeCompare(b.title))
})
</script>

<style scoped>
.repertoire-manager {
  padding: 0 24px 48px;
  max-width: 900px;
  margin: 0 auto;
}

.repertoire-header {
  padding: 24px;
  margin-bottom: 20px;
}

.repertoire-header h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.stats-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
}

.stat-chip.learning { border-left: 3px solid #f59e0b; }
.stat-chip.ready { border-left: 3px solid #3b82f6; }
.stat-chip.performance { border-left: 3px solid #22c55e; }
.stat-chip.total { border-left: 3px solid var(--text-tertiary); }

.stat-num {
  font-size: 18px;
  font-weight: 800;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Filters */
.filter-bar {
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 14px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: var(--bg-highlight);
}

.filter-btn.active {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

/* Song List */
.song-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.song-row {
  padding: 14px 18px;
  transition: all 0.2s;
}

.song-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-weight: 700;
  font-size: 15px;
}

.song-artist {
  font-size: 13px;
  color: var(--text-secondary);
}

.song-status {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.status-btn {
  padding: 5px 12px;
  border-radius: 20px;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.status-btn:hover {
  border-color: var(--text-tertiary);
  color: var(--text-primary);
}

.status-btn.learning.active {
  background: #f59e0b;
  border-color: #f59e0b;
  color: white;
}

.status-btn.ready.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.status-btn.performance.active {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.song-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.meta-select,
.meta-input {
  padding: 6px 10px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
}

.meta-select.genre {
  min-width: 100px;
}

.meta-input.notes {
  flex: 1;
  min-width: 120px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

@media (max-width: 600px) {
  .repertoire-manager {
    padding: 0 12px 32px;
  }
  .song-main {
    flex-direction: column;
    align-items: flex-start;
  }
  .song-meta {
    width: 100%;
  }
  .meta-input.notes {
    width: 100%;
  }
  .stats-bar {
    justify-content: center;
  }
}
</style>
