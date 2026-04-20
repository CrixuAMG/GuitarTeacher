<template>
  <div class="strumming-practice-view">
    <BackLink to="/practice" :label="$t('strummingPractice.backLabel')" />
    <PageHeader>{{ $t('strummingPractice.title') }}</PageHeader>
    <StrummingTrainer />
  </div>
</template>

<script setup lang="ts">
import StrummingTrainer from '@/components/StrummingTrainer.vue'
import BackLink from '@/components/BackLink.vue'
import PageHeader from '@/components/PageHeader.vue'
</script>

<style scoped>
.strumming-practice-view {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}
</style>