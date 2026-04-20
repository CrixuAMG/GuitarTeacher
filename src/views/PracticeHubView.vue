<template>
  <div class="practice-hub">
    <div class="hub-header">
      <h1>🎯 {{ $t('practiceHub.title') }}</h1>
      <p>{{ $t('practiceHub.subtitle') }}</p>
    </div>

    <div v-if="activeGoal && !showAllContent" class="session-filter-banner">
      <span>📍 Focused on: {{ getGoalName(activeGoal) }}</span>
      <button @click="showAllContent = true">Show All Tools</button>
    </div>

    <!-- Core Practice Tools -->
    <section class="tools-section">
      <h2 class="section-title">{{ $t('practiceHub.corePractice') }}</h2>
      <p class="section-desc">{{ $t('practiceHub.corePracticeDesc') }}</p>
      <div class="tools-grid">
        <router-link
          v-for="tool in coreTools"
          :key="tool.to"
          :to="tool.to"
          class="tool-card card"
        >
          <span class="tool-icon">{{ tool.icon }}</span>
          <div class="tool-info">
            <h3>{{ tool.label }}</h3>
            <p>{{ tool.desc }}</p>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Intermediate Tools (shown when unlocked) -->
    <section v-if="intermediateTools.length > 0" class="tools-section">
      <h2 class="section-title">{{ $t('practiceHub.practiceTraining') }}</h2>
      <p class="section-desc">{{ $t('practiceHub.practiceTrainingDesc') }}</p>
      <div class="tools-grid">
        <router-link
          v-for="tool in intermediateTools"
          :key="tool.to"
          :to="tool.to"
          class="tool-card card"
        >
          <span class="tool-icon">{{ tool.icon }}</span>
          <div class="tool-info">
            <h3>{{ tool.label }}</h3>
            <p>{{ tool.desc }}</p>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Music Theory Tools -->
    <section v-if="theoryTools.length > 0" class="tools-section">
      <h2 class="section-title">{{ $t('practiceHub.musicTheory') }}</h2>
      <p class="section-desc">{{ $t('practiceHub.musicTheoryDesc') }}</p>
      <div class="tools-grid">
        <router-link
          v-for="tool in theoryTools"
          :key="tool.to"
          :to="tool.to"
          class="tool-card card"
        >
          <span class="tool-icon">{{ tool.icon }}</span>
          <div class="tool-info">
            <h3>{{ tool.label }}</h3>
            <p>{{ tool.desc }}</p>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Advanced Theory Tools -->
    <section v-if="advancedTools.length > 0" class="tools-section">
      <h2 class="section-title">{{ $t('practiceHub.advancedTheory') }}</h2>
      <p class="section-desc">{{ $t('practiceHub.advancedTheoryDesc') }}</p>
      <div class="tools-grid">
        <router-link
          v-for="tool in advancedTools"
          :key="tool.to"
          :to="tool.to"
          class="tool-card card"
        >
          <span class="tool-icon">{{ tool.icon }}</span>
          <div class="tool-info">
            <h3>{{ tool.label }}</h3>
            <p>{{ tool.desc }}</p>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Performance & Gig Tools -->
    <section v-if="performanceTools.length > 0" class="tools-section">
      <h2 class="section-title">{{ $t('practiceHub.performance') }}</h2>
      <p class="section-desc">{{ $t('practiceHub.performanceDesc') }}</p>
      <div class="tools-grid">
        <router-link
          v-for="tool in performanceTools"
          :key="tool.to"
          :to="tool.to"
          class="tool-card card"
        >
          <span class="tool-icon">{{ tool.icon }}</span>
          <div class="tool-info">
            <h3>{{ tool.label }}</h3>
            <p>{{ tool.desc }}</p>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Quick Links -->
    <section class="quick-links">
      <router-link to="/learn" class="link-card">
        <span>📚 {{ $t('practiceHub.quickLinkLearningPath') }}</span>
      </router-link>
      <router-link to="/chords" class="link-card">
        <span>🔤 {{ $t('practiceHub.quickLinkChordLibrary') }}</span>
      </router-link>
      <router-link to="/library" class="link-card">
        <span>🎵 {{ $t('practiceHub.quickLinkSongLibrary') }}</span>
      </router-link>
      <router-link to="/profile" class="link-card">
        <span>👤 {{ $t('practiceHub.quickLinkProfile') }}</span>
      </router-link>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProgressiveUnlock } from '../composables/useProgressiveUnlock.ts'
import { useActiveSession } from '../composables/useActiveSession.ts'

const { t } = useI18n()
const { isLevelVisible } = useProgressiveUnlock()
const { activeGoal, matchesGoal } = useActiveSession()
const showAllContent = ref(false)

const goalMeta: Record<string, string> = {
  learn_chords: 'Learn Chords',
  strumming: 'Strumming',
  fingerstyle: 'Fingerstyle',
  songs: 'Songs',
  theory: 'Theory',
  lead: 'Lead Guitar',
  ear_training: 'Ear Training',
  songwriting: 'Songwriting',
  perform: 'Performance',
  just_fun: 'Just Fun',
}

function getGoalName(goalId: string | null): string {
  return goalId ? goalMeta[goalId] || goalId : ''
}

const allTools = [
  { to: '/practice/routine', icon: '📋', label: t('practiceHub.toolRoutine'), desc: t('practiceHub.toolRoutineDesc'), category: 'core', level: 'beginner' as const, goalTags: ['learn_chords', 'strumming'] },
  { to: '/practice/notes', icon: '🎯', label: t('practiceHub.toolNoteTrainer'), desc: t('practiceHub.toolNoteTrainerDesc'), category: 'core', level: 'beginner' as const, goalTags: ['ear_training', 'theory'] },
  { to: '/practice/strumming', icon: '🎵', label: t('practiceHub.toolStrummingTrainer'), desc: t('practiceHub.toolStrummingTrainerDesc'), category: 'core', level: 'beginner' as const, goalTags: ['strumming'] },
  { to: '/practice/chords', icon: '🎸', label: t('practiceHub.toolChordDrills'), desc: t('practiceHub.toolChordDrillsDesc'), category: 'core', level: 'beginner' as const, goalTags: ['learn_chords'] },
  { to: '/practice/tuner', icon: '🎛️', label: t('practiceHub.toolTuner'), desc: t('practiceHub.toolTunerDesc'), category: 'core', level: 'beginner' as const, goalTags: ['just_fun', 'perform'] },
  { to: '/practice/metronome', icon: '⏱️', label: t('practiceHub.toolMetronome'), desc: t('practiceHub.toolMetronomeDesc'), category: 'core', level: 'beginner' as const, goalTags: ['strumming', 'perform'] },
  { to: '/practice/ear-training', icon: '👂', label: t('practiceHub.toolEarTraining'), desc: t('practiceHub.toolEarTrainingDesc'), category: 'core', level: 'beginner' as const, goalTags: ['ear_training'] },
  { to: '/tools/tempo-tapper', icon: '👆', label: t('practiceHub.toolTempoTapper'), desc: t('practiceHub.toolTempoTapperDesc'), category: 'core', level: 'beginner' as const, goalTags: ['strumming'] },

  { to: '/practice/timer', icon: '⏲️', label: t('practiceHub.toolPracticeTimer'), desc: t('practiceHub.toolPracticeTimerDesc'), category: 'intermediate', level: 'intermediate' as const, goalTags: ['just_fun', 'learn_chords'] },
  { to: '/zen', icon: '🧘', label: t('practiceHub.toolZenMode'), desc: t('practiceHub.toolZenModeDesc'), category: 'intermediate', level: 'intermediate' as const, goalTags: ['just_fun', 'perform'] },
  { to: '/practice/blind-mode', icon: '🙈', label: t('practiceHub.toolBlindMode'), desc: t('practiceHub.toolBlindModeDesc'), category: 'intermediate', level: 'intermediate' as const, goalTags: ['learn_chords'] },
  { to: '/practice/speed-run', icon: '⚡', label: t('practiceHub.toolSpeedRun'), desc: t('practiceHub.toolSpeedRunDesc'), category: 'intermediate', level: 'intermediate' as const, goalTags: ['lead'] },
  { to: '/practice/exercises', icon: '📖', label: t('practiceHub.toolExerciseLibrary'), desc: t('practiceHub.toolExerciseLibraryDesc'), category: 'intermediate', level: 'intermediate' as const, goalTags: ['learn_chords', 'fingerstyle', 'lead'] },
  { to: '/practice/speed-trainer', icon: '💨', label: t('practiceHub.toolSpeedTrainer'), desc: t('practiceHub.toolSpeedTrainerDesc'), category: 'intermediate', level: 'intermediate' as const, goalTags: ['lead', 'fingerstyle'] },
  { to: '/practice/journal', icon: '📓', label: t('practiceHub.toolPracticeJournal'), desc: t('practiceHub.toolPracticeJournalDesc'), category: 'intermediate', level: 'intermediate' as const, goalTags: ['just_fun', 'songs'] },
  { to: '/practice/weekly-report', icon: '📊', label: t('practiceHub.toolWeeklyReport'), desc: t('practiceHub.toolWeeklyReportDesc'), category: 'intermediate', level: 'intermediate' as const, goalTags: ['theory'] },
  { to: '/hero', icon: '🎮', label: t('practiceHub.toolGuitarHero'), desc: t('practiceHub.toolGuitarHeroDesc'), category: 'intermediate', level: 'intermediate' as const, goalTags: ['lead', 'songs', 'just_fun'] },
  { to: '/jam', icon: '🎷', label: t('practiceHub.toolJamMode'), desc: t('practiceHub.toolJamModeDesc'), category: 'intermediate', level: 'intermediate' as const, goalTags: ['songs', 'songwriting', 'just_fun'] },
  { to: '/goals', icon: '🎯', label: t('practiceHub.toolGoalTracker'), desc: t('practiceHub.toolGoalTrackerDesc'), category: 'intermediate', level: 'intermediate' as const, goalTags: ['just_fun'] },

  { to: '/tools/scale-visualizer', icon: '🎼', label: t('practiceHub.toolScaleVisualizer'), desc: t('practiceHub.toolScaleVisualizerDesc'), category: 'theory', level: 'intermediate' as const, goalTags: ['theory', 'lead'] },
  { to: '/tools/circle-of-fifths', icon: '🔄', label: t('practiceHub.toolCircleOfFifths'), desc: t('practiceHub.toolCircleOfFifthsDesc'), category: 'theory', level: 'intermediate' as const, goalTags: ['theory', 'songwriting'] },
  { to: '/tools/transpose', icon: '🔀', label: t('practiceHub.toolTranspose'), desc: t('practiceHub.toolTransposeDesc'), category: 'theory', level: 'intermediate' as const, goalTags: ['songs', 'theory'] },
  { to: '/tools/capo', icon: '🧷', label: t('practiceHub.toolCapo'), desc: t('practiceHub.toolCapoDesc'), category: 'theory', level: 'intermediate' as const, goalTags: ['songs'] },

  { to: '/tools/caged', icon: '🧱', label: t('practiceHub.toolCAGED'), desc: t('practiceHub.toolCAGEDDesc'), category: 'advanced', level: 'advanced' as const, goalTags: ['learn_chords', 'theory'] },
  { to: '/tools/chord-scale', icon: '🔗', label: t('practiceHub.toolChordScale'), desc: t('practiceHub.toolChordScaleDesc'), category: 'advanced', level: 'advanced' as const, goalTags: ['theory', 'lead'] },
  { to: '/tools/triad-inversions', icon: '🔺', label: t('practiceHub.toolTriadInversions'), desc: t('practiceHub.toolTriadInversionsDesc'), category: 'advanced', level: 'advanced' as const, goalTags: ['theory', 'fingerstyle'] },
  { to: '/tools/nashville-numbers', icon: '🔢', label: t('practiceHub.toolNashvilleNumbers'), desc: t('practiceHub.toolNashvilleNumbersDesc'), category: 'advanced', level: 'advanced' as const, goalTags: ['theory', 'songwriting'] },
  { to: '/tools/chord-voicings', icon: '🔊', label: t('practiceHub.toolChordVoicingsDesc'), desc: t('practiceHub.toolChordVoicingsDesc'), category: 'advanced', level: 'advanced' as const, goalTags: ['theory', 'perform'] },
  { to: '/tools/technique-lottery', icon: '🎡', label: t('practiceHub.toolTechniqueLottery'), desc: t('practiceHub.toolTechniqueLotteryDesc'), category: 'advanced', level: 'advanced' as const, goalTags: ['just_fun', 'lead'] },

  { to: '/repertoire', icon: '📋', label: t('practiceHub.toolRepertoire'), desc: t('practiceHub.toolRepertoireDesc'), category: 'performance', level: 'advanced' as const, goalTags: ['songs', 'perform'] },
  { to: '/setlists', icon: '📝', label: t('practiceHub.toolSetlists'), desc: t('practiceHub.toolSetlistsDesc'), category: 'performance', level: 'advanced' as const, goalTags: ['perform', 'songs'] },
]

const filteredTools = computed(() => {
  if (showAllContent.value || !activeGoal.value) return allTools
  return allTools.filter(tool => {
    const tags = tool.goalTags || []
    return matchesGoal(tags, activeGoal.value)
  })
})

const coreTools = computed(() =>
  filteredTools.value.filter(t => t.category === 'core' && isLevelVisible(t.level))
)
const intermediateTools = computed(() =>
  filteredTools.value.filter(t => t.category === 'intermediate' && isLevelVisible(t.level))
)
const theoryTools = computed(() =>
  filteredTools.value.filter(t => t.category === 'theory' && isLevelVisible(t.level))
)
const advancedTools = computed(() =>
  filteredTools.value.filter(t => t.category === 'advanced' && isLevelVisible(t.level))
)
const performanceTools = computed(() =>
  filteredTools.value.filter(t => t.category === 'performance' && isLevelVisible(t.level))
)
</script>

<style scoped>
.practice-hub {
  padding: 0 24px 48px;
  max-width: 900px;
  margin: 0 auto;
}

.hub-header {
  margin-bottom: 32px;
}

.hub-header h1 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
}

.hub-header p {
  color: var(--text-secondary);
  font-size: 16px;
}

.tools-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.section-desc {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  text-decoration: none;
}

.tool-icon {
  font-size: 40px;
}

.tool-info h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.tool-info p {
  font-size: 14px;
  color: var(--text-secondary);
}

.quick-links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 32px;
}

.link-card {
  padding: 12px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 14px;
  transition: all 0.2s;
}

.link-card:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

@media (max-width: 600px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>