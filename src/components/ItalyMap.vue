<script setup>
import { MAP_PATHS, MAP_VIEWBOX } from '../data/mapPaths.js'

// Thin regions get an invisible, wider tap area (stroke width in map units). It is drawn first, so
// neighbouring regions on land stay on top and only the sea side is added.
const HIT_PADDING = { '07': 70, '02': 36 } // Liguria, Valle d'Aosta
const padded = MAP_PATHS.filter((r) => HIT_PADDING[r.id])

// states: { [regionId]: 'completed' | 'selected' | 'target' | 'correct' | 'wrong' }
defineProps({ states: { type: Object, default: () => ({}) } })
const emit = defineEmits(['select'])
</script>

<template>
  <svg class="map" :viewBox="MAP_VIEWBOX" role="img" aria-label="Mappa delle regioni d'Italia">
    <path
      v-for="r in padded"
      :key="'hit-' + r.id"
      :d="r.d"
      class="hit"
      :stroke-width="HIT_PADDING[r.id]"
      @click="emit('select', r.id)"
    />
    <path
      v-for="r in MAP_PATHS"
      :key="r.id"
      :d="r.d"
      :class="['region', states[r.id]]"
      @click="emit('select', r.id)"
    />
  </svg>
</template>

<style scoped>
.map {
  width: 100%;
  max-height: 70vh;
  display: block;
}
.hit {
  fill: none;
  stroke: transparent;
  pointer-events: stroke;
  cursor: pointer;
}
.region {
  fill: #9a9a9a;
  stroke: #000;
  stroke-width: 1.2;
  stroke-linejoin: round;
  cursor: pointer;
  transition: fill 0.15s;
}
.region.completed { fill: #7fcf96; }
.region:hover { fill: #b5b5b5; }
.region.completed:hover { fill: #96d9a9; }
.region.selected { fill: #6f6f6f; }
.region.target { fill: #f2c230; }
.region.correct { fill: #2e9e4f; }
.region.wrong { fill: #d64545; }
</style>
