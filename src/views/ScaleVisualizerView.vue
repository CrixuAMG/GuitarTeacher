<template>
  <div class="scale-visualizer-view">
    <PageHeader :subtitle="$t('scaleVisualizer.subtitle')" compact>{{ $t('scaleVisualizer.title') }}</PageHeader>
    <ScaleVisualizer />
  </div>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import ScaleVisualizer from '../components/ScaleVisualizer.vue'
</script>

<style scoped>
.scale-visualizer-view {
  padding: 0 24px 48px;
}

</style>
