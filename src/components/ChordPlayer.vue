<template>
  <div class="chord-player card">
    <div class="player-header">
      <h3 class="player-title">{{ chord.fullName }}</h3>
      <div class="player-controls">
        <button class="btn btn-primary" :disabled="playing" @click="play">
          <svg v-if="!playing" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span v-else class="playing-indicator"></span>
          {{ playing ? 'Playing...' : 'Play Chord' }}
        </button>
        <button class="btn btn-secondary btn-sm" :disabled="playing" @click="playArpeggio">Arpeggio</button>
      </div>
    </div>
    <div class="player-content">
      <Fretboard :chord="chord" :highlight="playing" />
      <div class="string-indicators">
        <div v-for="(fret, i) in chord.strings" :key="i" class="string-ind" :class="{ active: playing && !isMuted(i), muted: isMuted(i) }">
          <span class="string-label">{{ STRING_NAMES[5-i] }}</span>
          <span class="fret-label">{{ isMuted(i) ? 'X' : fret === 0 ? '0' : fret }}</span>
        </div>
      </div>
    </div>
    <p v-if="chord.description" class="chord-desc">{{ chord.description }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Fretboard from './Fretboard.vue'
import { useAudio } from '../composables/useAudio.js'
import { STRING_NAMES } from '../data/chords.js'

const props = defineProps({
  chord: { type: Object, required: true }
})

const { playChord, playNote } = useAudio()
const playing = ref(false)

function isMuted(index) {
  return props.chord.strings[index] === -1
}

function play() {
  playing.value = true
  playChord(props.chord.strings, 2)
  setTimeout(() => { playing.value = false }, 2000)
}

function playArpeggio() {
  playing.value = true
  const strings = [...props.chord.strings].reverse()
  strings.forEach((fret, i) => {
    setTimeout(() => {
      if (fret >= 0) playNote(fret, i, 0.8)
    }, i * 300)
  })
  setTimeout(() => { playing.value = false }, strings.length * 300 + 1000)
}
</script>

<style scoped>
.chord-player {
  margin-bottom: 16px;
}
.player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.player-title {
  font-size: 22px;
  font-weight: 700;
}
.player-controls {
  display: flex;
  gap: 8px;
}
.player-content {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}
.string-indicators {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.string-ind {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  transition: all 0.2s ease;
}
.string-ind.active {
  background: var(--bg-highlight-light);
  color: var(--bg-highlight);
  font-weight: 600;
}
.string-ind.muted {
  color: var(--bg-danger);
  opacity: 0.6;
}
.string-label {
  font-weight: 700;
  min-width: 16px;
}
.fret-label {
  font-weight: 500;
}
.chord-desc {
  margin-top: 12px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}
.playing-indicator {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>