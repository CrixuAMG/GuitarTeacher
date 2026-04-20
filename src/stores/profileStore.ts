import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setLocale, type LocaleCode } from '../i18n'

const PROFILES_KEY = 'guitar-teacher-profiles'
const ACTIVE_PROFILE_KEY = 'guitar-teacher-active-profile'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export type ThemeColor = 'default' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'rose' | 'pink' | 'yellow'
export type AppTheme = 'light' | 'dark' | 'contrast' | 'ocean-deep' | 'forest-night' | 'sunset-glow' | 'midnight-purple' | 'rosé'

export interface Profile {
  id: string
  name: string
  createdAt: number
  experienceLevel?: ExperienceLevel
  goals?: string[]
  onboarded?: boolean
  theme?: AppTheme
  themeColor?: ThemeColor
  language?: string
}

// Keys that are scoped per-profile (swapped when switching profiles)
const DATA_KEYS = [
  'guitar-gamification-v2',
  'guitar-teacher-progress',
  'guitar-teacher-chords',
  'guitar-teacher-goals',
  'guitar-teacher-left-handed',
  'guitar-teacher-auto-backup',
  'guitar-teacher-sessions',
  'guitar-teacher-journal',
  'guitar-teacher-repertoire',
  'guitar-teacher-setlists',
  'guitar-spaced-repetition',
  'guitar-unlocked-skills',
  'guitar-teacher-custom-lessons',
  'guitar-timer-stats',
  'guitar-exercise-progress',
  'guitar-completed-exercises',
  'guitar-daily-challenges',
  'guitar-chord-of-day',
]

// Prefix for dynamic keys that are per-profile (e.g. 'lesson-checklist-')
const DATA_KEY_PREFIXES = ['lesson-checklist-']

// Keys that are shared across all profiles (never swapped)
const SHARED_KEYS = ['guitar-teacher-songs']

export const useProfileStore = defineStore('profiles', () => {
  const profiles = ref<Profile[]>([])
  const activeProfileId = ref<string>('default')

  function loadProfiles() {
    try {
      const stored = localStorage.getItem(PROFILES_KEY)
      if (stored) {
        profiles.value = JSON.parse(stored)
        for (const p of profiles.value) {
          if (!p.experienceLevel) p.experienceLevel = 'beginner'
          if (!p.goals) p.goals = []
          if (p.onboarded === undefined) p.onboarded = false
          if (!p.theme) p.theme = 'light'
          if (!p.themeColor) p.themeColor = 'default'
          // migrate darkMode boolean to theme string
          if ((p as { darkMode?: boolean }).darkMode === true && p.theme === 'light') p.theme = 'dark'
          delete (p as { darkMode?: boolean }).darkMode
        }
      } else {
        // Initialize with default profile
        profiles.value = [{ id: 'default', name: 'Default', createdAt: Date.now(), experienceLevel: 'beginner', goals: [], onboarded: false, theme: 'light', themeColor: 'default', language: 'en' }]
        saveProfiles()
      }
      const active = localStorage.getItem(ACTIVE_PROFILE_KEY)
      if (active) {
        activeProfileId.value = active
      }
    } catch (e) {
      console.error('Failed to load profiles:', e)
    }
  }

  function saveProfiles() {
    try {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles.value))
      localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId.value)
    } catch (e) {
      console.error('Failed to save profiles:', e)
    }
  }

  const activeProfile = computed(() => {
    return profiles.value.find(p => p.id === activeProfileId.value) || profiles.value[0]
  })

  function getProfileDataKey(profileId: string): string {
    return `guitar-teacher-profile-data-${profileId}`
  }

  function getDynamicKeys(): string[] {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && DATA_KEY_PREFIXES.some(prefix => key.startsWith(prefix))) {
      keys.push(key)
    }
  }
  return keys
}

function exportCurrentData(): Record<string, unknown> {
    const data: Record<string, unknown> = {}
    const allKeys = [...DATA_KEYS, ...getDynamicKeys()]
    for (const key of allKeys) {
      try {
        const value = localStorage.getItem(key)
        if (value !== null) {
          data[key] = JSON.parse(value)
        }
      } catch {
        const value = localStorage.getItem(key)
        if (value !== null) data[key] = value
      }
    }

    // Also include shared data (songs) in the export for full backups
    for (const key of SHARED_KEYS) {
      try {
        const value = localStorage.getItem(key)
        if (value !== null) {
          data[key] = JSON.parse(value)
        }
      } catch {
        const value = localStorage.getItem(key)
        if (value !== null) data[key] = value
      }
    }

    return data
  }

  function importDataToCurrent(data: Record<string, unknown>) {
    // Clear all current profile data (static + dynamic keys)
    const allCurrentKeys = [...DATA_KEYS, ...getDynamicKeys()]
    for (const key of allCurrentKeys) {
      localStorage.removeItem(key)
    }

    // Import per-profile data from backup
    for (const key of [...DATA_KEYS, ...getDynamicKeys()]) {
      if (key in data) {
        try {
          localStorage.setItem(key, JSON.stringify(data[key]))
        } catch {
          localStorage.setItem(key, String(data[key]))
        }
      }
    }

    // Import shared data (songs) if present
    for (const key of SHARED_KEYS) {
      if (key in data) {
        try {
          localStorage.setItem(key, JSON.stringify(data[key]))
        } catch {
          localStorage.setItem(key, String(data[key]))
        }
      }
    }
  }

  function saveCurrentProfile() {
    const data: Record<string, unknown> = {}
    const allKeys = [...DATA_KEYS, ...getDynamicKeys()]
    for (const key of allKeys) {
      try {
        const value = localStorage.getItem(key)
        if (value !== null) {
          data[key] = JSON.parse(value)
        }
      } catch {
        const value = localStorage.getItem(key)
        if (value !== null) data[key] = value
      }
    }
    try {
      localStorage.setItem(getProfileDataKey(activeProfileId.value), JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save profile data:', e)
    }
  }

  function switchProfile(profileId: string): boolean {
    if (profileId === activeProfileId.value) return true

    // Save current data
    saveCurrentProfile()

    // Load new profile data
    try {
      const stored = localStorage.getItem(getProfileDataKey(profileId))
      if (stored) {
        const data = JSON.parse(stored)
        importDataToCurrent(data)
      } else {
        // New profile - clear per-profile data (keep shared data like songs)
        const dynamicKeys = getDynamicKeys()
        for (const key of [...DATA_KEYS, ...dynamicKeys]) {
          localStorage.removeItem(key)
        }
      }
      activeProfileId.value = profileId
      saveProfiles()
      return true
    } catch (e) {
      console.error('Failed to switch profile:', e)
      return false
    }
  }

  function createProfile(name: string): Profile {
    // Save current first
    saveCurrentProfile()

    const profile: Profile = {
      id: crypto.randomUUID(),
      name: name || 'New Profile',
      createdAt: Date.now(),
      experienceLevel: 'beginner',
      goals: [],
      onboarded: false,
    }
    profiles.value.push(profile)

    // Switch to new profile (clears per-profile data only, keeps shared data)
    const dynamicKeys = getDynamicKeys()
    for (const key of [...DATA_KEYS, ...dynamicKeys]) {
      localStorage.removeItem(key)
    }
    activeProfileId.value = profile.id
    saveProfiles()
    applyLanguage()

    return profile
  }

  function renameProfile(profileId: string, newName: string) {
    const profile = profiles.value.find(p => p.id === profileId)
    if (profile) {
      profile.name = newName || profile.name
      saveProfiles()
    }
  }

  function setExperienceLevel(level: ExperienceLevel) {
    const profile = profiles.value.find(p => p.id === activeProfileId.value)
    if (profile) {
      profile.experienceLevel = level
      saveProfiles()
    }
  }

  function setGoals(goals: string[]) {
    const profile = profiles.value.find(p => p.id === activeProfileId.value)
    if (profile) {
      profile.goals = goals
      saveProfiles()
    }
  }

  function setOnboarded(value: boolean) {
    const profile = profiles.value.find(p => p.id === activeProfileId.value)
    if (profile) {
      profile.onboarded = value
      saveProfiles()
    }
  }

  function deleteProfile(profileId: string): boolean {
    if (profiles.value.length <= 1) return false
    const index = profiles.value.findIndex(p => p.id === profileId)
    if (index === -1) return false

    // Remove profile data
    localStorage.removeItem(getProfileDataKey(profileId))

    // Remove from list
    profiles.value.splice(index, 1)

    // If we deleted the active profile, switch to the first one
    if (activeProfileId.value === profileId) {
      switchProfile(profiles.value[0].id)
    } else {
      saveProfiles()
    }
    return true
  }

  function setTheme(theme: AppTheme) {
    const profile = profiles.value.find(p => p.id === activeProfileId.value)
    if (profile) {
      profile.theme = theme
      saveProfiles()
      applyTheme()
    }
  }

  function setThemeColor(color: ThemeColor) {
    const profile = profiles.value.find(p => p.id === activeProfileId.value)
    if (profile) {
      profile.themeColor = color
      saveProfiles()
      applyTheme()
    }
  }

  function setLanguage(lang: LocaleCode) {
    const profile = profiles.value.find(p => p.id === activeProfileId.value)
    if (profile) {
      profile.language = lang
      saveProfiles()
      applyLanguage()
    }
  }

  function applyTheme() {
    const profile = activeProfile.value
    const theme = profile?.theme || 'light'
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-theme-color', profile?.themeColor || 'default')
  }

  function applyLanguage() {
    const profile = activeProfile.value
    const lang = (profile?.language || 'en') as LocaleCode
    setLocale(lang)
  }

  loadProfiles()
  applyTheme()
  applyLanguage()

  return {
    profiles,
    activeProfileId,
    activeProfile,
    createProfile,
    renameProfile,
    deleteProfile,
    switchProfile,
    saveCurrentProfile,
    setExperienceLevel,
    setGoals,
    setOnboarded,
    setTheme,
    setThemeColor,
    setLanguage,
    exportCurrentData,
    importDataToCurrent,
  }
})
