<template>
  <div class="transpose-view">
    <PageHeader :subtitle="$t('transposeTool.subtitle')">{{ $t('transposeTool.title') }}</PageHeader>
    <TransposeTool />
  </div>
</template>

<script setup lang="ts">
import TransposeTool from '../components/TransposeTool.vue'
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.transpose-view {
  padding: 0 24px 48px;
}
</style>