<template>
  <div class="lesson-creator-view">
    <PageHeader subtitle="Build your own guitar lessons and practice routines.">Lesson Creator</PageHeader>

    <!-- Create Form -->
    <div class="creator-form card">
      <h3>{{ editingId ? 'Edit Lesson' : 'New Lesson' }}</h3>

      <div class="form-group">
        <label>Title</label>
        <input v-model="form.title" type="text" placeholder="e.g., My Fingerpicking Routine" />
      </div>

      <div class="form-group">
        <label>Category</label>
        <select v-model="form.category">
          <option value="technique">Technique</option>
          <option value="theory">Theory</option>
          <option value="song">Song Study</option>
          <option value="exercise">Exercise</option>
          <option value="warmup">Warm-up</option>
        </select>
      </div>

      <div class="form-group">
        <label>Content (Markdown supported)</label>
        <textarea
          v-model="form.content"
          rows="10"
          placeholder="Write your lesson content here..."
        ></textarea>
      </div>

      <div class="form-group">
        <label>Duration estimate</label>
        <input v-model="form.duration" type="text" placeholder="e.g., 15 min" />
      </div>

      <div class="form-actions">
        <button class="btn btn-primary" :disabled="!form.title || !form.content" @click="saveLesson">
          {{ editingId ? 'Update Lesson' : 'Save Lesson' }}
        </button>
        <button v-if="editingId" class="btn btn-secondary" @click="cancelEdit">Cancel</button>
      </div>
    </div>

    <!-- Lesson List -->
    <div class="my-lessons">
      <h2>My Lessons</h2>

      <div v-if="lessons.length === 0" class="empty-state card">
        <div class="empty-icon">📚</div>
        <p>No custom lessons yet. Create your first one above!</p>
      </div>

      <div v-else class="lessons-list">
        <div v-for="lesson in lessons" :key="lesson.id" class="lesson-card card">
          <div class="lesson-info">
            <div class="lesson-title">{{ lesson.title }}</div>
            <div class="lesson-meta">
              <span class="lesson-category">{{ lesson.category }}</span>
              <span v-if="lesson.duration" class="lesson-duration">{{ lesson.duration }}</span>
              <span class="lesson-date">{{ formatDate(lesson.createdAt) }}</span>
            </div>
          </div>
          <div class="lesson-actions">
            <button class="btn-icon" title="View" @click="viewLesson(lesson)">👁</button>
            <button class="btn-icon" title="Edit" @click="editLesson(lesson)">✏</button>
            <button class="btn-icon btn-delete" title="Delete" @click="deleteLesson(lesson.id)">🗑</button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <div v-if="viewingLesson" class="modal-overlay" @click.self="viewingLesson = null">
      <div class="modal-content card">
        <h2>{{ viewingLesson.title }}</h2>
        <div class="modal-meta">
          <span>{{ viewingLesson.category }}</span>
          <span v-if="viewingLesson.duration">{{ viewingLesson.duration }}</span>
        </div>
        <div class="lesson-content">
          <pre>{{ viewingLesson.content }}</pre>
        </div>
        <button class="btn btn-secondary" @click="viewingLesson = null">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '../components/PageHeader.vue'

const STORAGE_KEY = 'guitar-teacher-custom-lessons'

const lessons = ref([])
const editingId = ref(null)
const viewingLesson = ref(null)

const form = ref({
  title: '',
  category: 'technique',
  content: '',
  duration: ''
})

function loadLessons() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      lessons.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load custom lessons:', e)
  }
}

function saveLessons() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons.value))
}

function saveLesson() {
  if (!form.value.title.trim() || !form.value.content.trim()) return

  if (editingId.value) {
    const index = lessons.value.findIndex(l => l.id === editingId.value)
    if (index > -1) {
      lessons.value[index] = {
        ...lessons.value[index],
        ...form.value,
        updatedAt: new Date().toISOString()
      }
    }
  } else {
    lessons.value.unshift({
      id: crypto.randomUUID(),
      ...form.value,
      createdAt: new Date().toISOString()
    })
  }

  saveLessons()
  resetForm()
}

function editLesson(lesson) {
  editingId.value = lesson.id
  form.value = {
    title: lesson.title,
    category: lesson.category,
    content: lesson.content,
    duration: lesson.duration || ''
  }
}

function cancelEdit() {
  resetForm()
}

function deleteLesson(id) {
  if (!confirm('Delete this lesson?')) return
  lessons.value = lessons.value.filter(l => l.id !== id)
  saveLessons()
}

function viewLesson(lesson) {
  viewingLesson.value = lesson
}

function resetForm() {
  editingId.value = null
  form.value = {
    title: '',
    category: 'technique',
    content: '',
    duration: ''
  }
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString()
}

onMounted(loadLessons)
</script>

<style scoped>
.lesson-creator-view {
  padding: 0 24px 48px;
  max-width: 900px;
  margin: 0 auto;
}



.creator-form {
  padding: 24px;
  margin-bottom: 32px;
}

.creator-form h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text-secondary);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.my-lessons h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lesson-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  gap: 16px;
}

.lesson-info {
  flex: 1;
  min-width: 0;
}

.lesson-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 4px;
}

.lesson-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.lesson-category {
  text-transform: capitalize;
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: 6px;
}

.lesson-actions {
  display: flex;
  gap: 6px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: var(--bg-tertiary);
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: var(--bg-card-hover);
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
}

.modal-content h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}

.modal-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.lesson-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background: var(--bg-secondary);
  padding: 16px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  font-family: inherit;
  margin-bottom: 16px;
}

.btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--bg-highlight);
  color: white;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

@media (max-width: 600px) {
  .lesson-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .lesson-actions {
    align-self: flex-end;
  }
}
</style>
