# DARK SKY — Comms VO Script

All spoken/intercepted comms lines extracted from `index.html`, grouped by speaker
(= one ElevenLabs voice per speaker). Production asset, not part of the shipped game.

- **tone** `sig` = THE SIGNAL (alien, processed/eerie) · `mil` = military radio intercept (bandpass + distortion to taste)
- **id** suggested stable filename stem (e.g. `signal-01.mp3`)
- Templated/dynamic lines are expanded into their concrete utterances.
- Source locations are `index.html` line numbers at time of extraction (2026-06-13).

Totals: 13 voices, ~48 unique utterances (~2.8k characters → trivial generation cost).

---

## SIGNAL  ·  tone `sig`  ·  the alien — the one voice that must NOT sound human
Casting: unsettling, intimate, slightly processed. The game already underscores these with a low sine tone.

| id | line | trigger |
|----|------|---------|
| signal-01 | WE SEE YOU. THEY HAVE ALWAYS SEEN YOU. | game start (L784) |
| signal-02 | YOU WOKE A CENTURY FROM THE DOOR. SURVIVE. | M1 CALIBRATION intro (L700) |
| signal-03 | GOOD. THEY BREAK LIKE ANYTHING ELSE. SLEEP NOW — WAKE FORWARD. | M1 done (L703) |
| signal-04 | 1917. PIECES OF US FELL INTO THE MUD OF THEIR WAR. GATHER THEM. | M2 RESONANCE intro (L706) |
| signal-05 | FRAGMENT 1 OF 3. MORE. | M2 fragment 1 collected (L968) |
| signal-06 | FRAGMENT 2 OF 3. MORE. | M2 fragment 2 collected (L968) |
| signal-07 | THE LAST PIECE. | M2 final fragment (L968) |
| signal-08 | ALMOST WHOLE. FORWARD AGAIN. | M2 done (L708) |
| signal-09 | 1942. THEY HAVE BUILT EYES OF IRON ALONG THE COAST. PUT THEM OUT. | M3 BLIND THE NET intro (L711) |
| signal-10 | NOW THEY HUNT BLIND. | M3 done (L714) |
| signal-11 | 1945. A SHIP CARRIES WHAT THEY PULLED FROM THE SEA. THE WATER REMEMBERS. | M4 SINK THE PICKET intro (L717) |
| signal-12 | RETRIEVED. | M4 done (L720) |
| signal-13 | 1947. ONE OF US FELL HERE AND DID NOT WAKE. STAND OVER THE SAND. CALL TO IT. | M5 CRASH SITE intro (L723) |
| signal-14 | IT HEARS US NOW. TWO STOPS REMAIN. | M5 done (L725) |
| signal-15 | THEIR BURIED SUNS SLEEP TONIGHT. EVERYTHING THEY HAVE IS COMING. ENDURE. | M6 THE SILOS intro (L729) |
| signal-16 | STILL HERE. THEY ARE AFRAID NOW. ONE HUNTER LEFT. | M6 done (L730) |
| signal-17 | THE HUNTER OF HUNTERS. HE WILL NOT MISS TWICE. | M7 THE NIMITZ intro (L735) |
| signal-18 | 2026. A CENTURY OF RUNNING ENDS TONIGHT. THE SKY IS OPEN. | M8 ASCENSION intro (L739) |
| signal-19 | DO NOT FALL HERE. NOT THIS CLOSE. | hull < 25% (L1246) |
| signal-20 | DEATH IS A DOOR WE DO NOT USE. AGAIN. | checkpoint resume (L805) |
| signal-21 | ...YOU STAYED. | win → endless continue (L2402) |

---

## WAR DEPT  ·  tone `mil`  ·  early-era command (1908–pre-WWII)
| id | line | trigger |
|----|------|---------|
| wardept-01 | CAMERA CREW REPORTS THE OBJECT IS MOVING. FILM EVERYTHING. | game start (L783) |
| wardept-02 | DISPATCH AEROPLANES AND GUNS. BRING IT DOWN. | M1 CALIBRATION (L702) |
| wardept-03 | AERIAL SURVEY PLATES REQUESTED. STAND BY. | satellite feed engaged, early era (L511) |
| wardept-04 | IMAGERY UNAVAILABLE. CHARTS HOLD. | sat feed failed, early era (L519) — same text as overlord-06 |

## SIGNAL CORPS  ·  tone `mil`
| id | line | trigger |
|----|------|---------|
| sigcorps-01 | AIRSHIP SIGHTED OVER THE COAST. NOT ONE OF OURS. | M1 CALIBRATION (L701) |

## R.F.C. PILOT  ·  tone `mil`  ·  WWI British flyer
| id | line | trigger |
|----|------|---------|
| rfc-01 | THE THING OVER THE LINES — IT IS BACK. SAME ONE, I SWEAR IT. | M2 RESONANCE (L707) |

## CHAIN HOME  ·  tone `mil`  ·  WWII British radar
| id | line | trigger |
|----|------|---------|
| chainhome-01 | UNIDENTIFIED ECHO, NO IFF, SPEED IMPOSSIBLE. SCRAMBLE ALL SECTORS. | M3 BLIND THE NET (L712) |
| chainhome-02 | WE ARE BLIND. THE WHOLE EASTERN PICTURE IS GONE. | M3 done (L713) |

## USS DEFIANT  ·  tone `mil`  ·  1945 picket destroyer
| id | line | trigger |
|----|------|---------|
| defiant-01 | THIS IS THE PICKET. AIR ACTION STARBOARD — IT IS NOT A ZERO. | M4 SINK THE PICKET (L718) |
| defiant-02 | MAYDAY MAYDAY MAYDAY — DEFIANT IS | M4 done; line cuts off mid-word, keep the abrupt end (L719) |

## 509TH OPS  ·  tone `mil`  ·  Roswell, 1947
| id | line | trigger |
|----|------|---------|
| ops509-01 | ALL UNITS TO THE RANCH. NOTHING LEAVES. NOTHING IS SAID. | M5 CRASH SITE (L724) |

## NORAD  ·  tone `mil`  ·  1967
| id | line | trigger |
|----|------|---------|
| norad-01 | 1967. BIRDS IN THE FIELDS ARE GOING DARK ONE BY ONE. THIS IS NOT A DRILL. | M6 THE SILOS (L728) |

## PRINCETON  ·  tone `mil`  ·  2004 Nimitz, USS Princeton controller
| id | line | trigger |
|----|------|---------|
| princeton-01 | 2004. FASTEAGLE FLIGHT, PICTURE: SINGLE CONTACT, CAP POINT — MERGED PLOT. | M7 THE NIMITZ (L733) |
| princeton-02 | ...FASTEAGLE, PRINCETON. RESPOND. FASTEAGLE? | M7 done (L736) |

## FASTEAGLE  ·  tone `mil`  ·  Cmdr. Fravor, the boss pilot
| id | line | trigger |
|----|------|---------|
| fasteagle-01 | FIGHT IS ON. I HAVE BEEN WAITING MY WHOLE CAREER FOR YOU. | M7 boss engage (L734) |

## OVERLORD  ·  tone `mil`  ·  modern joint command (later eras + sat feed)
| id | line | trigger |
|----|------|---------|
| overlord-01 | ALL UNITS — A HUNDRED YEARS OF TAPE SAYS IT MUST NOT REACH THAT STORM CELL. | M8 ASCENSION (L740) |
| overlord-02 | TRACK REACQUIRED. ALL UNITS, RESUME. | win → endless continue (L2403) |
| overlord-03 | RETASKING NATIONAL ASSETS. OVERHEAD IMAGERY INBOUND. | satellite feed engaged, later era (L511) |
| overlord-04 | SAT FEED LIVE — GROOM LAKE, NV. | sat feed acquired (L517) |
| overlord-05a | SAT FEED LIVE — TONOPAH TEST RANGE, NV. | sat feed acquired (L517) |
| overlord-05b | SAT FEED LIVE — CHINA LAKE NAWS, CA. | sat feed acquired (L517) |
| overlord-05c | SAT FEED LIVE — EDWARDS AFB, CA. | sat feed acquired (L517) |
| overlord-05d | SAT FEED LIVE — WHITE SANDS, NM. | sat feed acquired (L517) |
| overlord-05e | SAT FEED LIVE — DUGWAY PROVING GROUND, UT. | sat feed acquired (L517) |
| overlord-05f | SAT FEED LIVE — WRIGHT-PATTERSON AFB, OH. | sat feed acquired (L517) |
| overlord-06 | IMAGERY UNAVAILABLE. CHARTS HOLD. | sat feed failed, later era (L519) — same text as wardept-04 |

## LINK  ·  tone `mil`  ·  system/telemetry voice (not a character)
| id | line | trigger |
|----|------|---------|
| link-01 | MANUAL CONTROL CONFIRMED. | gamepad connected (L431) |

---

## Notes for generation

- **`SAT FEED LIVE — {site}`** is a template (`L517`); the 7 rows above are its full expansion across `SAT.sites`. Skip the per-site VO and keep these as synth/text-only if you'd rather not voice place-names.
- **`IMAGERY UNAVAILABLE. CHARTS HOLD.`** is spoken by WAR DEPT (early eras) or OVERLORD (later) — listed under both. Generate once per voice, or pick one.
- **`defiant-02`** intentionally cuts off mid-sentence ("...DEFIANT IS") — preserve the hard stop; do not let the model complete it.
- **`signal-05/06`** are the only true counter-variants ("FRAGMENT n OF 3"); n only ever reaches 1 and 2 before `signal-07` ("THE LAST PIECE"), since that tasking needs 3.
- Em-dashes in the source are real `—` (U+2014); rendered as such here.
- Playback hook lives in `Comms.push()` (index.html ~L328), right where the synth blip fires today — map `id → audio`, key on `{spk, txt}` or a stable per-line id you add to the data.
