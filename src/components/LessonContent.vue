<template>
  <div class="lesson-content-renderer">
    <template v-for="(block, index) in blocks" :key="index">
      <!-- Header / Section Title -->
      <div v-if="block.type === 'header'" class="content-section-header">
        <span class="section-icon">{{ getSectionIcon(block.text) }}</span>
        <h4>{{ block.text }}</h4>
      </div>

      <!-- Callout Box -->
      <div v-else-if="block.type === 'callout'" class="content-callout" :class="block.calloutType">
        <div class="callout-icon">{{ calloutIcon(block.calloutType) }}</div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="callout-body" v-html="renderInline(block.text)"></div>
      </div>

      <!-- Practice Exercise Block -->
      <div v-else-if="block.type === 'exercise'" class="content-exercise card">
        <div class="exercise-header">
          <span class="exercise-icon">🎯</span>
          <h4>Practice Exercise</h4>
        </div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="exercise-body" v-html="renderInline(block.text)"></div>
        <div class="exercise-checklist">
          <label
            v-for="(item, i) in block.checklist"
            :key="i"
            class="check-item"
            :class="{ checked: checkedItems[`${block.id}-${i}`] }"
          >
            <input
              v-model="checkedItems[`${block.id}-${i}`]"
              type="checkbox"
              @change="saveChecklist"
            />
            <span>{{ item }}</span>
          </label>
        </div>
      </div>

      <!-- Code Block (Tablature) -->
      <div v-else-if="block.type === 'code'" class="content-code-block">
        <div class="code-header">
          <span class="code-label">Tablature</span>
          <button class="copy-btn" title="Copy" @click="copyCode(block.text)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            {{ copiedBlock === index ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <pre><code>{{ block.text }}</code></pre>
      </div>

      <!-- Chord Progression Block -->
      <div v-else-if="block.type === 'progression'" class="content-progression">
        <div class="progression-flow">
          <div
            v-for="(chord, i) in block.chords"
            :key="i"
            class="progression-chord"
            @click="$emit('chord-click', chord)"
          >
            <span class="chord-name">{{ chord }}</span>
            <span v-if="i < block.chords.length - 1" class="progression-arrow">→</span>
          </div>
        </div>
      </div>

      <!-- List -->
      <ul v-else-if="block.type === 'list'" class="content-list">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <li v-for="(item, i) in block.items" :key="i"><span v-html="renderInline(item)"></span></li>
      </ul>

      <!-- Ordered List -->
      <ol v-else-if="block.type === 'ordered-list'" class="content-ordered-list">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <li v-for="(item, i) in block.items" :key="i"><span v-html="renderInline(item)"></span></li>
      </ol>

      <!-- Paragraph -->
      <p v-else-if="block.type === 'paragraph'"><!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="renderInline(block.text)"></span></p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getAllChords } from '../data/chords.js'

const props = defineProps({
  content: { type: String, required: true },
  lessonId: { type: String, default: '' },
})

defineEmits(['chord-click'])

const copiedBlock = ref(null)
const checkedItems = ref({})

const allChordNames = getAllChords().map(c => c.name)

function loadChecklist() {
  try {
    const stored = localStorage.getItem(`lesson-checklist-${props.lessonId}`)
    if (stored) checkedItems.value = JSON.parse(stored)
  } catch { /* ignore */ }
}

function saveChecklist() {
  try {
    localStorage.setItem(`lesson-checklist-${props.lessonId}`, JSON.stringify(checkedItems.value))
  } catch { /* ignore */ }
}

onMounted(loadChecklist)

function getSectionIcon(text) {
  const lower = text.toLowerCase()
  if (lower.includes('finger')) return '🖐️'
  if (lower.includes('placement')) return '📍'
  if (lower.includes('mistake')) return '⚠️'
  if (lower.includes('practice')) return '🎯'
  if (lower.includes('sound')) return '🔊'
  if (lower.includes('tip')) return '💡'
  if (lower.includes('technique')) return '✨'
  if (lower.includes('compare')) return '⚖️'
  return '📖'
}

function calloutIcon(type) {
  return { tip: '💡', warning: '⚠️', info: 'ℹ️', success: '✅' }[type] || '💡'
}

function parseContent(text) {
  const lines = text.split('\n')
  const result = []
  let currentList = null
  let currentCode = null
  let blockId = 0

  function flushList() {
    if (currentList) {
      result.push(currentList)
      currentList = null
    }
  }

  function flushCode() {
    if (currentCode) {
      result.push({ type: 'code', text: currentCode.lines.join('\n') })
      currentCode = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Code block start/end
    if (trimmed.startsWith('```')) {
      if (currentCode) {
        flushCode()
      } else {
        flushList()
        currentCode = { lines: [] }
      }
      continue
    }

    if (currentCode) {
      currentCode.lines.push(line)
      continue
    }

    // Empty line
    if (!trimmed) {
      flushList()
      continue
    }

    // Header line: **Something:**
    if (/^\*\*[^*]+\*\*\s*$/.test(trimmed)) {
      flushList()
      const headerText = trimmed.replace(/^\*\*|\*\*\s*$/g, '')
      result.push({ type: 'header', text: headerText })
      continue
    }

    // Check for chord progression patterns like: D - A - E - D or C → G → Am → F
    const progMatch = trimmed.match(/^([A-G][#bm\d]*(\s*[-→]\s*[A-G][#bm\d]*)+)$/)
    if (progMatch && !trimmed.includes(' ')) {
      flushList()
      const chords = trimmed.split(/\s*[-→]\s*/).filter(Boolean)
      result.push({ type: 'progression', chords })
      continue
    }

    // Callout detection
    const calloutMatch = trimmed.match(/^(Practice Tip|Tip|Warning|Note|Remember|Important):\s*(.*)/i)
    if (calloutMatch) {
      flushList()
      const keyword = calloutMatch[1].toLowerCase()
      const type = keyword.includes('warn') || keyword.includes('important') ? 'warning' : keyword.includes('tip') ? 'tip' : 'info'
      result.push({ type: 'callout', calloutType: type, text: calloutMatch[2] })
      continue
    }

    // Exercise block detection
    if (/^Practice Exercise:/i.test(trimmed)) {
      flushList()
      const exerciseLines = []
      const checklist = []
      let j = i
      // Collect until next empty line or header
      while (j < lines.length && lines[j].trim() !== '' && !/^\*\*[^*]+\*\*\s*$/.test(lines[j].trim())) {
        exerciseLines.push(lines[j])
        j++
      }
      i = j - 1
      // Extract checklist items (lines starting with numbers)
      const exerciseText = exerciseLines.join('\n')
      const numMatches = exerciseText.matchAll(/^(\d+)\.\s+(.+)$/gm)
      for (const m of numMatches) {
        checklist.push(m[2])
      }
      result.push({ type: 'exercise', text: exerciseText, checklist, id: blockId++ })
      continue
    }

    // Unordered list
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      if (!currentList || currentList.type !== 'list') {
        flushList()
        currentList = { type: 'list', items: [] }
      }
      currentList.items.push(trimmed.slice(2))
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(trimmed)) {
      if (!currentList || currentList.type !== 'ordered-list') {
        flushList()
        currentList = { type: 'ordered-list', items: [] }
      }
      currentList.items.push(trimmed.replace(/^\d+\.\s/, ''))
      continue
    }

    // Regular paragraph
    flushList()
    result.push({ type: 'paragraph', text: trimmed })
  }

  flushList()
  flushCode()
  return result
}

const blocks = computed(() => parseContent(props.content))

function renderInline(text: string): string {
  if (!text) return ''
  let html = text
    .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')

  // Highlight chord names
  allChordNames.forEach(name => {
    const regex = new RegExp(`\\b${name.replace(/[#b]/g, '\\$&')}\\b`, 'g')
    html = html.replace(regex, `<span class="inline-chord" data-chord="${name}">${name}</span>`)
  })

  return html
}

function copyCode(text) {
  navigator.clipboard.writeText(text).then(() => {
    copiedBlock.value = Date.now()
    setTimeout(() => { copiedBlock.value = null }, 2000)
  })
}
</script>

<style scoped>
.lesson-content-renderer {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-primary);
}

.lesson-content-renderer :deep(p) {
  margin-bottom: 16px;
}

.content-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 28px 0 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-color);
}

.content-section-header .section-icon {
  font-size: 22px;
}

.content-section-header h4 {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  color: var(--text-primary);
}

.content-callout {
  display: flex;
  gap: 12px;
  padding: 16px 18px;
  border-radius: var(--radius-lg);
  margin: 16px 0;
  border-left: 4px solid;
}

.content-callout.tip {
  background: rgba(59, 130, 246, 0.08);
  border-color: #3b82f6;
}

.content-callout.warning {
  background: rgba(245, 158, 11, 0.08);
  border-color: #f59e0b;
}

.content-callout.info {
  background: rgba(139, 92, 246, 0.08);
  border-color: #8b5cf6;
}

.content-callout.success {
  background: rgba(34, 197, 94, 0.08);
  border-color: #22c55e;
}

.callout-icon {
  font-size: 22px;
  flex-shrink: 0;
  margin-top: 2px;
}

.callout-body {
  flex: 1;
  font-size: 15px;
}

.callout-body :deep(strong) {
  color: inherit;
}

.content-exercise {
  padding: 20px;
  margin: 20px 0;
  background: linear-gradient(135deg, var(--bg-highlight-light) 0%, var(--bg-card) 100%);
  border: 2px solid var(--bg-highlight);
}

.exercise-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.exercise-icon {
  font-size: 24px;
}

.exercise-header h4 {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--bg-highlight);
}

.exercise-body {
  margin-bottom: 16px;
}

.exercise-checklist {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.check-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.check-item:hover {
  background: var(--bg-card-hover);
}

.check-item.checked {
  opacity: 0.6;
  text-decoration: line-through;
}

.check-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--bg-highlight);
  margin-top: 2px;
  flex-shrink: 0;
}

.content-code-block {
  margin: 16px 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.code-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-tertiary);
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.content-code-block pre {
  margin: 0;
  padding: 16px;
  background: var(--bg-tertiary);
  overflow-x: auto;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.content-code-block code {
  background: none;
  padding: 0;
  font-size: inherit;
}

.content-list,
.content-ordered-list {
  margin: 12px 0 16px;
  padding-left: 20px;
}

.content-list li,
.content-ordered-list li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.content-progression {
  margin: 16px 0;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  overflow-x: auto;
}

.progression-flow {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.progression-chord {
  display: flex;
  align-items: center;
  gap: 6px;
}

.progression-chord .chord-name {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 2px solid var(--bg-highlight);
  color: var(--bg-highlight);
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.progression-chord .chord-name:hover {
  background: var(--bg-highlight);
  color: white;
}

.progression-arrow {
  color: var(--text-tertiary);
  font-weight: 700;
}

.lesson-content-renderer :deep(.inline-chord) {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--bg-highlight-light);
  color: var(--bg-highlight);
  font-weight: 700;
  font-size: 0.95em;
  cursor: pointer;
  transition: all 0.15s;
}

.lesson-content-renderer :deep(.inline-chord:hover) {
  background: var(--bg-highlight);
  color: white;
}
</style>
