<template>
  <div class="home-view">
    <!-- Simple Hero -->
    <section class="hero">
      <div class="hero-content">
        <div class="greeting">{{ greeting }}</div>
        <router-link v-if="goalTip" to="/tips" class="goal-tip">
          <span class="tip-icon">💡</span>
          <span class="tip-text">{{ goalTip }}</span>
        </router-link>
        <h1 class="hero-title">{{ $t('home.heroTitle') }}<br /><span class="highlight">{{ $t('home.heroTitleHighlight') }}</span></h1>
        <p class="hero-subtitle">{{ $t('home.heroSubtitle') }}</p>

        <div class="hero-actions">
          <router-link to="/practice/notes" class="btn btn-primary btn-lg">
            🎯 {{ $t('home.noteTrainer') }}
          </router-link>
          <router-link to="/learn" class="btn btn-secondary btn-lg"> 📚 {{ $t('home.learn') }} </router-link>
          <router-link to="/library" class="btn btn-secondary btn-lg"> 🎵 {{ $t('home.songs') }} </router-link>
        </div>
      </div>
      <div class="hero-visual">
        <Fretboard :chord="previewChord" />
      </div>
    </section>

    <!-- Quick Links Grid -->
    <section class="quick-links">
      <router-link to="/practice/routine" class="quick-link card">
        <span class="link-icon">📋</span>
        <span class="link-text">{{ $t('home.quickLinkRoutine') }}</span>
      </router-link>
      <router-link to="/learn" class="quick-link card">
        <span class="link-icon">📚</span>
        <span class="link-text">{{ $t('home.quickLinkLearn') }}</span>
      </router-link>
      <router-link to="/practice" class="quick-link card">
        <span class="link-icon">🎸</span>
        <span class="link-text">{{ $t('home.quickLinkPractice') }}</span>
      </router-link>
      <router-link to="/chords" class="quick-link card">
        <span class="link-icon">🔤</span>
        <span class="link-text">{{ $t('home.quickLinkChords') }}</span>
      </router-link>
      <router-link to="/practice/tuner" class="quick-link card">
        <span class="link-icon">🎛️</span>
        <span class="link-text">{{ $t('home.quickLinkTuner') }}</span>
      </router-link>
      <router-link to="/library" class="quick-link card">
        <span class="link-icon">🎵</span>
        <span class="link-text">{{ $t('home.quickLinkSongs') }}</span>
      </router-link>
    </section>

    <!-- Smart Recommendations -->
    <section class="recommendations-section">
      <SmartRecommendations />
    </section>

    <!-- Chord of the Day -->
    <section class="chord-of-day-section">
      <ChordOfTheDay />
    </section>

    <!-- Daily Challenges -->
    <section class="daily-challenges-section">
      <DailyChallenges />
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import Fretboard from '../components/Fretboard.vue'
import DailyChallenges from '../components/DailyChallenges.vue'
import ChordOfTheDay from '../components/ChordOfTheDay.vue'
import SmartRecommendations from '../components/SmartRecommendations.vue'
import { useGamificationStore } from '../stores/gamificationStore.ts'
import { useProfileStore } from '../stores/profileStore.ts'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const gamification = useGamificationStore()
const profileStore = useProfileStore()

onMounted(() => {
  gamification.checkAndResetDailyQuests()
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  let timeGreeting = t('home.goodMorning')
  if (hour < 12) timeGreeting = t('home.goodMorning')
  else if (hour < 18) timeGreeting = t('home.goodAfternoon')
  else timeGreeting = t('home.goodEvening')

  const name = profileStore.activeProfile?.name
  if (name && name !== 'Default') {
    return t('home.greetingWithName', { timeGreeting, name })
  }
  return t('home.greetingWithoutName', { timeGreeting })
})

const goalTip = computed(() => {
  const goals = profileStore.activeProfile?.goals
  const allGoals = ['rhythm', 'lead', 'barre', 'fingerpicking', 'chords', 'scales', 'strumming']
  const selectedGoals = (goals && goals.length > 0) ? goals : allGoals
  const randomGoal = selectedGoals[Math.floor(Math.random() * selectedGoals.length)]
  const goalTips = t('tips.' + randomGoal) as unknown as string[]
  if (Array.isArray(goalTips) && goalTips.length > 0) {
    return goalTips[Math.floor(Math.random() * goalTips.length)]
  }
  return null
})

const previewChord = {
  name: 'Em',
  fullName: 'E Minor',
  strings: [0, 0, 0, 2, 2, 0],
  fingers: [0, 0, 0, 2, 3, 0],
  barre: null,
}
</script>

<style scoped>
.home-view {
  padding: 0 24px 48px;
  max-width: 900px;
  margin: 0 auto;
}

.hero {
  display: flex;
  gap: 48px;
  align-items: center;
  padding: 48px 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 32px;
}

.hero-content {
  flex: 1;
}

.greeting {
  font-size: 16px;
  font-weight: 600;
  color: var(--bg-highlight);
  margin-bottom: 8px;
}

.goal-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-highlight);
  color: var(--bg-primary);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  font-weight: 500;
  text-decoration: none;
  transition: opacity 0.2s;
}

.goal-tip:hover {
  opacity: 0.9;
}

.tip-icon {
  font-size: 16px;
}

.tip-text {
  flex: 1;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 16px;
}

.hero-title .highlight {
  color: var(--bg-highlight);
}

.hero-subtitle {
  color: var(--text-secondary);
  font-size: 18px;
  margin-bottom: 24px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-visual {
  flex: 0 0 auto;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  text-decoration: none;
  color: inherit;
  text-align: center;
  transition: transform 0.2s;
}

.quick-link:hover {
  transform: translateY(-2px);
}

.link-icon {
  font-size: 32px;
}

.link-text {
  font-size: 14px;
  font-weight: 600;
}

.recommendations-section {
  margin-top: 32px;
}

.daily-challenges-section {
  margin-top: 32px;
}

@media (max-width: 700px) {
  .hero {
    flex-direction: column;
    padding: 32px 0 24px;
  }
  .hero-title {
    font-size: 32px;
  }
  .hero-visual {
    width: 100%;
  }
  .quick-links {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
