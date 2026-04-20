<template>
  <div class="caged-view">
    <PageHeader :subtitle="$t('caged.subtitle')">{{ $t('caged.title') }}</PageHeader>
    <CAGEDVisualizer />
  </div>
</template>

<script setup lang="ts">
import CAGEDVisualizer from '../components/CAGEDVisualizer.vue'
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.caged-view {
  padding: 0 24px 48px;
}
</style>