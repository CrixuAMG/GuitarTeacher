import { ref, readonly, computed } from 'vue'
import { useProfileStore, type ThemeColor } from '../stores/profileStore'

const LEFT_HANDED_KEY = 'guitar-teacher-left-handed'

export type ThemeColorType = ThemeColor

export interface ThemeOption {
  id: ThemeColor
  name: string
  color: string
}

export const THEMES: ThemeOption[] = [
  { id: 'default', name: 'Default', color: '#4f46e5' },
  { id: 'ocean', name: 'Ocean', color: '#0891b2' },
  { id: 'forest', name: 'Forest', color: '#059669' },
  { id: 'sunset', name: 'Sunset', color: '#ea580c' },
  { id: 'midnight', name: 'Midnight', color: '#7c3aed' },
  { id: 'rose', name: 'Rose', color: '#e11d48' },
  { id: 'pink', name: 'Pink', color: '#ff6b9d' },
  { id: 'yellow', name: 'Yellow', color: '#eab308' },
]

const isLeftHanded = ref(false)

function loadSetting() {
  try {
    const stored = localStorage.getItem(LEFT_HANDED_KEY)
    if (stored !== null) {
      isLeftHanded.value = stored === 'true'
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
  }
}

function saveSetting() {
  try {
    localStorage.setItem(LEFT_HANDED_KEY, String(isLeftHanded.value))
  } catch (e) {
    console.error('Failed to save left-handed setting:', e)
  }
}

function toggleLeftHanded() {
  isLeftHanded.value = !isLeftHanded.value
  saveSetting()
}

function setLeftHanded(value: boolean) {
  isLeftHanded.value = value
  saveSetting()
}

function setThemeColor(color: ThemeColor) {
  const profileStore = useProfileStore()
  profileStore.setThemeColor(color)
}

loadSetting()

export function useSettings() {
  const profileStore = useProfileStore()
  const currentTheme = computed(() => profileStore.activeProfile?.themeColor || 'default')

  return {
    isLeftHanded: readonly(isLeftHanded),
    currentTheme,
    toggleLeftHanded,
    setLeftHanded,
    setTheme: setThemeColor,
    THEMES,
  }
}