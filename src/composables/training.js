export const RUN_LENGTH = 5

// Picks up to `count` distinct region ids that are not completed.
export function pickTargets(regions, completedIds, count = RUN_LENGTH, rng = Math.random) {
  const pool = regions.filter((r) => !completedIds.has(r.id)).map((r) => r.id)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count)
}

// Lowercase, strip accents, apostrophes, hyphens and extra spaces.
export const normalizeName = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’`\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const isNameMatch = (answer, name) => normalizeName(answer) === normalizeName(name)
