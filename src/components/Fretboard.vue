<template>
  <div class="fretboard-container" :class="{ 'left-handed': isLeftHanded }">
    <div class="fretboard" :style="{ '--strings': 6, '--frets': frets + 1 }">
      <div class="fretboard-header">
        <div v-for="s in 6" :key="'h'+s" class="string-header" :class="{ muted: chord.strings[stringHeaderIndex(s)] === -1 }">
          {{ chord.strings[stringHeaderIndex(s)] === -1 ? 'X' : STRING_NAMES[stringHeaderIndex(s)] }}
        </div>
      </div>
      <div class="fretboard-body">
        <div class="nut"></div>
        <div v-for="fret in frets" :key="'f'+fret" class="fret-line" :style="{ left: (fret / (frets + 0.5)) * 100 + '%' }">
        </div>
        <template v-for="s in 6" :key="'s'+s">
          <div class="string-line" :style="{ top: ((s - 0.5) / 6) * 100 + '%', height: s <= 2 ? '2px' : s <= 4 ? '3px' : '4px' }"></div>
          <template v-for="fret in frets" :key="'d'+s+'-'+fret">
            <div
              v-if="isActiveFret(6-s, fret)"
              class="finger-dot"
              :class="{ 'barre-dot': isBarreFret(6-s, fret) }"
              :style="fingerDotStyle(6-s, fret)"
            >
              <span v-if="!isBarreFret(6-s, fret)" class="finger-number">{{ chord.fingers[6-s] }}</span>
            </div>
          </template>
          <div
            v-if="chord.strings[6-s] === 0"
            class="open-marker"
            :style="{ top: ((s - 0.5) / 6) * 100 + '%', left: fretToX(0) }"
          ></div>
        </template>
        <div v-if="chord.barre" class="barre-indicator" :style="barreStyle()"></div>
      </div>
      <div class="fret-numbers">
        <div class="fret-zero-num">0</div>
        <div v-for="fret in frets" :key="'fn'+fret" class="fret-num" :style="{ left: fretToX(fret) }">{{ fret }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { STRING_NAMES } from '../data/chords.js'
import { useSettings } from '../composables/useSettings.ts'

const { isLeftHanded } = useSettings()

const props = defineProps({
  chord: { type: Object, required: true },
  highlight: { type: Boolean, default: false },
  maxFrets: { type: Number, default: 5 }
})

const frets = computed(() => {
  const maxFret = Math.max(...props.chord.strings.filter(f => f >= 0), 3)
  return Math.min(maxFret + 1, props.maxFrets)
})

function isActiveFret(stringIdx, fret) {
  return props.chord.strings[stringIdx] === fret
}

function isBarreFret(stringIdx, fret) {
  return props.chord.barre && props.chord.barre.fret === fret && stringIdx >= props.chord.barre.fromString && stringIdx <= props.chord.barre.toString
}

function fretToX(fret) {
  return ((fret + 0.35) / (frets.value + 0.5)) * 100 + '%'
}

function fingerDotStyle(stringIdx, fret) {
  // stringIdx is 0-5 (low E to high E)
  // We need to map this to visual position (top to bottom)
  // String 0 (low E) should be at bottom, String 5 (high E) at top
  const visualPosition = 5 - stringIdx
  return {
    left: fretToX(fret),
    top: ((visualPosition + 0.5) / 6) * 100 + '%'
  }
}

function barreStyle() {
  const barre = props.chord.barre
  if (!barre) return {}
  const topString = 5 - barre.toString
  const bottomString = 5 - barre.fromString
  const top = ((topString + 0.5) / 6) * 100
  const bottom = ((bottomString + 0.5) / 6) * 100
  return {
    left: fretToX(barre.fret),
    top: top + '%',
    height: (bottom - top) + '%'
  }
}

function stringHeaderIndex(s) {
  // s goes 1-6
  // Right-handed: high E on left (index 5), low E on right (index 0)
  // Left-handed: low E on left (index 0), high E on right (index 5)
  return isLeftHanded.value ? s - 1 : 6 - s
}
</script>

<style scoped>
.fretboard-container {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}
.fretboard {
  position: relative;
  user-select: none;
}
.fretboard-header {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  text-align: center;
  margin-bottom: 4px;
}
.string-header {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  padding: 2px 0;
}
.string-header.muted {
  color: var(--bg-danger);
  opacity: 0.7;
}
.fretboard-body {
  position: relative;
  background: var(--bg-fretboard);
  border-radius: 8px;
  height: 180px;
  overflow: hidden;
  border: 2px solid var(--bg-fret);
}
.nut {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 10px;
  background: var(--text-tertiary);
  z-index: 4;
  border-radius: 2px;
}
.fret-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--bg-fret);
  z-index: 1;
  transform: translateX(-50%);
}
.string-line {
  position: absolute;
  left: 10px;
  right: 0;
  background: var(--string-color);
  z-index: 2;
  transform: translateY(-50%);
}
.finger-dot {
  position: absolute;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--finger-bg);
  z-index: 5;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
.finger-number {
  color: var(--finger-fg);
  font-size: 11px;
  font-weight: 700;
}
.barre-indicator {
  position: absolute;
  width: 28px;
  background: var(--barre-color);
  border-radius: 6px;
  z-index: 4;
  transform: translate(-50%, -50%);
  opacity: 0.7;
}
.open-marker {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid var(--text-secondary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-fretboard);
  z-index: 5;
}
.fret-numbers {
  position: relative;
  height: 24px;
  margin-top: 4px;
}
.fret-zero-num {
  position: absolute;
  left: 0;
  font-size: 11px;
  color: var(--text-tertiary);
  transform: translateX(3px);
}
.fret-num {
  position: absolute;
  font-size: 11px;
  color: var(--text-tertiary);
  transform: translateX(-50%);
}

/* Left-handed mode */
.fretboard-container.left-handed .fretboard-body {
  transform: scaleX(-1);
}

.fretboard-container.left-handed .fretboard-header {
  transform: scaleX(-1);
}

.fretboard-container.left-handed .fret-numbers {
  transform: scaleX(-1);
}

.fretboard-container.left-handed .string-header,
.fretboard-container.left-handed .fret-num,
.fretboard-container.left-handed .fret-zero-num {
  transform: scaleX(-1);
}

.fretboard-container.left-handed .finger-dot,
.fretboard-container.left-handed .open-marker,
.fretboard-container.left-handed .barre-indicator {
  transform: translate(-50%, -50%) scaleX(-1);
}

.fretboard-container.left-handed .finger-number {
  display: inline-block;
  transform: scaleX(-1);
}
</style>