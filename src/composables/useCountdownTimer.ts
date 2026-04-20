import { ref, computed, onUnmounted } from 'vue'

export function useCountdownTimer(duration: number = 0, onComplete?: () => void) {
  const timeRemaining = ref(duration)
  const timeElapsed = ref(0)
  const isRunning = ref(false)
  let intervalId: ReturnType<typeof setInterval> | null = null

  const progress = computed(() => {
    if (duration === 0) return 0
    const elapsed = duration - timeRemaining.value
    return Math.min(100, Math.round((elapsed / duration) * 100))
  })

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function start() {
    if (isRunning.value) return
    isRunning.value = true
    intervalId = setInterval(() => {
      timeElapsed.value++
      if (duration > 0) {
        if (timeRemaining.value > 0) {
          timeRemaining.value--
        } else {
          stop()
          onComplete?.()
        }
      }
    }, 1000)
  }

  function stop() {
    isRunning.value = false
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function toggle() {
    if (isRunning.value) {
      stop()
    } else {
      start()
    }
  }

  function reset(newDuration?: number) {
    stop()
    if (newDuration !== undefined) {
      timeRemaining.value = newDuration
    } else {
      timeRemaining.value = duration
    }
    timeElapsed.value = 0
  }

  onUnmounted(() => stop())

  return {
    timeRemaining,
    timeElapsed,
    isRunning,
    progress,
    start,
    stop,
    toggle,
    reset,
    formatTime,
  }
}