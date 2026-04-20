<template>
  <div class="onboarding">
    <div class="onboarding-card card">
      <div v-if="step === 1" class="step">
        <div class="step-icon">🎸</div>
        <h1 class="step-title">{{ $t('onboarding.welcome') }}</h1>
        <p class="step-desc">{{ $t('onboarding.namePrompt') }}</p>
        <div class="input-group">
          <input
            v-model="name"
            type="text"
            class="text-input"
            :placeholder="$t('onboarding.namePlaceholder')"
            maxlength="30"
            @keyup.enter="nextStep"
          />
        </div>
        <div class="language-section">
          <label class="language-label">{{ $t('onboarding.language') }}</label>
          <select v-model="selectedLanguage" class="text-input language-select" @change="onLanguageChange">
            <option v-for="lang in availableLocales" :key="lang.code" :value="lang.code">{{ lang.label }}</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" :disabled="!name.trim()" @click="nextStep">
          {{ $t('onboarding.continue') }}
        </button>
      </div>

      <div v-else-if="step === 2" class="step">
        <div class="step-icon">🎵</div>
        <h1 class="step-title">{{ $t('onboarding.experienceTitle') }}</h1>
        <p class="step-desc">{{ $t('onboarding.experienceDesc') }}</p>
        <div class="level-cards">
          <button
            v-for="level in levels"
            :key="level.id"
            class="level-card card"
            :class="{ selected: selectedLevel === level.id }"
            @click="selectedLevel = level.id"
          >
            <div class="level-icon">{{ level.icon }}</div>
            <div class="level-name">{{ level.name }}</div>
            <div class="level-desc">{{ level.desc }}</div>
            <ul class="level-features">
              <li v-for="feat in level.features" :key="feat">{{ feat }}</li>
            </ul>
          </button>
        </div>
        <button class="btn btn-primary btn-lg" @click="nextStep">{{ $t('onboarding.continue') }}</button>
      </div>

      <div v-else-if="step === 3" class="step">
        <div class="step-icon">🎯</div>
        <h1 class="step-title">{{ $t('onboarding.goalsTitle') }}</h1>
        <p class="step-desc">{{ $t('onboarding.goalsDesc') }}</p>
        <div class="goal-options">
          <button
            v-for="goal in goals"
            :key="goal.id"
            class="goal-btn"
            :class="{ selected: selectedGoals.includes(goal.id) }"
            @click="toggleGoal(goal.id)"
          >
            <span class="goal-icon">{{ goal.icon }}</span>
            <span class="goal-text">{{ goal.name }}</span>
          </button>
        </div>
        <button class="btn btn-primary btn-lg" @click="nextStep">{{ $t('onboarding.next') }}</button>
      </div>

      <div v-else-if="step === 4" class="step">
        <div class="step-icon">🎨</div>
        <h1 class="step-title">{{ $t('onboarding.themeTitle') }}</h1>
        <p class="step-desc">{{ $t('onboarding.themeDesc') }}</p>
        <div class="theme-grid">
          <button
            v-for="theme in themes"
            :key="theme.id"
            class="theme-card card"
            :class="{ selected: selectedTheme === theme.id }"
            @click="selectTheme(theme.id)"
          >
            <div class="theme-preview" :style="{ background: theme.preview }"></div>
            <div class="theme-name">{{ theme.name }}</div>
          </button>
        </div>
        <div class="color-section">
          <p class="color-label">{{ $t('onboarding.accentColor') }}</p>
          <div class="color-options">
            <button
              v-for="c in colors"
              :key="c.id"
              class="color-dot"
              :class="{ active: selectedColor === c.id }"
              :style="{ background: c.color }"
              :title="c.name"
              @click="selectedColor = c.id"
            >
              <svg v-if="selectedColor === c.id" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" @click="finish">{{ $t('onboarding.startLearning') }}</button>
      </div>

      <div class="step-indicator">
        <span v-for="s in 4" :key="s" class="dot" :class="{ active: step >= s }"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore, type AppTheme, type ThemeColor } from '../stores/profileStore.ts'
import { useSettings, type ThemeOption } from '../composables/useSettings.ts'
import type { ExperienceLevel } from '../stores/profileStore.ts'
import { useI18n } from 'vue-i18n'
import { availableLocales, setLocale, type LocaleCode } from '../i18n'

const router = useRouter()
const { t, locale } = useI18n()
const profileStore = useProfileStore()
const settings = useSettings()

const existingProfile = profileStore.activeProfile
const step = ref(1)
const name = ref(existingProfile?.name && existingProfile.name !== 'Default' ? existingProfile.name : '')
const selectedLevel = ref<ExperienceLevel>(existingProfile?.experienceLevel || 'beginner')
const selectedGoals = ref<string[]>(existingProfile?.goals || [])
const selectedTheme = ref<AppTheme>(existingProfile?.theme || 'light')
const selectedColor = ref<ThemeColor>(existingProfile?.themeColor || 'default')
const selectedLanguage = ref<LocaleCode>((existingProfile?.language as LocaleCode) || 'en')

const themes = computed<{ id: AppTheme; name: string; preview: string }[]>(() => [
  { id: 'light', name: t('onboarding.themeLight'), preview: 'linear-gradient(135deg, #f8f9fa 60%, #4f46e5)' },
  { id: 'dark', name: t('onboarding.themeDark'), preview: 'linear-gradient(135deg, #1e2130 60%, #6366f1)' },
  { id: 'contrast', name: t('onboarding.themeHighContrast'), preview: 'linear-gradient(135deg, #000000 60%, #ffdd00)' },
  { id: 'ocean-deep', name: t('onboarding.themeOceanDeep'), preview: 'linear-gradient(135deg, #0c2d48 60%, #8ecae6)' },
  { id: 'forest-night', name: t('onboarding.themeForestNight'), preview: 'linear-gradient(135deg, #0a1f0a 60%, #6bc96b)' },
  { id: 'sunset-glow', name: t('onboarding.themeSunsetGlow'), preview: 'linear-gradient(135deg, #2d1b0e 60%, #ff6b35)' },
  { id: 'midnight-purple', name: t('onboarding.themeMidnightPurple'), preview: 'linear-gradient(135deg, #1a0a2e 60%, #b388ff)' },
  { id: 'rosé', name: t('onboarding.themeRose'), preview: 'linear-gradient(135deg, #2a1520 60%, #f472b6)' },
])

const levels = computed(() => [
  {
    id: 'beginner' as ExperienceLevel,
    name: t('onboarding.levelBeginner'),
    icon: '🌱',
    desc: t('onboarding.levelBeginnerDesc'),
    features: [
      t('onboarding.levelBeginnerFeature1'),
      t('onboarding.levelBeginnerFeature2'),
      t('onboarding.levelBeginnerFeature3'),
      t('onboarding.levelBeginnerFeature4'),
      t('onboarding.levelBeginnerFeature5'),
    ],
  },
  {
    id: 'intermediate' as ExperienceLevel,
    name: t('onboarding.levelIntermediate'),
    icon: '🔥',
    desc: t('onboarding.levelIntermediateDesc'),
    features: [
      t('onboarding.levelIntermediateFeature1'),
      t('onboarding.levelIntermediateFeature2'),
      t('onboarding.levelIntermediateFeature3'),
      t('onboarding.levelIntermediateFeature4'),
      t('onboarding.levelIntermediateFeature5'),
    ],
  },
  {
    id: 'advanced' as ExperienceLevel,
    name: t('onboarding.levelAdvanced'),
    icon: '⭐',
    desc: t('onboarding.levelAdvancedDesc'),
    features: [
      t('onboarding.levelAdvancedFeature1'),
      t('onboarding.levelAdvancedFeature2'),
      t('onboarding.levelAdvancedFeature3'),
      t('onboarding.levelAdvancedFeature4'),
      t('onboarding.levelAdvancedFeature5'),
    ],
  },
])

const goals = computed(() => [
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
])

const colors: ThemeOption[] = settings.THEMES

function selectTheme(themeId: AppTheme) {
  selectedTheme.value = themeId
  profileStore.setTheme(themeId)
}

function toggleGoal(goalId: string) {
  const index = selectedGoals.value.indexOf(goalId)
  if (index === -1) {
    selectedGoals.value.push(goalId)
  } else {
    selectedGoals.value.splice(index, 1)
  }
}

function nextStep() {
  if (step.value === 1 && !name.value.trim()) return

  if (step.value === 1) {
    if (profileStore.activeProfile) {
      profileStore.renameProfile(profileStore.activeProfile.id, name.value.trim())
    }
    locale.value = selectedLanguage.value
    setLocale(selectedLanguage.value)
  }

  step.value++
}

function onLanguageChange() {
  locale.value = selectedLanguage.value
  setLocale(selectedLanguage.value)
}

function finish() {
  profileStore.setExperienceLevel(selectedLevel.value)
  profileStore.setGoals(selectedGoals.value)
  profileStore.setTheme(selectedTheme.value)
  profileStore.setThemeColor(selectedColor.value)
  profileStore.setLanguage(selectedLanguage.value)
  profileStore.setOnboarded(true)
  locale.value = selectedLanguage.value
  router.push('/')
}
</script>

<style scoped>
.onboarding {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.onboarding-card {
  max-width: 640px;
  width: 100%;
  padding: 48px 40px;
  text-align: center;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.step-icon {
  font-size: 64px;
  line-height: 1;
}

.step-title {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
}

.step-desc {
  color: var(--text-secondary);
  font-size: 16px;
  max-width: 480px;
}

.input-group {
  width: 100%;
  max-width: 320px;
}

.text-input {
  width: 100%;
  padding: 14px 18px;
  font-size: 18px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.text-input:focus {
  border-color: var(--bg-highlight);
}

.level-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
}

.level-card {
  padding: 16px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.level-card:hover {
  background: var(--bg-card-hover);
}

.level-card.selected {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.level-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.level-name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.level-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.level-features {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.level-features li {
  padding: 2px 0;
}

.level-features li::before {
  content: '✓ ';
  color: var(--bg-success);
  font-weight: 700;
}

.goal-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.goal-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.goal-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.goal-btn.selected {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
  color: var(--bg-highlight);
  font-weight: 600;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  width: 100%;
}

.theme-card {
  padding: 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.theme-card:hover {
  background: var(--bg-card-hover);
}

.theme-card.selected {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.theme-preview {
  width: 100%;
  aspect-ratio: 16/10;
  border-radius: var(--radius-sm);
  margin-bottom: 6px;
  overflow: hidden;
}

.theme-name {
  font-size: 13px;
  font-weight: 600;
}

.color-section {
  text-align: left;
  width: 100%;
}

.color-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.color-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}

.color-dot:hover {
  transform: scale(1.1);
}

.color-dot.active {
  border-color: var(--text-primary);
  transform: scale(1.1);
}

.goal-icon {
  font-size: 16px;
}

.step-indicator {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 32px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  transition: background 0.2s;
}

.dot.active {
  background: var(--bg-highlight);
}

@media (max-width: 600px) {
  .onboarding-card {
    padding: 32px 20px;
  }

  .level-cards {
    grid-template-columns: 1fr;
  }

  .theme-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .step-title {
    font-size: 24px;
  }
}
</style>