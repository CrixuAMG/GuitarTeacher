<template>
  <div class="mastery-section">
    <div class="mastery-header">
      <div>
        <h2>Mastery Levels</h2>
        <p class="mastery-subtitle">Track your skill progression across categories</p>
      </div>
      <div class="overall-mastery">
        <span class="overall-label">Overall</span>
        <span class="overall-level" :style="{ background: getOverallColor }">{{ overallMastery }}</span>
      </div>
    </div>

    <div class="mastery-grid">
      <div
        v-for="cat in MASTERY_CATEGORIES"
        :key="cat.id"
        class="mastery-card card"
        :style="{ '--mastery-color': cat.color }"
      >
        <div class="mastery-card-header">
          <span class="mastery-icon">{{ cat.icon }}</span>
          <div class="mastery-info">
            <span class="mastery-name">{{ cat.name }}</span>
            <span class="mastery-desc">{{ cat.description }}</span>
          </div>
          <span class="mastery-level-badge" :style="{ background: cat.color }">
            Lv.{{ getCategoryLevel(cat.id) }}
          </span>
        </div>
        <div class="mastery-bar-container">
          <div class="mastery-bar-bg">
            <div
              class="mastery-bar-fill"
              :style="{ width: `${getCategoryProgress(cat.id)}%`, background: cat.color }"
            ></div>
          </div>
          <span class="mastery-xp">{{ mastery[cat.id] || 0 }} XP</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGamificationStore } from '../stores/gamificationStore'

const gamification = useGamificationStore()

const MASTERY_CATEGORIES = gamification.MASTERY_CATEGORIES
const mastery = computed(() => gamification.mastery || {})
const masteryLevels = computed(() => gamification.masteryLevels || {})
const masteryProgress = computed(() => gamification.masteryProgress || {})
const overallMastery = computed(() => gamification.overallMastery || 1)

function getCategoryLevel(categoryId) {
  return masteryLevels.value[categoryId as keyof typeof masteryLevels.value] || 1
}

function getCategoryProgress(categoryId) {
  return masteryProgress.value[categoryId as keyof typeof masteryProgress.value] || 0
}

const getOverallColor = computed(() => {
  const level = overallMastery.value
  if (level >= 9) return '#10b981'
  if (level >= 7) return '#8b5cf6'
  if (level >= 5) return '#3b82f6'
  if (level >= 3) return '#f59e0b'
  return '#22c55e'
})
</script>

<style scoped>
.mastery-section {
  margin-bottom: 32px;
}

.mastery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.mastery-header h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.mastery-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.overall-mastery {
  display: flex;
  align-items: center;
  gap: 8px;
}

.overall-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
}

.overall-level {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 16px;
}

.mastery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.mastery-card {
  padding: 16px;
  border-left: 4px solid var(--mastery-color);
}

.mastery-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.mastery-icon {
  font-size: 28px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 10px;
  flex-shrink: 0;
}

.mastery-info {
  flex: 1;
  min-width: 0;
}

.mastery-name {
  display: block;
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 2px;
}

.mastery-desc {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
}

.mastery-level-badge {
  padding: 4px 10px;
  border-radius: 12px;
  color: white;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.mastery-bar-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mastery-bar-bg {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.mastery-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.mastery-xp {
  font-size: 11px;
  color: var(--text-tertiary);
  font-weight: 600;
  min-width: 50px;
  text-align: right;
}
</style>
