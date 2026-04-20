<template>
  <div class="speed-trainer-view">
    <PageHeader :subtitle="$t('speedTrainer.subtitle')">{{ $t('speedTrainer.title') }}</PageHeader>
    <SpeedTrainer />
  </div>
</template>

<script setup lang="ts">
import SpeedTrainer from '../components/SpeedTrainer.vue'
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.speed-trainer-view {
  padding: 0 24px 48px;
}
</style>