import { describe, expect, it } from 'vitest'
import { isNameMatch, pickTargets } from './training.js'

const regions = Array.from({ length: 8 }, (_, i) => ({ id: String(i), name: 'R' + i }))

describe('pickTargets', () => {
  it('returns 5 distinct ids', () => {
    const t = pickTargets(regions, new Set())
    expect(t).toHaveLength(5)
    expect(new Set(t).size).toBe(5)
  })
  it('skips completed regions and shortens the run', () => {
    const t = pickTargets(regions, new Set(['0', '1', '2', '3', '4', '5']))
    expect(t.sort()).toEqual(['6', '7'])
  })
  it('returns nothing when all are completed', () => {
    expect(pickTargets(regions, new Set(regions.map((r) => r.id)))).toEqual([])
  })
})

describe('isNameMatch', () => {
  it('ignores case, accents, apostrophes and hyphens', () => {
    expect(isNameMatch("valle d aosta", "Valle d'Aosta")).toBe(true)
    expect(isNameMatch('  friuli venezia giulia ', 'Friuli-Venezia Giulia')).toBe(true)
    expect(isNameMatch('Trentino Alto Adige', 'Trentino-Alto Adige')).toBe(true)
  })
  it('rejects different names', () => {
    expect(isNameMatch('Lazio', 'Lombardia')).toBe(false)
  })
})
