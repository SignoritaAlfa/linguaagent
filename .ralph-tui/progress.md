# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- **Per-language config maps**: `index.html` holds plain JS object maps keyed by language code (`EN`/`FR`/`IT`/`NO`...), e.g. `EL_VOICES` (~line 630). Adding a language = append a new keyed block matching the existing shape. Same pattern likely repeats for `FILMS`, `LANGS`, `LANG_BCP`, `ACCENT_CHARS`.
- **JS lives inline in `index.html`** inside a `<script>` block. Validate with: `awk '/<script>/{p=1;next} /<\/script>/{p=0} p' index.html > /tmp/lingua.js && node --check /tmp/lingua.js`.
- **Per-language grammar rules are DUPLICATED across ~6 prompt strings + 1 bulk-fix function.** The noun-article / verb-infinitive instruction ("FR: le/la...; IT: ...; DE: ...") appears in 3+ surface forms: `le/la/un/une`, full `le/la/l'/un/une`, and Polish names `francuski:/włoski:/niemiecki:`. Extending grammar to a new language = (1) grep all three forms and update every prompt, (2) extend `fixVocabArticles`/`vocabItemNeedsFix` (~2321): add a `<LANG>_ARTICLE_RE` const, a branch in `vocabItemNeedsFix`, the `lang !==` guard, a candidate-skip + verb heuristic, and `langName`/`articleHint`, (3) un-gate the "🔧 Popraw rodzajniki AI" button (~4244).
- **`FILMS` (Filmoteka) is a per-language map at ~line 662** keyed by lang code (`EN`/`FR`/`IT`/`NO`...), closed by `};`. Each film: `{ id, title, type, level, platform, desc, clips:[{ id, episode, title, level, topic, desc, ytSearch }] }`. `type` only drives a binary badge — `series.type==="film" ? "🎞 Film" : "📺 Serial"` (lines ~6498, ~6608); any other value renders as Serial. Add a language = append a `<LANG>: [ ... ],` block before the closing `};`. FR-style immersion (desc/topic in target language) is the convention to copy for new langs; EN/IT use Polish topic/desc.
- **Built-in lessons live in `const COURSE={...}` (~line 1319)** — a per-language map keyed by lang code (`EN`/`FR`/`IT`/`NO`...), closed by `};` (IT array closed at ~1485 before this story, COURSE end at ~1486). Each lesson: `{ id, title (target lang), level, topic (Polish), type:"dialog", dialog:[{s,l,t}], vocab:[{w,tr,ipa,pl,ex,exT}], fill:[{s,a,h}], grammar:[{rule,ex,exT,note}] }`. `s`=speaker, `l`=line (target), `t`=translation; vocab `w`=word w/article, `tr`=translation, `ipa`=IPA, `pl`=Polish phonetics, `ex`/`exT`=example+translation; fill `s`=sentence w/`___`, `a`=answer, `h`=hint. Add a language = change IT's closing `  ]` to `  ],` and append a `<LANG>:[ ... ]` block before `};`. **`grep -c 'id:"no'` is polluted by FILMS clip ids `nor1/nor2/nor3` (Norsemen) — it counts both lesson ids and those clips.**

---

## 2026-05-27 - US-005b
- Appended 4 lessons (A2-B1) to the existing `NO:[...]` array in `const COURSE` (~line 1579, after no3's grammar close, before `  ]\n};`): no4 "Hvor er…?" (A2, pytanie o drogę — Lars), no5 "På restaurant" (A2, zamawianie jedzenia — Servitør), no6 "Reise" (A2-B1, podróż — Ingrid), no7 "Vær og tid" (A2, pogoda i czas — Per).
- Each lesson: `type:"dialog"`, 8 dialog turns (Aleksandra + a Norwegian interlocutor), 8 vocab, 4 fill, 3 grammar. Same shape as US-005a. Content authentic bokmål: directions imperatives (gå/ta til høyre/venstre), restaurant register (Jeg tar…, Vil dere ha…), travel skal-future + preteritum (bestilte/kjøpte), weather impersonal "det" + clock (kvart over ti) + "om" (za ile czasu).
- Vocab nouns carry en/ei/et articles (en togstasjon, et lyskryss, en billett, et regntøy, et vær, en grad, en avtale); verbs as å-infinitives (å gå seg vill, å anbefale, å glede seg, å huske, å regne, å blåse, å skynde seg). Reflexives kept reflexive (å gå seg vill, å glede seg, å skynde seg, å sette seg → sett dere).
- Files changed: `index.html` (+93 lines), `.ralph-tui/progress.md`. Backup at `/tmp/lingua-NO-US5b-0920.html`.
- **Learnings:**
  - Anchor for appending to the NO lesson array is the same shape as US-005a's COURSE close: no3's last grammar `]}` + `  ]` + `};` is unique (only the last lesson is followed by array-close + object-close). Changed `]}` → `]},` and inserted before `  ]`.
  - `grep -c 'id:"no'` now returns 10 (7 lessons no1-no7 + 3 `nor1/nor2/nor3` Norsemen film clips from US-004b) — still pollluted as noted, so the AC "≥7" passes but the literal count over-reports. Clean lesson count: `grep -o 'id:"no[0-9]"'` = 7.
  - Lesson `level` field accepts ranges ("A2-B1") freely — same as FILMS, no enum/validation; no7/no6 use it without issue.

---

## 2026-05-27 - US-005a
- Added `NO:[...]` block to `const COURSE={...}` (~line 1486, after IT array closes, before `};`) with 3 built-in A1 lessons: no1 "På kafé" (zamawianie kawy), no2 "Å presentere seg" (przedstawianie się), no3 "På butikken" (zakupy).
- Each lesson: `type:"dialog"`, 8 dialog turns (Aleksandra + a Norwegian: Kari/Ola/Astrid), 7-8 vocab entries, 3-4 fill exercises, 3 grammar rules. Content authentically Norwegian bokmål (kanelboller, kroner, "Vær så god", V2 word order) — not a 1:1 FR translation.
- Vocab nouns always carry an article (`en kaffe`, `et brød`, `et smør`, `en kanelbolle`); verbs given as å-infinitives (`å bestille`, `å bo`, `å snakke`, `å lete etter`, `å trenge`). Each vocab entry has w/tr/ipa(bokmål)/pl(Polish phonetics)/ex/exT.
- Files changed: `index.html` (+93 lines), `.ralph-tui/progress.md`. Backup at `/tmp/lingua-NO-US5a-*.html`.
- **Learnings:**
  - The lessons map is `const COURSE` (not `LESSONS`) — `grep -n LESSONS` returns nothing; find it via `grep -n 'const COURSE'`. EN uses 3-space indent (`   EN:[`), so a `^  [A-Z]+:\[` awk pattern misses it.
  - AC check `grep -c 'id:"no'` returns 6, not 3 — `nor1/nor2/nor3` (Norsemen film clips from US-004b) also match. Lesson-only count via `grep -c 'id:"no[123]"'` = 3.
  - The insertion anchor is the same shape as FILMS: IT (the last lang) ends with `     ]}` + `  ]` + `};`; changed `  ]` → `  ],` and inserted the NO block. No other COURSE close uses `  ]\n};`.
  - `å` doubles as the infinitive marker in vocab `w` fields (parallel to the bulk-fix verb heuristic from US-003); kept dialog noun phrases natural (used "her borte" instead of an awkward "et smør" mid-dialog) while keeping articles in vocab.

---

## 2026-05-27 - US-004b
- Appended 7 more NO films (B2-C1) to the existing `NO: [...]` array in `FILMS` (~line 1196, after `lilyhammer` closes, before `  ],`): Norsemen/Vikingane (Netflix serial, B2 viking-komedie), Beforeigners (HBO serial, B2-C1 sci-fi+krim), Occupied/Okkupert (Netflix serial, B2-C1 polit. thriller), State of Happiness/Lykkeland (HBO serial, B2 70-talls oljedrama), Headhunters/Hodejegerne (Prime film, B2 Nesbø-thriller), The Wave/Bølgen (Netflix film, B1-B2 katastrofe), Pyromaniac/Pyromanen (Prime film, B2 drama).
- Each film 3 clips, `desc`/`topic` in Norwegian (bokmål), `ytSearch` in English. Unique clip id prefixes: nor/bef/okk/lyk/hod/bol/pyr.
- Files changed: `index.html` (+119 lines), `.ralph-tui/progress.md`. Backup at `/tmp/lingua-NO-US4b-0913.html`.
- **Learnings:**
  - Anchor used was `lilyhammer`'s closing `ytSearch:"...business deal scene" }` + `]` + `},` + `],` + `};` — the only place where a film-close is immediately followed by the array-close + object-close. (US-004a inserted lilyhammer last, so it is now the anchor instead of `IT`'s ender.)
  - `grep -c ytSearch` went 98 → 119 (exactly +21 = 7×3); `node --check` on the awk-extracted inline script passes.
  - `platform` is free-text (no enum/validation) — used "Prime" for films available there and "HBO"/"Netflix" per AC; no badge logic keys off it, only `type` ("film"→🎞, anything else→📺).

---

## 2026-05-27 - US-004a
- Added `NO: [...]` block to `FILMS` map (~line 1077, after `IT` array closes, before `};`) with 7 films A1-B1: Skam (NRK serial), Ragnarok (Netflix serial), Frost norsk dub (Disney+ film), Pippi Langstrømpe (NRK serial), Bergensbanen Slow TV (NRK), Trolljegeren (Prime film), Lilyhammer (Netflix serial).
- Each film has 3 clips with `desc`/`topic` in Norwegian (bokmål, FR-style immersion) and `ytSearch` in English. Unique clip id prefixes: sk/ra/fro/pi/be/tj/li.
- Files changed: `index.html` (+119 lines), `.ralph-tui/progress.md`.
- **Learnings:**
  - `type` is only ever read at lines ~6498/~6608 as a binary badge (film vs serial) — no filter logic, so non-"film"/"serial" values just fall through to "📺 Serial". Kept to existing `film`/`serial` values for consistency (Slow TV/docu/mockumentary mapped to the nearest of the two).
  - Insertion anchor `    },\n  ],\n};` is unique to the FILMS-object end (EN/FR end with `  ],` followed by the next lang key, only IT/last is followed by `};`).
  - `grep -c ytSearch` went 77 → 98 (exactly +21 = 7×3); `node --check` on the awk-extracted inline script passes.

---

## 2026-05-27 - US-003
- Extended noun-article + verb-infinitive prompt rules to Norwegian (bokmål) across ALL 6 vocab-generating prompts in `index.html`: added `NO: en/ei/et — bokmål` to the gender-article lists and `å snakke` as the NO infinitive example.
- Locations updated: ekstrakt vocab z tekstu (~2419, ~4479), processUpload main PROMPT (~2685), `processYouTubeViaGemini` rule with Polish lang names (~5780), and two `COMMON_SECTIONS` blocks without DE (~5951, ~6062).
- Bulk-fix articles (`fixVocabArticles` / `vocabItemNeedsFix`, ~2321): added `NO_ARTICLE_RE = /^(en|ei|et)\s/i`, NO branch in `vocabItemNeedsFix`, NO in the guard, candidate skip for already-articled words + `å `-infinitive verbs, plus `langName`/`articleHint` for NO. Enabled the "🔧 Popraw rodzajniki AI" button for NO (~4244).
- Files changed: `index.html`.
- **Learnings:**
  - The "FR/IT/DE" article rule lives in MORE than the 3 spots the `grep 'FR: le/la/un/une'` finds — two extra variants use `FR: le/la/l'/un/une` (full forms, ~2419/4479) and one uses Polish language names (`francuski/włoski/niemiecki`, ~5780). Grep all of: `le/la/un/une`, `le/la/l'/un/une`, `francuski:` to catch them.
  - Bulk-fix had a hard `lang !== "FR" && lang !== "IT"` guard in 3 places (regex consts, `vocabItemNeedsFix`, `fixVocabArticles` guard) AND a UI button gate at ~4244 — extending a language means touching all four, not just the prompt.
  - NO bokmål: nouns take en/ei/et (masc/fem/neut), verbs are å+infinitive. The å-prefix doubles as the verb-skip heuristic in bulk-fix (parallel to FR `se/s'` and IT `si`).

---

## 2026-05-27 - US-002
- Added `EL_VOICES.NO` block after the `IT` block in `index.html` (~line 642), structure `{female:{id,name}, male:{id,name}}` matching EN/FR/IT.
- Voices: female Rachel `21m00Tcm4TlvDq8ikWAM`, male Antoni `ErXwobaYiN019PkySvjV` (ElevenLabs Multilingual v2 supports Norwegian).
- Files changed: `index.html` (+5 lines incl. comment).
- **Learnings:**
  - Spec contradiction: AC said "copy voiceID from FR" + comment "reuse FR voice IDs", but FR uses Sarah/Daniel while AC explicitly listed Rachel/Antoni IDs. Resolved toward the explicit IDs (concrete intent); kept the required comment verbatim. Flag for future: the comment text is factually off vs the actual IDs used.
  - `node --check` on the extracted script passes.

---

