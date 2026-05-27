# PRD — LinguaAgent: dodanie norweskiego (NO, Bokmål) jako 4. języka

**Cel:** rozszerzyć LinguaAgent o pełne wsparcie norweskiego (Bokmål, `nb-NO`)
z parytetem funkcjonalnym względem istniejących FR/IT/EN. Zadanie do wykonania
autonomicznie przez Ralph TUI w jednym przebiegu (target: noc 26→27 maja 2026).

**Repo:** `/Users/aleksandrabarwasna/lingua-agent/`
**Plik docelowy:** `index.html` (single-file SPA, JS w `<script>`)
**Branch:** `main` (po każdym US — commit; po całości pojedynczy push)
**Walidacja per US:** `awk '/<script>/{p=1;next} /<\/script>/{p=0} p' index.html > /tmp/lingua.js && node --check /tmp/lingua.js`

**Globalne zasady:**
- NIE edytuj istniejących języków (EN/FR/IT) poza miejscami gdzie wymagana zmiana to *dodanie* klucza NO.
- Polski (PL) to język L1 (interfejs + tłumaczenia) — nigdy nie jest "językiem nauki".
- Każde US kończy: `node --check` clean + git commit z opisem zaczynającym się od `[NO]`.
- Po WSZYSTKICH US: jedyny `git push origin main`.

---

## US1 — LANG plumbing (NO w core LANGS/BCP/ACCENT_CHARS)

**Jako użytkowniczka chcę widzieć Norweski jako 4. kafelek na stronie głównej, żeby móc wybrać go do nauki.**

**Acceptance criteria:**
- W `const LANGS` (~linia 611) dodać `NO:{name:"Norsk",flag:"🇳🇴"}` po IT.
- W `const LANG_BCP` (~linia 612) dodać `NO:"nb-NO"`.
- W `ACCENT_CHARS` (helper dla writing/dictation, ~linia 2880) dodać:
  ```js
  NO: ["æ","ø","å","Æ","Ø","Å","'"]
  ```
- Otworzyć https://signoritaalfa.github.io/linguaagent/ — strona główna pokazuje 4 kafelki języków (EN/FR/IT/NO).
- `node --check` passes.

**Plik:** `index.html` (3 miejsca edycji)
**Walidacja dodatkowa:** `grep -c "NO:" index.html` zwraca ≥4 (LANGS + LANG_BCP + ACCENT_CHARS + przyszłe użycia).
**Commit:** `[NO] Add NO to LANGS / LANG_BCP / ACCENT_CHARS`

---

## US2 — TTS (ElevenLabs voices + OpenAI fallback)

**Jako użytkowniczka chcę żeby TTS czytał norweski poprawnie (akcent norweski, nie angielski).**

**Acceptance criteria:**
- W `const EL_VOICES` (~linia 630) dodać blok `NO:` z 2 voiceID:
  - female: ElevenLabs multilingual voice — sprawdzić w docs / w obecnym kodzie wybrać voice który ma `language` includes `nb` lub jest oznaczony jako multilingual. Bezpieczny default: skopiować voiceID z `FR.female` (Rachel `21m00Tcm4TlvDq8ikWAM`) — ElevenLabs multilingual v2 obsługuje norweski.
  - male: skopiować voiceID z `FR.male` (Antoni `ErXwobaYiN019PkySvjV`).
- W `getVoiceId` żadne zmiany nie są wymagane (funkcja jest LANG-agnostic).
- OpenAI tts-1 (nazwy głosów: nova, shimmer, alloy, echo, fable, onyx) działa z norweskim natywnie bez zmian kodu (model jest multilingual). Nie wymagane dodatkowe konfiguracje.
- Browser speechSynthesis fallback: `LANG_BCP.NO="nb-NO"` zapewnia auto-detekcję głosu systemowego (już zrobione w US1).

**Plik:** `index.html` (1 miejsce — dodanie bloku NO w EL_VOICES)
**Walidacja dodatkowa:** `grep "NO:" index.html | grep "female\|male" | wc -l` zwraca ≥2.
**Commit:** `[NO] Add EL_VOICES.NO (multilingual fallback) + confirm OpenAI TTS NO support`

---

## US3 — Prompt engineering (rules dla generowania lekcji NO)

**Jako użytkowniczka chcę żeby AI generowało norweski vocab POPRAWNIE — z rodzajnikiem en/ei/et przy rzeczownikach i bezokolicznikiem przy czasownikach.**

**Acceptance criteria:**
- Główny `PROMPT` w `processUpload` (~linia 2630) zawiera regułę:
  ```
  KRYTYCZNE: rzeczowniki w językach z rodzajem
  (FR: le/la/un/une; IT: il/la/lo/un/una/uno; DE: der/die/das;
   NO: en/ei/et — bokmål) ZAWSZE z rodzajnikiem w polu "w".
  Czasowniki w bezokoliczniku (parler, parlare, to talk, å snakke).
  ```
- W `regenerateLessonDialog` i innych funkcjach które kopiują tę regułę — analogicznie zaktualizować (znajdź wszystkie wystąpienia "FR: le/la/un/une" i dopisz NO przy każdym).
- Funkcja sprawdzająca rodzajniki przy bulk-fix (`Require articles on nouns…` z commitu 2e29334) — dodać NO do listy języków gdzie reguła obowiązuje. Sprawdzić jaki regex/lista jest tam użyty i analogicznie wpisać `^(en|ei|et)\s` jako kwalifikujący "ma rodzajnik".

**Pliki:** `index.html` (multi-edit po występach reguły)
**Walidacja dodatkowa:** `grep -c "en/ei/et" index.html` zwraca ≥2 (prompt + bulk-fix).
**Commit:** `[NO] Extend article/infinitive rules to Norwegian (en/ei/et, å+infinitive)`

---

## US4 — Wbudowana Filmoteka NO (12-14 pozycji × 3 klipy)

**Jako użytkowniczka chcę kliknąć 🎬 Filmoteka w NO i zobaczyć 12-14 norweskich filmów/seriali z gotowymi klipami do nauki.**

**Acceptance criteria:**
- Znaleźć blok wbudowanej Filmoteki dla FR (lookup: `lupin`, `amelie`, `intouchables` etc., ~linie 760+).
- Stworzyć analogiczny blok dla `FILMS_NO` (lub po prostu dopisanie do tej samej struktury z kluczem `NO`).
- Lista filmów/seriali (Bokmål, popularne dostępne na YouTube/Netflix, mix poziomów A2-C1):

  **Seriale (Netflix/HBO/NRK):**
  1. **Skam** (NRK, kultowy serial młodzieżowy) — poziom B1-B2, platform: NRK/Netflix
  2. **Ragnarok** (Netflix, mitologia + thriller młodzieżowy) — B1
  3. **Lilyhammer** (Netflix, mafia + Norwegia) — B1-B2
  4. **Norsemen / Vikingane** (Netflix, komedia o wikingach) — B2
  5. **Beforeigners** (HBO, sci-fi+kryminał) — B2-C1
  6. **Occupied / Okkupert** (Netflix, polityczny thriller) — B2-C1
  7. **State of Happiness / Lykkeland** (HBO, lata 70., odkrycie ropy) — B2

  **Filmy:**
  8. **Headhunters / Hodejegerne** (Jo Nesbø, thriller) — B2
  9. **The Wave / Bølgen** (katastroficzny) — B1-B2
  10. **Pyromaniac / Pyromanen** (dramat) — B2
  11. **Trollhunter** (mockumentary) — B1-B2

  **Kultura:**
  12. **Frost** (animacja — wersja dubbingowana NO) — A2-B1
  13. **Pippi Långstrump** (klasyka dla dzieci) — A2

  **Edukacyjny dokumentalny / kulturalny:**
  14. **Slow TV (Bergensbanen)** — A2 (proste, długie ujęcia + komentarz)

- Każdy element ma: `id`, `title`, `type`, `level`, `platform`, `description` (po norwesku, krótko — to immersja), `topic` (po norwesku) i **3 klipy** w polu `clips[]`. Każdy klip: `id`, `title`, `description` (po norwesku — scena), `ytSearch` (string do wyszukiwania YT, najlepiej angielski tytuł sceny + nazwa serialu).
- Struktura **dokładnie** taka sama jak istniejąca FR Filmoteka (Ralph, sprawdź `lupin` w kodzie jako referencyjny szablon).
- `description` i `topic` PO NORWESKU (zasada immersji, jak FR — z commitu `d9587b3`).

**Plik:** `index.html`
**Walidacja dodatkowa:** `grep -c "\"NO\":\s*\[" index.html` zwraca ≥1; `grep -c "ytSearch" index.html` powinien wzrosnąć o ~42 (14 filmów × 3 klipy).
**Commit:** `[NO] Add built-in Filmoteka NO with 14 films/series × 3 clips`

---

## US5 — Wbudowane lekcje NO (5-7 lekcji A1-B1)

**Jako użytkowniczka chcę od razu po wybraniu NO mieć ~5 gotowych lekcji do startu (nie czekać na własne uploady).**

**Acceptance criteria:**
- Stworzyć 5-7 lekcji NO analogicznych do `fr1` (Au café), `fr2` (Se présenter):
  1. **no1**: "På kafé" (W kawiarni / zamawianie kawy) — A1
  2. **no2**: "Å presentere seg" (Przedstawianie się) — A1
  3. **no3**: "På butikken" (W sklepie / zakupy) — A1-A2
  4. **no4**: "Hvor er…?" (Pytanie o drogę) — A2
  5. **no5**: "På restaurant" (W restauracji / zamawianie jedzenia) — A2
  6. **no6**: "Reise" (Podróż / pociąg/lot) — A2-B1
  7. **no7**: "Vær og tid" (Pogoda i czas) — A2

- Każda lekcja MA strukturę:
  ```json
  {
    "id": "no1",
    "title": "På kafé",
    "level": "A1",
    "topic": "Zamawianie w kawiarni",
    "type": "dialog",
    "dialog": [ ~6-8 kwestii Aleksandra ↔ inny mówiący ],
    "vocab": [ ~6-8 słówek/zwrotów {w, tr, ipa, pl, ex, exT} ],
    "fill": [ ~3-4 ćwiczenia luk {s, a, h} ],
    "grammar": [ ~2-3 zasady {rule, ex, exT, note} ]
  }
  ```
- Treść MA być **autentyczna norweska bokmål** (nie tłumaczenie 1:1 z FR). Postacie: Aleksandra + ktoś norweski (Ola, Kari, Bjørn, Astrid, Erik — typowe imiona).
- IPA notation poprawne dla bokmål (np. "Hei" /hæɪ/).
- Pole `pl` (fonetyka po polsku) — jak czytać dla Polaka (np. "Hei" → "hej", "På kafé" → "po ka-FE").
- Rzeczowniki ZAWSZE z rodzajnikiem (`en kaffe`, `et bord`, `ei jente`).
- Czasowniki w bezokoliczniku z `å` (`å være`, `å snakke`).
- Tłumaczenia po polsku (`t`, `tr`, `exT`).

**Plik:** `index.html` — dopisać do bloku obecnych lekcji
**Walidacja:** szukaj `id:"no1"`, `id:"no2"`, …, `id:"no7"` w pliku — powinny być.
**Commit:** `[NO] Add 5-7 built-in lessons A1-B1 (kafé, presentere seg, butikken, …)`

---

## US6 — UI strings + kafelek "Moje słówka/zwroty" obsługuje NO

**Jako użytkowniczka chcę żeby kafelki "Moje słówka" / "Moje zwroty" / "Powtórki" / "Tłumacz" działały tak samo dla NO jak dla EN/FR/IT.**

**Acceptance criteria:**
- Funkcje `renderMyVocab`, `renderLang`, `renderHome`, `renderTopNav` — sprawdzić że nie ma hardkodowanych warunków `if(lang==="EN"||lang==="FR"||lang==="IT")`. Jeśli są — zamienić na sprawdzenie `if(LANGS[lang])`.
- "Translate" feature (tłumacz na stronie głównej) — sprawdzić że LANG_BCP.NO jest używany do PL→NO i Web Speech recognition.
- `getEnrichedVocabEntry(word, "NO")` działa (przeszukuje cache + myLessons).
- Strona główna → klik NO → widać te same przyciski narzędzi co dla FR/IT (Tłumacz / Moje słówka / Moje zwroty / Powtórki).

**Plik:** `index.html` — przeszukać per hardkodowane lang warunki.
**Walidacja:** `grep -c "lang===\"FR\"" index.html` powinno być 0 (lub jeśli są takie, dopisać `|| lang==="NO"` lub przerefactorować).
**Commit:** `[NO] Remove hardcoded EN/FR/IT lang checks; make all features LANG-agnostic`

---

## US7 — Final smoke test + commit-all + push

**Acceptance criteria:**
- `awk '/<script>/{p=1;next} /<\/script>/{p=0} p' index.html > /tmp/lingua.js && node --check /tmp/lingua.js` — clean.
- `git log --oneline` od początku run pokazuje 6 commitów `[NO] …`.
- `git push origin main` — single push.
- Plik `prd-norwegian.md` przeniesiony do `docs/` (utworzyć folder jeśli nie ma) — żeby root nie był zaśmiecony.

**Commit:** `[NO] Final: archive PRD to docs/, ready for prod`

---

## Notes dla Ralpha

- **Single-file SPA** — `index.html` ma ~7100 linii. Używaj `grep -n` żeby znajdować miejsca; `Read offset=N limit=M` żeby czytać fragmenty; `Edit` z exact match żeby zmieniać.
- **Per CLAUDE.md user'a:** NIE używaj `cd && ...` (blokowane przez Claude Code security). Używaj ścieżek absolutnych.
- **JS lokalizacja:** Cały JS jest w jednym `<script>...</script>` blocku (~linie 572-7100). Walidacja: extract + `node --check`.
- **NIE pchaj na origin po każdym US.** Push tylko raz na końcu (US7). Każdy US robi tylko commit lokalny.
- **Jeśli któryś US wymaga API key** (Gemini/Claude do generowania content) — wstrzymaj się i zapytaj w komentarzu commitu. Domyślnie generuj content przez Claude'a (Ralph TUI ma kontekst); jeśli context window się zapełnia, podziel US5/US6 content generation na mniejsze podzadania.
- **Backup:** Przed każdym dużym US (US4, US5) zrób `cp index.html /tmp/lingua-NO-backup-USN-$(date +%H%M).html`.
- **Test wizualny:** po US7, otwórz lokalnie `open /Users/aleksandrabarwasna/lingua-agent/index.html` — strona główna powinna pokazać 4 kafelki języków.
