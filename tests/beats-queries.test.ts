import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Supabase server client
const mockSingle = vi.fn()
const mockLimit = vi.fn()
const mockOrder = vi.fn()
const mockLte = vi.fn()
const mockGte = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()

// Chain all query builder methods back to the same object
const queryBuilder = {
  select: mockSelect,
  eq: mockEq,
  gte: mockGte,
  lte: mockLte,
  order: mockOrder,
  limit: mockLimit,
  single: mockSingle,
}

// Each method returns the same builder for chaining
mockSelect.mockReturnValue(queryBuilder)
mockEq.mockReturnValue(queryBuilder)
mockGte.mockReturnValue(queryBuilder)
mockLte.mockReturnValue(queryBuilder)
mockOrder.mockReturnValue(queryBuilder)
mockLimit.mockReturnValue(queryBuilder)

const mockFrom = vi.fn().mockReturnValue(queryBuilder)

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({ from: mockFrom }),
}))

vi.mock('@/lib/supabase/storage', () => ({
  getPreviewAudioUrl: vi.fn().mockResolvedValue('https://project.supabase.co/storage/v1/object/public/preview-audio/preview/test.mp3'),
  getArtworkUrl: vi.fn().mockResolvedValue('https://project.supabase.co/storage/v1/object/public/artwork/artwork/test.jpg'),
}))

const rawBeat = {
  id: 'uuid-1',
  slug: 'after-hours-anthem',
  title: 'After Hours Anthem',
  tagline: 'Luxurious synth stacks.',
  description: 'A glossy late-night trap instrumental.',
  bpm: 142,
  musical_key: 'F# min',
  genre: 'Trap',
  mood: 'Nocturnal',
  price_basic: 120.00,
  price_premium: 198.00,
  price_exclusive: 420.00,
  preview_key: 'preview/after-hours-anthem.mp3',
  artwork_key: 'artwork/after-hours-anthem.jpg',
  tags: ['trap', 'late-night'],
  best_for: ['melodic hooks'],
  mix_palette: ['midnight blue'],
  featured: true,
  is_exclusive_sold: false,
  play_count: 0,
  published: true,
  created_at: '2026-05-21T00:00:00Z',
  // NOTE: no full_key field — this is the DB response shape after explicit .select()
}

const { getPublishedBeats, getBeatBySlug } = await import('@/lib/beats/queries')

describe('getPublishedBeats()', () => {
  beforeEach(() => {
    mockOrder.mockResolvedValue({ data: [rawBeat], error: null })
    mockLimit.mockResolvedValue({ data: [rawBeat], error: null })
  })

  it('returns an array of beats without full_key field (BE-03, BE-04)', async () => {
    const beats = await getPublishedBeats()
    expect(beats).toHaveLength(1)
    expect(beats[0]).not.toHaveProperty('full_key')
  })

  it('result objects have price_basic, price_premium, price_exclusive fields', async () => {
    const beats = await getPublishedBeats()
    expect(beats[0]).toHaveProperty('price_basic')
    expect(beats[0]).toHaveProperty('price_premium')
    expect(beats[0]).toHaveProperty('price_exclusive')
    expect(beats[0]).not.toHaveProperty('price')
  })

  it('result objects have resolved audio_src and artwork_url fields', async () => {
    const beats = await getPublishedBeats()
    expect(beats[0].audio_src).toMatch(/^https:\/\//)
    expect(beats[0].artwork_url).toMatch(/^https:\/\//)
  })
})

describe('getBeatBySlug()', () => {
  it('returns null for an unknown slug', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'no rows' } })
    const beat = await getBeatBySlug('does-not-exist')
    expect(beat).toBeNull()
  })

  it('returns a beat object without full_key field for a known slug', async () => {
    mockSingle.mockResolvedValue({ data: rawBeat, error: null })
    const beat = await getBeatBySlug('after-hours-anthem')
    expect(beat).not.toBeNull()
    expect(beat).not.toHaveProperty('full_key')
  })

  it('returned beat has price_basic not price', async () => {
    mockSingle.mockResolvedValue({ data: rawBeat, error: null })
    const beat = await getBeatBySlug('after-hours-anthem')
    expect(beat?.price_basic).toBe(120.00)
    expect(beat).not.toHaveProperty('price')
  })
})

describe('full_key exclusion contract (BE-04)', () => {
  it('no beat object in any public query result contains a full_key property', async () => {
    mockOrder.mockResolvedValue({ data: [rawBeat], error: null })
    mockLimit.mockResolvedValue({ data: [rawBeat], error: null })
    const beats = await getPublishedBeats()
    for (const beat of beats) {
      expect(beat).not.toHaveProperty('full_key')
    }
  })
})
