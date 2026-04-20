<template>
  <div class="blind-mode-view">
    <PageHeader :subtitle="$t('blindMode.subtitle')">{{ $t('blindMode.title') }}</PageHeader>
    <BlindMode />
  </div>
</template>

<script setup lang="ts">
import BlindMode from '../components/BlindMode.vue'
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.blind-mode-view {
  padding: 0 24px 48px;
}
</style>