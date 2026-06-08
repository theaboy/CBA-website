import { createClient } from '@/lib/supabase/server'

/**
 * Returns the public CDN URL for a preview audio file.
 * preview-audio bucket is PUBLIC — no auth required.
 * Never call this with full_key; only pass beat.preview_key.
 */
export async function getPreviewAudioUrl(previewKey: string): Promise<string> {
  const supabase = await createClient()
  const { data } = supabase.storage
    .from('preview-audio')
    .getPublicUrl(previewKey)
  return data.publicUrl
}

/**
 * Returns the public CDN URL for a beat artwork image.
 * artwork bucket is PUBLIC — no auth required.
 * Pass beat.artwork_key.
 */
export async function getArtworkUrl(artworkKey: string): Promise<string> {
  const supabase = await createClient()
  const { data } = supabase.storage
    .from('artwork')
    .getPublicUrl(artworkKey)
  return data.publicUrl
}

/**
 * Generates a time-limited signed URL for a full-quality audio file.
 * full-audio bucket is PRIVATE — signed URL required for every access.
 *
 * SECURITY: This function must ONLY be called from server-side code
 * (API routes, Server Actions) after verifying a valid purchase token.
 * The full_key value must come from a server-side DB lookup — never
 * from a client request parameter.
 *
 * Used in Phase 5 post-purchase download flow.
 */
export async function getSignedDownloadUrl(
  fullKey: string,
  expiresIn = 3600
): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from('full-audio')
    .createSignedUrl(fullKey, expiresIn)

  if (error || !data) {
    throw new Error(`Could not generate signed download URL: ${error?.message ?? 'unknown error'}`)
  }

  return data.signedUrl
}
