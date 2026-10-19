import { MAP_PATHS } from './mapPaths.js'

export const REGIONS = MAP_PATHS.map(({ id, name }) => ({ id, name }))
  .sort((a, b) => a.name.localeCompare(b.name, 'it'))

export const regionName = (id) => REGIONS.find((r) => r.id === id)?.name ?? ''
