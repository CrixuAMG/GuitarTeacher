<template>
  <div class="technique-lottery-view">
    <PageHeader :subtitle="$t('techniqueLottery.subtitle')">{{ $t('techniqueLottery.title') }}</PageHeader>
    <TechniqueLottery />
  </div>
</template>

<script setup lang="ts">
import TechniqueLottery from '../components/TechniqueLottery.vue'
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.technique-lottery-view {
  padding: 0 24px 48px;
}
</style>