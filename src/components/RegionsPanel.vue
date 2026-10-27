<script setup>
import { REGIONS } from '../data/regions.js'

defineProps({ stats: Object, percent: Function })
defineEmits(['reset'])
</script>

<template>
  <section class="panel">
    <p class="note">Una regione segnata come ricordata non appare più nell'esercizio.</p>
    <table>
      <thead>
        <tr><th>Regione</th><th>Corrette</th><th>%</th><th>Ricordato</th></tr>
      </thead>
      <tbody>
        <tr v-for="r in REGIONS" :key="r.id" :class="{ done: stats[r.id].completed }">
          <td>{{ r.name }}</td>
          <td>{{ stats[r.id].correct }}/{{ stats[r.id].total }}</td>
          <td>{{ percent(r.id) === null ? '–' : percent(r.id) + '%' }}</td>
          <td><input type="checkbox" v-model="stats[r.id].completed" :aria-label="'Ricordato: ' + r.name" /></td>
        </tr>
      </tbody>
    </table>
    <button class="link" @click="$emit('reset')">Azzera statistiche</button>
  </section>
</template>

<style scoped>
.panel { width: 100%; max-width: 520px; }
.note { margin: 0 0 10px; color: #666; font-size: 0.9rem; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #ddd; }
td:nth-child(n+2), th:nth-child(n+2) { text-align: center; }
tr.done td:first-child { text-decoration: line-through; color: #888; }
.link { margin-top: 10px; background: none; border: 0; color: #a33; cursor: pointer; text-decoration: underline; }
</style>
