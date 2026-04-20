<template>
  <div class="voicing-view">
    <PageHeader :subtitle="$t('chordVoicingExplorer.subtitle')">{{ $t('chordVoicingExplorer.title') }}</PageHeader>
    <ChordVoicingExplorer />
  </div>
</template>

<script setup lang="ts">
import ChordVoicingExplorer from '../components/ChordVoicingExplorer.vue'
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.voicing-view {
  padding: 0 24px 48px;
}
</style>