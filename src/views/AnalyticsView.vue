<template>
  <div class="analytics-view">
    <PageHeader :subtitle="$t('analytics.subtitle')">{{ $t('analytics.title') }}</PageHeader>

    <SessionAnalytics />

    <LessonProgress />

    <WeakPointAnalysis />

    <PracticeHeatmap />

    <SkillRadarChart />

    <ProgressCharts />
  </div>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import PracticeHeatmap from '../components/PracticeHeatmap.vue'
import SkillRadarChart from '../components/SkillRadarChart.vue'
import ProgressCharts from '../components/ProgressCharts.vue'
import LessonProgress from '../components/LessonProgress.vue'
import SessionAnalytics from '../components/SessionAnalytics.vue'
import WeakPointAnalysis from '../components/WeakPointAnalysis.vue'
</script>

<style scoped>
.analytics-view {
  padding: 0 24px 48px;
  max-width: 900px;
  margin: 0 auto;
}



.analytics-view > * {
  margin-bottom: 24px;
}

.analytics-view .card {
  background: var(--bg-card);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}
</style>
