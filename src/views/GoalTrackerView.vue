<template>
  <div class="goal-tracker-view">
    <PageHeader :subtitle="$t('goalTracker.subtitle')" compact>{{ $t('goalTracker.title') }}</PageHeader>
    <GoalTracker />
  </div>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import GoalTracker from '../components/GoalTracker.vue'
</script>

<style scoped>
.goal-tracker-view {
  padding: 0 24px 48px;
}

</style>
