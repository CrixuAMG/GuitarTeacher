import { ref, computed } from 'vue'
import type { NoteEvent, HitResult } from '@/types'

export function useNoteScoring() {
  const score = ref(0)
  const combo = ref(0)
  const maxCombo = ref(0)
  const hits = ref(0)
  const misses = ref(0)
  const perfect = ref(0)
  const good = ref(0)
  const early = ref(0)
  const late = ref(0)
  const hitHistory = ref<HitResult[]>([])

  const accuracy = computed(() => {
    const total = hits.value + misses.value
    if (total === 0) return 100
    return Math.round((hits.value / total) * 100)
  })

  const calculateHitQuality = (timeDiff: number): HitResult['quality'] => {
    const absDiff = Math.abs(timeDiff)
    if (absDiff <= 50) return 'perfect'
    if (absDiff <= 100) return 'good'
    if (timeDiff < 0) return 'early'
    return 'late'
  }

  const calculateScore = (quality: HitResult['quality'], combo: number): number => {
    const baseScores: Record<HitResult['quality'], number> = {
      perfect: 100,
      good: 50,
      early: 25,
      late: 25,
      miss: 0,
    }

    const comboMultiplier = 1 + combo * 0.1
    return Math.floor(baseScores[quality] * comboMultiplier)
  }

  const recordHit = (note: NoteEvent, timeDiff: number): HitResult => {
    const quality = calculateHitQuality(timeDiff)

    if (quality === 'perfect' || quality === 'good') {
      combo.value++
      if (combo.value > maxCombo.value) {
        maxCombo.value = combo.value
      }
      hits.value++

      if (quality === 'perfect') perfect.value++
      else good.value++
    } else {
      combo.value = 0
      hits.value++

      if (quality === 'early') early.value++
      else late.value++
    }

    const points = calculateScore(quality, combo.value)
    score.value += points

    const result: HitResult = {
      noteId: note.id,
      quality,
      timeDiff,
      points,
      timestamp: Date.now(),
    }

    hitHistory.value.push(result)
    return result
  }

  const recordMiss = (note: NoteEvent): HitResult => {
    combo.value = 0
    misses.value++

    const result: HitResult = {
      noteId: note.id,
      quality: 'miss',
      timeDiff: Infinity,
      points: 0,
      timestamp: Date.now(),
    }

    hitHistory.value.push(result)
    return result
  }

  const reset = () => {
    score.value = 0
    combo.value = 0
    maxCombo.value = 0
    hits.value = 0
    misses.value = 0
    perfect.value = 0
    good.value = 0
    early.value = 0
    late.value = 0
    hitHistory.value = []
  }

  const getStarRating = (): number => {
    if (accuracy.value >= 95 && perfect.value > hits.value * 0.8) return 5
    if (accuracy.value >= 90) return 4
    if (accuracy.value >= 80) return 3
    if (accuracy.value >= 60) return 2
    return 1
  }

  return {
    // State
    score,
    combo,
    maxCombo,
    hits,
    misses,
    perfect,
    good,
    early,
    late,
    hitHistory,

    // Computed
    accuracy,

    // Actions
    recordHit,
    recordMiss,
    reset,
    getStarRating,
    calculateHitQuality,
  }
}
