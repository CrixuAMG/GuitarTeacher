<template>
  <div class="achievements-panel card">
    <div class="panel-header">
      <h3 class="panel-title">
        <span class="title-icon">🏆</span>
        Achievements
        <span class="achievement-count">
          {{ unlockedCount }}/{{ totalCount }}
        </span>
      </h3>
      <button 
        v-if="!showAll" 
        class="btn btn-sm btn-secondary"
        @click="showAll = true"
      >
        View All
      </button>
      <button 
        v-else 
        class="btn btn-sm btn-secondary"
        @click="showAll = false"
      >
        Show Less
      </button>
    </div>

    <!-- Category Tabs -->
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="category-tab"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        {{ cat.label }}
        <span class="cat-count">{{ getCategoryProgress(cat.id) }}</span>
      </button>
    </div>

    <!-- Achievements Grid -->
    <div class="achievements-grid" :class="{ expanded: showAll }">
      <div
        v-for="achievement in displayedAchievements"
        :key="achievement.id"
        class="achievement-card"
        :class="{ 
          unlocked: isUnlocked(achievement.id),
          recent: recentlyUnlocked === achievement.id 
        }"
      >
        <div class="achievement-icon">{{ achievement.icon }}</div>
        <div class="achievement-info">
          <div class="achievement-title">{{ achievement.title }}</div>
          <div class="achievement-desc">{{ achievement.description }}</div>
          <div class="achievement-xp">+{{ achievement.xp }} XP</div>
        </div>
        <div v-if="isUnlocked(achievement.id)" class="achievement-check">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div v-else class="achievement-locked">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Unlock Animation Overlay -->
    <Transition name="unlock">
      <div v-if="showUnlockAnimation" class="unlock-overlay" @click="showUnlockAnimation = false">
        <div class="unlock-content">
          <div class="unlock-icon">{{ lastUnlocked?.icon }}</div>
          <div class="unlock-title">Achievement Unlocked!</div>
          <div class="unlock-name">{{ lastUnlocked?.title }}</div>
          <div class="unlock-xp">+{{ lastUnlocked?.xp }} XP</div>
          <button class="btn btn-primary" @click="showUnlockAnimation = false">Awesome!</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps({
  unlockedAchievements: { type: Array, default: () => [] },
  recentlyUnlocked: { type: String, default: '' }
})

const showAll = ref(false)
const activeCategory = ref('all')
const showUnlockAnimation = ref(false)
const lastUnlocked = ref(null)

const categories = [
  { id: 'all', label: 'All' },
  { id: 'learning', label: 'Learning' },
  { id: 'playing', label: 'Playing' },
  { id: 'streak', label: 'Streaks' },
  { id: 'practice', label: 'Practice' },
  { id: 'skills', label: 'Skills' },
  { id: 'special', label: 'Special' }
]

const ACHIEVEMENTS = [
  { id: 'first_chord', title: 'First Steps', description: 'Learn your first chord', icon: '🎸', xp: 50, category: 'learning' },
  { id: 'chord_collector', title: 'Chord Collector', description: 'Learn 10 different chords', icon: '📚', xp: 150, category: 'learning' },
  { id: 'chord_master', title: 'Chord Master', description: 'Learn all basic chords', icon: '🏆', xp: 300, category: 'learning' },
  { id: 'barre_chord', title: 'Barre Hero', description: 'Learn your first barre chord', icon: '💪', xp: 200, category: 'learning' },
  { id: 'first_song', title: 'Song Player', description: 'Complete your first song', icon: '🎵', xp: 100, category: 'playing' },
  { id: 'song_library', title: 'Repertoire', description: 'Complete 5 songs', icon: '📀', xp: 250, category: 'playing' },
  { id: 'perfect_play', title: 'Perfect Performance', description: 'Play through a song without stopping', icon: '⭐', xp: 200, category: 'playing' },
  { id: 'speed_demon', title: 'Speed Demon', description: 'Play a song at 1.5x speed', icon: '💨', xp: 200, category: 'playing' },
  { id: 'practice_streak_3', title: 'Consistency', description: 'Practice 3 days in a row', icon: '🔥', xp: 100, category: 'streak' },
  { id: 'practice_streak_7', title: 'Week Warrior', description: 'Practice 7 days in a row', icon: '⚡', xp: 300, category: 'streak' },
  { id: 'practice_streak_30', title: 'Monthly Master', description: 'Practice 30 days in a row', icon: '🌟', xp: 1000, category: 'streak' },
  { id: 'time_1h', title: 'Getting Serious', description: 'Practice for 1 hour total', icon: '⏱️', xp: 100, category: 'practice' },
  { id: 'time_10h', title: 'Dedicated', description: 'Practice for 10 hours total', icon: '🕐', xp: 500, category: 'practice' },
  { id: 'transitions_100', title: 'Smooth Operator', description: 'Practice 100 chord transitions', icon: '🔄', xp: 200, category: 'practice' },
  { id: 'loop_master', title: 'Loop Master', description: 'Use loop mode 10 times', icon: '🔁', xp: 150, category: 'practice' },
  { id: 'ear_training_novice', title: 'Good Ear', description: 'Score 10 correct in ear training', icon: '🎧', xp: 150, category: 'skills' },
  { id: 'ear_training_pro', title: 'Perfect Pitch', description: 'Score 50 correct in ear training', icon: '👂', xp: 400, category: 'skills' },
  { id: 'tuner_pro', title: 'In Tune', description: 'Tune your guitar 20 times', icon: '🎯', xp: 100, category: 'skills' },
  { id: 'night_owl', title: 'Night Owl', description: 'Practice after 10 PM', icon: '🌙', xp: 50, category: 'special' },
  { id: 'early_bird', title: 'Early Bird', description: 'Practice before 8 AM', icon: '🌅', xp: 50, category: 'special' }
]

const filteredAchievements = computed(() => {
  if (activeCategory.value === 'all') return ACHIEVEMENTS
  return ACHIEVEMENTS.filter(a => a.category === activeCategory.value)
})

const displayedAchievements = computed(() => {
  const list = filteredAchievements.value
  if (showAll.value) return list
  // Show unlocked first, then locked, limit to 6
  const unlocked = list.filter(a => isUnlocked(a.id))
  const locked = list.filter(a => !isUnlocked(a.id))
  return [...unlocked, ...locked].slice(0, 6)
})

const unlockedCount = computed(() => props.unlockedAchievements.length)
const totalCount = computed(() => ACHIEVEMENTS.length)

function isUnlocked(id) {
  return props.unlockedAchievements.includes(id)
}

function getCategoryProgress(catId) {
  if (catId === 'all') return `${unlockedCount.value}/${totalCount.value}`
  const catAchievements = ACHIEVEMENTS.filter(a => a.category === catId)
  const unlocked = catAchievements.filter(a => isUnlocked(a.id)).length
  return `${unlocked}/${catAchievements.length}`
}

watch(() => props.recentlyUnlocked, (newId) => {
  if (newId) {
    lastUnlocked.value = ACHIEVEMENTS.find(a => a.id === newId)
    showUnlockAnimation.value = true
    setTimeout(() => {
      showUnlockAnimation.value = false
    }, 4000)
  }
})
</script>

<style scoped>
.achievements-panel {
  padding: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 20px;
}

.achievement-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 2px 10px;
  border-radius: 20px;
}

.category-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.category-tab {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-tab:hover {
  background: var(--bg-card-hover);
}

.category-tab.active {
  background: var(--bg-highlight);
  color: #fff;
}

.cat-count {
  font-size: 10px;
  opacity: 0.8;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.achievements-grid.expanded {
  max-height: none;
}

.achievement-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  opacity: 0.6;
  transition: all var(--transition);
}

.achievement-card.unlocked {
  opacity: 1;
  background: var(--bg-card);
  border-color: var(--bg-success);
}

.achievement-card.recent {
  animation: achievementPulse 2s ease;
}

@keyframes achievementPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
  50% { box-shadow: 0 0 20px 5px rgba(16, 185, 129, 0.4); }
}

.achievement-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 12px;
  flex-shrink: 0;
}

.achievement-card.unlocked .achievement-icon {
  background: rgba(16, 185, 129, 0.1);
}

.achievement-info {
  flex: 1;
  min-width: 0;
}

.achievement-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 2px;
}

.achievement-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.achievement-xp {
  font-size: 11px;
  font-weight: 700;
  color: var(--bg-highlight);
}

.achievement-check {
  color: var(--bg-success);
  flex-shrink: 0;
}

.achievement-locked {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

/* Unlock Animation */
.unlock-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.unlock-content {
  text-align: center;
  animation: unlockPop 0.5s ease;
}

@keyframes unlockPop {
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.unlock-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: iconBounce 0.6s ease infinite alternate;
}

@keyframes iconBounce {
  from { transform: translateY(0); }
  to { transform: translateY(-10px); }
}

.unlock-title {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.unlock-name {
  font-size: 32px;
  font-weight: 700;
  color: var(--bg-success);
  margin-bottom: 8px;
}

.unlock-xp {
  font-size: 20px;
  font-weight: 700;
  color: var(--bg-highlight);
  margin-bottom: 24px;
}

.unlock-enter-active,
.unlock-leave-active {
  transition: all 0.3s ease;
}

.unlock-enter-from,
.unlock-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .achievements-grid {
    grid-template-columns: 1fr;
  }
}
</style>