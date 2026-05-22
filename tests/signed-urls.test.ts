import { describe, it, expect, vi } from 'vitest'

// Mock the Supabase server client so tests run without a real DB connection
vi.mock('@/lib/supabase/server', () => {
  const mockStorage = {
    from: (bucket: string) => ({
      getPublicUrl: (key: string) => ({
        data: {
          publicUrl: `https://project.supabase.co/storage/v1/object/public/${bucket}/${key}`,
        },
      }),
      createSignedUrl: async (key: string, expiresIn: number) => ({
        data: {
          signedUrl: `https://project.supabase.co/storage/v1/object/sign/${bucket}/${key}?token=mock-token&expiresIn=${expiresIn}`,
        },
        error: null,
      }),
    }),
  }

  return {
    createClient: vi.fn().mockResolvedValue({ storage: mockStorage }),
  }
})

// Import after mock is set up
const { getPreviewAudioUrl, getArtworkUrl, getSignedDownloadUrl } = await import(
  '@/lib/supabase/storage'
)

describe('getPreviewAudioUrl()', () => {
  it('returns a string starting with https://', async () => {
    const url = await getPreviewAudioUrl('preview/north-line.mp3')
    expect(url).toMatch(/^https:\/\//)
  })

  it('returned URL contains the preview-audio bucket path segment', async () => {
    const url = await getPreviewAudioUrl('preview/north-line.mp3')
    expect(url).toContain('preview-audio')
  })

  it('URL contains the key path', async () => {
    const url = await getPreviewAudioUrl('preview/after-hours-anthem.mp3')
    expect(url).toContain('after-hours-anthem.mp3')
  })
})

describe('getArtworkUrl()', () => {
  it('returns a string starting with https://', async () => {
    const url = await getArtworkUrl('artwork/north-line.jpg')
    expect(url).toMatch(/^https:\/\//)
  })

  it('returned URL contains the artwork bucket path segment', async () => {
    const url = await getArtworkUrl('artwork/north-line.jpg')
    expect(url).toContain('artwork')
  })
})

describe('getSignedDownloadUrl()', () => {
  it('returns a string starting with https://', async () => {
    const url = await getSignedDownloadUrl('full/north-line.wav', 3600)
    expect(url).toMatch(/^https:\/\//)
  })

  it('returned URL contains the full-audio bucket path segment', async () => {
    const url = await getSignedDownloadUrl('full/north-line.wav', 3600)
    expect(url).toContain('full-audio')
  })

  it('returned URL is a signed URL (contains token query param)', async () => {
    const url = await getSignedDownloadUrl('full/north-line.wav', 3600)
    expect(url).toContain('token=')
  })

  it('does NOT return a public URL (must go through sign endpoint)', async () => {
    const url = await getSignedDownloadUrl('full/north-line.wav', 3600)
    // Signed URLs use /sign/ path, not /public/
    expect(url).not.toContain('/object/public/')
  })
})
