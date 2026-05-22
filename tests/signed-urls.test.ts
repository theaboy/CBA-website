import { describe, it, expect, vi } from 'vitest'

// Stub: real implementations wired in Plan 04-03
// These tests verify the URL helper returns properly shaped HTTPS URLs

describe('getPreviewAudioUrl()', () => {
  it.todo('returns a string starting with https://')
  it.todo('returned URL contains the preview-audio bucket path segment')
  it.todo('does not throw when given a valid preview_key path')
})
