# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- **Per-language config maps**: `index.html` holds plain JS object maps keyed by language code (`EN`/`FR`/`IT`/`NO`...), e.g. `EL_VOICES` (~line 630). Adding a language = append a new keyed block matching the existing shape. Same pattern likely repeats for `FILMS`, `LANGS`, `LANG_BCP`, `ACCENT_CHARS`.
- **JS lives inline in `index.html`** inside a `<script>` block. Validate with: `awk '/<script>/{p=1;next} /<\/script>/{p=0} p' index.html > /tmp/lingua.js && node --check /tmp/lingua.js`.

---

## 2026-05-27 - US-002
- Added `EL_VOICES.NO` block after the `IT` block in `index.html` (~line 642), structure `{female:{id,name}, male:{id,name}}` matching EN/FR/IT.
- Voices: female Rachel `21m00Tcm4TlvDq8ikWAM`, male Antoni `ErXwobaYiN019PkySvjV` (ElevenLabs Multilingual v2 supports Norwegian).
- Files changed: `index.html` (+5 lines incl. comment).
- **Learnings:**
  - Spec contradiction: AC said "copy voiceID from FR" + comment "reuse FR voice IDs", but FR uses Sarah/Daniel while AC explicitly listed Rachel/Antoni IDs. Resolved toward the explicit IDs (concrete intent); kept the required comment verbatim. Flag for future: the comment text is factually off vs the actual IDs used.
  - `node --check` on the extracted script passes.

---

