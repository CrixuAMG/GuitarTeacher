<template>
  <div class="tempo-tapper-view">
    <PageHeader :subtitle="$t('tempoTapper.subtitle')">{{ $t('tempoTapper.title') }}</PageHeader>
    <TempoTapper />
  </div>
</template>

<script setup lang="ts">
import TempoTapper from '../components/TempoTapper.vue'
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.tempo-tapper-view {
  padding: 0 24px 48px;
}
</style>