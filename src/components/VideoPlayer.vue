<template>
  <div class="video-player">
    <div v-if="embedUrl" class="video-container">
      <iframe
        :src="embedUrl"
        frameborder="0"
        allow="
          accelerometer;
          autoplay;
          clipboard-write;
          encrypted-media;
          gyroscope;
          picture-in-picture;
        "
        allowfullscreen
        class="video-iframe"
      ></iframe>
    </div>
    <div v-else class="video-placeholder">
      <div class="placeholder-icon">🎥</div>
      <p>Video tutorial coming soon</p>
    </div>

    <div v-if="title" class="video-info">
      <h4>{{ title }}</h4>
      <p v-if="description" class="video-description">{{ description }}</p>
    </div>

    <!-- Playback Speed Control -->
    <div v-if="embedUrl" class="speed-control">
      <span class="speed-label">Speed:</span>
      <button
        v-for="speed in playbackSpeeds"
        :key="speed.value"
        class="speed-btn"
        :class="{ active: currentSpeed === speed.value }"
        @click="setPlaybackSpeed(speed.value)"
      >
        {{ speed.label }}
      </button>
    </div>

    <!-- Loop Section -->
    <div v-if="embedUrl && allowLoop" class="loop-control">
      <button class="loop-btn" :class="{ active: isLooping }" @click="toggleLoop">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
        {{ isLooping ? 'Looping' : 'Loop' }}
      </button>
      <span v-if="isLooping" class="loop-hint">Click loop button again to stop</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  videoUrl?: string
  videoId?: string
  title?: string
  description?: string
  startTime?: number
  allowLoop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  startTime: 0,
  allowLoop: true,
  videoUrl: '',
  videoId: '',
  title: '',
  description: '',
})

const currentSpeed = ref(1)
const isLooping = ref(false)

const playbackSpeeds = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
]

const embedUrl = computed(() => {
  if (props.videoId) {
    return `https://www.youtube.com/embed/${props.videoId}?start=${props.startTime}&enablejsapi=1`
  }
  if (props.videoUrl) {
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = props.videoUrl.match(regExp)
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?start=${props.startTime}&enablejsapi=1`
    }
  }
  return null
})

function setPlaybackSpeed(speed: number) {
  currentSpeed.value = speed
  // Note: Actual playback speed control would require YouTube Player API
  // This is a UI placeholder for the feature
}

function toggleLoop() {
  isLooping.value = !isLooping.value
}
</script>

<style scoped>
.video-player {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.video-placeholder {
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.video-info {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.video-info h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.video-description {
  font-size: 14px;
  color: var(--text-secondary);
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.speed-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.speed-btn {
  padding: 4px 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.speed-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.speed-btn.active {
  background: var(--bg-highlight);
  color: white;
  border-color: var(--bg-highlight);
}

.loop-control {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.loop-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.loop-btn:hover {
  background: var(--bg-card-hover);
}

.loop-btn.active {
  background: var(--bg-highlight-light);
  color: var(--bg-highlight);
  border-color: var(--bg-highlight);
}

.loop-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}
</style>
