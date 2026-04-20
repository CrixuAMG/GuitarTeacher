<template>
  <div class="repertoire-view">
    <PageHeader :subtitle="$t('repertoire.subtitle')">{{ $t('repertoire.title') }}</PageHeader>
    <RepertoireManager />
  </div>
</template>

<script setup lang="ts">
import RepertoireManager from '../components/RepertoireManager.vue'
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.repertoire-view {
  padding: 0 24px 48px;
}
</style>