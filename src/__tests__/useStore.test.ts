import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
} as Storage

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('useStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have required exports', async () => {
    const { useStore } = await import('../stores/useStore')
    expect(useStore).toBeDefined()
    expect(typeof useStore).toBe('function')
  })

  it('should return store with expected methods', async () => {
    const { useStore } = await import('../stores/useStore')
    const store = useStore()

    expect(store.songs).toBeDefined()
    expect(store.progress).toBeDefined()
    expect(store.preferences).toBeDefined()
    expect(store.addSong).toBeDefined()
    expect(store.removeSong).toBeDefined()
    expect(store.getSong).toBeDefined()
    expect(store.updateSong).toBeDefined()
  })

  it('should have getAllSongs method', async () => {
    const { useStore } = await import('../stores/useStore')
    const store = useStore()

    expect(store.getAllSongs).toBeDefined()
    expect(typeof store.getAllSongs).toBe('function')
  })
})
