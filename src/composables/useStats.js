import { reactive, watch } from 'vue'

const KEY = 'italia-regioni-stats-v1'

function load(storage) {
  try {
    return JSON.parse(storage?.getItem(KEY)) ?? {}
  } catch {
    return {}
  }
}

export function useStats(regions, storage = globalThis.localStorage) {
  const saved = load(storage)
  const stats = reactive({})
  for (const { id } of regions) {
    stats[id] = { correct: 0, total: 0, completed: false, ...saved[id] }
  }

  watch(
    stats,
    () => {
      try {
        storage?.setItem(KEY, JSON.stringify(stats))
      } catch {
        /* storage unavailable */
      }
    },
    { deep: true },
  )

  const record = (id, correct) => {
    stats[id].total++
    if (correct) stats[id].correct++
  }
  const percent = (id) => (stats[id].total ? Math.round((stats[id].correct / stats[id].total) * 100) : null)
  const completedIds = () => new Set(Object.keys(stats).filter((id) => stats[id].completed))
  const reset = () => {
    for (const id in stats) Object.assign(stats[id], { correct: 0, total: 0, completed: false })
  }

  return { stats, record, percent, completedIds, reset }
}
