<template>
  <div class="skill-radar card">
    <div class="radar-header">
      <h3>Skill Radar</h3>
      <p class="radar-subtitle">Your strengths and weaknesses across categories</p>
    </div>

    <div class="radar-container">
      <svg viewBox="0 0 300 260" class="radar-svg">
        <!-- Background grid -->
        <g class="grid">
          <polygon
            v-for="n in 5"
            :key="n"
            :points="getPolygonPoints(n / 5)"
            fill="none"
            stroke="var(--border-color)"
            stroke-width="1"
          />
          <!-- Axis lines -->
          <line
            v-for="(cat, i) in categories"
            :key="`axis-${i}`"
            :x1="150"
            :y1="130"
            :x2="getPoint(i, 1).x"
            :y2="getPoint(i, 1).y"
            stroke="var(--border-color)"
            stroke-width="1"
          />
        </g>

        <!-- Data polygon -->
        <polygon
          :points="dataPoints"
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#3b82f6"
          stroke-width="2"
        />

        <!-- Data points -->
        <circle
          v-for="(cat, i) in categories"
          :key="`point-${i}`"
          :cx="getPoint(i, scores[i]).x"
          :cy="getPoint(i, scores[i]).y"
          r="4"
          fill="#3b82f6"
          stroke="white"
          stroke-width="2"
        />

        <!-- Labels -->
        <text
          v-for="(cat, i) in categories"
          :key="`label-${i}`"
          :x="getLabelPoint(i).x"
          :y="getLabelPoint(i).y"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="11"
          font-weight="600"
          fill="var(--text-secondary)"
        >
          {{ cat.name }}
        </text>
      </svg>
    </div>

    <div class="radar-legend">
      <div v-for="(cat, i) in categories" :key="cat.id" class="radar-legend-item">
        <span class="legend-dot" :style="{ background: cat.color }"></span>
        <span class="legend-name">{{ cat.name }}</span>
        <span class="legend-score">{{ Math.round(scores[i] * 100) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGamificationStore } from '../stores/gamificationStore.ts'

const store = useGamificationStore()
const categories = [
  { id: 'chords', name: 'Chords', color: '#ef4444' },
  { id: 'strumming', name: 'Strumming', color: '#f59e0b' },
  { id: 'theory', name: 'Theory', color: '#3b82f6' },
  { id: 'earTraining', name: 'Ear', color: '#8b5cf6' },
  { id: 'repertoire', name: 'Songs', color: '#22c55e' },
  { id: 'technique', name: 'Technique', color: '#ec4899' },
]

const stats = computed(() => (store.stats || {
  chordsLearned: [] as string[],
  strummingTime: 0,
  earTrainingCorrect: 0,
  songsCompleted: [] as string[],
  transitionsPracticed: 0
}))
const progress = computed(() => store.progress || {})

const scores = computed(() => {
  const maxValues = {
    chords: 20,
    strumming: 300,
    theory: 50,
    earTraining: 50,
    repertoire: 10,
    technique: 200
  }

  const raw = [
    (stats.value.chordsLearned?.length || 0) / maxValues.chords,
    (stats.value.strummingTime || 0) / maxValues.strumming,
    Object.values(progress.value).filter(p => p.completed).length / maxValues.theory,
    (stats.value.earTrainingCorrect || 0) / maxValues.earTraining,
    (stats.value.songsCompleted?.length || 0) / maxValues.repertoire,
    (stats.value.transitionsPracticed || 0) / maxValues.technique
  ]

  return raw.map(v => Math.min(1, Math.max(0.05, v)))
})

const dataPoints = computed(() => {
  return scores.value.map((score, i) => {
    const p = getPoint(i, score)
    return `${p.x},${p.y}`
  }).join(' ')
})

function getPoint(index, value) {
  const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2
  const radius = 100 * value
  return {
    x: 150 + Math.cos(angle) * radius,
    y: 130 + Math.sin(angle) * radius
  }
}

function getLabelPoint(index) {
  const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2
  const radius = 120
  return {
    x: 150 + Math.cos(angle) * radius,
    y: 130 + Math.sin(angle) * radius
  }
}

function getPolygonPoints(scale) {
  return categories.map((_, i) => {
    const p = getPoint(i, scale)
    return `${p.x},${p.y}`
  }).join(' ')
}
</script>

<style scoped>
.skill-radar {
  padding: 24px;
}

.radar-header {
  margin-bottom: 16px;
}

.radar-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.radar-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
}

.radar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.radar-svg {
  width: 100%;
  max-width: 300px;
  height: auto;
}

.radar-legend {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.radar-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  color: var(--text-secondary);
}

.legend-score {
  font-weight: 700;
  color: var(--text-primary);
  margin-left: auto;
}

@media (max-width: 600px) {
  .radar-legend {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
