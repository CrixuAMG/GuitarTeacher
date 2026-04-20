<template>
  <div class="circle-of-fifths-view">
    <PageHeader :subtitle="$t('circleOfFifths.subtitle')" compact>{{ $t('circleOfFifths.title') }}</PageHeader>
    <CircleOfFifths />
  </div>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import CircleOfFifths from '../components/CircleOfFifths.vue'
</script>

<style scoped>
.circle-of-fifths-view {
  padding: 0 24px 48px;
}

</style>
