<template>
  <div class="caged-visualizer">
    <div class="caged-controls card">
      <h2>CAGED System</h2>
      <p class="subtitle">Visualize 5 movable major chord shapes across the fretboard</p>

      <div class="key-selector">
        <label>Select Key</label>
        <div class="note-buttons">
          <button
            v-for="note in ROOT_NOTES"
            :key="note"
            class="note-btn"
            :class="{ active: selectedKey === note }"
            @click="selectedKey = note"
          >
            {{ note }}
          </button>
        </div>
      </div>
    </div>

    <div class="shapes-grid">
      <div
        v-for="shape in cagedShapes"
        :key="shape.letter"
        class="shape-card card"
        :class="{ active: selectedShape === shape.letter }"
        @click="selectedShape = shape.letter"
      >
        <div class="shape-header">
          <span class="shape-letter">{{ shape.letter }}</span>
          <span class="shape-position">{{ selectedKey }} at fret {{ shape.fret }}</span>
        </div>
        <div class="shape-fretboard">
          <div class="fretboard-body">
            <div class="nut"></div>
            <div
              v-for="f in displayedFrets"
              :key="'fl'+f"
              class="fret-line"
              :style="{ left: fretToPercent(f) + '%' }"
            />
            <template v-for="s in 6" :key="'str'+s">
              <div
                class="string-line"
                :style="{
                  top: ((s - 0.5) / 6) * 100 + '%',
                  height: s <= 2 ? '1px' : s <= 4 ? '2px' : '3px'
                }"
              />
              <template v-for="f in displayedFrets" :key="'n'+s+'-'+f">
                <div
                  v-if="getNoteAtFret(6 - s, f, shape)"
                  class="note-marker"
                  :class="getNoteClass(6 - s, f, shape)"
                  :style="noteMarkerStyle(s, f)"
                >
                  <span class="note-text">{{ getNoteAtFret(6 - s, f, shape) }}</span>
                </div>
              </template>
            </template>
          </div>
          <div class="fret-nums">
            <span v-for="f in fretLabels" :key="'fn'+f" class="fret-num">{{ f }}</span>
          </div>
        </div>
        <div class="shape-tip">{{ shape.tip }}</div>
      </div>
    </div>

    <div class="caged-info card">
      <h3>How CAGED Works</h3>
      <p>
        The CAGED system uses 5 open chord shapes (C, A, G, E, D) as movable templates.
        Each shape can be shifted up the neck to play any major chord in any key.
        The colored dots show finger positions; <strong class="root">red = root</strong>, <strong class="third">blue = 3rd</strong>, <strong class="fifth">green = 5th</strong>.
      </p>
      <div class="tips-list">
        <div class="tip-item">
          <span class="tip-icon">🎯</span>
          <span>Learn one shape at a time, starting with the E and A shapes</span>
        </div>
        <div class="tip-item">
          <span class="tip-icon">🔗</span>
          <span>Connect shapes by finding shared root notes on adjacent positions</span>
        </div>
        <div class="tip-item">
          <span class="tip-icon">🎵</span>
          <span>Use CAGED to find chords anywhere on the neck without looking up diagrams</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const STRING_TUNING = [4, 11, 7, 2, 9, 4] // E B G D A E as semitone indices (0=C)

const selectedKey = ref('C')
const selectedShape = ref('C')

interface ShapeNote {
  string: number
  fret: number
  type: 'root' | 'third' | 'fifth'
}

interface CagedShape {
  letter: string
  fret: number
  notes: ShapeNote[]
  tip: string
}

// CAGED shapes as finger positions relative to shape root
// Each shape shows where to place fingers for the selected key
function getCagedShapes(key: string): CagedShape[] {
  const rootIdx = ROOT_NOTES.indexOf(key)

  // E shape is barre chord. For key C, barre at 8th fret
  const eFret = (rootIdx - 4 + 12) % 12 // E is index 4
  // A shape is barre chord. For key C, barre at 3rd fret
  const aFret = (rootIdx - 9 + 12) % 12 // A is index 9
  // D shape. For key C, barre at 10th fret
  const dFret = (rootIdx - 2 + 12) % 12 // D is index 2
  // C shape. For key C, shape at 3rd fret
  const cFret = rootIdx // C is index 0
  // G shape. For key C, shape at 3rd fret (G is index 7, so 5 frets up)
  const gFret = (rootIdx - 7 + 12) % 12 // G is index 7

  return [
    {
      letter: 'C',
      fret: cFret || 12,
      notes: [
        { string: 5, fret: cFret + 3, type: 'root' },
        { string: 4, fret: cFret + 2, type: 'third' },
        { string: 3, fret: cFret, type: 'fifth' },
        { string: 2, fret: cFret + 1, type: 'root' },
        { string: 1, fret: cFret, type: 'third' },
      ],
      tip: 'C shape: root on A string. High position, great for adding melody notes.',
    },
    {
      letter: 'A',
      fret: aFret,
      notes: [
        { string: 5, fret: aFret, type: 'root' },
        { string: 4, fret: aFret + 2, type: 'fifth' },
        { string: 3, fret: aFret + 2, type: 'root' },
        { string: 2, fret: aFret + 2, type: 'third' },
        { string: 1, fret: aFret, type: 'root' },
      ],
      tip: 'A shape: barre chord, root on A string. Very common rock/pop voicing.',
    },
    {
      letter: 'G',
      fret: gFret,
      notes: [
        { string: 6, fret: gFret + 3, type: 'root' },
        { string: 5, fret: gFret + 2, type: 'third' },
        { string: 4, fret: gFret, type: 'fifth' },
        { string: 3, fret: gFret, type: 'root' },
        { string: 2, fret: gFret + 3, type: 'third' },
        { string: 1, fret: gFret + 3, type: 'root' },
      ],
      tip: 'G shape: root on low E and high E. Stretchy but adds high-end sparkle.',
    },
    {
      letter: 'E',
      fret: eFret,
      notes: [
        { string: 6, fret: eFret, type: 'root' },
        { string: 5, fret: eFret + 2, type: 'fifth' },
        { string: 4, fret: eFret + 2, type: 'root' },
        { string: 3, fret: eFret + 1, type: 'third' },
        { string: 2, fret: eFret, type: 'root' },
        { string: 1, fret: eFret, type: 'root' },
      ],
      tip: 'E shape: the classic barre chord. Root on low E string. Essential.',
    },
    {
      letter: 'D',
      fret: dFret,
      notes: [
        { string: 4, fret: dFret, type: 'root' },
        { string: 3, fret: dFret + 2, type: 'fifth' },
        { string: 2, fret: dFret + 3, type: 'root' },
        { string: 1, fret: dFret + 2, type: 'third' },
      ],
      tip: 'D shape: higher voicing, root on D string. Great for upper-register color.',
    },
  ]
}

const cagedShapes = computed(() => getCagedShapes(selectedKey.value))

const minFret = computed(() => {
  const frets = cagedShapes.value.flatMap(s => s.notes.map(n => n.fret))
  return Math.max(0, Math.min(...frets) - 1)
})

const maxFret = computed(() => {
  const frets = cagedShapes.value.flatMap(s => s.notes.map(n => n.fret))
  return Math.max(...frets) + 2
})

const displayedFrets = computed(() => {
  const arr = []
  for (let f = minFret.value; f <= maxFret.value && f <= 15; f++) {
    if (f > 0) arr.push(f)
  }
  return arr
})

const fretLabels = computed(() => {
  return [minFret.value, ...displayedFrets.value]
})

function fretToPercent(fret: number): number {
  const range = maxFret.value - minFret.value + 1
  return ((fret - minFret.value + 0.5) / range) * 100
}

function getNoteAtFret(stringIdx: number, fret: number, shape: CagedShape): string | null {
  const note = shape.notes.find(n => n.string === stringIdx && n.fret === fret)
  if (!note) return null
  const openNote = STRING_TUNING[stringIdx]
  const noteIdx = (openNote + fret) % 12
  return ROOT_NOTES[noteIdx]
}

function getNoteClass(stringIdx: number, fret: number, shape: CagedShape): string {
  const note = shape.notes.find(n => n.string === stringIdx && n.fret === fret)
  return note ? note.type : ''
}

function noteMarkerStyle(stringVisualIndex: number, fret: number) {
  const visualPosition = 6 - stringVisualIndex
  return {
    left: fretToPercent(fret) + '%',
    top: ((visualPosition + 0.5) / 6) * 100 + '%',
  }
}
</script>

<style scoped>
.caged-visualizer {
  padding: 0 24px 48px;
  max-width: 900px;
  margin: 0 auto;
}

.caged-controls {
  padding: 24px;
  margin-bottom: 24px;
}

.caged-controls h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.key-selector label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 10px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.note-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.note-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.note-btn:hover {
  border-color: var(--bg-highlight);
  color: var(--bg-highlight);
}

.note-btn.active {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

/* Shape Grid */
.shapes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.shape-card {
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid var(--border-color);
}

.shape-card:hover {
  border-color: var(--bg-highlight);
}

.shape-card.active {
  border-color: var(--bg-highlight);
  box-shadow: 0 0 0 3px var(--bg-highlight-light);
}

.shape-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.shape-letter {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-highlight);
  color: white;
  font-size: 18px;
  font-weight: 800;
}

.shape-position {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Mini Fretboard */
.shape-fretboard {
  margin-bottom: 10px;
}

.fretboard-body {
  position: relative;
  background: var(--bg-fretboard, #2a2a2a);
  border-radius: 6px;
  height: 130px;
  overflow: hidden;
  border: 2px solid var(--bg-fret, #444);
}

.nut {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background: var(--text-tertiary, #888);
  z-index: 4;
}

.fret-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--bg-fret, #555);
  z-index: 1;
  transform: translateX(-50%);
}

.string-line {
  position: absolute;
  left: 6px;
  right: 0;
  background: var(--string-color, #aaa);
  z-index: 2;
  transform: translateY(-50%);
}

.note-marker {
  position: absolute;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  z-index: 5;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  color: white;
}

.note-marker.root {
  background: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
}

.note-marker.third {
  background: #3b82f6;
}

.note-marker.fifth {
  background: #22c55e;
}

.fret-nums {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  padding-left: 6px;
}

.fret-num {
  font-size: 10px;
  color: var(--text-tertiary);
  min-width: 16px;
  text-align: center;
}

.shape-tip {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Info Section */
.caged-info {
  padding: 24px;
}

.caged-info h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
}

.caged-info p {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.caged-info .root { color: #ef4444; font-weight: 700; }
.caged-info .third { color: #3b82f6; font-weight: 700; }
.caged-info .fifth { color: #22c55e; font-weight: 700; }

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-primary);
}

.tip-icon {
  font-size: 18px;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .caged-visualizer {
    padding: 0 12px 32px;
  }
  .shapes-grid {
    grid-template-columns: 1fr;
  }
  .note-btn {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }
}
</style>
