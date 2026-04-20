<template>
  <div class="chord-of-the-day card">
    <div class="cod-header">
      <div class="cod-title-section">
        <span class="cod-badge">Chord of the Day</span>
        <h3>{{ dailyChord.fullName }}</h3>
        <p class="cod-date">{{ formattedDate }}</p>
      </div>
      <div class="cod-actions">
        <button
          v-if="!isPracticed"
          class="btn btn-primary"
          @click="markPracticed"
        >
          Mark Practiced
        </button>
        <span v-else class="practiced-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Practiced Today
        </span>
      </div>
    </div>

    <div class="cod-content">
      <div class="cod-diagram">
        <Fretboard v-if="dailyChord" :chord="dailyChord" :max-frets="4" />
      </div>
      <div class="cod-info">
        <p class="cod-description">{{ dailyChord.description }}</p>

        <div class="cod-tips">
          <h4>Practice Tips</h4>
          <ul>
            <li>Place your fingers one at a time, checking each string rings clearly</li>
            <li>Strum slowly and listen for any muted or buzzing strings</li>
            <li>Practice switching to and from this chord with G, C, and D</li>
            <li>Hold the chord for 10 seconds, then release and reshape</li>
          </ul>
        </div>

        <div class="cod-challenge">
          <h4>Today's Challenge</h4>
          <p>{{ dailyChallenge }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Fretboard from './Fretboard.vue'
import { getAllChords } from '../data/chords.js'
import { useGamificationStore } from '../stores/gamificationStore'

const gamification = useGamificationStore()

const STORAGE_KEY = 'guitar-chord-of-day'

function getDailySeed() {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
}

function getChordForDate() {
  const chords = getAllChords()
  const seed = getDailySeed()
  // Simple hash of the date string
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash = hash & hash
  }
  const index = Math.abs(hash) % chords.length
  return chords[index]
}

const dailyChord = computed(() => getChordForDate())

const formattedDate = computed(() => {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const isPracticed = ref(false)

const dailyChallenge = computed(() => {
  const challenges = [
    `Play ${dailyChord.value.name} cleanly 10 times in a row without looking at your left hand.`,
    `Practice the transition ${dailyChord.value.name} → G → ${dailyChord.value.name} for 2 minutes with a metronome at 60 BPM.`,
    `Strum ${dailyChord.value.name} using only downstrokes for 1 minute, focusing on consistent pressure.`,
    `Play ${dailyChord.value.name} and arpeggiate each string individually, ensuring all notes ring clearly.`,
    `Practice ${dailyChord.value.name} → C → Am → ${dailyChord.value.name} as a loop for 3 minutes.`,
    `Hold ${dailyChord.value.name} for 30 seconds, relax, and repeat 5 times to build finger strength.`,
  ]
  const seed = getDailySeed()
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash = hash & hash
  }
  return challenges[Math.abs(hash) % challenges.length]
})

function checkPracticed() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      isPracticed.value = data.date === getDailySeed() && data.practiced
    }
  } catch (e) {
    console.error('Failed to load chord of day status:', e)
  }
}

function markPracticed() {
  isPracticed.value = true
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: getDailySeed(),
      practiced: true,
      chord: dailyChord.value.name,
    }))
  } catch (e) {
    console.error('Failed to save chord of day status:', e)
  }
  gamification.addMasteryXP('chords', 15)
  gamification.addXP(15, 'Chord of the Day practiced!')
}

onMounted(() => {
  checkPracticed()
})
</script>

<style scoped>
.chord-of-the-day {
  padding: 24px;
  margin-bottom: 32px;
}

.cod-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.cod-title-section {
  flex: 1;
}

.cod-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.cod-title-section h3 {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 4px;
}

.cod-date {
  font-size: 13px;
  color: var(--text-secondary);
}

.cod-actions {
  flex-shrink: 0;
}

.practiced-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.1);
  color: var(--bg-success, #10b981);
  font-size: 13px;
  font-weight: 700;
}

.cod-content {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.cod-diagram {
  flex: 0 0 auto;
  min-width: 200px;
}

.cod-info {
  flex: 1;
  min-width: 200px;
}

.cod-description {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.cod-tips h4,
.cod-challenge h4 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cod-tips ul {
  padding-left: 18px;
  margin-bottom: 20px;
}

.cod-tips li {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  line-height: 1.5;
}

.cod-challenge {
  background: var(--bg-tertiary);
  padding: 16px;
  border-radius: var(--radius-lg);
}

.cod-challenge p {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .cod-content {
    flex-direction: column;
    align-items: center;
  }
  .cod-diagram {
    width: 100%;
    max-width: 280px;
  }
}
</style>
