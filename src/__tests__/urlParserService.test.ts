import { describe, it, expect } from 'vitest'
import { detectUrlType, getPlatformLabel } from '../services/urlParserService'

describe('urlParserService', () => {
  describe('detectUrlType', () => {
    it('should detect YouTube watch URLs', () => {
      const result = detectUrlType('https://www.youtube.com/watch?v=abc123xyz78')
      expect(result.type).toBe('youtube')
      expect(result.id).toBe('abc123xyz78')
    })

    it('should detect YouTube short URLs', () => {
      const result = detectUrlType('https://youtu.be/abc123xyz78')
      expect(result.type).toBe('youtube')
      expect(result.id).toBe('abc123xyz78')
    })

    it('should detect YouTube embed URLs', () => {
      const result = detectUrlType('https://www.youtube.com/embed/abc123xyz78')
      expect(result.type).toBe('youtube')
      expect(result.id).toBe('abc123xyz78')
    })

    it('should detect YouTube shorts URLs', () => {
      const result = detectUrlType('https://www.youtube.com/shorts/abc123xyz78')
      expect(result.type).toBe('youtube')
      expect(result.id).toBe('abc123xyz78')
    })

    it('should detect Apple Music URLs', () => {
      const result = detectUrlType('https://music.apple.com/us/song/song-name/123456')
      expect(result.type).toBe('apple_music')
      expect(result.platform).toBe('apple_music')
    })

    it('should detect Spotify URLs', () => {
      const result = detectUrlType('https://open.spotify.com/track/abc123')
      expect(result.type).toBe('spotify')
      expect(result.platform).toBe('spotify')
    })

    it('should detect Spotify international URLs', () => {
      const result = detectUrlType('https://open.spotify.com/intl-en/track/abc123')
      expect(result.type).toBe('spotify')
    })

    it('should handle invalid URLs', () => {
      const result = detectUrlType('')
      expect(result.type).toBe('unknown')
    })

    it('should handle plain text', () => {
      const result = detectUrlType('not a url')
      expect(result.type).toBe('unknown')
    })

    it('should handle generic HTTP URLs', () => {
      const result = detectUrlType('https://example.com/song')
      expect(result.type).toBe('link')
    })
  })

  describe('getPlatformLabel', () => {
    it('should return correct labels', () => {
      expect(getPlatformLabel('youtube')).toBe('YouTube')
      expect(getPlatformLabel('apple_music')).toBe('Apple Music')
      expect(getPlatformLabel('spotify')).toBe('Spotify')
      expect(getPlatformLabel('unknown')).toBe('Unknown')
    })
  })
})
