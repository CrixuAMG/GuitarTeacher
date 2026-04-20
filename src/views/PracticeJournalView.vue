<template>
  <div class="journal-view">
    <PageHeader :subtitle="$t('practiceJournal.subtitle')" compact>{{ $t('practiceJournal.title') }}</PageHeader>
    <PracticeJournal />
  </div>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import PracticeJournal from '../components/PracticeJournal.vue'
</script>

<style scoped>
.journal-view {
  padding: 0 24px 48px;
}

</style>
