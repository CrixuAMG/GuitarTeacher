<template>
  <div class="technique-lottery">
    <div class="lottery-header card">
      <h2>Technique Lottery</h2>
      <p class="subtitle">Spin the wheel to pick today's practice focus</p>
    </div>

    <div class="wheel-section card">
      <div class="wheel-wrapper">
        <div class="pointer">▼</div>
        <canvas ref="canvasRef" class="wheel-canvas" :width="canvasSize" :height="canvasSize"></canvas>
      </div>

      <button
        class="spin-btn"
        :disabled="isSpinning"
        @click="spin"
      >
        {{ isSpinning ? 'Spinning...' : 'Spin the Wheel' }}
      </button>
    </div>

    <div v-if="selectedTechnique" class="result-card card">
      <div class="result-technique" :style="{ color: selectedTechnique.color }">
        <span class="result-icon">🎯</span>
        <h3>{{ selectedTechnique.name }}</h3>
      </div>
      <p class="result-desc">{{ selectedTechnique.description }}</p>
      <div class="result-actions">
        <button class="action-btn" @click="spin">Spin Again</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'

const TECHNIQUES = [
  { name: 'Alternate Picking', color: '#ef4444', description: 'Pick every note with strict down-up motion. Great for speed and precision.' },
  { name: 'Hammer-Ons', color: '#f97316', description: 'Sound a higher note by striking the string with a fretting finger.' },
  { name: 'Pull-Offs', color: '#f59e0b', description: 'Sound a lower note by pulling the string off with a fretting finger.' },
  { name: 'String Bending', color: '#84cc16', description: 'Raise the pitch by pushing or pulling the string sideways. Essential for blues and rock.' },
  { name: 'Vibrato', color: '#22c55e', description: 'Add expression by oscillating the pitch of a sustained note.' },
  { name: 'Slides', color: '#14b8a6', description: 'Move smoothly from one fret to another without re-picking.' },
  { name: 'Palm Muting', color: '#06b6d4', description: 'Rest the side of your picking hand on the strings for a chunky, percussive sound.' },
  { name: 'Fingerstyle', color: '#3b82f6', description: 'Pluck strings with fingertips instead of a pick. Adds warmth and control.' },
  { name: 'Sweep Picking', color: '#6366f1', description: 'Play arpeggios with one continuous picking motion across strings.' },
  { name: 'String Skipping', color: '#8b5cf6', description: 'Jump over adjacent strings to create wide melodic leaps.' },
  { name: 'Economy Picking', color: '#a855f7', description: 'Minimize picking motion by using the same direction when changing strings.' },
  { name: 'Hybrid Picking', color: '#d946ef', description: 'Combine pick and fingers for fluid lines and wide interval jumps.' },
  { name: 'Tremolo Picking', color: '#ec4899', description: 'Rapidly alternate pick a single note for a sustained, shimmering effect.' },
  { name: 'Double Stops', color: '#f43f5e', description: 'Play two notes at once for a thicker, harmonized sound.' },
  { name: 'Tapping', color: '#fb7185', description: 'Use fingers from your picking hand to hammer notes on the fretboard.' },
  { name: 'Natural Harmonics', color: '#fca5a5', description: 'Lightly touch the string at specific nodes for bell-like overtones.' },
]

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isSpinning = ref(false)
const selectedTechnique = ref<typeof TECHNIQUES[number] | null>(null)

const WHEEL_SIZE = 400
const canvasSize = WHEEL_SIZE * 2 // retina

let rotation = 0
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let animId = 0

function drawWheel() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = 2
  const size = WHEEL_SIZE * dpr
  const cx = size / 2
  const cy = size / 2
  const radius = (WHEEL_SIZE / 2 - 8) * dpr

  ctx.clearRect(0, 0, size, size)

  const count = TECHNIQUES.length
  const angleStep = (Math.PI * 2) / count

  // Draw segments
  for (let i = 0; i < count; i++) {
    const startAngle = i * angleStep + (rotation * Math.PI / 180)
    const endAngle = (i + 1) * angleStep + (rotation * Math.PI / 180)
    const midAngle = (startAngle + endAngle) / 2

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = TECHNIQUES[i].color
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'
    ctx.lineWidth = 2 * dpr
    ctx.stroke()

    // Draw text
    const textRadius = radius * 0.65
    const tx = cx + Math.cos(midAngle) * textRadius
    const ty = cy + Math.sin(midAngle) * textRadius

    ctx.save()
    ctx.translate(tx, ty)
    // Keep text upright
    let textRot = midAngle + Math.PI / 2
    if (textRot > Math.PI / 2 && textRot < 3 * Math.PI / 2) {
      textRot += Math.PI
    }
    ctx.rotate(textRot)
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${12 * dpr}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(TECHNIQUES[i].name, 0, 0)
    ctx.restore()
  }

  // Center circle
  ctx.beginPath()
  ctx.arc(cx, cy, 20 * dpr, 0, Math.PI * 2)
  ctx.fillStyle = 'var(--bg-primary, #1a1a1a)'
  ctx.fill()
  ctx.strokeStyle = 'var(--border-color, #444)'
  ctx.lineWidth = 3 * dpr
  ctx.stroke()
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function spin() {
  if (isSpinning.value) return
  isSpinning.value = true
  selectedTechnique.value = null

  const minSpins = 5
  const extraRotation = Math.random() * 360
  const targetRotation = rotation + minSpins * 360 + extraRotation
  const duration = 3500
  const startTime = performance.now()
  const startRotation = rotation

  function animate(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeOutCubic(progress)

    rotation = startRotation + (targetRotation - startRotation) * eased
    drawWheel()

    if (progress < 1) {
      animId = requestAnimationFrame(animate)
    } else {
      isSpinning.value = false
      // Normalize rotation to 0-360
      const normalized = ((rotation % 360) + 360) % 360
      // Pointer is at top (270 degrees / -90 in standard math). Need to account for rotation direction.
      // The wheel rotates clockwise. At 0 rotation, segment 0 starts at 0 radians (right).
      // Wait, in drawWheel, segment 0 starts at 0 + rotation. So at rotation=0, segment 0 is at 3 o'clock.
      // But our pointer is at 12 o'clock. The angle at top is -90 degrees or 270 degrees.
      // Since canvas arc 0 is at 3 o'clock, the top corresponds to angle -PI/2 or 3PI/2.
      // In our rotation logic: the wheel rotates clockwise. So to find what's at top, we look at
      // what segment covers the angle -PI/2 - rotation (because the wheel rotated clockwise by `rotation`).
      // Actually: segment i covers angles [i*step + rot, (i+1)*step + rot].
      // We want the segment that covers angle -PI/2 (top).
      // i*step + rot <= -PI/2 + 2PI*k <= (i+1)*step + rot
      // i <= (-PI/2 - rot + 2PI*k) / step <= i+1
      // Since step = 2PI/n, let's work in degrees.
      // Segment i covers [i*(360/n) + rot, (i+1)*(360/n) + rot]
      // Top is at 270 degrees (or -90).
      // We want i such that i*(360/n) + rot <= 270 + 360*k <= (i+1)*(360/n) + rot
      // Effective pointer angle = (270 - rot) mod 360
      const pointerAngle = (270 - normalized + 360) % 360
      const segmentAngle = 360 / TECHNIQUES.length
      const index = Math.floor(pointerAngle / segmentAngle)
      selectedTechnique.value = TECHNIQUES[index]
    }
  }

  animId = requestAnimationFrame(animate)
}

onMounted(() => {
  nextTick(() => drawWheel())
})

watch(() => canvasRef.value, () => {
  nextTick(() => drawWheel())
})
</script>

<style scoped>
.technique-lottery {
  padding: 0 24px 48px;
  max-width: 600px;
  margin: 0 auto;
}

.lottery-header {
  padding: 24px;
  margin-bottom: 24px;
}

.lottery-header h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
}

/* Wheel */
.wheel-section {
  padding: 32px 24px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.wheel-wrapper {
  position: relative;
  width: 320px;
  height: 320px;
}

.wheel-canvas {
  width: 320px;
  height: 320px;
  border-radius: 50%;
}

.pointer {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  color: var(--bg-highlight);
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

.spin-btn {
  padding: 14px 40px;
  border-radius: var(--radius-xl);
  border: none;
  background: var(--bg-highlight);
  color: white;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.spin-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.spin-btn:active:not(:disabled) {
  transform: translateY(0);
}

.spin-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Result */
.result-card {
  padding: 24px;
  text-align: center;
}

.result-technique {
  margin-bottom: 12px;
}

.result-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.result-technique h3 {
  font-size: 28px;
  font-weight: 800;
}

.result-desc {
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto 20px;
}

.result-actions {
  display: flex;
  justify-content: center;
}

.action-btn {
  padding: 10px 28px;
  border-radius: var(--radius-xl);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: var(--bg-highlight);
  color: var(--bg-highlight);
}

@media (max-width: 600px) {
  .technique-lottery {
    padding: 0 12px 32px;
  }
  .wheel-wrapper {
    width: 260px;
    height: 260px;
  }
  .wheel-canvas {
    width: 260px;
    height: 260px;
  }
  .result-technique h3 {
    font-size: 22px;
  }
}
</style>
