<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import ItalyMap from './components/ItalyMap.vue'
import RegionsPanel from './components/RegionsPanel.vue'
import CapitalsPanel from './components/CapitalsPanel.vue'
import { REGIONS, regionName } from './data/regions.js'
import { CAPITALS } from './data/capitals.js'
import { useStats } from './composables/useStats.js'
import { useTraining } from './composables/useTraining.js'
import { useSound } from './composables/useSound.js'

const { stats, record, percent, completedIds, reset } = useStats(REGIONS)
const { run, target, start, stop, tapRegion, submitName, next, RUN_LENGTH } = useTraining(REGIONS, {
  record,
  completedIds,
})

const { enabled: soundOn, play } = useSound()
// play a sound whenever an attempt gets answered
watch(() => run.answered, (a) => a && play(a.correct ? 'correct' : 'wrong'))

const showRegions = ref(false)
const showCapitals = ref(false)
const showCapital = ref(false) // show capitals next to region names (free mode and training answers)
const capitalCity = (id) => CAPITALS[regionName(id)].city
const capitalOf = (id) => {
  const c = CAPITALS[regionName(id)]
  return `${c.city} (${c.code})`
}

// opening a panel scrolls the page to the bottom so it is visible
watch([showRegions, showCapitals], async ([regions, capitals], [prevRegions, prevCapitals]) => {
  if (!(regions && !prevRegions) && !(capitals && !prevCapitals)) return
  await nextTick()
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
})
const selected = ref(null) // free-browse selection
const dropdown = ref('')
const typed = ref('')

const inLocate = computed(() => run.active && (run.mode === 'locate' || run.mode === 'capital'))
const inCapital = computed(() => run.active && run.mode === 'capital')
const inIdentify = computed(() => run.active && run.mode === 'identify')

const mapStates = computed(() => {
  const s = {}
  for (const id in stats) if (stats[id].completed) s[id] = 'completed'
  if (!run.active) {
    if (selected.value && !s[selected.value]) s[selected.value] = 'selected' // completed stays green
    return s
  }
  if (run.mode === 'identify') s[target.value] = run.answered ? (run.answered.correct ? 'correct' : 'wrong') : 'target'
  if (inLocate.value && run.answered) {
    s[target.value] = 'correct'
    if (!run.answered.correct) s[run.answered.picked] = 'wrong'
  }
  return s
})

function onSelect(id) {
  if (inLocate.value) tapRegion(id)
  else if (!run.active) {
    selected.value = id
    play('click')
  }
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

    <header class="topbar">
      <h1>Regioni e capoluoghi</h1>
      <button :class="['switch', { on: showCapital }]" role="switch" :aria-checked="showCapital" @click="showCapital = !showCapital">
        Mostra capoluogi
        <span class="track" aria-hidden="true"><span class="knob"></span></span>
      </button>
      <button
        class="sound-toggle"
        :aria-pressed="soundOn"
        :aria-label="soundOn ? 'Suono attivo' : 'Suono disattivato'"
        :title="soundOn ? 'Suono attivo' : 'Suono disattivato'"
        @click="soundOn = !soundOn"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor" />
          <template v-if="soundOn">
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </template>
          <template v-else>
            <path d="m16 9 6 6" />
            <path d="m22 9-6 6" />
          </template>
        </svg>
      </button>
    </header>

    <div class="controls">
      <span class="controls-label">{{ run.active ? `Pratica: ${run.index + 1}/${run.targets.length}` : 'Tocca la mappa o scegli un esercizio' }}</span>
      <div class="controls-buttons">
        <template v-if="!run.active">
          <button class="start" @click="begin('locate')">Trova la regione</button>
          <button class="start" @click="begin('identify')">Indovina il nome</button>
          <button class="start" @click="begin('capital')">Capoluogi</button>
        </template>
        <button v-else class="start" @click="stop">Stop</button>
      </div>
    </div>

    <ItalyMap :states="mapStates" @select="onSelect" />

    <div class="status" aria-live="polite">
      <template v-if="run.active">
        <template v-if="inLocate">
          <p class="prompt"><span class="where">dov'è</span> {{ inCapital ? capitalCity(target) : regionName(target) }}<span class="where">?</span></p>
          <template v-if="run.answered">
            <p v-if="run.answered.correct" class="ok">OK<span v-if="inCapital" class="capital-inline">{{ regionName(target) }}</span><span v-else-if="showCapital" class="capital-inline">capoluogo: {{ capitalOf(target) }}</span></p>
            <p v-else class="bad">Questa è: {{ regionName(run.answered.picked) }}<span v-if="showCapital" class="capital-inline">capoluogo: {{ capitalOf(run.answered.picked) }}</span></p>
            <p v-if="inCapital && !run.answered.correct" class="bad">{{ capitalCity(target) }} è in: {{ regionName(target) }}</p>
            <p v-if="!run.answered.correct" class="hint hint-float">Tocca ovunque per continuare</p>
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
            <p v-if="run.answered.correct" class="ok">OK<span v-if="showCapital" class="capital-inline">capoluogo: {{ capitalOf(target) }}</span></p>
            <p v-else class="bad">Era: {{ regionName(target) }}<span v-if="showCapital" class="capital-inline">capoluogo: {{ capitalOf(target) }}</span></p>
            <p v-if="!run.answered.correct" class="hint hint-float">Tocca ovunque per continuare</p>
          </template>
        </form>
      </template>

      <template v-else-if="selected">
        <p class="prompt">{{ regionName(selected) }}</p>
        <p v-if="showCapital" class="capital">capoluogo: {{ capitalOf(selected) }}</p>
      </template>
      <template v-else-if="run.finished">
        <p class="prompt">Risultato: {{ run.score }} / {{ run.targets.length }}</p>
      </template>
      <p v-else-if="run.empty" class="bad">Tutte le regioni sono completate.</p>
      <p v-else class="hint">Tocca una regione o tocca pulsante blu.</p>
    </div>

    <div class="toggles">
      <button :class="['toggle', { on: showRegions }]" :aria-pressed="showRegions" @click="showRegions = !showRegions">
        {{ showRegions ? 'Chiudi' : 'Regioni' }}
      </button>
      <button :class="['toggle', { on: showCapitals }]" :aria-pressed="showCapitals" @click="showCapitals = !showCapitals">
        {{ showCapitals ? 'Chiudi' : 'Capoluogi' }}
      </button>
    </div>

    <RegionsPanel v-if="showRegions" :stats="stats" :percent="percent" @reset="reset" />
    <CapitalsPanel v-if="showCapitals" />
  </main>
</template>
