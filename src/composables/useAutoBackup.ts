import { ref, readonly } from 'vue'

const AUTO_BACKUP_KEY = 'guitar-teacher-auto-backup'

interface AutoBackupSettings {
  enabled: boolean
  intervalDays: number
  lastBackupDate: string | null
}

const defaultSettings: AutoBackupSettings = {
  enabled: false,
  intervalDays: 7,
  lastBackupDate: null,
}

const settings = ref<AutoBackupSettings>({ ...defaultSettings })

function loadSettings() {
  try {
    const stored = localStorage.getItem(AUTO_BACKUP_KEY)
    if (stored) {
      settings.value = { ...defaultSettings, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('Failed to load auto-backup settings:', e)
  }
}

function saveSettings() {
  try {
    localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(settings.value))
  } catch (e) {
    console.error('Failed to save auto-backup settings:', e)
  }
}

function setEnabled(value: boolean) {
  settings.value.enabled = value
  saveSettings()
}

function setIntervalDays(days: number) {
  settings.value.intervalDays = Math.max(1, Math.min(30, days))
  saveSettings()
}

function isBackupDue(): boolean {
  if (!settings.value.enabled) return false
  if (!settings.value.lastBackupDate) return true
  const last = new Date(settings.value.lastBackupDate)
  const now = new Date()
  const diffMs = now.getTime() - last.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= settings.value.intervalDays
}

function exportAllData(): string {
  const data: Record<string, unknown> = {
    exportVersion: 3,
    exportDate: new Date().toISOString(),
    app: 'guitar-teacher',
  }

  // Per-profile keys
const perProfileKeys = [
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

  // Shared keys (not per-profile)
  const sharedKeys = ['guitar-teacher-songs']

  // Dynamic key prefixes (e.g. lesson-checklist-*)
  const dynamicPrefixes = ['lesson-checklist-']

  const allKeys = [...perProfileKeys, ...sharedKeys]

  // Add dynamic keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && dynamicPrefixes.some(prefix => key.startsWith(prefix))) {
      if (!allKeys.includes(key)) allKeys.push(key)
    }
  }

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

  return JSON.stringify(data, null, 2)
}

function triggerBackup(): boolean {
  try {
    const data = exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guitar-teacher-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    settings.value.lastBackupDate = new Date().toISOString()
    saveSettings()
    return true
  } catch (e) {
    console.error('Auto-backup failed:', e)
    return false
  }
}

const backupPromptShown = ref(false)

function checkAndRunBackup(): boolean {
  if (isBackupDue() && !backupPromptShown.value) {
    backupPromptShown.value = true
  }
  return false
}

function dismissBackupPrompt() {
  backupPromptShown.value = false
  settings.value.lastBackupDate = new Date().toISOString()
  saveSettings()
}

loadSettings()

export function useAutoBackup() {
  return {
    settings: readonly(settings),
    isBackupDue,
    triggerBackup,
    checkAndRunBackup,
    dismissBackupPrompt,
    backupPromptShown,
    setEnabled,
    setIntervalDays,
    exportAllData,
  }
}
