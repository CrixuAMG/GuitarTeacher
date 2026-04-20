<template>
  <div class="learn-view">
    <PageHeader :subtitle="$t('learnChords.subtitle')">{{ $t('learnChords.title') }}</PageHeader>

    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="tab-btn"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        {{ cat.label }}
        <span class="tab-count">{{ learnedCount(cat.key) }}/{{ getChordsByCategory(cat.key).length }}</span>
      </button>
    </div>

    <div class="category-description">
      {{ currentCategory.description }}
    </div>

    <div v-if="selectedChord" class="selected-chord-section">
      <ChordPlayer :key="selectedChord.name" :chord="selectedChord" />
      <div class="chord-nav">
        <button class="btn btn-secondary" :disabled="selectedIndex <= 0" @click="selectedIndex--">{{ $t('learnChords.previous') }}</button>
        <span class="chord-counter">{{ $t('learnChords.counter', { current: selectedIndex + 1, total: currentChords.length }) }}</span>
        <button class="btn btn-secondary" :disabled="selectedIndex >= currentChords.length - 1" @click="selectedIndex++">{{ $t('learnChords.next') }}</button>
      </div>
    </div>

    <div class="grid grid-4 chord-grid">
      <div
        v-for="(chord, i) in currentChords"
        :key="chord.name"
        class="chord-grid-item"
        :class="{ selected: selectedChord && selectedChord.name === chord.name }"
        @click="selectChord(i)"
      >
        <div class="mini-fretboard">
          <Fretboard :chord="chord" :max-frets="4" />
        </div>
        <div class="chord-grid-info">
          <div class="chord-grid-name">{{ chord.name }}</div>
          <div v-if="isChordLearned(chord.name)" class="learned-badge-sm">{{ $t('learnChords.learned') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ChordPlayer from '../components/ChordPlayer.vue'
import Fretboard from '../components/Fretboard.vue'
import PageHeader from '../components/PageHeader.vue'
import { CHORD_CATEGORIES, getChordsByCategory } from '../data/chords.js'
import { useStore } from '../stores/useStore'
import { useGamificationStore } from '../stores/gamificationStore.ts'

const { isChordLearned: checkLearned, markChordLearned } = useStore()
const gamification = useGamificationStore()

const categories = CHORD_CATEGORIES
const activeCategory = ref('basic')
const selectedIndex = ref(0)

const currentCategory = computed(() => categories.find(c => c.key === activeCategory.value))
const currentChords = computed(() => getChordsByCategory(activeCategory.value))
const selectedChord = computed(() => currentChords.value[selectedIndex.value] || null)

function selectChord(index) {
  selectedIndex.value = index
  
  // Mark chord as learned when selected (if not already learned)
  const chord = currentChords.value[index]
  if (chord && !checkLearned(chord.name)) {
    markChordLearned(chord.name)
    gamification.recordChordLearned(chord.name)
  }
}

function learnedCount(category) {
  return getChordsByCategory(category).filter(c => checkLearned(c.name)).length
}

function isChordLearned(name) {
  return checkLearned(name)
}
</script>

<style scoped>
.learn-view {
  padding: 0 24px 48px;
}
.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.tab-btn {
  padding: 10px 18px;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--transition);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.tab-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}
.tab-btn.active {
  background: var(--bg-highlight);
  color: #fff;
  border-color: var(--bg-highlight);
}
.tab-count {
  font-size: 11px;
  opacity: 0.8;
}
.category-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}
.selected-chord-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 24px;
  animation: fadeIn 0.2s ease;
}
.chord-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}
.chord-counter {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 600;
}
.chord-grid {
  margin-top: 16px;
}
.chord-grid-item {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 12px;
  cursor: pointer;
  transition: all var(--transition);
  text-align: center;
}
.chord-grid-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.chord-grid-item.selected {
  border-color: var(--bg-highlight);
  box-shadow: 0 0 0 3px var(--bg-highlight-light);
}
.chord-grid-info {
  margin-top: 8px;
}
.chord-grid-name {
  font-size: 18px;
  font-weight: 700;
}
.learned-badge-sm {
  font-size: 11px;
  color: var(--bg-success);
  font-weight: 600;
  margin-top: 2px;
}
.mini-fretboard {
  max-width: 160px;
  margin: 0 auto;
}
</style>