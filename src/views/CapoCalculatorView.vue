<template>
  <div class="capo-view">
    <PageHeader :subtitle="$t('capoCalculator.subtitle')">{{ $t('capoCalculator.title') }}</PageHeader>
    <CapoCalculator />
  </div>
</template>

<script setup lang="ts">
import CapoCalculator from '../components/CapoCalculator.vue'
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.capo-view {
  padding: 0 24px 48px;
}
</style>