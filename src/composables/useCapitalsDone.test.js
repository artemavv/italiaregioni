import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useCapitalsDone } from './useCapitalsDone.js'

const regions = [{ id: 'a' }, { id: 'b' }]
const memoryStorage = (data = {}) => ({
  getItem: (k) => data[k] ?? null,
  setItem: (k, v) => (data[k] = v),
})

describe('useCapitalsDone', () => {
  it('starts empty and reports ticked regions', () => {
    const { done, doneIds } = useCapitalsDone(regions, memoryStorage())
    expect([...doneIds()]).toEqual([])
    done.b = true
    expect([...doneIds()]).toEqual(['b'])
  })

  it('persists and restores', async () => {
    const storage = memoryStorage()
    const first = useCapitalsDone(regions, storage)
    first.done.a = true
    await nextTick()
    expect([...useCapitalsDone(regions, storage).doneIds()]).toEqual(['a'])
  })
})
