<template>
  <div class="page-header" :class="{ compact, 'has-actions': $slots.actions }">
    <div class="page-header-text">
      <h1><slot /></h1>
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
    </div>
    <slot name="actions" />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  subtitle?: string
  compact?: boolean
}>(), {
  subtitle: '',
  compact: false,
})
</script>

<style scoped>
.page-header {
  margin-bottom: 32px;
}

.page-header.compact {
  margin-bottom: 24px;
}

.page-header.has-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
}

.page-header.compact h1 {
  font-size: 28px;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 16px;
}
</style>