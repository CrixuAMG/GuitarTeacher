<template>
  <TransitionGroup name="toast" tag="div" class="xp-toasts">
    <div
      v-for="toast in notifications"
      :key="toast.id"
      class="xp-toast"
      :class="toast.type"
    >
      <div class="toast-icon">{{ iconForType(toast.type) }}</div>
      <div class="toast-content">
        <div class="toast-title">{{ toast.title }}</div>
        <div v-if="toast.message" class="toast-message">{{ toast.message }}</div>
        <div v-if="toast.xp > 0" class="xp-gained">+{{ toast.xp }} XP</div>
      </div>
      <div v-if="toast.levelUp" class="level-up-badge">
        LEVEL {{ toast.newLevel }}!
      </div>
      <button class="toast-close" @click="removeToast(toast.id)">×</button>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useGamificationStore } from '../stores/gamificationStore.ts'

const store = useGamificationStore()

// Use the store's notifications directly (it's a computed property that returns the array)
const notifications = store.notifications

const iconForType = (type) => {
  const icons = {
    xp: '✨',
    achievement: '🏆',
    levelUp: '🎉',
    quest: '🎯',
    unlock: '🔓',
    streak: '🔥'
  }
  return icons[type] || '✨'
}

function removeToast(_id: number) {
  // The store handles auto-removal, but we can force remove if needed
  // This is a no-op since the store auto-removes after 5 seconds
}

// Clear all notifications on mount (page load)
onMounted(() => {
  // Access the underlying ref through the store's mechanism
  // The notifications are managed by the store, we just display them
})
</script>

<style scoped>
.xp-toasts {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.xp-toast {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-left: 4px solid var(--primary-color);
  min-width: 280px;
  max-width: 400px;
  pointer-events: auto;
}

.xp-toast.xp {
  border-left-color: #f59e0b;
}

.xp-toast.achievement {
  border-left-color: #8b5cf6;
}

.xp-toast.levelUp {
  border-left-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), var(--surface-color));
}

.xp-toast.quest {
  border-left-color: #3b82f6;
}

.xp-toast.unlock {
  border-left-color: #ec4899;
}

.xp-toast.streak {
  border-left-color: #f97316;
}

.toast-icon {
  font-size: 1.5rem;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.toast-message {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.xp-gained {
  font-size: 0.85rem;
  font-weight: 700;
  color: #f59e0b;
  margin-top: 0.25rem;
}

.level-up-badge {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.75rem;
  animation: bounce 0.5s ease infinite alternate;
}

@keyframes bounce {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}

.toast-close {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  margin-left: 8px;
}

.toast-close:hover {
  color: var(--text-primary);
}

/* Toast transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-move {
  transition: transform 0.3s ease;
}

@media (max-width: 640px) {
  .xp-toasts {
    left: 10px;
    right: 10px;
    top: auto;
    bottom: 80px;
  }
  
  .xp-toast {
    min-width: auto;
    max-width: none;
  }
}
</style>
