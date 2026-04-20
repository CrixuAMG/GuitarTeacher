<template>
  <div class="chord-scale-view">
    <PageHeader :subtitle="$t('chordScaleMapper.subtitle')">{{ $t('chordScaleMapper.title') }}</PageHeader>
    <ChordScaleMapper />
  </div>
</template>

<script setup lang="ts">
import ChordScaleMapper from '../components/ChordScaleMapper.vue'
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.chord-scale-view {
  padding: 0 24px 48px;
}
</style>