<template>
  <nav class="navbar">
    <div class="nav-inner">
      <router-link to="/" class="nav-brand">
        <span class="brand-icon">🎸</span>
        <span class="brand-text">{{ $t('navBar.brand') }}</span>
        <span v-if="activeProfileName" class="profile-badge">{{ activeProfileName }}</span>
      </router-link>

      <!-- Desktop nav with groups -->
      <div class="nav-links desktop">
        <router-link to="/" class="nav-link" active-class="active">{{ $t('navBar.home') }}</router-link>

        <div
          v-for="group in navGroups"
          :key="group.labelKey"
          class="nav-group"
          @mouseenter="onGroupEnter(group.labelKey)"
          @mouseleave="onGroupLeave()"
        >
          <button
            class="nav-group-label"
            :class="{ active: isGroupActive(group) }"
            @click="openGroup = openGroup === group.labelKey ? null : group.labelKey"
            @keydown.escape="openGroup = null"
          >
            {{ $t(group.labelKey) }}
            <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div v-if="openGroup === group.labelKey" class="nav-dropdown">
            <router-link
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="dropdown-link"
              active-class="active"
            >
              <span class="dropdown-icon">{{ item.icon }}</span>
              <span class="dropdown-text">{{ $t(item.label) }}</span>
            </router-link>
          </div>
        </div>

        <router-link to="/analytics" class="nav-link" active-class="active">{{ $t('navBar.analytics') }}</router-link>

        <router-link to="/profile" class="nav-link profile-link" active-class="active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span class="profile-text">{{ $t('navBar.profile') }}</span>
        </router-link>
      </div>

      <div class="nav-actions">
        <div class="theme-selector" @mouseenter="themeOpen = true" @mouseleave="themeOpen = false">
          <button class="theme-toggle" :title="'Theme: ' + props.theme">
            <svg v-if="theme === 'light'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
          <div v-if="themeOpen" class="theme-dropdown">
            <button v-for="themeOption in themes" :key="themeOption.id" class="theme-dropdown-item" :class="{ active: props.theme === themeOption.id }" @click="$emit('set-theme', themeOption.id)">
              <span class="theme-swatch" :style="{ background: themeOption.preview }"></span>
              {{ themeOption.name }}
            </button>
          </div>
        </div>

        <button class="menu-toggle mobile" aria-label="Menu" @click="menuOpen = !menuOpen">
          <svg v-if="!menuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile dropdown -->
    <div v-if="menuOpen" class="mobile-menu">
      <div v-if="activeProfileName" class="mobile-profile-name">👤 {{ activeProfileName }}</div>
      <router-link to="/" class="mobile-link" active-class="active" @click="menuOpen = false">{{ $t('navBar.home') }}</router-link>

      <div v-for="group in navGroups" :key="group.labelKey" class="mobile-group">
        <button class="mobile-group-label" @click="toggleMobileGroup(group.labelKey)">
          {{ $t(group.labelKey) }}
          <svg class="chevron" :class="{ open: mobileOpenGroup === group.labelKey }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <div v-if="mobileOpenGroup === group.labelKey" class="mobile-group-items">
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="mobile-link nested"
            active-class="active"
            @click="menuOpen = false"
          >
            <span>{{ item.icon }}</span> {{ $t(item.label) }}
          </router-link>
        </div>
      </div>

      <router-link to="/analytics" class="mobile-link" active-class="active" @click="menuOpen = false">{{ $t('navBar.analytics') }}</router-link>
      <router-link to="/profile" class="mobile-link" active-class="active" @click="menuOpen = false">{{ $t('navBar.profile') }}</router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProfileStore, type AppTheme } from '../stores/profileStore.ts'
import { useProgressiveUnlock } from '../composables/useProgressiveUnlock.ts'

defineEmits(['toggle-theme', 'set-theme'])

const props = defineProps({
  theme: { type: String, default: 'light' }
})

const { t } = useI18n()

const themeOpen = ref(false)

const themes = computed<{ id: AppTheme; name: string; preview: string }[]>(() => [
  { id: 'light', name: t('navBar.themeLight'), preview: '#f8f9fa' },
  { id: 'dark', name: t('navBar.themeDark'), preview: '#1e2130' },
  { id: 'contrast', name: t('navBar.themeHighContrast'), preview: '#000000' },
  { id: 'ocean-deep', name: t('navBar.themeOceanDeep'), preview: '#0c2d48' },
  { id: 'forest-night', name: t('navBar.themeForestNight'), preview: '#0a1f0a' },
  { id: 'sunset-glow', name: t('navBar.themeSunsetGlow'), preview: '#2d1b0e' },
  { id: 'midnight-purple', name: t('navBar.themeMidnightPurple'), preview: '#1a0a2e' },
  { id: 'rosé', name: t('navBar.themeRose'), preview: '#2a1520' },
])

const route = useRoute()
const menuOpen = ref(false)
const openGroup = ref(null)
const mobileOpenGroup = ref(null)
const profileStore = useProfileStore()
const { visibleNavGroups } = useProgressiveUnlock()

watch(() => route.path, () => {
  openGroup.value = null
  menuOpen.value = false
  mobileOpenGroup.value = null
  themeOpen.value = false
})

let closeTimeout = null

function onGroupEnter(label) {
  if (closeTimeout) {
    clearTimeout(closeTimeout)
    closeTimeout = null
  }
  openGroup.value = label
}

function onGroupLeave() {
  closeTimeout = setTimeout(() => {
    openGroup.value = null
  }, 300)
}

const activeProfileName = computed(() => {
  const name = profileStore.activeProfile?.name
  return name && name !== 'Default' ? name : null
})

const navGroups = visibleNavGroups

function isGroupActive(group) {
  return group.items.some(item => route.path.startsWith(item.to))
}

function toggleMobileGroup(label) {
  mobileOpenGroup.value = mobileOpenGroup.value === label ? null : label
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  transition: background var(--transition), border-color var(--transition);
}
.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 18px;
}
.nav-brand:hover { text-decoration: none; }
.brand-icon { font-size: 24px; }
.profile-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--bg-highlight);
  color: white;
  margin-left: 4px;
}

/* Desktop nav */
.nav-links {
  display: flex;
  gap: 2px;
  align-items: center;
}
.nav-link {
  padding: 8px 14px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition);
  text-decoration: none;
}
.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
  text-decoration: none;
}
.nav-link.active {
  color: var(--bg-highlight);
  background: var(--bg-highlight-light);
  font-weight: 600;
}
.nav-link.profile-link {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Nav Groups */
.nav-group {
  position: relative;
}
.nav-group-label {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  transition: all var(--transition);
  font-family: inherit;
}
.nav-group-label:hover,
.nav-group-label.active {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}
.nav-group-label.active {
  color: var(--bg-highlight);
  background: var(--bg-highlight-light);
  font-weight: 600;
}
.chevron {
  transition: transform 0.2s;
}
.nav-group-label:hover .chevron {
  transform: rotate(180deg);
}

.nav-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 220px;
  max-height: 70vh;
  overflow-y: auto;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 6px;
  box-shadow: var(--shadow-lg);
  animation: dropdownIn 0.15s ease;
  z-index: 101;
}
.nav-dropdown::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  height: 8px;
}
@keyframes dropdownIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.dropdown-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s;
  white-space: nowrap;
}
.dropdown-link:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  text-decoration: none;
}
.dropdown-link.active {
  color: var(--bg-highlight);
  background: var(--bg-highlight-light);
  font-weight: 600;
}
.dropdown-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

/* Actions */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.theme-toggle {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition);
}
.theme-toggle:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}
.theme-selector {
  position: relative;
}
.theme-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 200;
  min-width: 180px;
  overflow: hidden;
}
.theme-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all var(--transition);
}
.theme-dropdown-item:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}
.theme-dropdown-item.active {
  color: var(--bg-highlight);
  font-weight: 600;
}
.theme-swatch {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  flex-shrink: 0;
}
.menu-toggle {
  width: 40px;
  height: 40px;
  display: none;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition);
}
.menu-toggle:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

/* Mobile menu */
.mobile-menu {
  display: none;
  flex-direction: column;
  padding: 8px 16px 16px;
  border-top: 1px solid var(--border-color);
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
  max-height: 70vh;
  overflow-y: auto;
}
.mobile-link {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: all var(--transition);
}
.mobile-link:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
  text-decoration: none;
}
.mobile-link.active {
  color: var(--bg-highlight);
  background: var(--bg-highlight-light);
  font-weight: 600;
}
.mobile-link.nested {
  padding-left: 36px;
  font-size: 14px;
}
.mobile-profile-name {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 4px;
}
.mobile-group {
  display: flex;
  flex-direction: column;
}
.mobile-group-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}
.mobile-group-label .chevron.open {
  transform: rotate(180deg);
}
.mobile-group-items {
  display: flex;
  flex-direction: column;
  animation: dropdownIn 0.15s ease;
}

@media (max-width: 860px) {
  .nav-inner { padding: 0 16px; }
  .nav-links.desktop { display: none; }
  .menu-toggle.mobile { display: flex; }
  .mobile-menu { display: flex; }
}

@media (max-width: 700px) {
  .nav-inner { padding: 0 12px; }
  .brand-text { display: none; }
}
</style>
