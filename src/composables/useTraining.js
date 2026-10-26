import { computed, reactive } from 'vue'
import { pickTargets, isNameMatch, RUN_LENGTH } from './training.js'
import { regionName } from '../data/regions.js'

// Modes: 'locate' - name shown, user taps the region;
//        'capital' - a capital city is shown, user taps its region;
//        'identify' - region highlighted, user picks/types its name.
const AUTO_NEXT_MS = 1500

export function useTraining(regions, statsApi) {
  const run = reactive({
    active: false,
    mode: 'locate',
    targets: [],
    index: 0,
    score: 0,
    answered: null, // { correct, picked } once the current attempt is answered
    finished: false,
    empty: false,
  })

  const target = computed(() => (run.active ? run.targets[run.index] : null))

  function start(mode) {
    clearTimer()
    const targets = pickTargets(regions, statsApi.completedIds())
    Object.assign(run, {
      active: targets.length > 0,
      mode,
      targets,
      index: 0,
      score: 0,
      answered: null,
      finished: false,
      empty: targets.length === 0,
    })
  }

  let timer = null
  const clearTimer = () => {
    clearTimeout(timer)
    timer = null
  }

  function stop() {
    clearTimer()
    Object.assign(run, { active: false, answered: null, finished: false, empty: false })
  }

  function finish(correct, picked) {
    statsApi.record(target.value, correct)
    if (correct) run.score++
    run.answered = { correct, picked }
    if (correct) timer = setTimeout(next, AUTO_NEXT_MS)
  }

  // locate and capital modes: one tap per attempt
  function tapRegion(id) {
    if (!run.active || !['locate', 'capital'].includes(run.mode) || run.answered) return
    finish(id === target.value, id)
  }

  // identify mode: answer is a name typed or chosen from the dropdown
  function submitName(text) {
    if (!run.active || run.mode !== 'identify' || run.answered || !text.trim()) return
    finish(isNameMatch(text, regionName(target.value)), text.trim())
  }

  function next() {
    clearTimer()
    if (!run.answered) return
    run.answered = null
    if (run.index + 1 >= run.targets.length) {
      run.active = false
      run.finished = true
    } else {
      run.index++
    }
  }

  return { run, target, start, stop, tapRegion, submitName, next, RUN_LENGTH }
}
