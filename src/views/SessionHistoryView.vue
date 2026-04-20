<template>
  <div class="session-history-view">
    <div class="history-header">
      <router-link to="/sessions" class="back-link">
        <span>←</span> {{ t('session.back') }}
      </router-link>
      <h1>{{ t('session.history') }}</h1>
    </div>

    <div v-if="sessionStore.sessions.length === 0" class="empty-state">
      <p>{{ t('session.noSessionsYet') }}</p>
      <router-link to="/sessions" class="start-link">
        {{ t('session.startFirstSession') }}
      </router-link>
    </div>

    <div v-else class="session-list">
      <div v-for="session in sortedSessions" :key="session.id" class="session-card">
        <div class="session-main">
          <div class="session-goal">
            <span class="goal-icon">{{ getGoalIcon(session.goal) }}</span>
            <span class="goal-name">{{ getGoalName(session.goal) }}</span>
          </div>
          <div class="session-meta">
            <span class="session-date">{{ formatDate(session.createdAt) }}</span>
            <span class="session-duration">{{ formatDuration(session.durationSeconds) }}</span>
          </div>
        </div>
        <div class="session-details">
          <div class="session-rating">
            <span v-for="star in 5" :key="star" :class="star <= session.rating ? 'star filled' : 'star'">★</span>
          </div>
          <p v-if="session.comment" class="session-comment">{{ session.comment }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSessionStore } from '../stores/sessionStore'

const { t } = useI18n()
const sessionStore = useSessionStore()

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

const sortedSessions = computed(() => {
  return [...sessionStore.sessions].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

function getGoalIcon(goalId: string): string {
  return goalMeta[goalId]?.icon || '🎯'
}

function getGoalName(goalId: string): string {
  return goalMeta[goalId]?.name || goalId
}

function formatDuration(seconds: number): string {
  return sessionStore.formatDuration(seconds)
}

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return t('session.today')
  if (days === 1) return t('session.yesterday')
  if (days < 7) return t('session.daysAgo', { count: days })

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.session-history-view {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px;
}

.history-header {
  margin-bottom: 24px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary, #666);
  text-decoration: none;
  margin-bottom: 12px;
}

.back-link:hover {
  color: var(--accent-color, #9333ea);
}

.history-header h1 {
  font-size: 28px;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-secondary, #666);
}

.start-link {
  display: inline-block;
  margin-top: 16px;
  color: var(--accent-color, #9333ea);
  text-decoration: none;
}

.start-link:hover {
  text-decoration: underline;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.session-card {
  background: var(--bg-secondary, #fff);
  border-radius: 12px;
  padding: 16px;
}

.session-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.session-goal {
  display: flex;
  align-items: center;
  gap: 12px;
}

.goal-icon {
  font-size: 24px;
}

.goal-name {
  font-size: 18px;
  font-weight: 600;
}

.session-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.session-date {
  font-size: 13px;
  color: var(--text-secondary, #666);
}

.session-duration {
  font-family: var(--font-mono, monospace);
  font-size: 14px;
  color: var(--accent-color, #9333ea);
}

.session-details {
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e5e5e5);
}

.session-rating {
  display: flex;
  gap: 2px;
  margin-bottom: 8px;
}

.star {
  color: #d1d5db;
  font-size: 16px;
}

.star.filled {
  color: #fbbf24;
}

.session-comment {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary, #666);
  font-style: italic;
  line-height: 1.5;
}
</style>