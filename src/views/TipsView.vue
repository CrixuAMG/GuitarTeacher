<template>
  <div class="tips-view">
    <header class="tips-header">
      <h1>{{ $t('tips.title') }}</h1>
      <p class="subtitle">{{ $t('tips.subtitle') }}</p>
    </header>

    <div class="goal-filters">
      <button
        v-for="goal in allGoals"
        :key="goal.key"
        class="filter-btn"
        :class="{ active: selectedGoals.includes(goal.key) }"
        @click="toggleGoal(goal.key)"
      >
        <span class="filter-icon">{{ goal.icon }}</span>
        <span class="filter-label">{{ $t('goals.' + goal.key) }}</span>
      </button>
    </div>

    <div v-if="filteredTips.length > 0" class="tips-grid">
      <div v-for="(tip, index) in filteredTips" :key="index" class="tip-card">
        <div class="tip-goal-tag" :class="tip.goal">
          <span class="tag-icon">{{ getGoalIcon(tip.goal) }}</span>
          {{ $t('goals.' + tip.goal) }}
        </div>
        <p class="tip-text">{{ tip.text }}</p>
      </div>
    </div>

    <div v-else class="empty-state">
      <span class="empty-icon">💡</span>
      <p>{{ $t('tips.noTips') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProfileStore } from '../stores/profileStore'

const { t } = useI18n()
const profileStore = useProfileStore()

const allGoals = [
  { key: 'rhythm', icon: '🥁' },
  { key: 'lead', icon: '🎸' },
  { key: 'barre', icon: '🎼' },
  { key: 'fingerpicking', icon: '✋' },
  { key: 'chords', icon: '🎵' },
  { key: 'scales', icon: '🎹' },
]

const selectedGoals = ref<string[]>([...profileStore.activeProfile?.goals || []])

const allTips = computed(() => {
  const tipsObj = t('tips') as unknown as Record<string, string[]>
  const tips: { goal: string; text: string }[] = []
  
  for (const goal in tipsObj) {
    if (Array.isArray(tipsObj[goal])) {
      for (const tip of tipsObj[goal]) {
        tips.push({ goal, text: tip })
      }
    }
  }
  
  return tips
})

const filteredTips = computed(() => {
  if (selectedGoals.value.length === 0) return allTips.value
  return allTips.value.filter(tip => selectedGoals.value.includes(tip.goal))
})

function toggleGoal(goal: string) {
  const index = selectedGoals.value.indexOf(goal)
  if (index === -1) {
    selectedGoals.value.push(goal)
  } else {
    selectedGoals.value.splice(index, 1)
  }
}

function getGoalIcon(goal: string): string {
  return allGoals.find(g => g.key === goal)?.icon || '💡'
}
</script>

<style scoped>
.tips-view {
  padding: 0 24px 48px;
  max-width: 900px;
  margin: 0 auto;
}

.tips-header {
  margin-bottom: 32px;
}

.tips-header h1 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 16px;
}

.goal-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 32px;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.filter-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.filter-btn.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.filter-icon {
  font-size: 18px;
}

.tips-grid {
  display: grid;
  gap: 16px;
}

.tip-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
}

.tip-goal-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
  background: var(--accent-color);
  color: white;
  opacity: 0.7;
}

.tip-goal-tag.rhythm { background: #f59e0b; }
.tip-goal-tag.lead { background: #8b5cf6; }
.tip-goal-tag.barre { background: #10b981; }
.tip-goal-tag.fingerpicking { background: #ec4899; }
.tip-goal-tag.chords { background: #3b82f6; }
.tip-goal-tag.scales { background: #ef4444; }

.tag-icon {
  font-size: 14px;
}

.tip-text {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 48px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

@media (max-width: 600px) {
  .goal-filters {
    gap: 8px;
  }
  
  .filter-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>