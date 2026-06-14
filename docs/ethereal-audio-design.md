# DARK SKY — Ethereal Audio Design (NMS-inspired)

**Date:** 2026-06-13
**Status:** approved design, pre-implementation
**Constraint:** 100% procedural Web Audio. No assets, no deps, stays in the single `index.html`.
**Character:** eerie / unsettling (the SIGNAL is a predator) — NOT warm/wondrous.
**Hard rule:** combat stays dry. Reverb must not muddy a bullet-hell with constant auto-fire.

---

## Goal

Give the whole game an ethereal, reverberant, evolving soundscape in the spirit of No Man's Sky's
generative ambience — but tuned eerie rather than serene — while keeping combat readability intact
and preserving the project's "no dependencies, one file" identity.

Five parts, one system: reverb bus · evolving pad bed · era-reactive mood · radio station-change
sweep on era transitions · ethereal SIGNAL voice. All existing SFX gain space for free via the bus.

## Architecture — reverb send bus

Today every source connects straight to `master` (dry). Insert a parallel send:

```
sources → bus ─┬─ dryGain  ─────────────────────→ master → destination
               └─ wetGain → convolver(IR) → verbReturn → master
```

- **Procedural impulse response:** noise buffer (stereo) shaped by an exponential decay envelope,
  low-passed so the tail is dark, not bright. `ConvolverNode.buffer = IR`. ~+0 KB.
  Decay: **2.8 s desktop / 1.8 s mobile** (mobile = `MOBILE` flag already in code).
- `tone()` / `noise()` gain a `send` arg (0–1 reverb amount); they connect to `bus` (→dry) and,
  scaled by `send`, to `wetGain`. Default `send` per call site (see Wet-send table).
- Master gain and mute (`M`) unchanged — they sit downstream of the whole graph.

## Part 1 — Evolving pad bed (replaces the flat hum)

Current bed: one 52 Hz sine + lowpassed noise. Replace with a tense, drifting drone:

| Voice | Start freq | Role |
|-------|-----------|------|
| sub drone | ~46 Hz sine | unease, body |
| octave | ~92 Hz sine | reinforcement |
| tritone | ~65 Hz (root×√2) triangle | the dissonance that reads "wrong" |
| frail partial | ~1600 Hz sine, very low gain, slow drift | the eerie high shimmer |

- Each voice has an independent slow **LFO (0.05–0.13 Hz)** on gain + a few-cents detune →
  inharmonic beating (the "alive, wrong" quality).
- Slow lowpass sweep on the bed (cutoff ~600 Hz drifting ±200) keeps timbre evolving.
- Heavy reverb send (`~.55`). Quiet overall — a bed, not a melody.
- Every ~20–30 s, re-seed LFO phases so it never loops audibly (generative drift).

## Part 2 — Era-reactive mood

`Game.eraI` (0→7) drives pad params via `AudioSys.setEra(eraI)`, ramped ~2–3 s:

| Eras (grp) | Character | Params |
|------------|-----------|--------|
| 1908–WWI (0–1) | haunted, sparse, lonely | thin (drop octave voice), dark filter, +hiss, longest reverb |
| mid (2) | fuller, tense | all voices in, moderate filter |
| FLIR / door (3–4) | cosmic dread | brighter filter, add a second high partial, more LFO depth |

Root pitch transposes slightly down for early eras (heavier), up for late (colder).

## Part 3 — Radio station-change sweep (era transitions)

On era slip, `AudioSys.tune()` (~1.2 s):
- Bandpass-noise whoosh, center freq sweeping 200→4000 Hz ("across the dial").
- 2–3 brief carrier "stations" bleed through (short sine blips at random freqs) + static crackle.
- Ducks the pad, then `setEra()` fades the new mood in behind it.
- Hooks the existing `slipped` branch in `Game.startMission()` (index.html ~L907), replacing the
  current bare `AudioSys.phase()`.

## Part 4 — Ethereal SIGNAL voice

- `AudioSys.playVoice(buffer, {ethereal:true})` chain for the future ElevenLabs files:
  dry voice + detuned double (±~8 cents) + octave-up shimmer (low gain) + heavy reverb send +
  slow tremolo. The alien never sounds "in the room."
- Until VO exists: upgrade the SIGNAL comms cue (Comms.push, index.html ~L330) from a single tone
  to a short reverberant minor chord-swell, so the presence already reads otherworldly.

## Part 5 — All SFX gain space (combat excepted)

Routing through the bus gives tails for free. Wet-send per category:

| Sounds | send | rationale |
|--------|------|-----------|
| pad bed | .55 | the space itself |
| SIGNAL comms cue | .5 | otherworldly |
| pickup, level, phase, lock | .3 | shimmer / reward |
| comms blip (mil) | .12 | light room |
| **shoot, zap, hit, hurt, boom, dash, alarm** | **0–.08** | **near-dry — clarity is sacred** |

## Risks & mitigations

1. **Combat mud (primary risk).** Constant auto-fire × reverb = wash that hurts Response/clarity.
   → weapons/hits near-dry (table above); dry transients always dominant.
2. **Mobile perf / CPU.** Convolver + ~6 pad oscillators + LFOs. → shorter IR on mobile; pad voice
   count already lower in early eras; all oscillators are cheap. Verify no frame drop on 390px.
3. **Autoplay policy.** AudioContext must resume on user gesture — already handled (`AudioSys.init`
   fires from the START button click). Pad starts at init; fine.
4. **Mute.** Must silence everything including pad + reverb tails → all downstream of `master`. ✓

## Integration points (index.html)

- `AudioSys.init()` — build bus, IR, convolver, pad voices, hiss; start pad.
- New methods: `setEra(eraI)`, `tune()`, `playVoice(buf,opts)`, ethereal signal cue helper.
- `tone()` / `noise()` — add `send` param, route via bus.
- `Game.start()` / resume — initial `setEra(this.eraI)`.
- `Game.startMission()` slipped branch (~L907) — `AudioSys.tune()` then `setEra()`.
- `Comms.push()` sig branch (~L330) — ethereal signal cue.

## Test plan

- Menu/start: eerie drifting pad audible, quiet, no console errors.
- Force/play an era change → radio sweep fires, mood shifts character (audibly different bed).
- Heavy fight: weapons/hits stay crisp and dry; pickups/level shimmer.
- Mobile 390px viewport: no frame drop; verify graph built (introspect node count, convolver present).
- `M` mute silences pad, reverb, and SFX.
- Note: tonal QA is partly by ear (user) — automated checks confirm graph wiring + no errors + params
  changing on era transition, not subjective "does it sound eerie."
