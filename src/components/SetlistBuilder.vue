<template>
  <div class="setlist-builder">
    <div class="builder-header card">
      <h2>Setlist Builder</h2>
      <p class="subtitle">Create and organize practice setlists</p>

      <div class="create-row">
        <input
          v-model="newSetlistName"
          class="create-input"
          placeholder="New setlist name..."
          @keyup.enter="createSetlist"
        />
        <button class="btn btn-primary" @click="createSetlist">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create
        </button>
      </div>
    </div>

    <div v-if="setlistStore.setlists.length > 0" class="setlists">
      <div
        v-for="setlist in setlistStore.setlists"
        :key="setlist.id"
        class="setlist-card card"
      >
        <div class="setlist-header">
          <input
            v-model="setlist.name"
            class="setlist-name-input"
            @blur="setlistStore.renameSetlist(setlist.id, setlist.name)"
          />
          <div class="setlist-actions">
            <router-link
              v-if="setlist.songs.length > 0"
              :to="`/gig/${setlist.id}`"
              class="gig-launch-btn"
              title="Launch Gig Mode"
            >
              🎤 Gig
            </router-link>
            <button class="btn-icon" title="Delete" @click="setlistStore.deleteSetlist(setlist.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="setlist-songs">
          <div
            v-for="(item, idx) in setlist.songs"
            :key="item.songId"
            class="setlist-song-item"
          >
            <span class="song-order">{{ idx + 1 }}</span>
            <span class="song-name">{{ getSongTitle(item.songId) }}</span>
            <div class="song-actions">
              <button class="btn-icon-sm" :disabled="idx === 0" @click="setlistStore.moveSong(setlist.id, item.songId, -1)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
              </button>
              <button class="btn-icon-sm" :disabled="idx === setlist.songs.length - 1" @click="setlistStore.moveSong(setlist.id, item.songId, 1)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <button class="btn-icon-sm danger" @click="setlistStore.removeSongFromSetlist(setlist.id, item.songId)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <div v-if="setlist.songs.length === 0" class="empty-songs">
            No songs yet. Add from your library below.
          </div>
        </div>

        <div class="add-songs">
          <label>Add Song</label>
          <select class="add-select" @change="e => addSong(setlist.id, e)">
            <option value="">Select a song...</option>
            <option v-for="song in availableSongs(setlist)" :key="song.id" :value="song.id">
              {{ song.title }} - {{ song.artist }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-else class="empty-setlists">
      <div class="empty-icon">📝</div>
      <p>Create your first setlist to organize practice sessions.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMainStore } from '../stores/mainStore.ts'
import { useSetlistStore } from '../stores/setlistStore.ts'

const mainStore = useMainStore()
const setlistStore = useSetlistStore()

const newSetlistName = ref('')

function createSetlist() {
  if (!newSetlistName.value.trim()) return
  setlistStore.createSetlist(newSetlistName.value.trim())
  newSetlistName.value = ''
}

function getSongTitle(songId: string): string {
  const song = mainStore.songs.find(s => s.id === songId)
  return song ? `${song.title} - ${song.artist}` : 'Unknown'
}

function availableSongs(setlist: typeof setlistStore.setlists[number]) {
  const existingIds = new Set(setlist.songs.map(s => s.songId))
  return mainStore.songs.filter(s => !existingIds.has(s.id))
}

function addSong(setlistId: string, event: Event) {
  const select = event.target as HTMLSelectElement
  const songId = select.value
  if (songId) {
    setlistStore.addSongToSetlist(setlistId, songId)
    select.value = ''
  }
}
</script>

<style scoped>
.setlist-builder {
  padding: 0 24px 48px;
  max-width: 900px;
  margin: 0 auto;
}

.builder-header {
  padding: 24px;
  margin-bottom: 24px;
}

.builder-header h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.create-row {
  display: flex;
  gap: 10px;
}

.create-input {
  flex: 1;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
}

/* Setlists */
.setlists {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setlist-card {
  padding: 20px;
}

.setlist-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.setlist-name-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  background: transparent;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
  transition: all 0.2s;
}

.setlist-name-input:hover,
.setlist-name-input:focus {
  border-color: var(--border-color);
  background: var(--bg-secondary);
  outline: none;
}

.setlist-songs {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.setlist-song-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.song-order {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-highlight);
  color: white;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.song-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-actions {
  display: flex;
  gap: 4px;
}

.empty-songs {
  padding: 16px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 13px;
  font-style: italic;
}

.add-songs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-songs label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  white-space: nowrap;
}

.add-select {
  flex: 1;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--bg-danger);
  color: white;
}

.btn-icon-sm {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-sm:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.btn-icon-sm:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-icon-sm.danger:hover {
  background: var(--bg-danger);
  color: white;
}

.setlist-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gig-launch-btn {
  padding: 6px 12px;
  border-radius: var(--radius-xl);
  background: var(--bg-success, #22c55e);
  color: white;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}

.gig-launch-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  text-decoration: none;
}

.empty-setlists {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-setlists p {
  color: var(--text-secondary);
}

@media (max-width: 600px) {
  .setlist-builder {
    padding: 0 12px 32px;
  }
  .create-row {
    flex-direction: column;
  }
  .setlist-song-item {
    flex-wrap: wrap;
  }
  .song-name {
    order: 3;
    width: 100%;
    padding-left: 34px;
  }
}
</style>
