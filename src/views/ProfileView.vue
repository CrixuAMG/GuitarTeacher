<template>
  <div class="profile-view">
    <PageHeader :subtitle="$t('profile.subtitle')">{{ $t('profile.title') }}</PageHeader>

    <!-- Level Card -->
    <div class="level-card card">
      <div class="level-header">
        <div class="level-badge" :style="{ background: currentLevel.color }">
          <span class="level-num">{{ level }}</span>
          <span class="level-title">{{ currentLevel.title }}</span>
        </div>
        <div class="xp-display">
          <span class="xp-current">{{ $t('profile.xpDisplay', { xp }) }}</span>
          <span v-if="nextLevel" class="xp-needed"
            >{{ $t('profile.xpForNext', { xpRequired: nextLevel.xpRequired, levelTitle: nextLevel.title }) }}</span
          >
          <span v-else class="xp-max">{{ $t('profile.maxLevel') }}</span>
        </div>
      </div>
      <div class="xp-bar-container">
        <div class="xp-bar-bg">
          <div
            class="xp-bar-fill"
            :style="{ width: `${levelProgress}%`, background: currentLevel.color }"
          >
            <div class="xp-shine"></div>
          </div>
        </div>
        <div class="level-markers">
          <span
            v-for="lvl in displayedLevels"
            :key="lvl.level"
            class="marker"
            :class="{ active: lvl.level <= level }"
            :style="{ left: `${getMarkerPosition(lvl)}%` }"
          >
            {{ lvl.level }}
          </span>
        </div>
      </div>
    </div>

    <!-- Experience Level -->
    <div class="settings-section">
      <h2>{{ $t('profile.yourLevel') }}</h2>
      <p class="section-desc" style="color: var(--text-secondary); font-size: 14px; margin-bottom: 16px;">
        {{ $t('profile.levelDesc') }}
      </p>
      <div class="level-selector">
        <button
          v-for="lvl in experienceLevels"
          :key="lvl.id"
          class="level-select-card card"
          :class="{ selected: profileStore.activeProfile?.experienceLevel === lvl.id }"
          @click="setLevel(lvl.id)"
        >
          <div class="level-select-icon">{{ lvl.icon }}</div>
          <div class="level-select-name">{{ $t(lvl.name) }}</div>
          <div class="level-select-desc">{{ $t(lvl.desc) }}</div>
        </button>
      </div>
    </div>

    <!-- Lesson Progress -->
    <LessonProgress />

    <!-- Mastery Levels -->
    <MasteryLevels />

    <!-- Goals Section -->
    <div class="goals-section">
      <div class="goals-header">
        <h2>{{ $t('profile.yourGoals') }}</h2>
        <button class="edit-goals-btn" @click="openGoalsModal">
          {{ $t('profile.editGoals') }}
        </button>
      </div>
      <div v-if="userGoals.length === 0" class="no-goals">
        <p>{{ $t('profile.noGoalsSet') }}</p>
      </div>
      <div v-else class="goals-list">
        <div v-for="goal in userGoals" :key="goal.id" class="goal-item">
          <span class="goal-icon">{{ goal.icon }}</span>
          <span class="goal-name">{{ goal.name }}</span>
          <span v-if="getSessionCount(goal.id)" class="goal-sessions">
            {{ getSessionCount(goal.id) }} {{ $t('profile.sessionsCount') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Skill Trees Link -->
    <div class="skill-trees-link card" @click="$router.push('/skill-trees')">
      <div class="skill-trees-icon">🌳</div>
      <div class="skill-trees-info">
        <h3>{{ $t('profile.skillTrees') }}</h3>
        <p>{{ $t('profile.skillTreesDesc') }}</p>
      </div>
      <div class="skill-trees-arrow">→</div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-section">
      <h2>{{ $t('profile.yourStats') }}</h2>
      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-icon">📚</div>
          <div class="stat-value">{{ completedLessons }}</div>
          <div class="stat-label">{{ $t('profile.lessonsCompleted') }}</div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">🎸</div>
          <div class="stat-value">{{ stats.chordsLearned?.length || 0 }}</div>
          <div class="stat-label">{{ $t('profile.chordsLearned') }}</div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">🎵</div>
          <div class="stat-value">{{ stats.songsCompleted?.length || 0 }}</div>
          <div class="stat-label">{{ $t('profile.songsCompleted') }}</div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value">{{ formatTime(stats.totalPracticeTime || 0) }}</div>
          <div class="stat-label">{{ $t('profile.totalPracticeTime') }}</div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">🏆</div>
          <div class="stat-value">{{ achievements.length }}</div>
          <div class="stat-label">{{ $t('profile.achievementsUnlocked') }}</div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">🔥</div>
          <div class="stat-value">{{ stats.practiceStreak || 0 }}</div>
          <div class="stat-label">{{ $t('profile.dayStreak') }}</div>
        </div>
      </div>
    </div>

    <!-- Achievements -->
    <div class="achievements-section">
      <h2>{{ $t('profile.recentAchievements') }}</h2>
      <div class="achievements-list">
        <div
          v-for="achievement in recentAchievements"
          :key="achievement.id"
          class="achievement-item card"
        >
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <div class="achievement-info">
            <div class="achievement-name">{{ achievement.title }}</div>
            <div class="achievement-desc">{{ achievement.description }}</div>
          </div>
          <div class="achievement-xp">+{{ achievement.xp }} XP</div>
        </div>
        <div v-if="achievements.length === 0" class="empty-state">
          {{ $t('profile.noAchievements') }}
        </div>
        </div>
      </div>

      <!-- Language -->
      <div class="setting-card card">
        <div class="setting-info">
          <h3>{{ $t('profile.language') }}</h3>
          <p>{{ $t('profile.languageDesc') }}</p>
        </div>
        <div class="setting-controls">
          <select v-model="profileStore.activeProfile.language" class="text-input" @change="onLanguageChange">
            <option v-for="lang in availableLocales" :key="lang.code" :value="lang.code">
              {{ lang.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Profiles -->
      <div class="setting-card card profiles-card">
          <div class="setting-info">
            <h3>{{ $t('profile.profiles') }}</h3>
            <p>{{ $t('profile.profilesDesc') }}</p>
          </div>
          <div class="profiles-list">
            <div
              v-for="profile in profileStore.profiles"
              :key="profile.id"
              class="profile-item"
              :class="{ active: profileStore.activeProfileId === profile.id }"
            >
              <span class="profile-name">{{ profile.name }}</span>
              <div class="profile-actions">
                <button
                  v-if="profileStore.activeProfileId !== profile.id"
                  class="btn btn-sm btn-secondary"
                  @click="switchProfile(profile.id)"
                >
                  {{ $t('profile.switchProfile') }}
                </button>
                <span v-else class="current-badge">{{ $t('profile.active') }}</span>
                <button
                  class="btn-icon-sm"
                  :title="$t('profile.rename')"
                  @click="renameProfile(profile)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  v-if="profileStore.profiles.length > 1"
                  class="btn-icon-sm danger"
                  :title="$t('profile.delete')"
                  @click="deleteProfile(profile.id)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm add-profile-btn" @click="createNewProfile">
              {{ $t('profile.addProfile') }}
            </button>
          </div>
        </div>

      <!-- Data Management -->
    <div class="data-section">
      <h2>{{ $t('profile.dataManagement') }}</h2>
      <div class="data-cards">
        <!-- Export -->
        <div class="data-card card">
          <div class="data-icon">💾</div>
          <h3>{{ $t('profile.exportProgress') }}</h3>
          <p>{{ $t('profile.exportDesc') }}</p>
          <button class="btn btn-primary" @click="exportData">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {{ $t('profile.exportData') }}
          </button>
        </div>

        <!-- Import -->
        <div class="data-card card">
          <div class="data-icon">📥</div>
          <h3>{{ $t('profile.importProgress') }}</h3>
          <p>{{ $t('profile.importDesc') }}</p>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            style="display: none"
            @change="handleFileImport"
          />
          <button class="btn btn-primary" @click="triggerImport">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {{ $t('profile.importData') }}
          </button>
          <div v-if="importStatus" class="import-status" :class="importStatus.type">
            {{ importStatus.message }}
          </div>
        </div>

        <!-- Reset -->
        <div class="data-card card danger">
          <div class="data-icon">⚠️</div>
          <h3>{{ $t('profile.resetAllProgress') }}</h3>
          <p>{{ $t('profile.resetDesc') }}</p>
          <button class="btn btn-danger" @click="confirmReset">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              />
            </svg>
{{ $t('profile.resetEverything') }}
          </button>
        </div>
      </div>
    </div>

<!-- Reset Confirmation Modal -->
    <div v-if="showResetModal" class="modal-overlay" @click.self="showResetModal = false">
      <div class="modal-content card">
        <h3>{{ $t('profile.resetConfirmTitle') }}</h3>
        <p class="warning-text">{{ $t('profile.resetCannotUndo') }}</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showResetModal = false">{{ $t('profile.cancel') }}</button>
          <button class="btn btn-danger" @click="resetAllData">{{ $t('profile.yesResetEverything') }}</button>
        </div>
      </div>
    </div>

    <!-- Edit Goals Modal -->
    <div v-if="showGoalsModal" class="modal-overlay" @click.self="showGoalsModal = false">
      <div class="modal-content card goals-modal">
        <h3>{{ $t('profile.editGoals') }}</h3>
        <p class="modal-desc">{{ $t('profile.editGoalsDesc') }}</p>
        <div class="goal-options">
          <button
            v-for="goal in allGoals"
            :key="goal.id"
            class="goal-option"
            :class="{ selected: selectedGoals.includes(goal.id) }"
            @click="toggleGoal(goal.id)"
          >
            <span class="goal-icon">{{ goal.icon }}</span>
            <span class="goal-name">{{ goal.name }}</span>
          </button>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showGoalsModal = false">{{ $t('profile.cancel') }}</button>
          <button class="btn btn-primary" @click="saveGoals">{{ $t('profile.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGamificationStore } from '../stores/gamificationStore.ts'
import MasteryLevels from '../components/MasteryLevels.vue'
import LessonProgress from '../components/LessonProgress.vue'
import { useSettings } from '../composables/useSettings.ts'
import { useAutoBackup } from '../composables/useAutoBackup.ts'
import { availableLocales, type LocaleCode } from '../i18n'
import { useProfileStore, type AppTheme } from '../stores/profileStore.ts'
import { useSessionStore } from '../stores/sessionStore.ts'
import type { ExperienceLevel } from '../stores/profileStore.ts'
import { formatDuration as formatTime } from '../utils/timeFormat'
import PageHeader from '../components/PageHeader.vue'

const { t } = useI18n()
const gamification = useGamificationStore()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const settings = useSettings()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const autoBackup = useAutoBackup()
const profileStore = useProfileStore()
const sessionStore = useSessionStore()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const appThemes: { id: AppTheme; name: string }[] = [
  { id: 'light', name: 'profile.themeLight' },
  { id: 'dark', name: 'profile.themeDark' },
  { id: 'contrast', name: 'profile.themeContrast' },
  { id: 'ocean-deep', name: 'profile.themeOcean' },
  { id: 'forest-night', name: 'profile.themeForest' },
  { id: 'sunset-glow', name: 'profile.themeSunset' },
  { id: 'midnight-purple', name: 'profile.themePurple' },
  { id: 'rosé', name: 'profile.themeRose' },
]

const experienceLevels = [
  { id: 'beginner' as ExperienceLevel, name: 'profile.levelBeginner', icon: '🌱', desc: 'profile.levelBeginnerDesc' },
  { id: 'intermediate' as ExperienceLevel, name: 'profile.levelIntermediate', icon: '🔥', desc: 'profile.levelIntermediateDesc' },
  { id: 'advanced' as ExperienceLevel, name: 'profile.levelAdvanced', icon: '⭐', desc: 'profile.levelAdvancedDesc' },
]

function setLevel(level: ExperienceLevel) {
  profileStore.setExperienceLevel(level)
}
const fileInput = ref<HTMLInputElement | null>(null)
const showResetModal = ref(false)
const showGoalsModal = ref(false)
const selectedGoals = ref<string[]>([])
const importStatus = ref<{ type: string; message: string } | null>(null)

const allGoals = [
  { id: 'learn_chords', name: t('onboarding.goalLearnChords'), icon: '🎸' },
  { id: 'strumming', name: t('onboarding.goalStrumming'), icon: '🥁' },
  { id: 'fingerstyle', name: t('onboarding.goalFingerstyle'), icon: '👆' },
  { id: 'songs', name: t('onboarding.goalSongs'), icon: '🎵' },
  { id: 'theory', name: t('onboarding.goalTheory'), icon: '📖' },
  { id: 'lead', name: t('onboarding.goalLead'), icon: '⚡' },
  { id: 'ear_training', name: t('onboarding.goalEarTraining'), icon: '👂' },
  { id: 'songwriting', name: t('onboarding.goalSongwriting'), icon: '✍️' },
  { id: 'perform', name: t('onboarding.goalPerform'), icon: '🎤' },
  { id: 'just_fun', name: t('onboarding.goalJustFun'), icon: '🎉' },
]

const userGoals = computed(() => {
  const profileGoals = profileStore.activeProfile?.goals || []
  return profileGoals.map(id => allGoals.find(g => g.id === id)).filter(Boolean) as typeof allGoals
})

function getSessionCount(goalId: string): number {
  return sessionStore.getSessionCountForGoal(goalId)
}

function toggleGoal(goalId: string) {
  const idx = selectedGoals.value.indexOf(goalId)
  if (idx === -1) {
    selectedGoals.value.push(goalId)
  } else {
    selectedGoals.value.splice(idx, 1)
  }
}

function saveGoals() {
  profileStore.setGoals(selectedGoals.value)
  showGoalsModal.value = false
}

function openGoalsModal() {
  selectedGoals.value = [...(profileStore.activeProfile?.goals || [])]
  showGoalsModal.value = true
}

const xp = computed(() => gamification.xp)
const level = computed(() => gamification.level)
const stats = computed(() => gamification.stats)
const achievements = computed(() => gamification.unlockedAchievements)

const currentLevel = computed(() => gamification.currentLevel)
const nextLevel = computed(() => gamification.nextLevel)
const levelProgress = computed(() => gamification.levelProgress)

const completedLessons = computed(() => gamification.getCompletedLessonsCount())

const displayedLevels = computed(() => {
  // Show current level and next 2
  return gamification.XP_LEVELS.filter((l) => l.level >= gamification.level && l.level <= gamification.level + 2)
})

const recentAchievements = computed(() => {
  return achievements.value.slice(0, 5)
})

function getMarkerPosition(lvl) {
  if (!nextLevel.value) return 100
  const currentXpReq = currentLevel.value.xpRequired
  const nextXpReq = nextLevel.value.xpRequired
  const xpRange = nextXpReq - currentXpReq
  const levelXp = lvl.xpRequired - currentXpReq
  return Math.min(100, Math.max(0, (levelXp / xpRange) * 100))
}

function exportData() {
  const data = gamification.exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `guitar-teacher-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function triggerImport() {
  fileInput.value?.click()
}

function handleFileImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const result = e.target?.result
      if (typeof result !== 'string') return

      // Try full backup format first (exportVersion 2+)
      try {
        const data = JSON.parse(result)
        if (data.exportVersion && data.app === 'guitar-teacher') {
          profileStore.importDataToCurrent(data)
          // Also reload all stores
          window.location.reload()
          return
        }
      } catch {
        // Not a full backup, fall through to gamification import
      }

      // Fall back to gamification-only import (legacy format)
      const success = gamification.importData(result)
      if (success) {
        importStatus.value = {
          type: 'success',
          message: t('profile.importSuccess'),
        }
        setTimeout(() => window.location.reload(), 1500)
      } else {
        importStatus.value = {
          type: 'error',
          message: t('profile.importError'),
        }
      }
    } catch (err) {
      importStatus.value = { type: 'error', message: t('profile.importFailed', { error: err.message }) }
    }
  }
  reader.readAsText(file)
  if (event.target instanceof HTMLInputElement) {
    event.target.value = ''
  }
}

function confirmReset() {
  showResetModal.value = true
}

function onLanguageChange() {
  const lang = (profileStore.activeProfile?.language || 'en') as LocaleCode
  profileStore.setLanguage(lang)
}

function resetAllData() {
  const keysToPreserve = [
    'guitar-teacher-songs',
    'guitar-teacher-profiles',
    'guitar-teacher-active-profile',
  ]
  const legacyKeys = ['guitar-songs', 'guitar-progress', 'guitar-preferences']
  const allKeys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('guitar-') && !keysToPreserve.includes(key)) {
      allKeys.push(key)
    }
  }
  ;[...allKeys, ...legacyKeys].forEach((key) => localStorage.removeItem(key))
  showResetModal.value = false
  window.location.reload()
}

function switchProfile(profileId) {
  profileStore.saveCurrentProfile()
  if (profileStore.switchProfile(profileId)) {
    window.location.reload()
  }
}

function createNewProfile() {
  const name = prompt(t('profile.enterProfileName'))
  if (name && name.trim()) {
    profileStore.createProfile(name.trim())
    window.location.reload()
  }
}

function renameProfile(profile) {
  const name = prompt(t('profile.renameProfile'), profile.name)
  if (name && name.trim()) {
    profileStore.renameProfile(profile.id, name.trim())
  }
}

function deleteProfile(profileId) {
  if (confirm(t('profile.deleteProfileConfirm'))) {
    if (profileStore.deleteProfile(profileId)) {
      window.location.reload()
    }
  }
}
</script>

<style scoped>
.profile-view {
  padding: 0 24px 48px;
  max-width: 900px;
  margin: 0 auto;
}



/* Level Card */
.level-card {
  padding: 24px;
  margin-bottom: 32px;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  color: white;
  font-weight: 700;
}

.level-num {
  font-size: 20px;
}

.level-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.xp-display {
  font-size: 14px;
}

.xp-current {
  font-weight: 700;
  color: var(--bg-highlight);
}

.xp-needed {
  color: var(--text-secondary);
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
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), transparent);
  border-radius: 6px 6px 0 0;
}

.level-markers {
  position: relative;
  height: 20px;
  margin-top: 8px;
}

.marker {
  position: absolute;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 600;
  color: var(--text-tertiary);
  padding: 2px 6px;
  background: var(--bg-tertiary);
  border-radius: 10px;
}

.marker.active {
  background: var(--bg-success);
  color: white;
}

/* Stats Section */
.stats-section {
  margin-bottom: 32px;
}

.stats-section h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 20px;
  text-align: center;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--bg-highlight);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

/* Achievements */
.achievements-section {
  margin-bottom: 32px;
}

.achievements-section h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.achievement-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 12px;
  flex-shrink: 0;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 2px;
}

.achievement-desc {
  font-size: 13px;
  color: var(--text-secondary);
}

.achievement-xp {
  font-size: 13px;
  font-weight: 700;
  color: var(--bg-highlight);
  background: var(--bg-highlight-light);
  padding: 4px 10px;
  border-radius: 12px;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: var(--text-secondary);
  font-style: italic;
}

/* Data Management */
.data-section {
  margin-bottom: 32px;
}

.data-section h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
}

.data-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.data-card {
  padding: 24px;
  text-align: center;
}

.data-card.danger {
  border-color: var(--bg-danger);
}

.data-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.data-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.data-card p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
}

.data-card .btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-danger {
  background: var(--bg-danger);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.import-status {
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

.import-status.success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--bg-success);
}

.import-status.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--bg-danger);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  max-width: 400px;
  width: 100%;
  padding: 24px;
  text-align: center;
}

.modal-content h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
}

.modal-content p {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.modal-content ul {
  text-align: left;
  margin-bottom: 16px;
  padding-left: 20px;
}

.modal-content li {
  margin-bottom: 8px;
  color: var(--text-primary);
}

.warning-text {
  color: var(--bg-danger) !important;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

/* Skill Trees Link */
.skill-trees-link {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  margin-bottom: 32px;
  cursor: pointer;
  transition: all var(--transition);
  background: linear-gradient(135deg, var(--bg-highlight-light) 0%, var(--bg-secondary) 100%);
}

.skill-trees-link:hover {
  transform: translateX(8px);
  box-shadow: var(--shadow-md);
}

.skill-trees-icon {
  font-size: 40px;
}

.skill-trees-info {
  flex: 1;
}

.skill-trees-info h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.skill-trees-info p {
  font-size: 14px;
  color: var(--text-secondary);
}

.skill-trees-arrow {
  font-size: 24px;
  color: var(--bg-highlight);
  font-weight: 700;
}

/* Settings Section */
.settings-section {
  margin-bottom: 32px;
}

.settings-section h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
}

.settings-cards {
  display: grid;
  gap: 16px;
}

.setting-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
}

.setting-info h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.setting-info p {
  font-size: 13px;
  color: var(--text-secondary);
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.toggle-track {
  display: block;
  width: 44px;
  height: 24px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  position: relative;
  transition: background 0.2s;
  border: 2px solid var(--border-color);
}

.toggle-btn.active .toggle-track {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
}

.toggle-thumb {
  display: block;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 1px;
  left: 1px;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle-btn.active .toggle-thumb {
  transform: translateX(20px);
}

.toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 28px;
}

.toggle-btn.active .toggle-label {
  color: var(--bg-highlight);
}

.setting-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.backup-date {
  color: var(--text-tertiary);
  font-size: 12px;
}

.theme-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 280px;
}

.theme-select-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.theme-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.theme-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.theme-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.theme-option {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}

.theme-option:hover {
  transform: scale(1.1);
}

.theme-option.active {
  border-color: var(--text-primary);
  transform: scale(1.1);
}

.profiles-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 280px;
  width: 100%;
}

.profile-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
}

.profile-item.active {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.profile-name {
  font-weight: 600;
  font-size: 14px;
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.current-badge {
  font-size: 12px;
  font-weight: 700;
  color: var(--bg-highlight);
  padding: 2px 8px;
  background: var(--bg-highlight-light);
  border-radius: 10px;
}

.btn-icon-sm {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-sm:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.btn-icon-sm.danger:hover {
  background: var(--bg-danger);
  color: white;
}

.add-profile-btn {
  margin-top: 4px;
}

/* Level Selector */
.level-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.level-select-card {
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.level-select-card:hover {
  background: var(--bg-card-hover);
}

.level-select-card.selected {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.level-select-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.level-select-name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.level-select-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

@media (max-width: 600px) {
  .level-header {
    flex-direction: column;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-actions {
    flex-direction: column;
  }

  .setting-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .data-cards {
    grid-template-columns: 1fr;
  }

  .profiles-list {
    min-width: auto;
  }

  .profile-item {
    flex-wrap: wrap;
  }

  .skill-trees-link {
    flex-wrap: wrap;
    gap: 12px;
  }
}

/* Goals Section */
.goals-section {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.goals-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.goals-header h2 {
  margin: 0;
  font-size: 18px;
}

.edit-goals-btn {
  background: var(--bg-tertiary);
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--accent-color);
}

.edit-goals-btn:hover {
  background: var(--border-color);
}

.no-goals {
  color: var(--text-secondary);
  text-align: center;
  padding: 24px;
}

.goals-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.goal-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-tertiary);
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.goal-icon {
  font-size: 18px;
}

.goal-name {
  font-weight: 500;
}

.goal-sessions {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 10px;
}

/* Goals Modal */
.goals-modal {
  max-width: 500px;
}

.modal-desc {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}

.goal-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.goal-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: var(--bg-tertiary);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.goal-option:hover {
  border-color: var(--accent-color);
}

.goal-option.selected {
  background: var(--accent-color);
  color: white;
}

.goal-option .goal-icon {
  font-size: 24px;
}

.goal-option .goal-name {
  font-weight: 500;
}
</style>
