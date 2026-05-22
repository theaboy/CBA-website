import { describe, it, expect, vi, beforeEach } from 'vitest'

// Stub: real implementations wired in Plan 04-04
// These tests verify the query layer's shape and full_key exclusion

describe('getPublishedBeats()', () => {
  it.todo('returns an array of beats without full_key field (BE-03, BE-04)')
  it.todo('only returns beats where published = true')
  it.todo('returns beats ordered by created_at descending')
})

describe('getBeatBySlug()', () => {
  it.todo('returns a beat object for a known slug without full_key field')
  it.todo('returns null for an unknown slug')
})

describe('full_key exclusion contract', () => {
  it.todo('no beat object in any public query result contains a full_key property')
})
