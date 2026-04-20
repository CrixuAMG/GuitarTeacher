<template>
  <router-link v-if="to" :to="to" class="back-link">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
    {{ label || $t('backLink.defaultLabel') }}
  </router-link>
  <div v-else class="back-link" @click="goBack">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
    {{ label || $t('backLink.defaultLabel') }}
  </div>
</template>

<script setup lang="ts">
import { useRouter, type RouteLocationRaw } from 'vue-router'

withDefaults(defineProps<{
  to?: RouteLocationRaw
  label?: string
}>(), {
  to: undefined,
  label: '',
})

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--bg-highlight);
}
</style>