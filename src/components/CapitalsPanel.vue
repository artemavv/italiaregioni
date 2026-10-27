<script setup>
import { REGIONS } from '../data/regions.js'
import { CAPITALS } from '../data/capitals.js'

defineProps({ done: Object })
</script>

<template>
  <section class="panel">
    <table>
      <thead>
        <tr><th>Regione</th><th>Capoluogo</th><th>Sigla</th><th>Ricordato</th></tr>
      </thead>
      <tbody>
        <tr v-for="r in REGIONS" :key="r.id" :class="{ done: done[r.id] }">
          <td>{{ r.name }}</td>
          <td>{{ CAPITALS[r.name].city }}</td>
          <td>{{ CAPITALS[r.name].code }}</td>
          <td><input type="checkbox" v-model="done[r.id]" :aria-label="'Ricordato: ' + CAPITALS[r.name].city" /></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.panel { width: 100%; max-width: 520px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #ddd; }
td:nth-child(n+3), th:nth-child(n+3) { text-align: center; }
tr.done td:nth-child(2) { text-decoration: line-through; color: #888; }
</style>
