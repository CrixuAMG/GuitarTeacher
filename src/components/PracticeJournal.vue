<template>
  <div class="practice-journal">
    <div class="journal-header card">
      <h2>Practice Journal</h2>
      <p class="subtitle">Log your sessions and track your progress</p>
    </div>

    <!-- New Entry Form -->
    <div class="entry-form card">
      <h3>New Entry</h3>
      <div class="form-grid">
        <div class="form-field">
          <label>Date</label>
          <input v-model="newEntry.date" type="date" class="form-input" />
        </div>
        <div class="form-field">
          <label>Duration (min)</label>
          <input v-model.number="newEntry.duration" type="number" min="1" max="300" class="form-input" />
        </div>
        <div class="form-field">
          <label>Mood</label>
          <div class="mood-picker">
            <button
              v-for="m in MOODS"
              :key="m.emoji"
              class="mood-btn"
              :class="{ active: newEntry.mood === m.emoji }"
              :title="m.label"
              @click="newEntry.mood = m.emoji"
            >
              {{ m.emoji }}
            </button>
          </div>
        </div>
        <div class="form-field full">
          <label>Focus Areas</label>
          <div class="tag-picker">
            <button
              v-for="area in FOCUS_AREAS"
              :key="area"
              class="tag-btn"
              :class="{ active: newEntry.areas.includes(area) }"
              @click="toggleArea(area)"
            >
              {{ area }}
            </button>
          </div>
        </div>
        <div class="form-field full">
          <label>Notes</label>
          <textarea v-model="newEntry.notes" class="form-textarea" rows="3" placeholder="What did you practice? What went well? What needs work?"></textarea>
        </div>
      </div>
      <button class="save-btn" @click="saveEntry">Add Entry</button>
    </div>

    <!-- Entries List -->
    <div class="entries-list">
      <div v-if="entries.length === 0" class="empty-state card">
        <p>No journal entries yet. Log your first practice session above!</p>
      </div>
      <div
        v-for="entry in sortedEntries"
        :key="entry.id"
        class="entry-card card"
      >
        <div class="entry-header">
          <div class="entry-meta">
            <span class="entry-date">{{ formatDate(entry.date) }}</span>
            <span class="entry-duration">{{ entry.duration }} min</span>
            <span class="entry-mood">{{ entry.mood }}</span>
          </div>
          <button class="delete-btn" title="Delete" @click="deleteEntry(entry.id)">×</button>
        </div>
        <div v-if="entry.areas.length" class="entry-tags">
          <span v-for="area in entry.areas" :key="area" class="entry-tag">{{ area }}</span>
        </div>
        <p v-if="entry.notes" class="entry-notes">{{ entry.notes }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const JOURNAL_KEY = 'guitar-teacher-journal'

const MOODS = [
  { emoji: '😫', label: 'Frustrated' },
  { emoji: '😕', label: 'Struggling' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '🤩', label: 'Great' },
]

const FOCUS_AREAS = ['Chords', 'Scales', 'Strumming', 'Fingerpicking', 'Ear Training', 'Theory', 'Songs', 'Technique', 'Improvisation']

interface JournalEntry {
  id: string
  date: string
  duration: number
  mood: string
  areas: string[]
  notes: string
}

function loadEntries(): JournalEntry[] {
  try {
    const stored = localStorage.getItem(JOURNAL_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveEntries(data: JournalEntry[]) {
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(data))
}

const entries = ref<JournalEntry[]>(loadEntries())

const today = new Date().toISOString().split('T')[0]
const newEntry = ref<{
  date: string
  duration: number
  mood: string
  areas: string[]
  notes: string
}>({
  date: today,
  duration: 30,
  mood: '🙂',
  areas: [],
  notes: '',
})

const sortedEntries = computed(() => {
  return [...entries.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

function toggleArea(area: string) {
  const idx = newEntry.value.areas.indexOf(area)
  if (idx > -1) {
    newEntry.value.areas.splice(idx, 1)
  } else {
    newEntry.value.areas.push(area)
  }
}

function saveEntry() {
  if (!newEntry.value.date || newEntry.value.duration < 1) return
  const entry: JournalEntry = {
    id: crypto.randomUUID(),
    date: newEntry.value.date,
    duration: newEntry.value.duration,
    mood: newEntry.value.mood,
    areas: [...newEntry.value.areas],
    notes: newEntry.value.notes.trim(),
  }
  entries.value.push(entry)
  saveEntries(entries.value)
  // Reset form
  newEntry.value.date = today
  newEntry.value.duration = 30
  newEntry.value.mood = '🙂'
  newEntry.value.areas = []
  newEntry.value.notes = ''
}

function deleteEntry(id: string) {
  entries.value = entries.value.filter((e) => e.id !== id)
  saveEntries(entries.value)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.practice-journal {
  padding: 0 24px 48px;
  max-width: 700px;
  margin: 0 auto;
}

.journal-header {
  padding: 24px;
  margin-bottom: 24px;
}

.journal-header h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
}

/* Form */
.entry-form {
  padding: 24px;
  margin-bottom: 24px;
}

.entry-form h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.full {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input,
.form-textarea {
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--bg-highlight);
}

/* Mood picker */
.mood-picker {
  display: flex;
  gap: 8px;
}

.mood-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.mood-btn:hover {
  border-color: var(--bg-highlight);
}

.mood-btn.active {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

/* Tag picker */
.tag-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-btn {
  padding: 6px 12px;
  border-radius: 20px;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-btn:hover {
  border-color: var(--bg-highlight);
  color: var(--bg-highlight);
}

.tag-btn.active {
  background: var(--bg-highlight);
  border-color: var(--bg-highlight);
  color: white;
}

.save-btn {
  width: 100%;
  padding: 12px;
  border-radius: var(--radius-xl);
  border: none;
  background: var(--bg-highlight);
  color: white;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Entries */
.entries-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 15px;
}

.entry-card {
  padding: 16px;
}

.entry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.entry-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.entry-date {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.entry-duration {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--bg-highlight-light);
  color: var(--bg-highlight);
}

.entry-mood {
  font-size: 18px;
}

.delete-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: var(--bg-danger);
  color: white;
}

.entry-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.entry-tag {
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--bg-tertiary);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.entry-notes {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  white-space: pre-wrap;
}

@media (max-width: 600px) {
  .practice-journal {
    padding: 0 12px 32px;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .entry-meta {
    flex-wrap: wrap;
    gap: 6px;
  }
}
</style>
