<template>
  <div class="setlist-view">
    <PageHeader :subtitle="$t('setlistBuilder.subtitle')">{{ $t('setlistBuilder.title') }}</PageHeader>
    <SetlistBuilder />
  </div>
</template>

<script setup lang="ts">
import SetlistBuilder from '../components/SetlistBuilder.vue'
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.setlist-view {
  padding: 0 24px 48px;
}
</style>