import { computed } from 'vue'
import { useProfileStore, type AppTheme } from '../stores/profileStore'

export function useTheme() {
  const profileStore = useProfileStore()
  const currentTheme = computed<AppTheme>(() => profileStore.activeProfile?.theme || 'light')

  function setTheme(theme: AppTheme) {
    profileStore.setTheme(theme)
  }

  function toggle() {
    const themes: AppTheme[] = ['light', 'dark', 'contrast']
    const idx = themes.indexOf(currentTheme.value)
    const next = themes[(idx >= 0 ? idx + 1 : 0) % themes.length]
    setTheme(next)
  }

  return { currentTheme, setTheme, toggle }
}