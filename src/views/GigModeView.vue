<template>
  <div class="gig-mode" :class="{ 'auto-scrolling': autoScroll }">
    <div v-if="!songs.length" class="gig-empty">
      <p>{{ $t('gigMode.setlistNotFound') }}</p>
      <router-link to="/setlists" class="btn btn-secondary">{{ $t('gigMode.backToSetlists') }}</router-link>
    </div>
    <template v-else>
    <!-- Header -->
    <div class="gig-header">
      <button class="gig-btn exit" @click="router.back()">{{ $t('gigMode.exit') }}</button>
      <div class="gig-title">
        <h2>{{ currentSong?.title ?? 'Gig Mode' }}</h2>
        <p v-if="currentSong?.artist">{{ currentSong.artist }}</p>
      </div>
      <div class="gig-controls">
        <button class="gig-btn" @click="transpose(-1)">♭</button>
        <span class="transpose-display">{{ transposeDisplay }}</span>
        <button class="gig-btn" @click="transpose(1)">♯</button>
        <button class="gig-btn" :class="{ active: autoScroll }" @click="toggleAutoScroll">⬇</button>
      </div>
    </div>

    <!-- Song Content -->
    <div ref="contentRef" class="gig-content">
      <div v-if="currentSong" class="song-sheet">
        <!-- Chords display -->
        <div v-if="transposedChords.length" class="chords-line">
          <span
            v-for="(chord, i) in transposedChords"
            :key="i"
            class="gig-chord"
          >
            {{ chord.name }}
            <span v-if="chord.duration >= 2" class="duration-marker">|</span>
          </span>
        </div>

        <!-- Lyrics with chords inline -->
        <div v-if="currentSong.sections?.length" class="lyrics-sections">
          <div
            v-for="(section, si) in currentSong.sections"
            :key="si"
            class="lyric-section"
          >
            <h4 v-if="section.name" class="section-name">{{ section.name }}</h4>
            <div v-if="section.lines" class="section-lines">
              <p v-for="(line, li) in section.lines" :key="li" class="lyric-line">
                {{ line }}
              </p>
            </div>
          </div>
        </div>

        <div v-else-if="currentSong.lyrics?.length" class="lyrics-plain">
          <p v-for="(line, i) in currentSong.lyrics" :key="i" class="lyric-line">
            {{ line.text || line }}
          </p>
        </div>

        <div v-else class="no-lyrics">
          <p>{{ $t('gigMode.noLyrics') }}</p>
        </div>
      </div>

      <div v-else class="no-song">
        <p>{{ $t('gigMode.songNotFound') }}</p>
      </div>
    </div>

    <!-- Footer Navigation -->
    <div class="gig-footer">
      <button
        class="nav-btn"
        :disabled="currentIndex <= 0"
        @click="prevSong"
      >
        {{ $t('gigMode.prev') }}
      </button>

      <div class="song-dots">
        <span
          v-for="(_, i) in songs"
          :key="i"
          class="dot"
          :class="{ active: i === currentIndex }"
          @click="goToSong(i)"
        ></span>
      </div>

      <span class="song-counter">{{ currentIndex + 1 }} / {{ songs.length }}</span>

      <button
        class="nav-btn"
        :disabled="currentIndex >= songs.length - 1"
        @click="nextSong"
      >
        {{ $t('gigMode.next') }}
      </button>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSetlistStore } from '../stores/setlistStore.ts'
import { useStore } from '../stores/useStore'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const setlistStore = useSetlistStore()
const songStore = useStore()

const setlistId = computed(() => route.params.setlistId as string)

const songs = computed(() => {
  const setlist = setlistStore.setlists.find((s) => s.id === setlistId.value)
  if (!setlist) return []
  return setlist.songs
    .map((s) => songStore.getSong(s.songId))
    .filter(Boolean)
})

const currentIndex = ref(0)
const transposeSemitones = ref(0)
const autoScroll = ref(false)
const contentRef = ref<HTMLElement | null>(null)

const currentSong = computed(() => songs.value[currentIndex.value] || null)

const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function transposeChordName(name: string, semitones: number): string {
  const match = name.match(/^([A-G][#b]?)(.*)/)
  if (!match) return name
  const [, root, suffix] = match
  const idx = ROOT_NOTES.indexOf(root)
  if (idx === -1) return name
  const newIdx = (idx + semitones + 12) % 12
  return ROOT_NOTES[newIdx] + suffix
}

const transposedChords = computed(() => {
  if (!currentSong.value?.chords) return []
  return currentSong.value.chords.map((c) => ({
    ...c,
    name: transposeChordName(c.name || '', transposeSemitones.value),
  }))
})

const transposeDisplay = computed(() => {
  if (transposeSemitones.value === 0) return t('gigMode.transposeOriginal')
  if (transposeSemitones.value > 0) return `+${transposeSemitones.value}`
  return `${transposeSemitones.value}`
})

function transpose(dir: number) {
  transposeSemitones.value += dir
}

function prevSong() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    transposeSemitones.value = 0
    scrollToTop()
  }
}

function nextSong() {
  if (currentIndex.value < songs.value.length - 1) {
    currentIndex.value++
    transposeSemitones.value = 0
    scrollToTop()
  }
}

function goToSong(index: number) {
  currentIndex.value = index
  transposeSemitones.value = 0
  scrollToTop()
}

function scrollToTop() {
  if (contentRef.value) contentRef.value.scrollTop = 0
}

// Auto-scroll
let scrollInterval: ReturnType<typeof setInterval> | null = null
const SCROLL_SPEED = 40 // pixels per interval

function toggleAutoScroll() {
  autoScroll.value = !autoScroll.value
  if (autoScroll.value) {
    scrollInterval = setInterval(() => {
      if (contentRef.value) {
        contentRef.value.scrollTop += 1
      }
    }, SCROLL_SPEED)
  } else {
    if (scrollInterval) clearInterval(scrollInterval)
  }
}

// Keyboard shortcuts
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault()
    nextSong()
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    prevSong()
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    transpose(1)
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    transpose(-1)
  }
  if (e.key === 'Escape') {
    router.back()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  if (scrollInterval) clearInterval(scrollInterval)
})
</script>

<style scoped>
.gig-mode {
  position: fixed;
  inset: 0;
  background: #0a0a0a;
  color: white;
  display: flex;
  flex-direction: column;
  z-index: 200;
}

/* Header */
.gig-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.gig-title {
  text-align: center;
  flex: 1;
}

.gig-title h2 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 2px;
}

.gig-title p {
  font-size: 13px;
  opacity: 0.6;
}

.gig-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gig-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.gig-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.gig-btn.active {
  background: var(--bg-highlight, #3b82f6);
}

.gig-btn.exit {
  font-size: 13px;
  width: auto;
  padding: 0 14px;
  border-radius: 18px;
}

.transpose-display {
  font-size: 13px;
  font-weight: 700;
  min-width: 36px;
  text-align: center;
  color: #fbbf24;
}

/* Content */
.gig-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px 24px;
  scroll-behavior: smooth;
}

.song-sheet {
  max-width: 700px;
  margin: 0 auto;
}

.chords-line {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.gig-chord {
  font-size: 24px;
  font-weight: 800;
  color: #fbbf24;
  display: flex;
  align-items: center;
  gap: 4px;
}

.duration-marker {
  color: rgba(255, 255, 255, 0.3);
  font-weight: 400;
}

.chord-bar {
  padding-left: 8px;
  border-left: 2px solid rgba(255, 255, 255, 0.2);
}

/* Lyrics */
.lyrics-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.lyric-section {
  padding: 16px 0;
}

.section-name {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 12px;
}

.lyric-line {
  font-size: 18px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 4px;
}

.lyrics-plain {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gig-empty {
  text-align: center;
  padding: 80px 24px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.gig-empty .btn {
  color: white;
  text-decoration: none;
  padding: 10px 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  transition: background 0.2s;
}

.gig-empty .btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.no-lyrics,
.no-song {
  text-align: center;
  padding: 48px 0;
  color: rgba(255, 255, 255, 0.5);
}

/* Footer */
.gig-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.nav-btn {
  padding: 10px 20px;
  border-radius: var(--radius-xl);
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.song-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;
}

.dot.active {
  background: var(--bg-highlight, #3b82f6);
  transform: scale(1.2);
}

.song-counter {
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 600px) {
  .gig-header {
    padding: 8px 12px;
  }
  .gig-title h2 {
    font-size: 16px;
  }
  .gig-chord {
    font-size: 20px;
  }
  .lyric-line {
    font-size: 16px;
  }
  .gig-content {
    padding: 20px 16px;
  }
}
</style>
