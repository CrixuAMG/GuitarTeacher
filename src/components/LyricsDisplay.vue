<template>
  <div ref="containerRef" class="lyrics-display">
    <div v-if="!sections || sections.length === 0" class="lyrics-fallback">
      <div
        v-for="(line, i) in flatLyrics"
        :key="i"
        class="lyric-line"
        :class="{ active: isLineActive(i), past: isLinePast(i), hasChords: line.chords && line.chords.length > 0 }"
        @click="$emit('seek-beat', line.beatPosition)"
      >
        <div v-if="line.chords && line.chords.length > 0" class="lyric-chords">
          <span v-for="(chord, ci) in line.chords" :key="ci" class="inline-chord" @click.stop="$emit('seek-beat', chord.beatPosition || line.beatPosition)">
            {{ chord.name || chord }}
          </span>
        </div>
        <div class="lyric-text">{{ line.text }}</div>
      </div>
    </div>
    <div v-else class="lyrics-sectioned">
      <div v-for="(section, si) in sections" :key="si" class="lyric-section" :class="'section-' + section.type">
        <div v-if="section.label" class="section-label">{{ section.label }}</div>
        <div
          v-for="(line, li) in getSectionLyrics(section)"
          :key="li"
          class="lyric-line"
          :class="{ active: isLineActive(getGlobalIndex(section, li)), past: isLinePast(getGlobalIndex(section, li)), hasChords: line.chords && line.chords.length > 0 }"
          @click="$emit('seek-beat', line.beatPosition)"
        >
          <div v-if="line.chords && line.chords.length > 0" class="lyric-chords">
            <span v-for="(chord, ci) in line.chords" :key="ci" class="inline-chord">{{ chord.name || chord }}</span>
          </div>
          <div class="lyric-text">{{ line.text }}</div>
        </div>
      </div>
    </div>
    <div v-if="!flatLyrics || flatLyrics.length === 0" class="lyrics-empty">
      <div class="empty-icon">📝</div>
      <p>No lyrics available for this song.</p>
      <p class="empty-hint">You can add lyrics by editing the song.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'

interface LyricLine {
  text: string
  chords?: Array<{ name?: string; beatPosition?: number }>
  beatPosition?: number
  time?: number
  section?: string
}

interface LyricSection {
  type: string
  label?: string
  startBeat: number
  endBeat: number
}

interface ChordEntry {
  position: number
}

const props = defineProps({
  lyrics: { type: Array as () => LyricLine[], default: () => [] },
  sections: { type: Array as () => LyricSection[], default: () => [] },
  currentBeat: { type: Number, default: 0 },
  totalBeats: { type: Number, default: 0 },
  bpm: { type: Number, default: 120 },
  chordLookup: { type: Array as () => ChordEntry[], default: () => [] }
})

defineEmits(['seek-beat'])

const containerRef = ref<HTMLElement | null>(null)

const flatLyrics = computed(() => {
  if (!props.lyrics || props.lyrics.length === 0) return []
  return props.lyrics.map((line, i) => {
    if (line.beatPosition !== undefined) return line
    let beatPos = i * 4
    const chordEntry = props.chordLookup?.[i]
    if (chordEntry) beatPos = chordEntry.position
    return { ...line, beatPosition: beatPos }
  })
})

function getSectionLyrics(section: LyricSection) {
  if (!props.lyrics) return []
  return props.lyrics.filter(l => {
    if (l.section === section.type) return true
    const lineBeat = l.beatPosition
    return lineBeat >= section.startBeat && lineBeat < section.endBeat
  })
}

function getGlobalIndex(_section, lineIndex) {
  let index = 0
  for (let i = 0; i < props.sections.length; i++) {
    index += getSectionLyrics(props.sections[i]).length
  }
  return index + lineIndex
}

function isLineActive(index) {
  const line = flatLyrics.value?.[index]
  if (!line) return false
  const beat = line.beatPosition ?? line.time * (props.bpm / 60) ?? index * 4
  const nextLine = flatLyrics.value?.[index + 1]
  const nextBeat = nextLine ? (nextLine.beatPosition ?? nextLine.time * (props.bpm / 60) ?? (index + 1) * 4) : props.totalBeats
  return props.currentBeat >= beat && props.currentBeat < nextBeat
}

function isLinePast(index) {
  const line = flatLyrics.value?.[index]
  if (!line) return false
  const nextLine = flatLyrics.value?.[index + 1]
  const _nextBeat = nextLine ? (nextLine.beatPosition ?? nextLine.time * (props.bpm / 60) ?? (index + 1) * 4) : props.totalBeats
  return props.currentBeat >= _nextBeat
}

watch(() => props.currentBeat, () => {
  nextTick(() => {
    const activeLine = containerRef.value?.querySelector('.lyric-line.active')
    if (activeLine) {
      activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
})
</script>

<style scoped>
.lyrics-display {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
  scroll-behavior: smooth;
}
.lyrics-section {
  margin-bottom: 20px;
}
.section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-tertiary);
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border-color-light);
}
.section-chorus .section-label {
  color: var(--bg-highlight);
}
.lyric-line {
  padding: 6px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.25s ease;
  margin-bottom: 2px;
  border-left: 3px solid transparent;
}
.lyric-line:hover {
  background: var(--bg-tertiary);
}
.lyric-line.active {
  background: var(--bg-highlight-light);
  border-left-color: var(--bg-highlight);
}
.lyric-line.active .lyric-text {
  color: var(--text-primary);
  font-weight: 600;
}
.lyric-line.active .inline-chord {
  background: var(--bg-highlight);
  color: #fff;
}
.lyric-line.past {
  opacity: 0.5;
}
.lyric-line.past .lyric-text {
  opacity: 0.7;
}
.lyric-chords {
  display: flex;
  gap: 6px;
  margin-bottom: 2px;
  flex-wrap: wrap;
}
.inline-chord {
  font-size: 12px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--bg-highlight);
  transition: all 0.2s ease;
}
.lyric-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary);
  transition: all 0.25s ease;
}
.lyrics-fallback {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.lyrics-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
}
.empty-icon {
  font-size: 36px;
  margin-bottom: 12px;
}
.lyrics-empty p {
  margin-bottom: 4px;
}
.empty-hint {
  font-size: 13px;
}
</style>