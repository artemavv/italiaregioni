<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import ItalyMap from './components/ItalyMap.vue'
import RegionsPanel from './components/RegionsPanel.vue'
import { REGIONS, regionName } from './data/regions.js'
import { useStats } from './composables/useStats.js'
import { useTraining } from './composables/useTraining.js'

const { stats, record, percent, completedIds, reset } = useStats(REGIONS)
const { run, target, start, stop, tapRegion, submitName, next, RUN_LENGTH } = useTraining(REGIONS, {
  record,
  completedIds,
})

const showRegions = ref(false)

watch(showRegions, async (on) => {
  if (!on) return
  await nextTick()
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
})
const selected = ref(null) // free-browse selection
const dropdown = ref('')
const typed = ref('')

const inLocate = computed(() => run.active && run.mode === 'locate')
const inIdentify = computed(() => run.active && run.mode === 'identify')

const mapStates = computed(() => {
  const s = {}
  for (const id in stats) if (stats[id].completed) s[id] = 'completed'
  if (!run.active) {
    if (selected.value && !s[selected.value]) s[selected.value] = 'selected' // completed stays green
    return s
  }
  if (run.mode === 'identify') s[target.value] = run.answered ? (run.answered.correct ? 'correct' : 'wrong') : 'target'
  if (run.mode === 'locate' && run.answered) {
    s[target.value] = 'correct'
    if (!run.answered.correct) s[run.answered.picked] = 'wrong'
  }
  return s
})

function onSelect(id) {
  if (inLocate.value) tapRegion(id)
  else if (!run.active) selected.value = id
}

function begin(mode) {
  selected.value = null
  start(mode)
}

function submit() {
  submitName(typed.value || dropdown.value)
}

// After a wrong answer a click/tap anywhere advances. Controls handle their own clicks, and clicks right
// after answering are ignored (the click that gave the answer, or a dropdown closing).
let answeredAt = 0
watch(() => run.answered, (a) => (answeredAt = a ? performance.now() : 0))

function onAnyClick(e) {
  if (!run.active || !run.answered || run.answered.correct) return
  if (performance.now() - answeredAt < 400) return
  if (e.target.closest('button, input, select, a, label')) return
  next()
}
function onEnter(e) {
  if (e.key === 'Enter' && run.answered && !run.answered.correct && performance.now() - answeredAt >= 400) next()
}
onMounted(() => {
  window.addEventListener('click', onAnyClick)
  window.addEventListener('keydown', onEnter)
})
onUnmounted(() => {
  window.removeEventListener('click', onAnyClick)
  window.removeEventListener('keydown', onEnter)
})

// clear the answer inputs for every new question (also when advancing automatically)
watch(() => [run.index, run.active], () => (dropdown.value = typed.value = ''))

const onDropdown = () => {
  typed.value = ''
  submitName(dropdown.value)
}
const onTyped = () => (dropdown.value = '')
</script>

<template>
  <main>
    <h1>Tocca la mappa per regioni d'Italia</h1>

    <div class="controls">
      <span class="controls-label">{{ run.active ? `Pratica: ${run.index + 1}/${run.targets.length}` : 'Esercizio:' }}</span>
      <template v-if="!run.active">
        <button class="start" @click="begin('locate')">Trova la regione</button>
        <button class="start" @click="begin('identify')">Indovina il nome</button>
      </template>
      <button v-else class="start" @click="stop">Stop</button>
    </div>

    <ItalyMap :states="mapStates" @select="onSelect" />

    <div class="status" aria-live="polite">
      <template v-if="run.active">
        <template v-if="inLocate">
          <p class="prompt"><span class="where">dov'è</span> {{ regionName(target) }}<span class="where">?</span></p>
          <template v-if="run.answered">
            <p v-if="run.answered.correct" class="ok">OK</p>
            <p v-else class="bad">Questa è: {{ regionName(run.answered.picked) }}</p>
            <p v-if="!run.answered.correct" class="hint">Tocca ovunque per continuare</p>
          </template>
        </template>

        <form v-else-if="inIdentify" class="identify" @submit.prevent="submit">
          <template v-if="!run.answered">
            <select v-model="dropdown" @change="onDropdown" aria-label="Scegli la regione">
              <option value="">— scegli —</option>
              <option v-for="r in REGIONS" :key="r.id" :value="r.name">{{ r.name }}</option>
            </select>
            <span>oppure</span>
            <input v-model="typed" @input="onTyped" placeholder="scrivi il nome" autocomplete="off" />
            <button type="submit" class="answer" :disabled="!typed.trim() && !dropdown">Rispondi</button>
          </template>
          <template v-else>
            <p v-if="run.answered.correct" class="ok">OK</p>
            <p v-else class="bad">Era: {{ regionName(target) }}</p>
            <p v-if="!run.answered.correct" class="hint">Tocca ovunque per continuare</p>
          </template>
        </form>
      </template>

      <p v-else-if="selected" class="prompt">{{ regionName(selected) }}</p>
      <template v-else-if="run.finished">
        <p class="prompt">Risultato: {{ run.score }} / {{ run.targets.length }}</p>
      </template>
      <p v-else-if="run.empty" class="bad">Tutte le regioni sono completate.</p>
      <p v-else class="hint">Tocca una regione o tocca pulsante blu.</p>
    </div>

    <button :class="['toggle', { on: showRegions }]" :aria-pressed="showRegions" @click="showRegions = !showRegions">
      Regions
    </button>

    <RegionsPanel v-if="showRegions" :stats="stats" :percent="percent" @reset="reset" />
  </main>
</template>
