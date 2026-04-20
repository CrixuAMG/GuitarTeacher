<template>
  <div class="song-player">
    <!-- Header Section -->
    <div class="player-header card">
      <div class="header-main">
        <div class="song-info">
          <h3 class="song-title">{{ song.title }}</h3>
          <p class="song-artist">{{ song.artist }}</p>
          <div v-if="song.chordsAutoDetected" class="auto-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 0 1 12 2z"/>
            </svg>
            {{ $t('songPlayer.aiDetectedChords') }}
          </div>
        </div>
        <div class="view-toggle">
          <button 
            v-for="mode in viewModes" 
            :key="mode.id"
            class="btn btn-sm view-btn" 
            :class="viewMode === mode.id ? 'btn-primary' : 'btn-secondary'" 
            @click="viewMode = mode.id"
          >
            {{ $t('songPlayer.' + mode.id) }}
          </button>
          <button
            class="btn btn-sm auto-scroll-btn"
            :class="autoScroll ? 'btn-primary' : 'btn-secondary'"
            :title="$t('songPlayer.autoScrollLyrics')"
            @click="toggleAutoScroll"
          >
            {{ $t('songPlayer.autoScroll') }}
          </button>
          <div v-if="autoScroll" class="auto-scroll-speed">
            <button class="btn btn-xs" @click="autoScrollSpeed = Math.max(0.5, autoScrollSpeed - 0.5)">−</button>
            <span class="speed-label">{{ autoScrollSpeed }}×</span>
            <button class="btn btn-xs" @click="autoScrollSpeed = Math.min(3, autoScrollSpeed + 0.5)">+</button>
          </div>
        </div>
      </div>
      
      <!-- YouTube Embed (if available) -->
      <div v-if="sourceType === 'youtube' && song.embedUrl" class="youtube-embed">
        <iframe :src="song.embedUrl" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
      
      <!-- Background Music (Apple Music or other) -->
      <div v-else-if="backgroundMusicUrl" class="background-music-section">
        <div class="background-music-header">
          <span class="background-music-label">{{ $t('songPlayer.backgroundMusic') }}</span>
          <button class="btn btn-sm btn-secondary" @click="bgMusicExpanded = !bgMusicExpanded">
            {{ bgMusicExpanded ? $t('songPlayer.hide') : $t('songPlayer.playAlong') }}
          </button>
        </div>
        <div v-if="bgMusicExpanded" class="background-music-embed">
          <div v-if="backgroundMusicType === 'apple_music'" class="apple-music-player">
            <iframe 
              :src="backgroundMusicUrl" 
              frameborder="0" 
              allow="autoplay *; encrypted-media *; fullscreen *"
              style="width:100%; max-width:660px; overflow:hidden; border-radius:10px;"
              sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
            ></iframe>
          </div>
          <div v-else-if="backgroundMusicType === 'spotify'" class="spotify-player">
            <iframe 
              :src="backgroundMusicUrl" 
              frameborder="0" 
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              style="border-radius:12px"
            ></iframe>
          </div>
          <div v-else class="generic-music-link">
            <a :href="song.backgroundMusicUrl" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              {{ $t('songPlayer.openMusic') }}
            </a>
          </div>
        </div>
      </div>
      
      <!-- Source Link -->
      <div v-else-if="sourceType !== 'none'" class="source-link">
        <button class="btn btn-secondary btn-sm" @click="$emit('open-source')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          {{ $t('songPlayer.openPlatform', { platform: platformLabel }) }}
        </button>
      </div>
    </div>

    <!-- Timeline Section -->
    <div class="timeline-section card">
      <SongTimeline
        :chords="song.chords"
        :sections="song.sections || []"
        :current-beat="currentBeat"
        :total-beats="totalBeats"
        :total-time="totalTime"
        :beat-duration="beatDuration"
        :loop-enabled="loopEnabled"
        :loop-start="loopStart"
        :loop-end="loopEnd"
        @seek="seekTo"
        @loop-change="onLoopChange"
      />
    </div>

    <!-- Main Content Area -->
    <div ref="contentAreaRef" class="content-area card" @scroll="onContentAreaScroll">
      <!-- Sheet Music View -->
      <SheetMusicView
        v-if="viewMode === 'sheet'"
        :notes="song.notes"
        :chords="song.chords"
        :current-beat="currentBeat"
        :total-beats="totalBeats"
      />

      <!-- Chords View -->
      <div v-else-if="viewMode === 'chords'" class="chords-view">
        <div v-if="activeChord" class="current-chord-section">
          <div class="section-label">{{ $t('songPlayer.currentChord') }}</div>
          <div class="main-chord">
            <Fretboard :chord="activeChord" :highlight="isPlaying" />
            <div class="chord-info">
              <div class="chord-name-large">{{ activeChord.name }}</div>
              <div class="chord-full-name">{{ activeChord.fullName }}</div>
            </div>
          </div>
        </div>
        
        <div v-if="upcomingChords.length" class="upcoming-section">
          <div class="section-label">{{ $t('songPlayer.comingUp') }}</div>
          <div class="upcoming-chords">
            <div v-for="(chord, i) in upcomingChords" :key="i" class="upcoming-item">
              <Fretboard :chord="chord" :highlight="false" />
              <div class="upcoming-name">{{ chord.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lyrics View -->
      <div v-else-if="viewMode === 'lyrics'" class="lyrics-view">
        <LyricsDisplay
          :lyrics="song.lyrics || []"
          :sections="song.sections || []"
          :current-beat="currentBeat"
          :total-beats="totalBeats"
          :bpm="song.bpm"
          @seek-beat="seekTo"
        />
      </div>

      <!-- Combined View -->
      <div v-else-if="viewMode === 'combined'" class="combined-view">
        <div class="combined-chords-row">
          <div v-if="activeChord" class="compact-chord">
            <Fretboard :chord="activeChord" :highlight="isPlaying" />
            <div class="compact-name">{{ activeChord.name }}</div>
          </div>
          <div class="chord-pills">
            <div
              v-for="(chord, i) in visibleChords"
              :key="i"
              class="chord-pill"
              :class="{ 
                active: isChordActive(song.chords.indexOf(chord)), 
                past: isChordPast(song.chords.indexOf(chord)),
                'auto-chord': chord.autoDetected 
              }"
              @click="seekTo(chord.position)"
            >
              {{ chord.name }}
            </div>
          </div>
        </div>
        <div class="combined-lyrics">
          <LyricsDisplay
            :lyrics="song.lyrics || []"
            :sections="song.sections || []"
            :current-beat="currentBeat"
            :total-beats="totalBeats"
            :bpm="song.bpm"
            @seek-beat="seekTo"
          />
        </div>
      </div>
    </div>

    <!-- Sticky Bottom Controls -->
    <div class="sticky-controls" :class="{ 'is-playing': isPlaying }">
      <div class="controls-inner card">
        <!-- Progress Bar -->
        <div class="progress-row">
          <div class="time-display current">{{ formatTime(currentBeat * beatDuration) }}</div>
          <div class="progress-track" @click="seekFromProgress">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            <div class="progress-handle" :style="{ left: progressPercent + '%' }"></div>
          </div>
          <div class="time-display total">{{ formatTime(totalTime) }}</div>
        </div>

        <!-- Main Transport Controls -->
        <div class="transport-row">
          <div class="transport-group">
            <button class="btn btn-icon" :title="$t('songPlayer.back4Beats')" @click="skipBack">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="11 19 2 12 11 5 11 19"/>
              </svg>
            </button>
            
            <button class="btn btn-play" :class="isPlaying ? 'playing' : ''" @click="togglePlay">
              <svg v-if="!isPlaying" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            </button>
            
            <button class="btn btn-icon" :title="$t('songPlayer.stop')" @click="stop">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
              </svg>
            </button>
            
            <button class="btn btn-icon" :title="$t('songPlayer.forward4Beats')" @click="skipForward">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 19 22 12 13 5 13 19"/>
              </svg>
            </button>
          </div>

          <!-- Tempo Control -->
          <div class="tempo-group">
            <span class="tempo-label">{{ $t('songPlayer.speed') }}</span>
            <div class="tempo-buttons">
              <button 
                v-for="speed in [0.5, 0.75, 1, 1.25, 1.5]" 
                :key="speed" 
                class="tempo-btn"
                :class="{ active: playbackSpeed === speed }"
                @click="setSpeed(speed)"
              >
                {{ speed }}x
              </button>
            </div>
          </div>
        </div>

        <!-- Loop Controls -->
        <div class="loop-row">
          <button 
            class="btn btn-sm loop-toggle" 
            :class="{ active: loopEnabled }"
            @click="toggleLoop"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="17 1 21 5 17 9"/>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            {{ $t(loopEnabled ? 'songPlayer.loopOn' : 'songPlayer.loopOff') }}
          </button>
          
          <template v-if="loopEnabled">
            <button class="btn btn-sm btn-secondary" @click="setLoopStart">
              {{ $t('songPlayer.setStart') }}
            </button>
            <button class="btn btn-sm btn-secondary" @click="setLoopEnd">
              {{ $t('songPlayer.setEnd') }}
            </button>
            <span v-if="loopEnd > loopStart" class="loop-range">
              {{ loopStart }}–{{ loopEnd }} {{ $t('songPlayer.beats') }}
            </span>
            <button class="btn btn-sm btn-secondary" @click="resetLoop">{{ $t('songPlayer.reset') }}</button>
          </template>
          
          <button 
            v-if="(song.sections || []).length > 0" 
            class="btn btn-sm btn-secondary section-btn"
            @click="showSectionLoop = !showSectionLoop"
          >
            {{ $t('songPlayer.sections') }}
          </button>
        </div>

        <!-- Section Loop Dropdown -->
        <div v-if="showSectionLoop && (song.sections || []).length > 0" class="section-loop-dropdown">
          <div class="section-loop-title">{{ $t('songPlayer.loopSection') }}</div>
          <div class="section-loop-list">
            <button
              v-for="section in song.sections"
              :key="section.label"
              class="section-loop-btn"
              :class="{ active: loopEnabled && loopStart === section.startBeat && loopEnd === section.endBeat }"
              @click="loopSection(section)"
            >
              {{ section.label }}
              <span class="beat-count">({{ section.endBeat - section.startBeat }}b)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import SongTimeline from './SongTimeline.vue'
import SheetMusicView from './SheetMusicView.vue'
import Fretboard from './Fretboard.vue'
import { formatTime } from '../utils/timeFormat'
import LyricsDisplay from './LyricsDisplay.vue'
import { getChordByName } from '../data/chords.js'
import { getPlatformLabel } from '../services/urlParserService.js'
import { useGamificationStore } from '../stores/gamificationStore.ts'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'

const props = defineProps({
  song: { type: Object, required: true },
  preferences: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['progress', 'open-source', 'loop-change'])

const viewModes = [
  { id: 'chords' },
  { id: 'lyrics' },
  { id: 'combined' },
  { id: 'sheet' }
]

const isPlaying = ref(false)
const currentBeat = ref(0)
const playbackSpeed = ref(1)
const viewMode = ref('chords')
const loopEnabled = ref(false)
const loopStart = ref(0)
const loopEnd = ref(0)
const showSectionLoop = ref(false)
const autoScroll = ref(false)
const autoScrollSpeed = ref(1)
let scrollAnimId = null
let lastScrollTime = 0
let userScrollTimeout = null
let animFrameId = null
let lastTimestamp = null
const contentAreaRef = ref(null)

function toggleAutoScroll() {
  autoScroll.value = !autoScroll.value
  if (autoScroll.value && isPlaying.value) {
    startAutoScroll()
  } else if (!autoScroll.value) {
    stopAutoScroll()
  }
}

function startAutoScroll() {
  stopAutoScroll()
  lastScrollTime = performance.now()
  scrollAutoStep()
}

function scrollAutoStep() {
  if (!autoScroll.value || !isPlaying.value) return
  const now = performance.now()
  const delta = (now - lastScrollTime) / 1000
  lastScrollTime = now
  const el = contentAreaRef.value
  if (el) {
    const pixelsPerSecond = 20 * autoScrollSpeed.value
    el.scrollTop += pixelsPerSecond * delta
    if (el.scrollTop >= el.scrollHeight - el.clientHeight - 5) {
      return
    }
  }
  scrollAnimId = requestAnimationFrame(scrollAutoStep)
}

function stopAutoScroll() {
  if (scrollAnimId) {
    cancelAnimationFrame(scrollAnimId)
    scrollAnimId = null
  }
}

function onContentAreaScroll() {
  if (!autoScroll.value || !isPlaying.value) return
  if (userScrollTimeout) clearTimeout(userScrollTimeout)
  stopAutoScroll()
  userScrollTimeout = setTimeout(() => {
    if (autoScroll.value && isPlaying.value) {
      startAutoScroll()
    }
  }, 2000)
}

const gamification = useGamificationStore()

const bgMusicExpanded = ref(false)

// Track song completion
let songCompleted = false

const backgroundMusicUrl = computed(() => {
  const url = props.song.backgroundMusicUrl
  if (!url) {
    if (props.song.sourceUrl && props.song.sourceUrl.includes('music.apple.com')) {
      return buildAppleMusicEmbedUrl(props.song.sourceUrl)
    }
    if (props.song.sourceUrl && props.song.sourceUrl.includes('open.spotify.com')) {
      return buildSpotifyEmbedUrl(props.song.sourceUrl)
    }
  }
  if (url && url.includes('music.apple.com')) return buildAppleMusicEmbedUrl(url)
  if (url && url.includes('open.spotify.com')) return buildSpotifyEmbedUrl(url)
  if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) return null
  return url || null
})

const backgroundMusicType = computed(() => {
  const url = props.song.backgroundMusicUrl || props.song.sourceUrl || ''
  if (url.includes('music.apple.com')) return 'apple_music'
  if (url.includes('open.spotify.com')) return 'spotify'
  return 'link'
})

function buildAppleMusicEmbedUrl(url) {
  try {
    const match = url.match(/music\.apple\.com\/([a-z]{2})\/(?:song|album)\/([^?/]+)/)
    if (match) return `https://embed.music.apple.com/${match[1]}/album/${match[2]}`
  } catch {}
  return url
}

function buildSpotifyEmbedUrl(url) {
  try {
    const match = url.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?track\/([a-zA-Z0-9]+)/)
    if (match) return `https://open.spotify.com/embed/track/${match[1]}`
    const albumMatch = url.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?album\/([a-zA-Z0-9]+)/)
    if (albumMatch) return `https://open.spotify.com/embed/album/${albumMatch[1]}`
  } catch {}
  return url
}

const sourceType = computed(() => {
  if (!props.song.sourceUrl && !props.song.embedUrl) return 'none'
  if (props.song.embedUrl || (props.song.sourceUrl && (props.song.sourceUrl.includes('youtube') || props.song.sourceUrl.includes('youtu.be')))) return 'youtube'
  return 'link'
})

const platformLabel = computed(() => getPlatformLabel(props.song.source || sourceType.value))

const beatDuration = computed(() => 60 / props.song.bpm)

const totalBeats = computed(() => {
  if (!props.song.chords.length) return 0
  const last = props.song.chords[props.song.chords.length - 1]
  return last.position + last.duration
})

const totalTime = computed(() => totalBeats.value * beatDuration.value)

const progressPercent = computed(() => {
  if (totalBeats.value === 0) return 0
  return (currentBeat.value / totalBeats.value) * 100
})

const activeChord = computed(() => {
  const chord = props.song.chords.find(c => currentBeat.value >= c.position && currentBeat.value < c.position + c.duration)
  if (!chord) return null
  return getChordByName(chord.name)
})

const upcomingChords = computed(() => {
  return props.song.chords
    .filter(c => c.position > currentBeat.value)
    .slice(0, 3)
    .map(c => getChordByName(c.name))
    .filter(Boolean)
})

const visibleChords = computed(() => {
  // Show current chord and next several
  const currentIndex = props.song.chords.findIndex(c => currentBeat.value >= c.position && currentBeat.value < c.position + c.duration)
  if (currentIndex === -1) return props.song.chords.slice(0, 8)
  return props.song.chords.slice(Math.max(0, currentIndex - 2), currentIndex + 6)
})

function isChordActive(i) {
  const chord = props.song.chords[i]
  return currentBeat.value >= chord.position && currentBeat.value < chord.position + chord.duration
}

function isChordPast(i) {
  return props.song.chords[i].position + props.song.chords[i].duration <= currentBeat.value
}

function togglePlay() {
  if (isPlaying.value) pause()
  else play()
}

function play() {
  isPlaying.value = true
  lastTimestamp = performance.now()
  if (autoScroll.value) startAutoScroll()
  animate()
}

function pause() {
  isPlaying.value = false
  if (animFrameId) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }
  stopAutoScroll()
}

function stop() {
  pause()
  currentBeat.value = 0
  songCompleted = false
  const el = contentAreaRef.value
  if (el) el.scrollTop = 0
}

function skipBack() {
  currentBeat.value = Math.max(0, currentBeat.value - 4)
}

function skipForward() {
  currentBeat.value = Math.min(totalBeats.value - 1, currentBeat.value + 4)
}

useKeyboardShortcuts({
  onPlayPause: () => { togglePlay() },
})

function animate() {
  if (!isPlaying.value) return
  const now = performance.now()
  const delta = (now - lastTimestamp) / 1000
  lastTimestamp = now

  const beatDelta = delta / (beatDuration.value / playbackSpeed.value)
  currentBeat.value += beatDelta

  if (loopEnabled.value && currentBeat.value >= loopEnd.value && loopEnd.value > loopStart.value) {
    currentBeat.value = loopStart.value
  }

  if (currentBeat.value >= totalBeats.value) {
    if (loopEnabled.value) {
      currentBeat.value = loopStart.value
    } else {
      stop()
      // Award XP for completing song
      if (!songCompleted) {
        gamification.recordSongCompleted(props.song.id)
        songCompleted = true
      }
    }
  }

  emit('progress', currentBeat.value)
  animFrameId = requestAnimationFrame(animate)
}

function seekTo(beat) {
  currentBeat.value = beat
}

function seekFromProgress(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  seekTo(percent * totalBeats.value)
}

function setSpeed(speed) {
  playbackSpeed.value = speed
  gamification.recordSpeed(speed)
}

function toggleLoop() {
  if (loopEnabled.value) {
    loopEnabled.value = false
  } else {
    loopEnabled.value = true
    if (loopEnd.value <= loopStart.value) {
      loopStart.value = Math.floor(currentBeat.value)
      loopEnd.value = Math.min(loopStart.value + 8, totalBeats.value)
    }
    gamification.recordLoopUse()
  }
}

function setLoopStart() {
  loopStart.value = Math.floor(currentBeat.value)
  if (!loopEnabled.value) loopEnabled.value = true
  if (loopEnd.value <= loopStart.value) {
    loopEnd.value = Math.min(loopStart.value + 8, totalBeats.value)
  }
  showSectionLoop.value = false
}

function setLoopEnd() {
  loopEnd.value = Math.min(Math.ceil(currentBeat.value), totalBeats.value)
  if (!loopEnabled.value) loopEnabled.value = true
  if (loopStart.value >= loopEnd.value) {
    loopStart.value = Math.max(0, loopEnd.value - 8)
  }
  showSectionLoop.value = false
}

function loopSection(section) {
  loopStart.value = section.startBeat
  loopEnd.value = section.endBeat
  loopEnabled.value = true
  currentBeat.value = section.startBeat
  showSectionLoop.value = false
}

function resetLoop() {
  loopEnabled.value = false
  loopStart.value = 0
  loopEnd.value = 0
  showSectionLoop.value = false
}

function onLoopChange({ startBeat, endBeat }) {
  if (startBeat !== undefined) loopStart.value = startBeat
  if (endBeat !== undefined) loopEnd.value = endBeat
}

onUnmounted(() => {
  stopAutoScroll()
  pause()
  if (userScrollTimeout) clearTimeout(userScrollTimeout)
})
</script>

<style scoped>
.song-player {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 200px; /* Space for sticky controls */
}

/* Header Section */
.player-header {
  padding: 20px;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.song-info {
  flex: 1;
  min-width: 200px;
}

.song-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
  line-height: 1.2;
}

.song-artist {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.auto-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--bg-warning);
  background: rgba(245, 158, 11, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.view-toggle {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.view-btn {
  padding: 6px 14px;
}

.auto-scroll-speed {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 4px;
}

.speed-label {
  font-size: 12px;
  font-weight: 600;
  min-width: 28px;
  text-align: center;
  color: var(--text-secondary);
}

.btn-xs {
  padding: 2px 6px;
  font-size: 12px;
  min-width: 24px;
}

.youtube-embed {
  margin-top: 16px;
  border-radius: var(--radius-md);
  overflow: hidden;
  aspect-ratio: 16/9;
}

.youtube-embed iframe {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.source-link {
  margin-top: 12px;
}

/* Content Area */
.content-area {
  flex: 1;
  min-height: 300px;
  padding: 20px;
}

/* Chords View */
.chords-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.current-chord-section {
  text-align: center;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.main-chord {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.chord-info {
  text-align: center;
}

.chord-name-large {
  font-size: 36px;
  font-weight: 800;
  color: var(--bg-highlight);
  line-height: 1;
}

.chord-full-name {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.upcoming-section {
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
}

.upcoming-chords {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}

.upcoming-item {
  text-align: center;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  min-width: 120px;
  flex: 0 0 auto;
}

.upcoming-item:hover {
  opacity: 1;
}

.upcoming-item :deep(.fretboard-container) {
  max-width: 140px;
  margin: 0 auto;
}

.upcoming-name {
  font-size: 16px;
  font-weight: 700;
  margin-top: 10px;
  color: var(--text-secondary);
}

/* Combined View */
.combined-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.combined-chords-row {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.compact-chord {
  text-align: center;
  flex-shrink: 0;
}

.compact-name {
  font-size: 16px;
  font-weight: 700;
  margin-top: 4px;
}

.chord-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
  overflow-x: auto;
}

.chord-pill {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition);
  border: 2px solid transparent;
}

.chord-pill:hover {
  border-color: var(--bg-highlight);
}

.chord-pill.active {
  background: var(--bg-highlight);
  color: #fff;
  transform: scale(1.05);
}

.chord-pill.past {
  background: var(--bg-highlight-light);
  color: var(--bg-highlight);
  opacity: 0.6;
}

.chord-pill.auto-chord {
  position: relative;
}

.chord-pill.auto-chord::after {
  content: '';
  position: absolute;
  top: 2px;
  right: 2px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--bg-warning);
}

/* Sticky Controls */
.sticky-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 12px 16px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

.controls-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 16px 20px;
}

.sticky-controls.is-playing .controls-inner {
  border-color: var(--bg-highlight);
}

/* Progress Row */
.progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.time-display {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  min-width: 42px;
  font-variant-numeric: tabular-nums;
}

.time-display.current {
  text-align: right;
}

.progress-track {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--bg-highlight), #818cf8);
  border-radius: 4px;
  transition: width 0.1s linear;
}

.progress-handle {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  background: #fff;
  border: 3px solid var(--bg-highlight);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: left 0.1s linear;
}

/* Transport Row */
.transport-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.transport-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all var(--transition);
}

.btn-icon:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.btn-play {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-highlight);
  color: #fff;
  border: none;
  cursor: pointer;
  transition: all var(--transition);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn-play:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
}

.btn-play.playing {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Tempo Group */
.tempo-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tempo-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.tempo-buttons {
  display: flex;
  gap: 4px;
}

.tempo-btn {
  padding: 5px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all var(--transition);
}

.tempo-btn:hover {
  background: var(--bg-card-hover);
}

.tempo-btn.active {
  background: var(--bg-highlight);
  color: #fff;
}

/* Loop Row */
.loop-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.loop-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
}

.loop-toggle.active {
  background: var(--bg-highlight);
  color: #fff;
}

.loop-range {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 600;
}

.section-btn {
  margin-left: auto;
}

/* Section Loop Dropdown */
.section-loop-dropdown {
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.section-loop-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.section-loop-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.section-loop-btn {
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
  background: var(--bg-card);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all var(--transition);
}

.section-loop-btn:hover {
  background: var(--bg-card-hover);
}

.section-loop-btn.active {
  background: var(--bg-highlight);
  color: #fff;
}

.beat-count {
  font-size: 10px;
  opacity: 0.7;
  margin-left: 4px;
}

/* Responsive */
@media (max-width: 700px) {
  .song-player {
    padding-bottom: 240px;
  }
  
  .header-main {
    flex-direction: column;
  }
  
  .view-toggle {
    width: 100%;
    justify-content: stretch;
  }
  
  .view-btn {
    flex: 1;
  }
  
  .transport-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .tempo-group {
    width: 100%;
    justify-content: center;
  }
  
  .loop-row {
    justify-content: center;
  }
  
  .section-btn {
    margin-left: 0;
  }
}

.background-music-section {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-top: 8px;
}

.background-music-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.background-music-label {
  font-size: 14px;
  font-weight: 600;
}

.background-music-embed {
  margin-top: 12px;
}

.apple-music-player iframe {
  height: 150px;
  border-radius: 8px;
}

.spotify-player iframe {
  width: 100%;
  height: 152px;
  border: none;
}

.generic-music-link {
  display: flex;
  justify-content: center;
  padding: 16px;
}
</style>