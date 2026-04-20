<template>
  <div class="routine-view">
    <BackLink to="/practice" :label="$t('practiceRoutine.backLabel')" />
    <PageHeader :subtitle="$t('practiceRoutine.subtitle')">{{ $t('practiceRoutine.title') }}</PageHeader>

    <!-- Step Progress -->
    <div class="step-progress">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="step-indicator"
        :class="{
          active: currentStepIndex === index,
          completed: stepCompleted[index],
        }"
        @click="goToStep(index)"
      >
        <div class="step-dot">{{ stepCompleted[index] ? '✓' : index + 1 }}</div>
        <div class="step-label">{{ step.name }}</div>
      </div>
    </div>

    <!-- Current Step Content -->
    <div v-if="currentStep && !routineComplete" class="step-content card">
      <div class="step-header">
        <div class="step-icon">{{ currentStep.icon }}</div>
        <div class="step-info">
          <h2>{{ currentStep.name }}</h2>
          <p>{{ currentStep.description }}</p>
        </div>
      </div>

      <!-- Timer -->
      <div class="step-timer">
        <div class="timer-display" :class="timer.isRunning.value ? 'running' : 'paused'">
          <div class="time-big">{{ timer.formatTime(timer.timeElapsed.value) }}</div>
          <div v-if="currentStep.duration > 0" class="time-label">
            {{ timer.formatTime(timer.timeRemaining.value) }} {{ $t('practiceRoutine.remaining') }}
          </div>
          <div v-else class="time-label">{{ $t('practiceRoutine.elapsed') }}</div>
        </div>
        <div v-if="currentStep.duration > 0" class="timer-bar">
          <div class="timer-bar-fill" :style="{ width: timer.progress.value + '%' }"></div>
        </div>
        <div class="timer-controls">
          <button class="btn btn-primary" @click="timer.toggle()">
            {{ timer.isRunning.value ? $t('practiceRoutine.pause') : $t('practiceRoutine.start') }}
          </button>
          <button v-if="currentStep.duration > 0" class="btn btn-secondary" @click="timer.reset(currentStep.duration)">{{ $t('practiceRoutine.reset') }}</button>
        </div>
      </div>

      <!-- Inline Tool -->
      <div v-if="currentStep.component" class="step-tool">
        <component :is="currentStep.component" v-bind="currentStep.componentProps || {}" />
      </div>
      <p v-else class="step-hint">{{ currentStep.hint }}</p>

      <!-- Navigation -->
      <div class="step-nav">
        <button
          class="btn btn-secondary"
          :disabled="currentStepIndex === 0"
          @click="prevStep"
        >
          {{ $t('practiceRoutine.previous') }}
        </button>
        <button
          v-if="currentStepIndex < steps.length - 1"
          class="btn btn-primary"
          @click="nextStep"
        >
          {{ $t('practiceRoutine.doneNextStep') }}
        </button>
        <button
          v-else
          class="btn btn-primary"
          @click="completeRoutine"
        >
          {{ $t('practiceRoutine.completeRoutine') }}
        </button>
      </div>
    </div>

    <!-- Routine Complete -->
    <div v-if="routineComplete" class="complete-card card">
      <div class="complete-icon">🎉</div>
      <h2>{{ $t('practiceRoutine.greatPractice') }}</h2>
      <p>{{ $t('practiceRoutine.greatPracticeDesc') }}</p>
      <p class="total-time">{{ $t('practiceRoutine.totalTime', { time: timer.formatTime(totalTimeElapsed) }) }}</p>
      <div class="complete-actions">
        <router-link to="/" class="btn btn-primary">{{ $t('practiceRoutine.goHome') }}</router-link>
        <router-link to="/practice" class="btn btn-secondary">{{ $t('practiceRoutine.practiceHub') }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, markRaw, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGamificationStore } from '../stores/gamificationStore'
import { useCountdownTimer } from '../composables/useCountdownTimer'
import { useAudioPlayer } from '../composables/useAudioPlayer'
import BackLink from '../components/BackLink.vue'
import PageHeader from '../components/PageHeader.vue'
import GuitarTuner from '../components/GuitarTuner.vue'
import NoteTrainer from '../components/NoteTrainer.vue'
import ChordTransitionTrainer from '../components/ChordTransitionTrainer.vue'
import StrummingTrainer from '../components/StrummingTrainer.vue'
import ExerciseLibrary from '../components/ExerciseLibrary.vue'

const { t } = useI18n()
const gamification = useGamificationStore()
const timer = useCountdownTimer()
const { playChime } = useAudioPlayer()

const currentStepIndex = ref(0)
const stepCompleted = ref<boolean[]>(new Array(7).fill(false))
const routineComplete = ref(false)
const totalTimeElapsed = ref(0)
let totalTimer: ReturnType<typeof setInterval> | null = null

interface RoutineStep {
  id: string
  name: string
  icon: string
  description: string
  duration: number
  component?: Component
  componentProps?: Record<string, unknown>
  hint: string
}

const steps: RoutineStep[] = [
  {
    id: 'tune',
    name: t('practiceRoutine.stepTune'),
    icon: '🎛️',
    description: t('practiceRoutine.stepTuneDesc'),
    duration: 0,
    component: markRaw(GuitarTuner),
    hint: '',
  },
  {
    id: 'warmup',
    name: t('practiceRoutine.stepWarmup'),
    icon: '🔥',
    description: t('practiceRoutine.stepWarmupDesc'),
    duration: 0,
    component: markRaw(ExerciseLibrary),
    componentProps: { initialCategory: 'warmup' },
    hint: '',
  },
  {
    id: 'notes',
    name: t('practiceRoutine.stepNotes'),
    icon: '🎯',
    description: t('practiceRoutine.stepNotesDesc'),
    duration: 180,
    component: markRaw(NoteTrainer),
    hint: '',
  },
  {
    id: 'chords',
    name: t('practiceRoutine.stepChords'),
    icon: '🎸',
    description: t('practiceRoutine.stepChordsDesc'),
    duration: 300,
    component: markRaw(ChordTransitionTrainer),
    hint: '',
  },
  {
    id: 'strumming',
    name: t('practiceRoutine.stepStrumming'),
    icon: '🥁',
    description: t('practiceRoutine.stepStrummingDesc'),
    duration: 180,
    component: markRaw(StrummingTrainer),
    hint: '',
  },
  {
    id: 'song',
    name: t('practiceRoutine.stepSong'),
    icon: '🎵',
    description: t('practiceRoutine.stepSongDesc'),
    duration: 0,
    component: markRaw(NoteTrainer),
    hint: '',
  },
  {
    id: 'cooldown',
    name: t('practiceRoutine.stepCooldown'),
    icon: '🧘',
    description: t('practiceRoutine.stepCooldownDesc'),
    duration: 60,
    hint: t('practiceRoutine.stepCooldownHint'),
  },
]

const currentStep = computed(() => steps[currentStepIndex.value])

function goToStep(index: number) {
  if (routineComplete.value) return
  const wasRunning = timer.isRunning.value
  timer.stop()
  stepCompleted.value[currentStepIndex.value] = true
  currentStepIndex.value = index
  timer.reset(steps[index].duration)
  if (wasRunning) timer.start()
}

function nextStep() {
  stepCompleted.value[currentStepIndex.value] = true
  timer.stop()
  if (currentStepIndex.value < steps.length - 1) {
    currentStepIndex.value++
    timer.reset(steps[currentStepIndex.value].duration)
  }
}

function prevStep() {
  timer.stop()
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
    timer.reset(steps[currentStepIndex.value].duration)
  }
}

function completeRoutine() {
  timer.stop()
  stepCompleted.value[currentStepIndex.value] = true
  routineComplete.value = true
  if (totalTimer) {
    clearInterval(totalTimer)
    totalTimer = null
  }
  gamification.recordPracticeTime(Math.ceil(totalTimeElapsed.value / 60))
  gamification.addXP(50, 'Practice Routine Complete!')
  playChime()
}

onMounted(() => {
  timer.reset(steps[0].duration)
  totalTimer = setInterval(() => {
    if (!routineComplete.value) {
      totalTimeElapsed.value++
    }
  }, 1000)
})

onUnmounted(() => {
  timer.stop()
  if (totalTimer) {
    clearInterval(totalTimer)
    totalTimer = null
  }
})
</script>

<style scoped>
.routine-view {
  padding: 0 24px 48px;
  max-width: 700px;
  margin: 0 auto;
}

/* Step Progress */
.step-progress {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 60px;
  cursor: pointer;
  padding: 8px 4px;
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.step-indicator:hover {
  background: var(--bg-tertiary);
}

.step-indicator.active {
  background: var(--bg-highlight-light);
}

.step-indicator.completed .step-dot {
  background: var(--bg-success);
  color: white;
}

.step-indicator.active .step-dot {
  background: var(--bg-highlight);
  color: white;
}

.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.step-label {
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.step-indicator.active .step-label {
  color: var(--bg-highlight);
}

.step-indicator.completed .step-label {
  color: var(--bg-success);
}

/* Step Content */
.step-content {
  padding: 32px;
  margin-bottom: 24px;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.step-icon {
  font-size: 48px;
  line-height: 1;
}

.step-info h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
}

.step-info p {
  color: var(--text-secondary);
  font-size: 14px;
}

/* Timer */
.step-timer {
  text-align: center;
  margin-bottom: 24px;
}

.timer-display {
  padding: 24px;
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  margin-bottom: 16px;
}

.timer-display.running {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(129, 140, 248, 0.1));
}

.timer-display.paused {
  background: var(--bg-secondary);
}

.time-big {
  font-size: 48px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.time-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.timer-bar {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 16px;
}

.timer-bar-fill {
  height: 100%;
  background: var(--bg-highlight);
  border-radius: 3px;
  transition: width 1s linear;
}

.timer-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* Step Tool */
.step-tool {
  margin-bottom: 24px;
  max-height: 500px;
  overflow-y: auto;
  border-radius: var(--radius-md);
}

.step-hint {
  color: var(--text-secondary);
  font-size: 14px;
  font-style: italic;
  text-align: center;
}

/* Navigation */
.step-nav {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

/* Complete */
.complete-card {
  text-align: center;
  padding: 48px 32px;
}

.complete-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.complete-card h2 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
}

.complete-card p {
  color: var(--text-secondary);
  font-size: 16px;
  margin-bottom: 12px;
}

.total-time {
  font-weight: 700;
  color: var(--bg-highlight) !important;
  font-size: 18px !important;
}

.complete-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

@media (max-width: 600px) {
  .routine-view {
    padding: 0 16px 48px;
  }

  .step-content {
    padding: 24px 16px;
  }

  .step-progress {
    gap: 2px;
  }

  .step-label {
    font-size: 9px;
  }

  .time-big {
    font-size: 36px;
  }

  .step-tool {
    max-height: 400px;
  }
}
</style>