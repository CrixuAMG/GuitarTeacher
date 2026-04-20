<template>
  <div class="nashville-view">
    <PageHeader :subtitle="$t('nashvilleNumber.subtitle')">{{ $t('nashvilleNumber.title') }}</PageHeader>
    <NashvilleNumberTrainer />
  </div>
</template>

<script setup lang="ts">
import NashvilleNumberTrainer from '../components/NashvilleNumberTrainer.vue'
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.nashville-view {
  padding: 0 24px 48px;
}
</style>