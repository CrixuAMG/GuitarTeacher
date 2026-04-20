<template>
  <div class="random-challenge card">
    <div class="challenge-header">
      <h3>🎲 Random Song Challenge</h3>
      <p>Let fate decide what to practice</p>
    </div>

    <div v-if="challengeSong" class="challenge-result">
      <div class="song-card">
        <div class="song-title">{{ challengeSong.title }}</div>
        <div class="song-artist">{{ challengeSong.artist }}</div>
      </div>
      <div class="challenge-actions">
        <router-link :to="`/play/${challengeSong.id}`" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Play Song
        </router-link>
        <button class="btn btn-secondary" @click="pickRandom">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Pick Another
        </button>
      </div>
    </div>

    <div v-else class="challenge-empty">
      <p>Add songs to your library to get random challenges!</p>
      <router-link to="/library" class="btn btn-primary">Go to Library</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMainStore } from '../stores/mainStore.ts'

const mainStore = useMainStore()

const challengeSong = ref<typeof mainStore.songs[number] | null>(null)

const hasSongs = computed(() => mainStore.songs.length > 0)

function pickRandom() {
  if (!hasSongs.value) {
    challengeSong.value = null
    return
  }
  const idx = Math.floor(Math.random() * mainStore.songs.length)
  challengeSong.value = mainStore.songs[idx]
}

// Pick one on mount
pickRandom()
</script>

<style scoped>
.random-challenge {
  padding: 24px;
}

.challenge-header {
  margin-bottom: 16px;
}

.challenge-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.challenge-header p {
  color: var(--text-secondary);
  font-size: 14px;
}

.challenge-result {
  text-align: center;
}

.song-card {
  padding: 20px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  margin-bottom: 16px;
}

.song-title {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 4px;
}

.song-artist {
  font-size: 15px;
  color: var(--text-secondary);
}

.challenge-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.challenge-empty {
  text-align: center;
  padding: 16px;
}

.challenge-empty p {
  color: var(--text-secondary);
  margin-bottom: 12px;
}
</style>
