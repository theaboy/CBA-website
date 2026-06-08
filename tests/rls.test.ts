import { describe, it, expect } from 'vitest'

// Stub: integration tests require a real Supabase project
// Run manually against dev project after Plan 04-03 completes
// BE-01: RLS must allow anon to read published beats, deny unpublished

describe('RLS — beats table', () => {
  it.todo('anon client can select published beats')
  it.todo('anon client cannot select unpublished beats (returns empty array, no error)')
  it.todo('anon client cannot insert into beats table')
})

describe('RLS — orders_beat table', () => {
  it.todo('anon client cannot select from orders_beat (returns empty array)')
})
