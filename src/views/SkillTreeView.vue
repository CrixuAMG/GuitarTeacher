<template>
  <div class="skill-tree-view">
    <BackLink to="/profile" label="Back to Profile" />
    <PageHeader subtitle="Unlock new abilities as you progress">Skill Trees</PageHeader>

    <!-- Skill Points -->
    <div class="skill-points card">
      <div class="points-display">
        <span class="points-value">{{ availablePoints }}</span>
        <span class="points-label">Skill Points Available</span>
      </div>
      <div class="points-hint">Complete lessons and practice to earn more points</div>
    </div>

    <!-- Branch Selector -->
    <div class="branch-tabs">
      <button
        v-for="branch in branches"
        :key="branch.id"
        class="branch-tab"
        :class="{ active: activeBranch === branch.id }"
        @click="activeBranch = branch.id"
      >
        <span class="branch-icon">{{ branch.icon }}</span>
        <span class="branch-name">{{ branch.name }}</span>
        <span class="branch-progress"
          >{{ getBranchProgress(branch.id) }}/{{ branch.skills.length }}</span
        >
      </button>
    </div>

    <!-- Skill Tree Visualization -->
    <div class="skill-tree-container card">
      <div class="tree-header">
        <h2>{{ currentBranch.name }}</h2>
        <p>{{ currentBranch.description }}</p>
      </div>

      <div class="skills-grid">
        <div
          v-for="(skill, index) in currentBranch.skills"
          :key="skill.id"
          class="skill-node"
          :class="{
            unlocked: skill.unlocked,
            locked: !skill.unlocked && !canUnlock(skill),
            available: !skill.unlocked && canUnlock(skill),
            'root-node': index === 0,
          }"
          @click="selectSkill(skill)"
        >
          <!-- Connection Lines -->
          <div v-if="index > 0" class="connection-line" :class="{ active: skill.unlocked }"></div>

          <div class="skill-content">
            <div class="skill-icon">{{ skill.icon }}</div>
            <div class="skill-info">
              <div class="skill-name">{{ skill.name }}</div>
              <div class="skill-description">{{ skill.description }}</div>
              <div class="skill-cost">
                <span v-if="!skill.unlocked" class="cost-badge">
                  {{ skill.cost }} point{{ skill.cost > 1 ? 's' : '' }}
                </span>
                <span v-else class="unlocked-badge">✓ Unlocked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Skill Detail Modal -->
    <div v-if="selectedSkill" class="skill-modal-overlay" @click.self="selectedSkill = null">
      <div class="skill-modal card">
        <button class="modal-close" @click="selectedSkill = null">×</button>

        <div class="modal-header">
          <div class="modal-icon">{{ selectedSkill.icon }}</div>
          <h3>{{ selectedSkill.name }}</h3>
          <p>{{ selectedSkill.description }}</p>
        </div>

        <div class="modal-benefits">
          <h4>Benefits:</h4>
          <ul>
            <li v-for="(benefit, i) in selectedSkill.benefits" :key="i">{{ benefit }}</li>
          </ul>
        </div>

        <div v-if="!selectedSkill.unlocked" class="modal-requirements">
          <h4>Requirements:</h4>
          <ul>
            <li :class="{ met: availablePoints >= selectedSkill.cost }">
              {{ selectedSkill.cost }} skill points ({{ availablePoints }} available)
            </li>
            <li
              v-if="selectedSkill.prerequisite"
              :class="{ met: isPrerequisiteMet(selectedSkill) }"
            >
              Unlock prerequisite: {{ getPrerequisiteName(selectedSkill) }}
            </li>
          </ul>
        </div>

        <div class="modal-actions">
          <button
            v-if="!selectedSkill.unlocked"
            class="btn btn-primary btn-lg"
            :disabled="!canUnlock(selectedSkill)"
            @click="unlockSkill(selectedSkill)"
          >
            {{
              canUnlock(selectedSkill)
                ? `Unlock for ${selectedSkill.cost} points`
                : 'Requirements not met'
            }}
          </button>
          <span v-else class="already-unlocked">✓ Already Unlocked</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useGamificationStore } from '../stores/gamificationStore'
import BackLink from '../components/BackLink.vue'
import PageHeader from '../components/PageHeader.vue'

interface Skill {
  id: string
  name: string
  description: string
  icon: string
  cost: number
  unlocked: boolean
  benefits: string[]
  prerequisite?: string
}

interface SkillBranch {
  id: string
  name: string
  description: string
  icon: string
  skills: Skill[]
}

const branches: SkillBranch[] = [
  {
    id: 'rhythm',
    name: 'Rhythm Guitar',
    description: 'Master strumming, timing, and chord progressions',
    icon: '🎸',
    skills: [
      {
        id: 'basic-strumming',
        name: 'Basic Strumming',
        description: 'Learn fundamental strumming patterns',
        icon: '🎵',
        cost: 1,
        unlocked: true,
        benefits: ['Access to strumming trainer', 'Basic patterns unlocked'],
      },
      {
        id: 'chord-transitions',
        name: 'Smooth Transitions',
        description: 'Seamlessly switch between chords',
        icon: '🔗',
        cost: 2,
        unlocked: false,
        benefits: ['Chord transition exercises', 'Smooth switch training'],
        prerequisite: 'basic-strumming',
      },
      {
        id: 'rhythm-patterns',
        name: 'Advanced Patterns',
        description: 'Complex rhythmic patterns and syncopation',
        icon: '🥁',
        cost: 3,
        unlocked: false,
        benefits: ['16th note patterns', 'Syncopation exercises'],
        prerequisite: 'chord-transitions',
      },
      {
        id: 'fingerstyle',
        name: 'Fingerstyle Basics',
        description: 'Play with fingers instead of pick',
        icon: '👆',
        cost: 3,
        unlocked: false,
        benefits: ['Travis picking', 'Arpeggio patterns'],
        prerequisite: 'chord-transitions',
      },
      {
        id: 'percussion',
        name: 'Percussive Guitar',
        description: 'Add percussion to your playing',
        icon: '👏',
        cost: 4,
        unlocked: false,
        benefits: ['Thumb slap technique', 'Body percussion'],
        prerequisite: 'fingerstyle',
      },
    ],
  },
  {
    id: 'lead',
    name: 'Lead Guitar',
    description: 'Soloing, scales, and melodic playing',
    icon: '🎸',
    skills: [
      {
        id: 'basic-scales',
        name: 'Major Scale',
        description: 'Learn the foundation of melody',
        icon: '🎼',
        cost: 1,
        unlocked: true,
        benefits: ['Scale visualizer access', 'Major patterns'],
      },
      {
        id: 'pentatonic',
        name: 'Pentatonic Scale',
        description: 'The essential soloing scale',
        icon: '🎹',
        cost: 2,
        unlocked: false,
        benefits: ['Minor pentatonic patterns', 'Blues scale included'],
        prerequisite: 'basic-scales',
      },
      {
        id: 'bending',
        name: 'String Bending',
        description: 'Expressive pitch bending technique',
        icon: '〰️',
        cost: 2,
        unlocked: false,
        benefits: ['Bend trainer', 'Pitch accuracy exercises'],
        prerequisite: 'pentatonic',
      },
      {
        id: 'vibrato',
        name: 'Vibrato Mastery',
        description: 'Add expression to sustained notes',
        icon: '〽️',
        cost: 3,
        unlocked: false,
        benefits: ['Vibrato timing trainer', 'Expression exercises'],
        prerequisite: 'bending',
      },
      {
        id: 'hammer-pull',
        name: 'Hammer-Ons & Pull-Offs',
        description: 'Legato technique for smooth lines',
        icon: '🔨',
        cost: 3,
        unlocked: false,
        benefits: ['Legato exercises', 'Speed building'],
        prerequisite: 'pentatonic',
      },
    ],
  },
  {
    id: 'theory',
    name: 'Music Theory',
    description: 'Understanding the language of music',
    icon: '📚',
    skills: [
      {
        id: 'note-recognition',
        name: 'Note Recognition',
        description: 'Learn all notes on the fretboard',
        icon: '🎵',
        cost: 1,
        unlocked: true,
        benefits: ['Fretboard memorization game', 'Note trainer access'],
      },
      {
        id: 'chord-theory',
        name: 'Chord Construction',
        description: 'Understand how chords are built',
        icon: '🏗️',
        cost: 2,
        unlocked: false,
        benefits: ['Extended chords library', 'Chord formulas'],
        prerequisite: 'note-recognition',
      },
      {
        id: 'keys-scales',
        name: 'Keys & Scales',
        description: 'Master key signatures and modes',
        icon: '🔑',
        cost: 3,
        unlocked: false,
        benefits: ['Circle of fifths', 'Mode visualizer'],
        prerequisite: 'chord-theory',
      },
      {
        id: 'ear-training',
        name: 'Ear Training Pro',
        description: 'Recognize intervals and chords by ear',
        icon: '👂',
        cost: 3,
        unlocked: false,
        benefits: ['Interval recognition', 'Chord quality trainer'],
        prerequisite: 'note-recognition',
      },
      {
        id: 'improvisation',
        name: 'Improvisation',
        description: 'Create music spontaneously',
        icon: '🎭',
        cost: 4,
        unlocked: false,
        benefits: ['Jam mode', 'Backing track generator'],
        prerequisite: 'keys-scales',
      },
    ],
  },
]

const gamification = useGamificationStore()

const activeBranch = ref('rhythm')
const currentBranch = computed(() => branches.find((b) => b.id === activeBranch.value)!)

// Skill points based on level
const availablePoints = computed(() => {
  const currentLevel = gamification.level || 1
  const unlockedCount = branches.flatMap((b) => b.skills).filter((s) => s.unlocked).length
  return Math.floor(currentLevel * 1.5) - unlockedCount
})

const selectedSkill = ref<Skill | null>(null)

// Load unlocked skills from storage
const STORAGE_KEY = 'guitar-unlocked-skills'

function getUnlockedSkills(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load unlocked skills:', e)
  }
  return []
}

function saveUnlockedSkills(skills: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(skills))
  } catch (e) {
    console.error('Failed to save unlocked skills:', e)
  }
}

const unlockedSkills = ref<string[]>(getUnlockedSkills())

// Watch for changes and save
watch(
  unlockedSkills,
  (newValue) => {
    saveUnlockedSkills(newValue)
  },
  { deep: true }
)

onMounted(() => {
  // Apply unlocked status from storage
  branches.forEach((branch) => {
    branch.skills.forEach((skill) => {
      skill.unlocked = skill.unlocked || unlockedSkills.value.includes(skill.id)
    })
  })
})

function getBranchProgress(branchId: string): number {
  const branch = branches.find((b) => b.id === branchId)
  if (!branch) return 0
  return branch.skills.filter((s) => s.unlocked).length
}

function canUnlock(skill: Skill): boolean {
  if (skill.unlocked) return false
  if (availablePoints.value < skill.cost) return false
  if (skill.prerequisite) {
    const prereq = currentBranch.value.skills.find((s) => s.id === skill.prerequisite)
    return prereq?.unlocked || false
  }
  return true
}

function isPrerequisiteMet(skill: Skill): boolean {
  if (!skill.prerequisite) return true
  const prereq = currentBranch.value.skills.find((s) => s.id === skill.prerequisite)
  return prereq?.unlocked || false
}

function getPrerequisiteName(skill: Skill): string {
  const prereq = currentBranch.value.skills.find((s) => s.id === skill.prerequisite)
  return prereq?.name || ''
}

function selectSkill(skill: Skill) {
  selectedSkill.value = skill
}

function unlockSkill(skill: Skill) {
  if (!canUnlock(skill)) return

  skill.unlocked = true
  unlockedSkills.value.push(skill.id)

  // Award XP for unlocking
  gamification.addXP(skill.cost * 50, `Unlocked skill: ${skill.name}`)

  selectedSkill.value = null
}
</script>

<style scoped>
.skill-tree-view {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

/* Skill Points Card */
.skill-points {
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
  background: linear-gradient(135deg, var(--bg-highlight-light) 0%, var(--bg-secondary) 100%);
}

.points-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.points-value {
  font-size: 48px;
  font-weight: 800;
  color: var(--bg-highlight);
  line-height: 1;
}

.points-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.points-hint {
  margin-top: 12px;
  font-size: 13px;
  color: var(--text-tertiary);
}

/* Branch Tabs */
.branch-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.branch-tab {
  padding: 16px;
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.branch-tab:hover {
  border-color: var(--bg-highlight);
  transform: translateY(-2px);
}

.branch-tab.active {
  border-color: var(--bg-highlight);
  background: var(--bg-highlight-light);
}

.branch-icon {
  font-size: 32px;
}

.branch-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.branch-progress {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* Skill Tree Container */
.skill-tree-container {
  padding: 32px;
}

.tree-header {
  text-align: center;
  margin-bottom: 32px;
}

.tree-header h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.tree-header p {
  color: var(--text-secondary);
}

/* Skills Grid */
.skills-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
}

.skill-node {
  position: relative;
  padding: 20px;
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  cursor: pointer;
  transition: all var(--transition);
}

.skill-node:hover {
  transform: translateX(8px);
}

.skill-node.unlocked {
  border-color: var(--bg-success);
  background: rgba(34, 197, 94, 0.05);
}

.skill-node.available {
  border-color: var(--bg-highlight);
  box-shadow: 0 0 0 4px var(--bg-highlight-light);
}

.skill-node.locked {
  opacity: 0.6;
}

.skill-node.root-node {
  border-width: 3px;
}

.connection-line {
  position: absolute;
  top: -26px;
  left: 50%;
  width: 2px;
  height: 26px;
  background: var(--border-color);
  transform: translateX(-50%);
}

.connection-line.active {
  background: var(--bg-success);
}

.skill-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.skill-icon {
  font-size: 36px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.skill-node.unlocked .skill-icon {
  background: rgba(34, 197, 94, 0.2);
}

.skill-info {
  flex: 1;
}

.skill-name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.skill-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.skill-cost {
  display: flex;
  gap: 8px;
}

.cost-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  background: var(--bg-highlight);
  color: #fff;
  border-radius: 20px;
}

.unlocked-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  background: rgba(34, 197, 94, 0.2);
  color: var(--bg-success);
  border-radius: 20px;
}

/* Skill Modal */
.skill-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.skill-modal {
  max-width: 500px;
  width: 100%;
  padding: 32px;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: none;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all var(--transition);
}

.modal-close:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.modal-header p {
  color: var(--text-secondary);
}

.modal-benefits,
.modal-requirements {
  margin-bottom: 24px;
}

.modal-benefits h4,
.modal-requirements h4 {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.modal-benefits ul,
.modal-requirements ul {
  margin: 0;
  padding-left: 20px;
}

.modal-benefits li,
.modal-requirements li {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.modal-requirements li.met {
  color: var(--bg-success);
}

.modal-actions {
  text-align: center;
}

.already-unlocked {
  font-size: 14px;
  color: var(--bg-success);
  font-weight: 600;
}

@media (max-width: 600px) {
  .branch-tabs {
    grid-template-columns: 1fr;
  }

  .skill-content {
    flex-direction: column;
    text-align: center;
  }

  .connection-line {
    display: none;
  }
}
</style>
