<template>
  <div class="app">
    <NavBar :theme="currentTheme" @toggle-theme="toggle" @set-theme="setTheme" />
    <main class="main-content">
      <router-view />
    </main>
    <XPToast />
    <SessionTimer />
    <div v-if="showBackupPrompt" class="backup-prompt">
      <div class="backup-prompt-card card">
        <h3>{{ $t('app.backupReminder') }}</h3>
        <p>{{ $t('app.backupPrompt') }}</p>
        <div class="backup-prompt-actions">
          <button class="btn btn-primary" @click="doBackup">{{ $t('app.backupNow') }}</button>
          <button class="btn btn-secondary" @click="dismissBackup">{{ $t('app.remindLater') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from './composables/useTheme.ts'
import { useAutoBackup } from './composables/useAutoBackup.ts'
import { useProfileStore } from './stores/profileStore.ts'
import NavBar from './components/NavBar.vue'
import XPToast from './components/XPToast.vue'
import SessionTimer from './components/SessionTimer.vue'

const { currentTheme, setTheme, toggle } = useTheme()
const autoBackup = useAutoBackup()
const profileStore = useProfileStore()
const router = useRouter()

const showBackupPrompt = computed(() => autoBackup.backupPromptShown.value)

function doBackup() {
  autoBackup.triggerBackup()
  autoBackup.dismissBackupPrompt()
}

function dismissBackup() {
  autoBackup.dismissBackupPrompt()
}

onMounted(() => {
  setTimeout(() => {
    autoBackup.checkAndRunBackup()
  }, 2000)

  const activeProfile = profileStore.activeProfile
  const needsOnboarding = !activeProfile?.onboarded
  if (needsOnboarding && router.currentRoute.value.path !== '/onboarding') {
    router.replace('/onboarding')
  }
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex: 1;
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.backup-prompt {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.backup-prompt-card {
  max-width: 400px;
  text-align: center;
  padding: 32px;
}

.backup-prompt-card h3 {
  margin-bottom: 8px;
}

.backup-prompt-card p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.backup-prompt-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
