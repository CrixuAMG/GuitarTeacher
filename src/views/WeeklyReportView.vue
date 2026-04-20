<template>
  <div class="weekly-view">
    <PageHeader :subtitle="$t('weeklyReport.subtitle')" compact>{{ $t('weeklyReport.title') }}</PageHeader>
    <WeeklyReport />
  </div>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import WeeklyReport from '../components/WeeklyReport.vue'
</script>

<style scoped>
.weekly-view {
  padding: 0 24px 48px;
}

</style>
