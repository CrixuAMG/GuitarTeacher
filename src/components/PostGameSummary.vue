<template>
  <div class="post-game-overlay">
    <div class="post-game-content card">
      <div class="results-header">
        <h2>Song Complete! 🎸</h2>
        <div class="star-rating">
          <span v-for="n in 5" :key="n" class="star" :class="{ earned: n <= stats.stars }">⭐</span>
        </div>
        <p class="rating-text">{{ ratingText }}</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ stats.score.toLocaleString() }}</span>
          <span class="stat-label">Final Score</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.maxCombo }}</span>
          <span class="stat-label">Max Combo</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.accuracy }}%</span>
          <span class="stat-label">Accuracy</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.perfect }}</span>
          <span class="stat-label">Perfect</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.good }}</span>
          <span class="stat-label">Good</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.misses }}</span>
          <span class="stat-label">Misses</span>
        </div>
      </div>

      <!-- Problem Notes Analysis -->
      <div v-if="problemNotes.length > 0" class="problem-notes-section">
        <h3>🎯 Notes to Practice</h3>
        <div class="problem-notes-grid">
          <div
            v-for="pn in problemNotes"
            :key="pn.label"
            class="problem-note-card"
          >
            <span class="problem-note-label">{{ pn.label }}</span>
            <span class="problem-note-count">{{ pn.count }}x missed</span>
            <span class="problem-note-advice">{{ pn.advice }}</span>
          </div>
        </div>
      </div>

      <!-- Tips Section -->
      <div class="tips-section">
        <h3>💡 Tips for Improvement</h3>
        <ul class="tips-list">
          <li v-for="(tip, index) in tips" :key="index" class="tip-item">
            <span class="tip-icon">{{ tip.icon }}</span>
            <span class="tip-text">{{ tip.message }}</span>
          </li>
        </ul>
      </div>

      <!-- XP Reward -->
      <div class="xp-reward">
        <span class="xp-label">XP Earned</span>
        <span class="xp-value">+{{ xpEarned }}</span>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button class="btn btn-primary btn-lg" @click="$emit('restart')">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Play Again
        </button>
        <button class="btn btn-secondary" @click="$emit('quit')">Back to Library</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface NoteEvent {
  id: string
  stringIndex: number
  fret: number
  time: number
  hit?: boolean
  missed?: boolean
}

interface GameStats {
  score: number
  maxCombo: number
  accuracy: number
  hits: number
  misses: number
  perfect: number
  good: number
  stars: number
  missedNotes: NoteEvent[]
}

interface Song {
  title: string
  artist: string
}

interface Tip {
  icon: string
  message: string
}

const props = defineProps<{
  stats: GameStats
  song: Song
}>()

defineEmits<{
  restart: []
  quit: []
}>()

const ratingText = computed(() => {
  if (props.stats.stars === 5) return 'Rock Star Performance! 🌟'
  if (props.stats.stars === 4) return 'Excellent Playing! 🎵'
  if (props.stats.stars === 3) return 'Good Job! Keep Practicing! 👍'
  if (props.stats.stars === 2) return 'Not Bad! Room for Improvement 💪'
  return 'Keep At It! Practice Makes Perfect 🎯'
})

const xpEarned = computed(() => {
  const baseXP = 50
  const accuracyBonus = Math.floor(props.stats.accuracy * 0.5)
  const comboBonus = Math.min(props.stats.maxCombo, 50)
  const starBonus = props.stats.stars * 20
  return baseXP + accuracyBonus + comboBonus + starBonus
})

const tips = computed((): Tip[] => {
  const tips: Tip[] = []

  // Accuracy-based tips
  if (props.stats.accuracy < 60) {
    tips.push({
      icon: '🎯',
      message: 'Focus on timing - try tapping your foot to the beat before playing',
    })
  }

  if (props.stats.misses > props.stats.hits * 0.3) {
    tips.push({
      icon: '👀',
      message: 'Watch the notes carefully - they appear before they reach the target line',
    })
  }

  // Combo-based tips
  if (props.stats.maxCombo < 10) {
    tips.push({
      icon: '🔗',
      message: 'Try to maintain your combo - consecutive hits give bonus points!',
    })
  }

  // Perfect hit tips
  if (props.stats.perfect < props.stats.good) {
    tips.push({
      icon: '✨',
      message: 'Aim for the center of the target line for Perfect hits (100 points)',
    })
  }

  // Positive reinforcement
  if (props.stats.stars >= 4) {
    tips.push({
      icon: '🚀',
      message: "You're doing great! Try increasing the difficulty for more challenge",
    })
  }

  // Audio input tip
  if (props.stats.misses > 5 && props.stats.accuracy < 50) {
    tips.push({
      icon: '🎤',
      message: 'Make sure your guitar is in tune and the microphone can hear you clearly',
    })
  }

  // General practice tip
  if (tips.length < 3) {
    tips.push({
      icon: '📚',
      message: 'Review the lesson before playing - understanding the chord progression helps!',
    })
  }

  return tips.slice(0, 4) // Max 4 tips
})

interface ProblemNote {
  label: string
  count: number
  advice: string
}

const problemNotes = computed((): ProblemNote[] => {
  const stringNames = ['Low E', 'A', 'D', 'G', 'B', 'High E']
  const fretNoteMap: Record<number, string[]> = {
    0: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    1: ['F2', 'A#2', 'D#3', 'G#3', 'C4', 'F4'],
    2: ['F#2', 'B2', 'E3', 'A3', 'C#4', 'F#4'],
    3: ['G2', 'C3', 'F3', 'A#3', 'D4', 'G4'],
    4: ['G#2', 'C#3', 'F#3', 'B3', 'D#4', 'G#4'],
    5: ['A2', 'D3', 'G3', 'C4', 'E4', 'A4'],
  }

  const noteCounts: Record<string, { count: number; stringIdx: number; fret: number }> = {}

  for (const note of props.stats.missedNotes) {
    const fret = note.fret ?? 0
    const noteName = fretNoteMap[fret]?.[note.stringIndex] ?? `${stringNames[note.stringIndex]} fret ${fret}`
    if (!noteCounts[noteName]) {
      noteCounts[noteName] = { count: 0, stringIdx: note.stringIndex, fret }
    }
    noteCounts[noteName].count++
  }

  const sorted = Object.entries(noteCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 4)

  const adviceMap: Record<number, string> = {
    0: 'Try anchoring your thumb on the back of the neck for better reach on low strings',
    1: 'Practice transitioning to the A string with slow, deliberate finger placement',
    2: 'Work on D string accuracy — keep your wrist relaxed and fingers curved',
    3: 'G string misses are common — focus on lighter finger pressure',
    4: 'B string requires precision — slow down and aim deliberately',
    5: 'High E is thin and sensitive — use just enough pressure without pressing too hard',
  }

  return sorted.map(([label, data]) => ({
    label,
    count: data.count,
    advice: adviceMap[data.stringIdx] ?? 'Practice this note slowly, then build up speed',
  }))
})
</script>

<style scoped>
.post-game-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.post-game-content {
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 40px;
}

.results-header {
  text-align: center;
  margin-bottom: 32px;
}

.results-header h2 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--bg-highlight), #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.star {
  font-size: 32px;
  opacity: 0.3;
  filter: grayscale(100%);
  transition: all 0.3s;
}

.star.earned {
  opacity: 1;
  filter: grayscale(0%);
  animation: starPop 0.5s ease;
}

@keyframes starPop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.rating-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-tertiary);
  padding: 16px;
  border-radius: var(--radius-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--bg-highlight);
}

.stat-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

/* Problem Notes Analysis */
.problem-notes-section {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 16px;
}

.problem-notes-section h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}

.problem-notes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.problem-note-card {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.problem-note-label {
  font-size: 16px;
  font-weight: 700;
  color: var(--bg-highlight);
}

.problem-note-count {
  font-size: 12px;
  color: #ef4444;
  font-weight: 600;
}

.problem-note-advice {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Tips Section */
.tips-section {
  background: linear-gradient(
    135deg,
    rgba(var(--primary-rgb), 0.1),
    rgba(var(--primary-rgb), 0.05)
  );
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 24px;
}

.tips-section h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.tip-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.tip-text {
  color: var(--text-secondary);
}

/* XP Reward */
.xp-reward {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
}

.xp-label {
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.xp-value {
  font-size: 28px;
  font-weight: 800;
  color: white;
}

/* Actions */
.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.actions .btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
}

.actions .btn-lg {
  font-size: 16px;
}

@media (max-width: 600px) {
  .post-game-content {
    padding: 24px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .results-header h2 {
    font-size: 24px;
  }
}
</style>
