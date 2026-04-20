<template>
  <div class="jam-mode-view">
    <PageHeader :subtitle="$t('jamMode.subtitle')">{{ $t('jamMode.title') }}</PageHeader>
    <JamMode />
  </div>
</template>

<script setup lang="ts">
import JamMode from '../components/JamMode.vue'
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.jam-mode-view {
  padding: 0 24px 48px;
}
</style>