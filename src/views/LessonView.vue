<template>
  <div class="lesson-view">
    <div v-if="chapter && lesson" class="lesson-content">
      <!-- Navigation Header -->
      <div class="lesson-nav">
        <BackLink :to="{ name: 'chapter', params: { chapterId: chapter.id } }" :label="`Back to ${chapter.title}`" />
        
        <div class="lesson-progress">
          Lesson {{ lesson.number }} of {{ chapter.lessons.length }}
        </div>
      </div>

      <!-- Lesson Header -->
      <div class="lesson-header-block" :style="{ '--chapter-color': chapter.color }">
        <div class="lesson-type-badge" :class="lesson.type">
          {{ typeLabel(lesson.type) }}
        </div>
        <h1>{{ lesson.title }}</h1>
        <div class="lesson-meta-header">
          <span class="duration">{{ lesson.duration }}</span>
          <span class="xp-reward">+{{ lesson.xpReward }} XP</span>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-card card">
        <!-- Text Content -->
        <div v-if="lesson.type === 'text'" class="text-content">
          <LessonContent :content="lesson.content" :lesson-id="lesson.id" />
        </div>

        <!-- Chord Lesson -->
        <div v-else-if="lesson.type === 'chord'" class="chord-content">
          <LessonContent :content="lesson.content" :lesson-id="lesson.id" />

          <div v-if="chordData" class="chord-demo">
            <h3>Practice This Chord</h3>
            <div class="fretboard-wrapper">
              <Fretboard :chord="chordData" :highlight="true" />
            </div>
            <div class="chord-name-display">{{ chordData.name }}</div>
            <button class="btn btn-primary play-btn" @click="playChord">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Play Chord
            </button>
          </div>
        </div>

        <!-- Song Lesson -->
        <div v-else-if="lesson.type === 'song'" class="song-content">
          <LessonContent :content="lesson.content" :lesson-id="lesson.id" />

          <div class="song-practice">
            <h3>Practice This Song</h3>
            <p>Use the Song Player to practice along with the chords and progression.</p>
            <router-link to="/library" class="btn btn-primary">
              Go to Song Library
            </router-link>
          </div>
        </div>
      </div>

      <!-- Completion Section -->
      <div v-if="!localCompleted" class="completion-section">
        <div class="completion-card">
          <h3>Complete This Lesson?</h3>
          <p>Mark this lesson as complete to earn {{ lesson.xpReward }} XP and continue to the next lesson!</p>
          <button class="btn btn-lg btn-success" :disabled="completing" @click="completeLesson">
            <span v-if="completing">Saving...</span>
            <span v-else>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Mark as Complete
            </span>
          </button>
        </div>
      </div>

      <div v-else class="completion-section completed">
        <div class="completion-card success">
          <div class="success-icon">✓</div>
          <h3>Lesson Completed!</h3>
          <p>You earned {{ lesson.xpReward }} XP</p>
          <div v-if="showUnlockMessage" class="unlock-message">
            <span v-if="nextLesson">Next lesson unlocked! Continue below.</span>
            <span v-else-if="isLastLessonInChapter && nextChapterAvailable">Chapter completed! Next chapter unlocked!</span>
            <span v-else-if="isLastLessonInChapter">Chapter completed!</span>
          </div>
        </div>
      </div>

      <!-- Navigation Footer -->
      <div class="lesson-navigation">
        <button 
          v-if="previousLesson" 
          class="btn btn-secondary nav-btn"
          @click="goToLesson(previousLesson)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <div class="nav-info">
            <span class="nav-label">Previous</span>
            <span class="nav-title">{{ previousLesson.lesson.title }}</span>
          </div>
        </button>
        <div v-else class="nav-spacer"></div>

        <button 
          v-if="nextLesson && localCompleted" 
          class="btn btn-primary nav-btn next"
          @click="goToLesson(nextLesson)"
        >
          <div class="nav-info">
            <span class="nav-label">Next Lesson</span>
            <span class="nav-title">{{ nextLesson.lesson.title }}</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <div v-else-if="!nextLesson && localCompleted" class="completion-message">
          <router-link 
            :to="{ name: 'chapter', params: { chapterId: nextChapter?.id || chapter.id } }" 
            class="btn btn-primary"
          >
            {{ nextChapter ? 'Next Chapter' : 'Back to Chapter' }}
          </router-link>
        </div>
        <div v-else class="nav-locked">
          <span>Complete this lesson to continue</span>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <h2>Lesson Not Found</h2>
      <router-link to="/learn" class="btn btn-primary">Back to Learning</router-link>
    </div>

    <!-- Confetti Celebration -->
    <ConfettiCelebration v-model="showConfetti" />

    <!-- Completion Toast -->
    <Transition name="toast">
      <div v-if="showToast" class="completion-toast" :class="toastType">
        <div class="toast-icon">{{ toastIcon }}</div>
        <div class="toast-content">
          <div class="toast-title">{{ toastTitle }}</div>
          <div class="toast-message">{{ toastMessage }}</div>
        </div>
        <button class="toast-close" @click="showToast = false">×</button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getChapterById, getNextLesson, getPreviousLesson } from '../data/chapters.js'
import { getChordByName } from '../data/chords.js'
import { useGamificationStore } from '../stores/gamificationStore.ts'
import Fretboard from '../components/Fretboard.vue'
import LessonContent from '../components/LessonContent.vue'
import ConfettiCelebration from '../components/ConfettiCelebration.vue'
import { useAudio } from '../composables/useAudio.js'
import BackLink from '../components/BackLink.vue'

const route = useRoute()
const router = useRouter()
const gamification = useGamificationStore()
const { playChord: playAudioChord, initAudio } = useAudio()

const chapter = computed(() => getChapterById(route.params.chapterId))
const lesson = computed(() => {
  if (!chapter.value) return null
  return chapter.value.lessons.find(l => l.id === route.params.lessonId)
})

const completing = ref(false)
const localCompleted = ref(false)
const showUnlockMessage = ref(false)
const showConfetti = ref(false)

// Toast state
const showToast = ref(false)
const toastType = ref('success')
const toastTitle = ref('')
const toastMessage = ref('')
const toastIcon = ref('✓')

const progress = computed(() => gamification.progress?.value || {})

const isCompleted = computed(() => {
  return progress.value[`${chapter.value?.id}-${lesson.value?.id}`]?.completed || false
})

// Sync local state with stored state
watch(isCompleted, (newVal) => {
  localCompleted.value = newVal
}, { immediate: true })

const chordData = computed(() => {
  if (lesson.value?.type === 'chord' && lesson.value?.chordName) {
    return getChordByName(lesson.value.chordName)
  }
  return null
})

const nextLesson = computed(() => {
  if (!chapter.value || !lesson.value) return null
  return getNextLesson(chapter.value.id, lesson.value.id)
})

const previousLesson = computed(() => {
  if (!chapter.value || !lesson.value) return null
  return getPreviousLesson(chapter.value.id, lesson.value.id)
})

const isLastLessonInChapter = computed(() => {
  if (!chapter.value || !lesson.value) return false
  return lesson.value.number === chapter.value.lessons.length
})

const nextChapter = computed(() => {
  const chapters = [{ id: 'chapter-1' }, { id: 'chapter-2' }, { id: 'chapter-3' }, { id: 'chapter-4' }, { id: 'chapter-5' }]
  const currentIndex = chapters.findIndex(c => c.id === chapter.value?.id)
  if (currentIndex === -1 || currentIndex >= chapters.length - 1) return null
  return chapters[currentIndex + 1]
})

const nextChapterAvailable = computed(() => {
  if (!nextChapter.value) return false
  return gamification.level >= (chapter.value?.number + 1 || 1)
})

function typeLabel(type) {
  const labels = {
    text: 'Reading Lesson',
    chord: 'Chord Lesson',
    song: 'Song Practice'
  }
  return labels[type] || type
}

async function playChord() {
  if (!chordData.value) return
  await initAudio()
  await playAudioChord(chordData.value.strings, 1.5)
}

function showCompletionToast(title, message, type = 'success') {
  toastTitle.value = title
  toastMessage.value = message
  toastType.value = type
  toastIcon.value = type === 'success' ? '✓' : type === 'levelup' ? '🎉' : 'ℹ️'
  showToast.value = true
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    showToast.value = false
  }, 5000)
}

async function completeLesson() {
  if (!lesson.value || !chapter.value) return
  
  // Check if already completed to prevent double XP
  const lessonKey = `${chapter.value.id}-${lesson.value.id}`
  if (progress.value[lessonKey]?.completed || localCompleted.value) {
    showCompletionToast('Already Completed', 'You have already completed this lesson!', 'info')
    return
  }
  
  completing.value = true
  
  // Award XP
  const result = gamification.addXP(lesson.value.xpReward, `Completed: ${lesson.value.title}`)
  
  // Mark lesson as complete using store method
  gamification.saveLessonProgress(chapter.value.id, lesson.value.id, lesson.value.xpReward)
  
  // Update local state
  localCompleted.value = true
  
  // Show feedback
  showUnlockMessage.value = true
  
  if (result?.levelUp) {
    showConfetti.value = true
    showCompletionToast(
      'Level Up! 🎉',
      `You are now level ${gamification.level}! New chapter unlocked!`,
      'levelup'
    )
  } else if (isLastLessonInChapter.value) {
    showConfetti.value = true
    showCompletionToast(
      'Chapter Complete! 🎉',
      `+${lesson.value.xpReward} XP earned. Chapter ${chapter.value.number} finished!`,
      'success'
    )
  } else {
    showCompletionToast(
      'Lesson Complete!',
      `+${lesson.value.xpReward} XP earned. ${nextLesson.value ? 'Next lesson unlocked!' : 'Chapter complete!'}`,
      'success'
    )
  }
  
  // Also record stats
  gamification.recordPracticeTime(parseInt(lesson.value.duration) || 10)
  
  completing.value = false
}

function goToLesson({ lesson: l, chapter: c }) {
  // Reset states when navigating
  localCompleted.value = false
  showUnlockMessage.value = false
  showToast.value = false
  
  router.push({
    name: 'lesson',
    params: { chapterId: c.id, lessonId: l.id }
  })
}

// Reset states when lesson changes
watch(() => route.params.lessonId, () => {
  localCompleted.value = isCompleted.value
  showUnlockMessage.value = false
  showToast.value = false
})
</script>

<style scoped>
.lesson-view {
  padding: 0 24px 48px;
  max-width: 800px;
  margin: 0 auto;
}

.lesson-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.lesson-nav .back-link {
  margin-bottom: 0;
}

.lesson-progress {
  font-size: 14px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.lesson-header-block {
  text-align: center;
  margin-bottom: 32px;
}

.lesson-type-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

.lesson-type-badge.text {
  background: #3b82f6;
  color: white;
}

.lesson-type-badge.chord {
  background: #22c55e;
  color: white;
}

.lesson-type-badge.song {
  background: #f59e0b;
  color: white;
}

.lesson-header-block h1 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 12px;
  line-height: 1.2;
}

.lesson-meta-header {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 14px;
}

.duration {
  color: var(--text-secondary);
}

.xp-reward {
  color: var(--bg-highlight);
  font-weight: 700;
  background: var(--bg-highlight-light);
  padding: 4px 10px;
  border-radius: 12px;
}

.content-card {
  padding: 32px;
  margin-bottom: 32px;
}

.content-body {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-primary);
}

.content-body :deep(p) {
  margin-bottom: 16px;
}

.content-body :deep(h3), 
.content-body :deep(h4) {
  margin-top: 24px;
  margin-bottom: 12px;
  font-weight: 700;
}

.content-body :deep(strong) {
  color: var(--bg-highlight);
}

.content-body :deep(code) {
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
}

.content-body :deep(pre) {
  background: var(--bg-tertiary);
  padding: 16px;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: 16px 0;
}

.content-body :deep(pre code) {
  background: none;
  padding: 0;
}

.chord-demo {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.chord-demo h3 {
  margin-bottom: 20px;
  font-size: 20px;
}

.fretboard-wrapper {
  max-width: 280px;
  margin: 0 auto 16px;
}

.chord-name-display {
  font-size: 24px;
  font-weight: 800;
  color: var(--bg-highlight);
  margin-bottom: 16px;
}

.play-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.song-practice {
  margin-top: 32px;
  padding: 24px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  text-align: center;
}

.song-practice h3 {
  margin-bottom: 8px;
}

.song-practice p {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.completion-section {
  margin-bottom: 32px;
}

.completion-card {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 32px;
  text-align: center;
}

.completion-card.success {
  border-color: var(--bg-success);
  background: rgba(16, 185, 129, 0.05);
}

.completion-card h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.completion-card p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--bg-success);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 16px;
}

.unlock-message {
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-highlight-light);
  border-radius: var(--radius-md);
  color: var(--bg-highlight);
  font-weight: 600;
  font-size: 14px;
}

.btn-success {
  background: var(--bg-success);
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-success:hover {
  background: #059669;
}

.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.lesson-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  flex: 1;
  max-width: 280px;
}

.nav-btn.next {
  flex-direction: row-reverse;
  text-align: right;
  margin-left: auto;
}

.nav-info {
  display: flex;
  flex-direction: column;
}

.nav-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-tertiary);
}

.nav-title {
  font-weight: 600;
  font-size: 14px;
}

.nav-spacer {
  flex: 1;
}

.nav-locked {
  color: var(--text-tertiary);
  font-size: 14px;
}

.completion-message {
  text-align: center;
}

.not-found {
  text-align: center;
  padding: 64px 24px;
}

/* Toast Styles */
.completion-toast {
  position: fixed;
  top: 80px;
  right: 20px;
  background: var(--bg-card);
  border-left: 4px solid var(--bg-success);
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  max-width: 400px;
  z-index: 1000;
}

.completion-toast.levelup {
  border-left-color: #f59e0b;
}

.completion-toast.info {
  border-left-color: #3b82f6;
}

.toast-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-success);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.completion-toast.levelup .toast-icon {
  background: #f59e0b;
}

.completion-toast.info .toast-icon {
  background: #3b82f6;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 2px;
}

.toast-message {
  font-size: 13px;
  color: var(--text-secondary);
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
}

.toast-close:hover {
  color: var(--text-primary);
}

/* Toast Transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (max-width: 600px) {
  .lesson-header-block h1 {
    font-size: 24px;
  }
  
  .content-card {
    padding: 20px;
  }
  
  .lesson-navigation {
    flex-direction: column;
  }
  
  .nav-btn {
    max-width: none;
    width: 100%;
  }
  
  .completion-toast {
    left: 10px;
    right: 10px;
    top: auto;
    bottom: 20px;
    max-width: none;
    min-width: auto;
  }
}
</style>
