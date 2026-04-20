const YOUTUBE_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
]

const APPLE_MUSIC_PATTERNS = [
  /(?:https?:\/\/)?music\.apple\.com\/([a-z]{2})\/song\/([^?/]+)/,
  /(?:https?:\/\/)?music\.apple\.com\/([a-z]{2})\/album\/([^?/]+)/
]

const SPOTIFY_PATTERNS = [
  /(?:https?:\/\/)?open\.spotify\.com\/track\/([a-zA-Z0-9]+)/,
  /(?:https?:\/\/)?open\.spotify\.com\/intl-([a-z]{2})\/track\/([a-zA-Z0-9]+)/
]

export function detectUrlType(url) {
  if (!url || typeof url !== 'string') return { type: 'unknown', id: null, platform: 'unknown' }
  
  const trimmed = url.trim()
  
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmed.match(pattern)
    if (match) {
      return { type: 'youtube', id: match[1], platform: 'youtube' }
    }
  }
  
  for (const pattern of APPLE_MUSIC_PATTERNS) {
    const match = trimmed.match(pattern)
    if (match) {
      return { type: 'apple_music', id: match[2], platform: 'apple_music', region: match[1] }
    }
  }
  
  for (const pattern of SPOTIFY_PATTERNS) {
    const match = trimmed.match(pattern)
    if (match) {
      return { type: 'spotify', id: match[1] || match[2], platform: 'spotify' }
    }
  }
  
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { type: 'link', id: null, platform: 'link' }
  }
  
  return { type: 'unknown', id: null, platform: 'unknown' }
}

export function getYouTubeEmbedUrl(videoId) {
  if (!videoId) return null
  return `https://www.youtube.com/embed/${videoId}`
}

export function getYouTubeThumbnail(videoId) {
  if (!videoId) return null
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

export function getPlatformLabel(type) {
  const labels = {
    youtube: 'YouTube',
    apple_music: 'Apple Music',
    spotify: 'Spotify',
    link: 'External Link',
    unknown: 'Unknown',
    manual: 'Manual'
  }
  return labels[type] || 'Unknown'
}

export function getPlatformIcon(type) {
  const icons = {
    youtube: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    apple_music: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.23-1.06-2.03-2.2-2.56a5.933 5.933 0 0 0-2.04-.5C18.814.78 17.876.646 16.966.598A19.56 19.56 0 0 0 14.254.5h-4.508a19.56 19.56 0 0 0-2.712.098c-.91.048-1.848.182-2.748.396a5.933 5.933 0 0 0-2.04.5c-1.14.53-1.883 1.33-2.2 2.56a9.23 9.23 0 0 0-.24 2.19c-.068.93-.098 1.867-.098 2.804v4.144c0 .937.03 1.874.098 2.804a9.23 9.23 0 0 0 .24 2.19c.317 1.23 1.06 2.03 2.2 2.56a5.933 5.933 0 0 0 2.04.5c1.898.34 3.826.424 5.752.388h4.104c1.926.036 3.854-.048 5.752-.388a5.933 5.933 0 0 0 2.04-.5c1.14-.53 1.883-1.33 2.2-2.56a9.23 9.23 0 0 0 .24-2.19c.068-.93.098-1.867.098-2.804V8.928c0-.937-.03-1.874-.098-2.804z"/></svg>',
    spotify: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.998-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381C9.66 5.801 16.68 6.001 20.82 8.82c.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>'
  }
  return icons[type] || ''
}

export function extractMetadata(url) {
  const info = detectUrlType(url)
  
  const result = {
    platform: info.platform,
    platformType: info.type,
    id: info.id,
    embedUrl: null,
    thumbnailUrl: null,
    sourceUrl: url.trim()
  }
  
  if (info.type === 'youtube') {
    result.embedUrl = getYouTubeEmbedUrl(info.id)
    result.thumbnailUrl = getYouTubeThumbnail(info.id)
  }
  
  return result
}

export function validateUrl(url) {
  if (!url || typeof url !== 'string') return { valid: false, error: 'Please enter a URL' }
  const trimmed = url.trim()
  if (!trimmed) return { valid: false, error: 'URL cannot be empty' }
  const info = detectUrlType(trimmed)
  if (info.type === 'unknown' && trimmed.length > 0) {
    if (!trimmed.startsWith('http')) return { valid: false, error: 'Please enter a valid URL starting with http(s)://' }
  }
  return { valid: true, info }
}