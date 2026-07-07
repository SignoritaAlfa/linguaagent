# LinguaAgent - instrukcja dla agentów AI

> **AKTUALIZACJA 2026-07-07:** dokument doprowadzony do zgodności z kodem (poprzednia wersja opisywała stan sprzed wielu zmian: 8 ekranów zamiast 13, nieużywane modele Opus, ElevenLabs jako główny TTS, TODO dawno zrobione). Zmiany z sesji 2026-07-07 opisane w sekcji "Historia zmian".

## Czym jest ten projekt

LinguaAgent to aplikacja webowa (PWA) do nauki języków obcych (angielski, francuski, włoski, norweski) zbudowana wokół **jednego pliku HTML** (`index.html`). Właścicielką projektu jest Aleksandra - osoba nietechniczna. Wszystkie wyjaśnienia po polsku, prostym językiem.

**URL produkcyjny:** https://signoritaalfa.github.io/linguaagent
**Repo:** `SignoritaAlfa/linguaagent`, branch `main`
**Plik roboczy na Macu:** `/Users/aleksandrabarwasna/lingua-agent/` (lokalny clone repo)
**Kopia w vaulcie Obsidian** (`Folder ALFA/AGENT LINGUA/`) = snapshot; sprawdź aktualność przed pracą.

---

## Stack techniczny

- **`index.html`** (~575 KB, ~9700 linii) - HTML + CSS + cały JS aplikacji. Zero frameworków, zero Node.js, zero bundlerów, vanilla JS + CSS variables.
- **PWA (wyjątek od zasady single-file, decyzja 2026-07-07):** `manifest.json`, `sw.js` (service worker: offline + cache statyków), `icon-180/192/512.png`. Logika aplikacji NADAL tylko w index.html - tych plików nie rozbudowuj o logikę.
- **`worker/worker.js`** - Cloudflare Worker do pobierania napisów YouTube (deploy ręczny, URL w Ustawieniach apki, klucz `lingua_worker_url`).
- **Storage:**
  - `LS` - wrapper KV (IndexedDB `LinguaAgentKV` + mirror w localStorage). WSZYSTKIE zapisy przez `LS.getItem/setItem`, nie bezpośrednio localStorage.
  - IndexedDB `lingua_db` (wersja **3**): store `videos` (pliki wideo), `sourceFiles` (oryginalne PDF/zdjęcia), `ttsCache` (trwały cache audio TTS, max 600 wpisów, LRU po indeksie `t`).
  - Parsowanie JSON z LS **zawsze** przez `safeParseLS(key, fallback)`; zapis dużych kluczy przez `safeSetItem`.

---

## Zewnętrzne API i klucze

| API | Do czego | localStorage key |
|-----|----------|-----------------|
| **Gemini** `gemini-2.5-flash` (`GEMINI_MODEL`) | Popup tłumaczeń słów, batch-tłumaczenie dialogu, generowanie lekcji (domyślny model), YouTube→lekcja | `lingua_gemini_key` |
| **Anthropic Claude** | Alternatywne modele lekcji: `claude-haiku-4-5-20251001`, `claude-sonnet-4-6` (patrz `LESSON_MODEL_CONFIG`) | `lingua_claude_key` |
| **OpenAI TTS** `tts-1-hd` | Głosy lektorów (silnik "oai"); głosy: `nova/echo` domyślnie | `lingua_oai_key` |
| **ElevenLabs** `eleven_multilingual_v2` | Alternatywny silnik TTS; voice IDs w `EL_VOICES` | `lingua_el_key` |
| **RapidAPI** | YouTube transcript (fallback dla workera) | `lingua_rapid_key` |
| **Google Drive** | Sync danych (scope `drive.appdata`) | `lingua_drive_*` |

**Nigdy nie hardkoduj kluczy API w plikach.** Klucz Gemini przekazujemy w nagłówku `x-goog-api-key` (NIE w URL).

Zasady wywołań AI/API:
- **Wszystkie** wywołania sieciowe przez `fetchWithRetry(url, opts, maxRetries)` (timeout 120 s, backoff na 429/500/503/529).
- Gemini 2.5: przy krótkich zadaniach ustaw `thinkingConfig:{thinkingBudget:0}` - inaczej "myślenie" zjada budżet tokenów.
- Generowanie lekcji przez `callLessonModel(input)` (provider-agnostic) + `lessonJsonSchema()` + `parseLessonJson` + `normalizeLessonData`.
- TTS: wynik jest cache'owany w pamięci (`_audioCache`) ORAZ trwale w IndexedDB (`ttsCacheGet/Put`) - ta sama kwestia nigdy nie jest generowana dwa razy. Preferencja głosu systemowego dla FR/IT/NO: `S.preferNativeVoiceForeign` (domyślnie ON).

---

## Ekrany (`S.screen`) - 13

| Ekran | Funkcja |
|-------|---------|
| `home` | Wybór języka + seria nauki (🔥 streak) + badge "X do powtórki" per język |
| `lang` | Lekcje języka + narzędzia: Tłumacz / Moje słówka / Moje zwroty / Powtórki (SRS) |
| `lesson` | Zakładki: dialog (klikalne słowa → popup), słówka, zwroty, gramatyka, ćwiczenia; wideo/karaoke YT |
| `practice` | Tryby: flashcard, fill, writing, dyktando, quiz, build (układanie zdań) |
| `results` | Wyniki sesji |
| `settings` | Klucze API, model lekcji, TTS, Google Drive sync, motyw/paleta |
| `audiomgr` | Nagrania MP3/WAV per lekcja |
| `filmoteka` | Seriale/klipy + transkrypcje YT (worker) → lekcje |
| `songs` | Piosenki → lekcje |
| `mywords` / `myphrases` | Zapisane słówka/zwroty + sesje nauki + eksport Anki CSV |
| `importlesson` | Import lekcji z JSON (pojedyncza lub tablica) |
| `translate` | Tłumacz PL→język z rozpoznawaniem mowy |

Stan globalny: obiekt `S`, zmiana przez `set({...})` → pełny `render()`. Render ekranów przez helper `h()` (bezpieczny, textContent). Globalna siatka: crash renderu pokazuje ekran błędu, nie białą stronę; jest też globalny listener `unhandledrejection`.

**Bezpieczeństwo treści:** dane z AI/importu wstawiane do `innerHTML` WYŁĄCZNIE przez `esc()`; HTML z contenteditable/importu przez `sanitizeHtml()`. Nowy kod: preferuj `h()`.

---

## Struktura danych lekcji

Format dialogu: `s/l/t` (NIE `speaker/line/tr`):
```javascript
{
  id, title, level, topic, type:"dialog",
  hasVideo, fromFilm, youtubeId,          // opcjonalne
  dialog:  [{ s, l, t, start?, end? }],   // start/end (sekundy) dla karaoke YT
  vocab:   [{ w, tr, ipa, pl, ex, exT }],
  phrases: [{ w, tr, ipa, pl, ex, exT }],
  fill:    [{ s, a, h, cat }],
  grammar: [{ rule, ex, exT, note, explanation }],
  rawText                                  // oryginalny tekst źródła (sanityzowany przy renderze)
}
```
Minimalne wymagania jakości (lekcje z PDF/wideo): dialog 8+, vocab 15+, fill 5+ (10+ dla filmów), grammar 4+.

## SRS (powtórki)

- Interwały `SRS_INTERVALS=[1,3,7,14,30]` dni; klucz `lingua_srs`.
- Dobra odpowiedź: poziom +1; błąd: poziom **-2** (nie zeruje - v2, 2026-07-07).
- `getDueWords(lang)` - zaległe; przyciski Powtórki na ekranie `lang`; badge na `home`.
- Każda odpowiedź dopisuje się do `lingua_activity` (dziennik → streak na home).

## Google Drive sync

- Główny payload (`buildSyncPayload`): lekcje, foldery, filmy, piosenki, SRS, statusy słówek, ustawienia. **Bez nagrań audio.**
- Klucze API w payloadzie tylko gdy `S.syncApiKeys` (checkbox w Ustawieniach, domyślnie WŁ.).
- Nagrania audio (`lingua_audio`): osobny plik Drive `lingua_audio.json`, wysyłany TYLKO gdy zmienił się odcisk (`_audioFingerprint`, klucz `lingua_audio_sync_fp`).
- Konflikt: nowszy `lastModified` wygrywa (push lokalnych, jeśli lokalne nowsze).

---

## Design system

Motywy light/dark + palety (`PALETTES`, klucz `lingua_palette`). Fonty: Cormorant Garamond (serif, tytuły) + DM Sans (UI). Kolory przez CSS variables (`--bg`, `--surface`, `--gold`, ...). **Nie zmieniaj wyglądu bez pytania.**

### iOS wymagania
- `overscroll-behavior:none`, `color-scheme`, min-height `-webkit-fill-available`
- NIE `position:fixed` (modal znika w Safari)
- W ćwiczeniach fill NIE `oninput` (zamyka klawiaturę iOS) → `onchange` + `onkeydown`

---

## Zasady pracy z kodem

### Zawsze
- Backup przed edycją: `cp index.html index.html.backup-YYYY-MM-DD`
- Edytuj `index.html` bezpośrednio; po zmianie sprawdź: 1× `<style>`, 1× `<script>` (główny), 1× `</html>` na końcu; `node --check` na wyciętym JS
- Po zmianie index.html wymagającej czystki cache: podbij `VERSION` w `sw.js`
- Test w przeglądarce przed oddaniem; konsola bez nowych błędów

### Nigdy
- Nie dziel logiki na wiele plików (wyjątek: manifest.json/sw.js/ikony - bez logiki aplikacji)
- Nie używaj frameworków; nie hardkoduj kluczy; nie duplikuj funkcji ani `const`
- Nie używaj surowego `fetch` (→ `fetchWithRetry`), surowego `JSON.parse(LS.getItem(...))` (→ `safeParseLS`), interpolacji do `innerHTML` bez `esc()`

### Najczęstsze błędy (historia)
1. Brakujący `@` przed `@media`; 2. CSS poza `<style>`; 3. JS za `</html>`; 4. zdublowany `</head>`/`</html>`; 5. `position:fixed`; 6. `oninput` w fill; 7. duplikaty `const`; 8. stary format dialogu `speaker/line/tr`; 9. pola z AI mogą być tablicą/obiektem/undefined → normalizuj (`normalizeLessonData`), nie wołaj metod stringowych bez koercji.

---

## Historia zmian 2026-07-07 (duża sesja: naprawy + wydajność + rozszerzenia)

1. **esc()/sanitizeHtml()** - treści AI/importu escapowane przed innerHTML (ochrona kluczy w LS przed XSS z importowanych lekcji).
2. **batchTranslateDialog** przepisany do głównego skryptu - prompt per język (wcześniej patch na końcu pliku z zahardkodowanym słownikiem włosko-polskim dla wszystkich języków), regex liter z diakrytykami FR/NO, nagłówek `x-goog-api-key`.
3. **fetchWithRetry** w TTS (OpenAI/ElevenLabs), oEmbed, wszystkich wywołaniach Drive.
4. **safeParseLS** wszędzie (było 26 surowych `JSON.parse`).
5. **Trwały cache TTS w IndexedDB** (`ttsCache`, DB_VER 2→3) + **tts-1-hd** (lepsza wymowa; dzięki cache każda kwestia płacona raz).
6. **Drive:** audio w osobnym pliku (push tylko przy zmianie odcisku), klucze API za checkboxem `syncApiKeys` (domyślnie WŁ.).
7. **PWA:** manifest + sw.js + ikony; instalacja na iPhone, offline.
8. **SRS v2:** błąd cofa o 2 poziomy (nie zeruje); seria nauki (streak) i badge powtórek na home; karty Powtórek wzbogacane tłumaczeniami z cache (`getEnrichedVocabEntry`).
9. **Eksport Anki CSV** w Moje słówka / Moje zwroty.
10. **Preconnect** do api.openai.com i generativelanguage.googleapis.com.
11. **Bugfix (druga tura):** tab Ćwiczenia przy lekcji bez `fill` renderował pustą stronę (brakowało `w.appendChild(main)` przed wczesnym `return`); `startPractice`/`renderPractice` dostały guard na puste karty (komunikat zamiast crasha); nowy przycisk **„✨ Wygeneruj ćwiczenia AI z tej lekcji"** (`generateFillFromLesson`) w pustym tabie Ćwiczenia — dla lekcji z transkrypcji, które powstały bez ćwiczeń. `sw.js` VERSION → v2.

## TODO (aktualne)

| Funkcja | Priorytet |
|---------|-----------|
| Scalenie duplikatów budowania wierszy słówek (2 prawie identyczne bloki innerHTML) | 🟢 niski |
| Dokończenie ekstrakcji duplikacji promptów (`COMMON_SECTIONS`, `targetLangInstr`) | 🟢 niski |
| Minimalne testy w Node dla czystych funkcji (parseLessonJson, normalizeLessonData, SRS) | 🟡 średni |
| Lekcje z korespondencji (maile dostawców → fiszki branżowe) | 🟡 do decyzji |
| Hiszpański/portugalski (architektura gotowa - to głównie treść) | 🟡 do decyzji |
| Ekran statystyk (dane już są: lingua_activity, SRS, wordStatus) | 🟢 niski |

---

## Kontekst użytkownika

- **Aleksandra** - uczy się EN/FR/IT/NO, baza PL, osoba nietechniczna
- Urządzenia: iPhone Safari + Mac Chrome; GitHub: `SignoritaAlfa`
- Preferuje elegancki design - nie zmieniaj wyglądu bez pytania

## Protokół Fable 5

Metodyka wspólna agentów Aleksandry: `../.claude/rules/fable5-core.md` (root vaulta) - przeczytaj na starcie sesji. Szczegóły dla tego projektu: `CLAUDE.md` obok. Kluczowe: plan przed kodem, backup przed edycją, Grep zamiast czytania całego pliku, test w przeglądarce przed <DONE>, składnia API tylko z docs.

**Synchronizacja**: kanoniczne AGENTS.md/CLAUDE.md żyją w repo (`~/lingua-agent/`); kopie w vaulcie aktualizuj po zmianach:
`cp "/Users/aleksandrabarwasna/Library/Mobile Documents/iCloud~md~obsidian/Documents/Folder ALFA/AGENT LINGUA/"{AGENTS.md,CLAUDE.md} ~/lingua-agent/ && cd ~/lingua-agent && git add AGENTS.md CLAUDE.md && git commit -m "docs: aktualizacja" && git push`
