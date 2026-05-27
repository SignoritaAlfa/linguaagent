# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- **Per-language config maps**: `index.html` holds plain JS object maps keyed by language code (`EN`/`FR`/`IT`/`NO`...), e.g. `EL_VOICES` (~line 630). Adding a language = append a new keyed block matching the existing shape. Same pattern likely repeats for `FILMS`, `LANGS`, `LANG_BCP`, `ACCENT_CHARS`.
- **JS lives inline in `index.html`** inside a `<script>` block. Validate with: `awk '/<script>/{p=1;next} /<\/script>/{p=0} p' index.html > /tmp/lingua.js && node --check /tmp/lingua.js`.
- **Per-language grammar rules are DUPLICATED across ~6 prompt strings + 1 bulk-fix function.** The noun-article / verb-infinitive instruction ("FR: le/la...; IT: ...; DE: ...") appears in 3+ surface forms: `le/la/un/une`, full `le/la/l'/un/une`, and Polish names `francuski:/włoski:/niemiecki:`. Extending grammar to a new language = (1) grep all three forms and update every prompt, (2) extend `fixVocabArticles`/`vocabItemNeedsFix` (~2321): add a `<LANG>_ARTICLE_RE` const, a branch in `vocabItemNeedsFix`, the `lang !==` guard, a candidate-skip + verb heuristic, and `langName`/`articleHint`, (3) un-gate the "🔧 Popraw rodzajniki AI" button (~4244).
- **`FILMS` (Filmoteka) is a per-language map at ~line 662** keyed by lang code (`EN`/`FR`/`IT`/`NO`...), closed by `};`. Each film: `{ id, title, type, level, platform, desc, clips:[{ id, episode, title, level, topic, desc, ytSearch }] }`. `type` only drives a binary badge — `series.type==="film" ? "🎞 Film" : "📺 Serial"` (lines ~6498, ~6608); any other value renders as Serial. Add a language = append a `<LANG>: [ ... ],` block before the closing `};`. FR-style immersion (desc/topic in target language) is the convention to copy for new langs; EN/IT use Polish topic/desc.

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

