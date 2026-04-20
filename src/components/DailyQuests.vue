<template>
  <div class="daily-quests">
    <div class="quests-header">
      <h3>Daily Quests</h3>
      <span class="reset-timer">Resets in {{ timeUntilReset }}</span>
    </div>
    
    <div class="quests-list">
      <div
        v-for="quest in quests"
        :key="quest.id"
        class="quest-item"
        :class="{ completed: quest.completed }"
      >
        <div class="quest-icon">
          <span v-if="quest.completed">✓</span>
          <span v-else>{{ questIcon(quest.type) }}</span>
        </div>
        
        <div class="quest-info">
          <div class="quest-name">{{ quest.name }}</div>
          <div class="quest-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${(quest.progress / quest.target) * 100}%` }"
              />
            </div>
            <span class="progress-text">{{ quest.progress }}/{{ quest.target }}</span>
          </div>
        </div>
        
        <div class="quest-reward">
          <span class="xp-badge">+{{ quest.xpReward }} XP</span>
        </div>
        
        <button
          v-if="quest.completed && !quest.claimed"
          class="claim-btn"
          @click="claimReward(quest.id)"
        >
          Claim
        </button>
        <span v-else-if="quest.claimed" class="claimed-badge">Claimed</span>
      </div>
    </div>
    
    <div v-if="!dailyBonusClaimed" class="daily-bonus">
      <div class="bonus-info">
        <span class="bonus-icon">🎁</span>
        <div>
          <div class="bonus-title">Daily Login Bonus</div>
          <div class="bonus-desc">Come back every day for bonus XP!</div>
        </div>
      </div>
      <button class="claim-bonus-btn" @click="claimDailyBonus">
        Claim +50 XP
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGamificationStore } from '../stores/gamificationStore.ts'

const store = useGamificationStore()

const quests = computed(() => store.dailyQuests || [])
const dailyBonusClaimed = computed(() => store.dailyBonusClaimed)
const timeUntilReset = computed(() => store.timeUntilReset)

const questIcon = (type) => {
  const icons = {
    practice: '🎸',
    learn_chord: '📚',
    perfect_play: '⭐',
    ear_training: '👂',
    transition: '⚡',
    streak: '🔥'
  }
  return icons[type] || '🎯'
}

const claimReward = (questId) => {
  store.claimQuestReward(questId)
}

const claimDailyBonus = () => {
  store.claimDailyBonus()
}

onMounted(() => {
  store.checkAndResetDailyQuests()
})
</script>

<style scoped>
.daily-quests {
  background: var(--surface-color);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quests-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.quests-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.reset-timer {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.quests-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quest-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--background-color);
  border-radius: 12px;
  transition: all 0.2s;
}

.quest-item.completed {
  opacity: 0.7;
}

.quest-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--surface-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.quest-item.completed .quest-icon {
  background: var(--success-color);
  color: white;
}

.quest-info {
  flex: 1;
}

.quest-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.quest-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--surface-color);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.quest-item.completed .progress-fill {
  background: var(--success-color);
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  min-width: 40px;
  text-align: right;
}

.quest-reward .xp-badge {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.claim-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.claim-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.4);
}

.claimed-badge {
  font-size: 0.75rem;
  color: var(--success-color);
  font-weight: 500;
}

.daily-bonus {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.1), rgba(var(--primary-rgb), 0.05));
  border-radius: 12px;
  border: 2px dashed var(--primary-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bonus-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bonus-icon {
  font-size: 2rem;
}

.bonus-title {
  font-weight: 600;
}

.bonus-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.claim-bonus-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.claim-bonus-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.4);
}

@media (max-width: 640px) {
  .daily-quests {
    padding: 1rem;
  }
  
  .daily-bonus {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
  
  .bonus-info {
    flex-direction: column;
  }
}
</style>
