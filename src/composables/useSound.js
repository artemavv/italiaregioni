import { ref, watch } from 'vue'

const KEY = 'italia-regioni-sound-v1'

// Sounds are synthesized with the Web Audio API, so no audio files are needed.
// Each note: [frequency Hz, start offset s, duration s]
const SOUNDS = {
  correct: { type: 'sine', notes: [[660, 0, 0.12], [880, 0.1, 0.22]] },
  click: { type: 'sine', gain: 0.06, notes: [[1200, 0, 0.04]] },
  wrong: { type: 'sawtooth', notes: [[220, 0, 0.18], [165, 0.16, 0.3]] },
}

function load() {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

export function useSound() {
  const enabled = ref(load())
  let ctx = null

  watch(enabled, (on) => {
    try {
      localStorage.setItem(KEY, on ? 'on' : 'off')
    } catch {
      /* storage unavailable - keep the setting for this session only */
    }
  })

  function play(name) {
    const sound = SOUNDS[name]
    if (!enabled.value || !sound) return
    try {
      ctx ??= new (window.AudioContext || window.webkitAudioContext)()
      if (ctx.state === 'suspended') ctx.resume()
      const t0 = ctx.currentTime
      for (const [freq, offset, dur] of sound.notes) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = sound.type
        osc.frequency.value = freq
        const start = t0 + offset
        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.exponentialRampToValueAtTime(sound.gain ?? 0.2, start + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
        osc.connect(gain).connect(ctx.destination)
        osc.start(start)
        osc.stop(start + dur + 0.02)
      }
    } catch {
      /* audio not available - stay silent */
    }
  }

  return { enabled, play }
}
