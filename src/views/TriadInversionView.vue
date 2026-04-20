<template>
  <div class="triad-view">
    <PageHeader :subtitle="$t('triadInversion.subtitle')">{{ $t('triadInversion.title') }}</PageHeader>
    <TriadInversionExplorer />
  </div>
</template>

<script setup lang="ts">
import TriadInversionExplorer from '../components/TriadInversionExplorer.vue'
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.triad-view {
  padding: 0 24px 48px;
}
</style>