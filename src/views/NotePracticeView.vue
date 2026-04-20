<template>
  <div class="note-practice-view">
    <BackLink to="/practice" :label="$t('notePractice.backLabel')" />
    <PageHeader compact>{{ $t('notePractice.title') }}</PageHeader>
    <NoteTrainer />
  </div>
</template>

<script setup lang="ts">
import NoteTrainer from '@/components/NoteTrainer.vue'
import BackLink from '@/components/BackLink.vue'
import PageHeader from '@/components/PageHeader.vue'
</script>

<style scoped>
.note-practice-view {
  padding: 24px;
  max-width: 100%;
}
</style>