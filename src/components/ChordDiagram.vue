<template>
  <div class="chord-card card" :class="{ 'is-highlighted': highlighted, 'is-learned': learned }" @click="$emit('play')">
    <div class="chord-name">{{ chord.name }}</div>
    <div class="chord-full-name">{{ chord.fullName }}</div>
    <Fretboard :chord="chord" />
    <div class="chord-actions">
      <span class="badge" :class="'badge-' + category">{{ category }}</span>
      <button v-if="showPlay" class="btn btn-sm btn-primary play-btn" @click.stop="$emit('play')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Play
      </button>
      <button v-if="!learned" class="btn btn-sm btn-secondary learn-btn" @click.stop="$emit('learn')">
        Mark Learned
      </button>
      <span v-else class="learned-badge">Learned</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import Fretboard from './Fretboard.vue'

defineProps({
  chord: { type: Object, required: true },
  category: { type: String, default: 'basic' },
  highlighted: { type: Boolean, default: false },
  learned: { type: Boolean, default: false },
  showPlay: { type: Boolean, default: true }
})

defineEmits(['play', 'learn'])
</script>

<style scoped>
.chord-card {
  cursor: pointer;
  transition: all var(--transition);
  animation: fadeIn 0.3s ease;
}
.chord-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.chord-card.is-highlighted {
  border-color: var(--bg-highlight);
  box-shadow: 0 0 0 3px var(--bg-highlight-light), var(--shadow-md);
}
.chord-card.is-learned {
  border-color: var(--bg-success);
}
.chord-name {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1;
}
.chord-full-name {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}
.chord-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.play-btn {
  padding: 5px 12px;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.learned-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--bg-success);
  padding: 4px 10px;
  border-radius: 20px;
  background: var(--bg-tertiary);
}
</style>