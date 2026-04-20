<template>
  <div class="level-progress" :class="{ compact }">
    <div class="level-badge" :style="{ background: currentLevel.color }">
      <span class="level-number">{{ currentLevel.level }}</span>
      <span class="level-title">{{ currentLevel.title }}</span>
    </div>
    
    <div class="progress-section">
      <div class="xp-info">
        <span class="xp-current">{{ xp }} XP</span>
        <span v-if="nextLevel" class="xp-needed">
          / {{ nextLevel.xpRequired }} XP
        </span>
        <span v-else class="xp-max">MAX LEVEL</span>
      </div>
      
      <div class="xp-bar-container">
        <div class="xp-bar-bg">
          <div 
            class="xp-bar-fill" 
            :style="{ 
              width: progressPercent + '%',
              background: `linear-gradient(90deg, ${currentLevel.color}, ${nextLevel?.color || currentLevel.color})`
            }"
          >
            <div class="xp-shine"></div>
          </div>
        </div>
        <div class="level-markers">
          <div 
            v-for="lvl in visibleLevels" 
            :key="lvl.level"
            class="level-marker"
            :class="{ passed: lvl.level <= currentLevel.level }"
            :style="{ left: getLevelPosition(lvl) + '%' }"
          >
            <span class="marker-dot"></span>
            <span class="marker-label">{{ lvl.level }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  compact: { type: Boolean, default: false },
})

const XP_LEVELS = [
  { level: 1, title: 'Beginner', xpRequired: 0, color: '#94a3b8' },
  { level: 2, title: 'Rookie', xpRequired: 100, color: '#22c55e' },
  { level: 3, title: 'Apprentice', xpRequired: 300, color: '#3b82f6' },
  { level: 4, title: 'Musician', xpRequired: 600, color: '#8b5cf6' },
  { level: 5, title: 'Performer', xpRequired: 1000, color: '#f59e0b' },
  { level: 6, title: 'Virtuoso', xpRequired: 1500, color: '#ef4444' },
  { level: 7, title: 'Rockstar', xpRequired: 2200, color: '#ec4899' },
  { level: 8, title: 'Legend', xpRequired: 3000, color: '#fbbf24' },
  { level: 9, title: 'Guitar God', xpRequired: 4000, color: '#a855f7' },
  { level: 10, title: 'Master', xpRequired: 5500, color: '#10b981' }
]

const currentLevel = computed(() => {
  return XP_LEVELS.find(l => l.level === props.level) || XP_LEVELS[0]
})

const nextLevel = computed(() => {
  return XP_LEVELS.find(l => l.level === props.level + 1)
})

const progressPercent = computed(() => {
  if (!nextLevel.value) return 100
  const currentXpReq = currentLevel.value.xpRequired
  const nextXpReq = nextLevel.value.xpRequired
  const xpInLevel = props.xp - currentXpReq
  const xpNeeded = nextXpReq - currentXpReq
  return Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100))
})

const visibleLevels = computed(() => {
  return XP_LEVELS.filter(l => l.level >= props.level && l.level <= props.level + 3)
})

function getLevelPosition(level) {
  if (!nextLevel.value) return 100
  const currentXpReq = currentLevel.value.xpRequired
  const nextXpReq = nextLevel.value.xpRequired
  const xpRange = nextXpReq - currentXpReq
  const levelXp = level.xpRequired - currentXpReq
  return Math.min(100, Math.max(0, (levelXp / xpRange) * 100))
}
</script>

<style scoped>
.level-progress {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.level-progress.compact {
  padding: 12px 16px;
}

.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  color: #fff;
  font-weight: 700;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.level-number {
  font-size: 18px;
  line-height: 1;
}

.level-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.progress-section {
  margin-bottom: 12px;
}

.xp-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  margin-bottom: 8px;
}

.xp-current {
  font-weight: 700;
  color: var(--bg-highlight);
}

.xp-needed {
  color: var(--text-tertiary);
}

.xp-max {
  color: var(--bg-success);
  font-weight: 700;
}

.xp-bar-container {
  position: relative;
}

.xp-bar-bg {
  height: 12px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.xp-bar-fill {
  height: 100%;
  border-radius: 6px;
  position: relative;
  transition: width 0.5s ease;
}

.xp-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.3), transparent);
  border-radius: 6px 6px 0 0;
}

.level-markers {
  position: relative;
  height: 20px;
  margin-top: 4px;
}

.level-marker {
  position: absolute;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.marker-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-color);
  transition: all 0.3s ease;
}

.level-marker.passed .marker-dot {
  background: var(--bg-success);
  box-shadow: 0 0 6px var(--bg-success);
}

.marker-label {
  font-size: 10px;
  color: var(--text-tertiary);
  font-weight: 600;
}

.level-marker.passed .marker-label {
  color: var(--text-secondary);
}

.compact .level-badge {
  margin-bottom: 8px;
}

.compact .xp-bar-bg {
  height: 8px;
}

.compact .level-markers {
  display: none;
}
</style>