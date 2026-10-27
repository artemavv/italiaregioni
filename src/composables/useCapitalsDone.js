import { reactive, watch } from 'vue'

const KEY = 'italia-regioni-capitals-done-v1'

function load(storage) {
  try {
    return JSON.parse(storage?.getItem(KEY)) ?? {}
  } catch {
    return {}
  }
}

// Per-region "capital completed" flag: such regions are skipped in the "Capoluogi" training mode only.
export function useCapitalsDone(regions, storage = globalThis.localStorage) {
  const saved = load(storage)
  const done = reactive({})
  for (const { id } of regions) done[id] = saved[id] === true

  watch(
    done,
    () => {
      try {
        storage?.setItem(KEY, JSON.stringify(done))
      } catch {
        /* storage unavailable */
      }
    },
    { deep: true },
  )

  const doneIds = () => new Set(Object.keys(done).filter((id) => done[id]))

  return { done, doneIds }
}
