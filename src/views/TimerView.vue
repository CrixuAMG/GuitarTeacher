<template>
  <div class="timer-view">
    <BackLink to="/practice" :label="$t('timer.backLabel')" />
    <PageHeader>{{ $t('timer.title') }}</PageHeader>

    <PracticeTimer />
  </div>
</template>

<script setup lang="ts">
import PracticeTimer from '@/components/PracticeTimer.vue'
import BackLink from '../components/BackLink.vue'
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.timer-view {
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}
</style>
