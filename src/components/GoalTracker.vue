<template>
  <div class="goal-tracker">
    <div class="goal-header">
      <h2>Your Goals</h2>
      <button class="btn btn-primary btn-sm" @click="showCreateModal = true">
        + New Goal
      </button>
    </div>

    <!-- Active Goals -->
    <div v-if="activeGoals.length > 0" class="goals-list">
      <div
        v-for="goal in activeGoals"
        :key="goal.id"
        class="goal-card card"
        :class="{ 'near-complete': goal.current / goal.target >= 0.8 }"
      >
        <div class="goal-info">
          <div class="goal-title">{{ goal.title }}</div>
          <div class="goal-meta">
            <span class="goal-type-badge">{{ formatType(goal.type) }}</span>
            <span v-if="goal.deadline" class="goal-deadline">
              Due {{ formatDate(goal.deadline) }}
            </span>
          </div>
        </div>
        <div class="goal-progress">
          <div class="progress-header">
            <span class="progress-current">{{ goal.current }}</span>
            <span class="progress-target">/ {{ goal.target }} {{ goal.unit }}</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-bar-fill"
              :style="{ width: Math.min(100, (goal.current / goal.target) * 100) + '%' }"
            ></div>
          </div>
        </div>
        <div class="goal-actions">
          <button class="btn-icon" title="Delete goal" @click="deleteGoal(goal.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🎯</div>
      <p>No active goals. Create one to stay motivated!</p>
    </div>

    <!-- Completed Goals -->
    <div v-if="completedGoals.length > 0" class="completed-section">
      <h3>Completed</h3>
      <div class="goals-list completed">
        <div
          v-for="goal in completedGoals.slice(0, 5)"
          :key="goal.id"
          class="goal-card card completed"
        >
          <div class="goal-info">
            <div class="goal-title">{{ goal.title }}</div>
            <div class="goal-meta">
              <span class="goal-completed">Completed {{ formatDateRelative(goal.completedAt) }}</span>
            </div>
          </div>
          <div class="goal-xp">+{{ goal.xpReward }} XP</div>
        </div>
      </div>
    </div>

    <!-- Create Goal Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content card">
        <h3>Create New Goal</h3>
        <div class="form-group">
          <label>Goal Type</label>
          <select v-model="newGoalType" class="form-select">
            <option v-for="t in templates" :key="t.type" :value="t.type">
              {{ t.title.replace('{target}', String(t.defaultTarget)) }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Target</label>
          <input
            v-model.number="newGoalTarget"
            type="number"
            min="1"
            class="form-input"
          />
          <span class="input-hint">{{ currentTemplate?.unit || '' }}</span>
        </div>
        <div class="form-group">
          <label>Deadline (optional)</label>
          <input v-model="newGoalDeadline" type="date" class="form-input" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showCreateModal = false">Cancel</button>
          <button class="btn btn-primary" :disabled="!newGoalTarget || newGoalTarget < 1" @click="createGoal">
            Create Goal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGoalStore, type GoalType } from '../stores/goalStore.ts'

const goalStore = useGoalStore()

const showCreateModal = ref(false)
const newGoalType = ref<GoalType>('practice_time')
const newGoalTarget = ref(120)
const newGoalDeadline = ref('')

const activeGoals = computed(() => goalStore.activeGoals)
const completedGoals = computed(() => goalStore.completedGoals)
const templates = computed(() => goalStore.getTemplates())

const currentTemplate = computed(() => templates.value.find(t => t.type === newGoalType.value))

watch(newGoalType, (type) => {
  const template = templates.value.find(t => t.type === type)
  if (template) {
    newGoalTarget.value = template.defaultTarget
  }
})

function createGoal() {
  if (!newGoalTarget.value || newGoalTarget.value < 1) return
  const deadline = newGoalDeadline.value || null
  goalStore.createGoal(newGoalType.value, newGoalTarget.value, deadline)
  showCreateModal.value = false
  newGoalDeadline.value = ''
}

function deleteGoal(id: string) {
  if (confirm('Delete this goal?')) {
    goalStore.deleteGoal(id)
  }
}

function formatType(type: string): string {
  const map: Record<string, string> = {
    practice_time: 'Practice',
    chords_learned: 'Chords',
    songs_completed: 'Songs',
    streak_days: 'Streak',
    lessons_completed: 'Lessons',
    ear_training_score: 'Ear Training',
  }
  return map[type] || type
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatDateRelative(timestamp: number | null): string {
  if (!timestamp) return ''
  const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}
</script>

<style scoped>
.goal-tracker {
  padding: 0 24px 48px;
  max-width: 900px;
  margin: 0 auto;
}

.goal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.goal-header h2 {
  font-size: 24px;
  font-weight: 800;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.goal-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  transition: all 0.2s;
}

.goal-card.near-complete {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.goal-info {
  flex: 1;
  min-width: 0;
}

.goal-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 6px;
}

.goal-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.goal-type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.goal-deadline {
  font-size: 12px;
  color: var(--text-tertiary);
}

.goal-progress {
  width: 160px;
  flex-shrink: 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
  font-size: 13px;
}

.progress-current {
  font-weight: 800;
  color: var(--bg-highlight);
}

.progress-target {
  color: var(--text-secondary);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--bg-highlight);
  border-radius: 4px;
  transition: width 0.4s ease;
}

.goal-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--bg-danger);
  color: white;
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

.completed-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.goal-card.completed {
  opacity: 0.7;
}

.goal-card.completed .goal-title {
  text-decoration: line-through;
}

.goal-completed {
  font-size: 12px;
  color: var(--bg-success);
  font-weight: 600;
}

.goal-xp {
  font-size: 13px;
  font-weight: 700;
  color: var(--bg-success);
  background: rgba(16, 185, 129, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
}

/* Modal */
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
  max-width: 420px;
  width: 100%;
  padding: 24px;
}

.modal-content h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 6px;
  color: var(--text-secondary);
}

.form-select,
.form-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
}

.input-hint {
  display: inline-block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 600px) {
  .goal-tracker {
    padding: 0 12px 32px;
  }
  .goal-header {
    flex-wrap: wrap;
    gap: 12px;
  }
  .goal-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .goal-progress {
    width: 100%;
  }
  .goal-actions {
    align-self: flex-end;
  }
  .btn-icon {
    width: 40px;
    height: 40px;
  }
  .modal-actions {
    flex-direction: column;
  }
}
</style>
