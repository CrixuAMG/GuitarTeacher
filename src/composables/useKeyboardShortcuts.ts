import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

interface ShortcutOptions {
  onPlayPause?: () => void
  onEscape?: () => void
}

export function useKeyboardShortcuts(options: ShortcutOptions = {}) {
  const router = useRouter()

  function handleKeyDown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault()
      options.onPlayPause?.()
    }

    if (e.code === 'Escape') {
      e.preventDefault()
      if (options.onEscape) {
        options.onEscape()
      } else {
        router.back()
      }
    }
  }

  onMounted(() => window.addEventListener('keydown', handleKeyDown))
  onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
}