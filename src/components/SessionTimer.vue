<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="sessionStore.isSessionActive" class="session-timer" :class="{ expanded: isExpanded }" @mouseenter="isExpanded = true" @mouseleave="isExpanded = false">
        <div class="timer-main" @click="toggleExpanded">
          <span class="timer-icon">🎯</span>
          <span class="timer-display">{{ formattedTime }}</span>
          <span class="goal-label">{{ goalName }}</span>
        </div>

        <div v-if="isExpanded" class="timer-controls">
          <button class="stop-btn" @click="openRatingModal">
            {{ t('session.stopSession') }}
          </button>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="showRatingModal" class="rating-overlay" @click.self="closeModal">
        <div class="rating-modal">
          <h3>{{ t('session.howWasSession') }}</h3>
          <div class="rating-stars">
            <button
              v-for="star in 5"
              :key="star"
              class="star-btn"
              :class="{ active: rating >= star }"
              @click="rating = star as 1 | 2 | 3 | 4 | 5"
            >
              ★
            </button>
          </div>
          <textarea
            v-model="comment"
            :placeholder="t('session.commentPlaceholder')"
            rows="3"
          ></textarea>
          <div class="rating-actions">
            <button class="cancel-btn" @click="handleCancel">
              {{ t('session.cancel') }}
            </button>
            <button class="save-btn" @click="handleSave">
              {{ t('session.save') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSessionStore } from '../stores/sessionStore'

const { t } = useI18n()
const sessionStore = useSessionStore()

const isExpanded = ref(false)
const showRatingModal = ref(false)
const rating = ref<1 | 2 | 3 | 4 | 5>(3)
const comment = ref('')

const goalNames: Record<string, string> = {
  learn_chords: '🎸',
  strumming: '🥁',
  fingerstyle: '👆',
  songs: '🎵',
  theory: '📖',
  lead: '⚡',
  ear_training: '👂',
  songwriting: '✍️',
  perform: '🎤',
  just_fun: '🎉',
}

const goalName = computed(() => {
  const goal = sessionStore.activeGoal
  return goal ? goalNames[goal] || goal : ''
})

const formattedTime = computed(() => {
  return sessionStore.formatDuration(sessionStore.sessionDuration)
})

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

function openRatingModal() {
  showRatingModal.value = true
  isExpanded.value = false
}

function closeModal() {
  showRatingModal.value = false
  rating.value = 3
  comment.value = ''
}

function handleSave() {
  const finalRating = rating.value
  const finalComment = comment.value
  closeModal()
  sessionStore.endSession(finalRating, finalComment)
}

function handleCancel() {
  closeModal()
  sessionStore.cancelSession()
}
</script>

<style scoped>
.session-timer {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  background: var(--bg-secondary, #fff);
  border: 2px solid var(--accent-color, #9333ea);
  border-radius: 24px;
  padding: 8px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-mono, monospace);
}

.session-timer:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
}

.session-timer.expanded {
  border-radius: 16px;
  padding: 12px 20px;
}

.timer-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timer-icon {
  font-size: 18px;
}

.timer-display {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
}

.goal-label {
  font-size: 14px;
  color: var(--text-secondary, #666);
}

.timer-controls {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e5e5e5);
}

.stop-btn {
  width: 100%;
  padding: 10px 16px;
  background: var(--accent-color, #9333ea);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.stop-btn:hover {
  background: var(--accent-color-dark, #7c22ce);
}

.rating-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.rating-modal {
  background: var(--bg-secondary, #fff);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.rating-modal h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: var(--text-primary, #1a1a1a);
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #d1d5db;
  transition: color 0.2s, transform 0.2s;
}

.star-btn.active {
  color: #fbbf24;
}

.star-btn:hover {
  transform: scale(1.1);
}

.rating-modal textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  margin-bottom: 16px;
  font-family: inherit;
}

.rating-modal textarea:focus {
  outline: 2px solid var(--accent-color, #9333ea);
  border-color: transparent;
}

.rating-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  background: var(--bg-tertiary, #f5f5f5);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  color: var(--text-secondary, #666);
}

.cancel-btn:hover {
  background: var(--border-color, #e5e5e5);
}

.save-btn {
  flex: 1;
  padding: 12px;
  background: var(--accent-color, #9333ea);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.save-btn:hover {
  background: var(--accent-color-dark, #7c22ce);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .rating-modal,
.modal-leave-active .rating-modal {
  transition: transform 0.2s ease;
}

.modal-enter-from .rating-modal,
.modal-leave-to .rating-modal {
  transform: scale(0.95);
}
</style>