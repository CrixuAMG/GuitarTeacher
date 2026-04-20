<template>
  <canvas
    v-if="active"
    ref="canvasRef"
    class="confetti-canvas"
    :style="{ zIndex }"
  ></canvas>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
  opacity: number
  shape: 'rect' | 'circle'
}

const props = defineProps<{
  modelValue: boolean
  zIndex?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const active = ref(false)
let animationId: number | null = null
let particles: Particle[] = []

const colors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#22c55e', '#10b981', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
]

function createParticle(x: number, y: number): Particle {
  const angle = Math.random() * Math.PI * 2
  const speed = Math.random() * 6 + 2
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - Math.random() * 4 - 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    opacity: 1,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }
}

function spawnParticles(count: number) {
  const canvas = canvasRef.value
  if (!canvas) return
  const cx = canvas.width / 2
  const cy = canvas.height / 2
  for (let i = 0; i < count; i++) {
    particles.push(createParticle(cx, cy))
  }
}

function updateParticles() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  particles.forEach((p) => {
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.15 // gravity
    p.rotation += p.rotationSpeed
    p.opacity -= 0.008
    p.vx *= 0.99 // air resistance

    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate((p.rotation * Math.PI) / 180)
    ctx.globalAlpha = Math.max(0, p.opacity)
    ctx.fillStyle = p.color

    if (p.shape === 'rect') {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
    } else {
      ctx.beginPath()
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  })

  particles = particles.filter((p) => p.opacity > 0)

  if (particles.length > 0) {
    animationId = requestAnimationFrame(updateParticles)
  } else {
    active.value = false
    emit('update:modelValue', false)
  }
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function startConfetti() {
  active.value = true
  resizeCanvas()
  particles = []
  spawnParticles(120)
  if (animationId) cancelAnimationFrame(animationId)
  animationId = requestAnimationFrame(updateParticles)
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) startConfetti()
  }
)

window.addEventListener('resize', resizeCanvas)

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
.confetti-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
}
</style>
