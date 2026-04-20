<template>
  <div class="speed-run-view">
    <PageHeader :subtitle="$t('speedRun.subtitle')">{{ $t('speedRun.title') }}</PageHeader>
    <SpeedRunMode />
  </div>
</template>

<script setup lang="ts">
import SpeedRunMode from '../components/SpeedRunMode.vue'
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.speed-run-view {
  padding: 0 24px 48px;
}
</style>