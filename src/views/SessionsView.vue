<template>
  <div class="sessions-view">
    <div class="sessions-header">
      <h1>{{ t('session.title') }}</h1>
      <p class="subtitle">{{ t('session.subtitle') }}</p>
    </div>

    <div class="start-session-card">
      <h2>{{ t('session.startTitle') }}</h2>
      <p class="select-prompt">{{ t('session.selectGoal') }}</p>

      <div v-if="profileGoals.length === 0" class="no-goals-message">
        <p>{{ t('session.noGoalsSet') }}</p>
        <router-link to="/profile" class="edit-goals-link">
          {{ t('session.setGoalsInProfile') }}
        </router-link>
      </div>

      <div v-else class="goal-grid">
        <button
          v-for="goal in availableGoals"
          :key="goal.id"
          class="goal-option"
          :class="{ selected: selectedGoal === goal.id }"
          @click="selectedGoal = goal.id"
        >
          <span class="goal-icon">{{ goal.icon }}</span>
          <span class="goal-name">{{ goal.name }}</span>
          <span v-if="getSessionCount(goal.id)" class="session-count">
            {{ getSessionCount(goal.id) }} {{ t('session.sessions') }}
          </span>
        </button>
      </div>

      <button
        v-if="selectedGoal"
        class="start-btn"
        :disabled="!selectedGoal"
        @click="startSession"
      >
        {{ t('session.startSession') }}
      </button>
    </div>

    <div v-if="sessionStore.sessions.length > 0" class="recent-sessions">
      <h3>{{ t('session.recentSessions') }}</h3>
      <div class="session-list">
        <div v-for="session in recentSessions" :key="session.id" class="session-item">
          <span class="session-icon">{{ getGoalIcon(session.goal) }}</span>
          <span class="session-goal">{{ getGoalName(session.goal) }}</span>
          <span class="session-duration">{{ formatDuration(session.durationSeconds) }}</span>
          <span class="session-rating">{{ '★'.repeat(session.rating) }}{{ '☆'.repeat(5 - session.rating) }}</span>
        </div>
      </div>
      <router-link to="/sessions/history" class="view-all-link">
        {{ t('session.viewAllSessions') }}
      </router-link>
    </div>

    <div v-else class="empty-state">
      <p>{{ t('session.noSessionsYet') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSessionStore } from '../stores/sessionStore'
import { useProfileStore } from '../stores/profileStore'

const { t } = useI18n()
const router = useRouter()
const sessionStore = useSessionStore()
const profileStore = useProfileStore()

const selectedGoal = ref<string | null>(null)

const profileGoals = computed(() => profileStore.activeProfile?.goals || [])

const goalMeta: Record<string, { icon: string; name: string }> = {
  learn_chords: { icon: '🎸', name: t('onboarding.goalLearnChords') },
  strumming: { icon: '🥁', name: t('onboarding.goalStrumming') },
  fingerstyle: { icon: '👆', name: t('onboarding.goalFingerstyle') },
  songs: { icon: '🎵', name: t('onboarding.goalSongs') },
  theory: { icon: '📖', name: t('onboarding.goalTheory') },
  lead: { icon: '⚡', name: t('onboarding.goalLead') },
  ear_training: { icon: '👂', name: t('onboarding.goalEarTraining') },
  songwriting: { icon: '✍️', name: t('onboarding.goalSongwriting') },
  perform: { icon: '🎤', name: t('onboarding.goalPerform') },
  just_fun: { icon: '🎉', name: t('onboarding.goalJustFun') },
}

const availableGoals = computed(() => {
  return profileGoals.value.map(goalId => {
    const meta = goalMeta[goalId] || { icon: '🎯', name: goalId }
    return { id: goalId, ...meta }
  })
})

const recentSessions = computed(() => {
  return sessionStore.sessions.slice(0, 5)
})

function getSessionCount(goalId: string): number {
  return sessionStore.getSessionCountForGoal(goalId)
}

function getGoalIcon(goalId: string): string {
  return goalMeta[goalId]?.icon || '🎯'
}

function getGoalName(goalId: string): string {
  return goalMeta[goalId]?.name || goalId
}

function formatDuration(seconds: number): string {
  return sessionStore.formatDuration(seconds)
}

function startSession() {
  if (!selectedGoal.value) return
  sessionStore.startSession(selectedGoal.value)
  router.push('/')
}
</script>

<style scoped>
.sessions-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.sessions-header {
  text-align: center;
  margin-bottom: 32px;
}

.sessions-header h1 {
  font-size: 28px;
  margin: 0 0 8px;
}

.subtitle {
  color: var(--text-secondary, #666);
  margin: 0;
}

.start-session-card {
  background: var(--bg-secondary, #fff);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.start-session-card h2 {
  font-size: 20px;
  margin: 0 0 4px;
}

.select-prompt {
  color: var(--text-secondary, #666);
  margin: 0 0 20px;
}

.goal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.goal-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--bg-tertiary, #f5f5f5);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.goal-option:hover {
  border-color: var(--accent-color, #9333ea);
}

.goal-option.selected {
  background: var(--accent-color, #9333ea);
  color: white;
}

.goal-option.selected .session-count {
  color: rgba(255, 255, 255, 0.8);
}

.goal-icon {
  font-size: 28px;
}

.goal-name {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.session-count {
  font-size: 12px;
  color: var(--text-secondary, #888);
}

.no-goals-message {
  text-align: center;
  padding: 32px;
  color: var(--text-secondary, #666);
}

.edit-goals-link {
  display: inline-block;
  margin-top: 12px;
  color: var(--accent-color, #9333ea);
  text-decoration: none;
}

.edit-goals-link:hover {
  text-decoration: underline;
}

.start-btn {
  width: 100%;
  padding: 14px;
  background: var(--accent-color, #9333ea);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.start-btn:hover:not(:disabled) {
  background: var(--accent-color-dark, #7c22ce);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recent-sessions {
  background: var(--bg-secondary, #fff);
  border-radius: 16px;
  padding: 20px;
}

.recent-sessions h3 {
  font-size: 16px;
  margin: 0 0 16px;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-tertiary, #f5f5f5);
  border-radius: 8px;
}

.session-icon {
  font-size: 20px;
}

.session-goal {
  flex: 1;
  font-weight: 500;
}

.session-duration {
  font-family: var(--font-mono, monospace);
  color: var(--text-secondary, #666);
}

.session-rating {
  color: #fbbf24;
}

.view-all-link {
  display: block;
  text-align: center;
  margin-top: 16px;
  color: var(--accent-color, #9333ea);
  text-decoration: none;
}

.view-all-link:hover {
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: 48px;
  color: var(--text-secondary, #666);
}
</style>