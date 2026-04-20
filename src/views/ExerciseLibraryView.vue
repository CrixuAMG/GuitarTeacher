<template>
  <div class="exercise-library-view">
    <BackLink to="/practice" :label="$t('exerciseLibrary.backLabel')" />
    <PageHeader :subtitle="$t('exerciseLibrary.subtitle')">{{ $t('exerciseLibrary.title') }}</PageHeader>
    <ExerciseLibrary />
  </div>
</template>

<script setup lang="ts">
import BackLink from '../components/BackLink.vue'
import PageHeader from '../components/PageHeader.vue'
import ExerciseLibrary from '../components/ExerciseLibrary.vue'
</script>

<style scoped>
.exercise-library-view {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}
</style>