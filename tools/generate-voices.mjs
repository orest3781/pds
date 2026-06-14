#!/usr/bin/env node
// DARK SKY — voice-over generator (v2: caching · per-line control · pronunciation).
//
// Calls ElevenLabs once per comms line and writes ../voices.js as { voiceKey: dataURI }.
// The game (AudioSys.playVoice) looks clips up by the SAME voiceKey, so a line plays VO if
// its clip exists and silently falls back to the synth cue if it doesn't.
//
// Caching: clips are cached in tools/.voice-cache.json keyed by a fingerprint of
// (voice id + model + settings + the SPOKEN text). Re-runs only call the API for lines
// whose fingerprint changed — so tweaking one voice costs one clip, not 48.
//
// Usage:
//   export ELEVENLABS_API_KEY=sk_...        (or: node --env-file=.env ...)
//   node tools/generate-voices.mjs list     → list your voices + IDs
//   node tools/generate-voices.mjs           → generate (cached)
//   node tools/generate-voices.mjs --force   → ignore cache, regenerate everything

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) { console.error('Set ELEVENLABS_API_KEY first.'); process.exit(1); }
const HERE = dirname(fileURLToPath(import.meta.url));
const FORCE = process.argv.includes('--force');

// MUST stay byte-identical to AudioSys.voiceKey() in index.html (djb2 over "spk|txt").
function voiceKey(spk, txt) { const s = spk + '|' + txt; let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }

// ── Per-speaker voice. id:'' = skip. Override model/settings per speaker here, or per line below. ──
// multilingual_v2 = high quality (use everywhere to avoid the "robotic" flash sound).
// Settings: stability (lower = more variation/emotion), similarity_boost, style (0-1, expressive),
// use_speaker_boost, speed (0.7 slow … 1.2 fast). Tune freely — caching makes re-runs cheap.
const VOICES = {
  'SIGNAL':       { id: 'nPczCjzI2devNBz1zQrb', model: 'eleven_multilingual_v2', settings: { stability: 0.45, similarity_boost: 0.80, style: 0.25, use_speaker_boost: true, speed: 0.88 } }, // Brian — deep; eerie once processed
  'WAR DEPT':     { id: 'pNInz6obpgDQGcFmaJgB', model: 'eleven_multilingual_v2', settings: { stability: 0.55, similarity_boost: 0.75 } }, // Adam
  'SIGNAL CORPS': { id: 'pNInz6obpgDQGcFmaJgB', model: 'eleven_multilingual_v2', settings: { stability: 0.55, similarity_boost: 0.75 } }, // Adam
  'R.F.C. PILOT': { id: 'JBFqnCBsd6RMkjVDRZzb', model: 'eleven_multilingual_v2', settings: { stability: 0.45, similarity_boost: 0.75, style: 0.30 } }, // George — British
  'CHAIN HOME':   { id: 'onwK4e9ZLuTAKqWW03F9', model: 'eleven_multilingual_v2', settings: { stability: 0.45, similarity_boost: 0.75, style: 0.35 } }, // Daniel — British
  'USS DEFIANT':  { id: 'pNInz6obpgDQGcFmaJgB', model: 'eleven_multilingual_v2', settings: { stability: 0.30, similarity_boost: 0.75, style: 0.45 } }, // Adam — panicked mayday
  '509TH OPS':    { id: 'pNInz6obpgDQGcFmaJgB', model: 'eleven_multilingual_v2', settings: { stability: 0.55, similarity_boost: 0.75 } }, // Adam
  'NORAD':        { id: 'pqHfZKP75CvOlQylNhV4', model: 'eleven_multilingual_v2', settings: { stability: 0.55, similarity_boost: 0.75 } }, // Bill
  'PRINCETON':    { id: 'cjVigY5qzO86Huf0OWal', model: 'eleven_multilingual_v2', settings: { stability: 0.55, similarity_boost: 0.75 } }, // Eric
  'FASTEAGLE':    { id: 'IKne3meq5aSn9XLyUdCD', model: 'eleven_multilingual_v2', settings: { stability: 0.40, similarity_boost: 0.75, style: 0.40 } }, // Charlie — cocky ace
  'OVERLORD':     { id: 'pqHfZKP75CvOlQylNhV4', model: 'eleven_multilingual_v2', settings: { stability: 0.55, similarity_boost: 0.75 } }, // Bill
  'LINK':         { id: 'SAz9YHcvj6GT2YYXdXww', model: 'eleven_multilingual_v2', settings: { stability: 0.70, similarity_boost: 0.70 } }, // River — flat system voice
};

// ── Pronunciation: applied to the SPOKEN text only (the lookup key still uses the original). ──
// Fix acronyms read as words and force era-defining years to spoken form.
const PRONOUNCE = [
  ['IFF', 'I.F.F.'],
  ['1908', 'nineteen-oh-eight'], ['1917', 'nineteen seventeen'], ['1942', 'nineteen forty-two'],
  ['1945', 'nineteen forty-five'], ['1947', 'nineteen forty-seven'], ['1967', 'nineteen sixty-seven'],
  ['2004', 'two thousand four'], ['2026', 'twenty twenty-six'],
];
const speak = txt => PRONOUNCE.reduce((s, [a, b]) => s.split(a).join(b), txt);

// ── Lines, EXACTLY as the game passes them (em-dashes are U+2014). ──
// Optional 3rd element overrides this line: { say, id, model, settings } — e.g. a custom spoken
// form, or a different voice/setting for one dramatic line. `say` bypasses PRONOUNCE.
const SAT_SITES = ['GROOM LAKE, NV','TONOPAH TEST RANGE, NV','CHINA LAKE NAWS, CA','EDWARDS AFB, CA',
                   'WHITE SANDS, NM','DUGWAY PROVING GROUND, UT','WRIGHT-PATTERSON AFB, OH'];
const LINES = [
  ['SIGNAL','WE SEE YOU. THEY HAVE ALWAYS SEEN YOU.'],
  ['SIGNAL','YOU WOKE A CENTURY FROM THE DOOR. SURVIVE.'],
  ['SIGNAL','GOOD. THEY BREAK LIKE ANYTHING ELSE. SLEEP NOW — WAKE FORWARD.'],
  ['SIGNAL','1917. PIECES OF US FELL INTO THE MUD OF THEIR WAR. GATHER THEM.'],
  ['SIGNAL','FRAGMENT 1 OF 3. MORE.'],
  ['SIGNAL','FRAGMENT 2 OF 3. MORE.'],
  ['SIGNAL','THE LAST PIECE.'],
  ['SIGNAL','ALMOST WHOLE. FORWARD AGAIN.'],
  ['SIGNAL','1942. THEY HAVE BUILT EYES OF IRON ALONG THE COAST. PUT THEM OUT.'],
  ['SIGNAL','NOW THEY HUNT BLIND.'],
  ['SIGNAL','1945. A SHIP CARRIES WHAT THEY PULLED FROM THE SEA. THE WATER REMEMBERS.'],
  ['SIGNAL','RETRIEVED.'],
  ['SIGNAL','1947. ONE OF US FELL HERE AND DID NOT WAKE. STAND OVER THE SAND. CALL TO IT.'],
  ['SIGNAL','IT HEARS US NOW. TWO STOPS REMAIN.'],
  ['SIGNAL','THEIR BURIED SUNS SLEEP TONIGHT. EVERYTHING THEY HAVE IS COMING. ENDURE.'],
  ['SIGNAL','STILL HERE. THEY ARE AFRAID NOW. ONE HUNTER LEFT.'],
  ['SIGNAL','THE HUNTER OF HUNTERS. HE WILL NOT MISS TWICE.'],
  ['SIGNAL','2026. A CENTURY OF RUNNING ENDS TONIGHT. THE SKY IS OPEN.'],
  ['SIGNAL','DO NOT FALL HERE. NOT THIS CLOSE.'],
  ['SIGNAL','DEATH IS A DOOR WE DO NOT USE. AGAIN.'],
  ['SIGNAL','...YOU STAYED.'],
  ['WAR DEPT','CAMERA CREW REPORTS THE OBJECT IS MOVING. FILM EVERYTHING.'],
  ['WAR DEPT','DISPATCH AEROPLANES AND GUNS. BRING IT DOWN.'],
  ['WAR DEPT','AERIAL SURVEY PLATES REQUESTED. STAND BY.'],
  ['WAR DEPT','IMAGERY UNAVAILABLE. CHARTS HOLD.'],
  ['SIGNAL CORPS','AIRSHIP SIGHTED OVER THE COAST. NOT ONE OF OURS.'],
  ['R.F.C. PILOT','THE THING OVER THE LINES — IT IS BACK. SAME ONE, I SWEAR IT.'],
  ['CHAIN HOME','UNIDENTIFIED ECHO, NO IFF, SPEED IMPOSSIBLE. SCRAMBLE ALL SECTORS.'],
  ['CHAIN HOME','WE ARE BLIND. THE WHOLE EASTERN PICTURE IS GONE.'],
  ['USS DEFIANT','THIS IS THE PICKET. AIR ACTION STARBOARD — IT IS NOT A ZERO.'],
  ['USS DEFIANT','MAYDAY MAYDAY MAYDAY — DEFIANT IS'],
  ['509TH OPS','ALL UNITS TO THE RANCH. NOTHING LEAVES. NOTHING IS SAID.'],
  ['NORAD','1967. BIRDS IN THE FIELDS ARE GOING DARK ONE BY ONE. THIS IS NOT A DRILL.'],
  ['PRINCETON','2004. FASTEAGLE FLIGHT, PICTURE: SINGLE CONTACT, CAP POINT — MERGED PLOT.'],
  ['PRINCETON','...FASTEAGLE, PRINCETON. RESPOND. FASTEAGLE?'],
  ['FASTEAGLE','FIGHT IS ON. I HAVE BEEN WAITING MY WHOLE CAREER FOR YOU.'],
  ['OVERLORD','ALL UNITS — A HUNDRED YEARS OF TAPE SAYS IT MUST NOT REACH THAT STORM CELL.'],
  ['OVERLORD','TRACK REACQUIRED. ALL UNITS, RESUME.'],
  ['OVERLORD','RETASKING NATIONAL ASSETS. OVERHEAD IMAGERY INBOUND.'],
  ['OVERLORD','IMAGERY UNAVAILABLE. CHARTS HOLD.'],
  ['LINK','MANUAL CONTROL CONFIRMED.'],
  ...SAT_SITES.map(s => ['OVERLORD', 'SAT FEED LIVE — ' + s + '.']),
];

function fingerprint(id, model, settings, spoken) {
  const s = [id, model, JSON.stringify(settings || {}), spoken].join('');
  let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36);
}

async function synth(text, voice) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.id}`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: voice.model || 'eleven_multilingual_v2',
      voice_settings: voice.settings || { stability: 0.5, similarity_boost: 0.75 } }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 160)}`);
  return 'data:audio/mpeg;base64,' + Buffer.from(await res.arrayBuffer()).toString('base64');
}

async function generate() {
  const cachePath = join(HERE, '.voice-cache.json');
  const cache = (!FORCE && existsSync(cachePath)) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};
  const out = {};
  let made = 0, cached = 0, skipped = 0, failed = 0;
  for (const [spk, txt, over = {}] of LINES) {
    const base = VOICES[spk];
    if (!base || !base.id) { skipped++; continue; }
    const voice = { id: over.id || base.id, model: over.model || base.model,
                    settings: over.settings || base.settings };
    const spoken = over.say != null ? over.say : speak(txt);
    const key = voiceKey(spk, txt);
    const fp = fingerprint(voice.id, voice.model, voice.settings, spoken);
    if (cache[key] && cache[key].fp === fp) { out[key] = cache[key].data; cached++; continue; }
    try {
      const data = await synth(spoken, voice);
      out[key] = data; cache[key] = { fp, data }; made++;
      console.log(`  ✓ [${spk}] ${txt.slice(0, 46)}${txt.length > 46 ? '…' : ''}`);
      await new Promise(r => setTimeout(r, 250));
    } catch (e) { failed++; console.error(`  ✗ [${spk}] ${txt.slice(0, 40)} — ${e.message}`); }
  }
  writeFileSync(cachePath, JSON.stringify(cache));
  writeFileSync(join(HERE, '..', 'voices.js'),
    '// Generated by tools/generate-voices.mjs — do not edit by hand.\n' +
    'window.VOICES = ' + JSON.stringify(out) + ';\n');
  console.log(`\nvoices.js: ${made} new, ${cached} cached, ${skipped} unset, ${failed} failed (${Object.keys(out).length} total).`);
}

// ── dispatch (after all definitions so const LINES/VOICES are initialized) ──
async function listVoices() {
  const r = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': API_KEY } });
  if (!r.ok) { console.error(`${r.status} ${await r.text()}`); process.exitCode = 1; return; }
  const { voices } = await r.json();
  console.log(`\n${voices.length} voice(s) in your account:\n`);
  for (const v of voices) console.log(`  ${v.voice_id}   ${v.name}  (${v.category || 'custom'})`);
}
if (process.argv[2] === 'list') await listVoices();
else await generate();
