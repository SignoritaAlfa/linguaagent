# Przegląd A‑Z — LinguaAgent (`index.html`)

- **Data:** 2026‑05‑30
- **Zakres:** audyt funkcjonalny (czy każdy ekran działa) + audyt jakości/runtime (czy kod jest odporny), na żywej wersji `signoritaalfa.github.io/linguaagent` oraz w kodzie.
- **Plik:** `index.html`, 9332 linie, single‑file SPA (vanilla JS).
- **Metoda:** smoke‑test wszystkich ekranów w przeglądarce + dwa równoległe statyczne skany kodu + testy logiki w Node. Nawiązuje do `CODE-REVIEW-2026-05-28.md` (statyka) i aktualizuje status jego rekomendacji.

---

## 1. Werdykt

Aplikacja jest **w dobrym stanie i w większości dobrze zaprogramowana**. Architektura (pojedynczy `S`, `set()`→`render()`, helper `h()`, `callLessonModel`+`fetchWithRetry`, `safeSetItem`, `parseLessonJson` z 3‑stopniowym recovery) jest spójna. Wcześniejsze rekomendacje P1/P2 z 28 maja są **zrealizowane**.

Jedna powtarzalna **klasa błędów** odpowiadała za prawie wszystkie dzisiejsze awarie: AI potrafi zwrócić pole jako `undefined`, **tablicę** albo **obiekt**, a kod wołał na nim metodę stringową (`.trim`, `.split`, `.toLowerCase`, `.replace`) → `TypeError` → biały ekran / „przycisk nic nie robi". W tej sesji zamknięto tę klasę u źródła (normalizacja danych + utwardzenie `h()` + globalna siatka renderu).

Po pushu ostatniego commita znane crashe są wyeliminowane. Pozostałe pozycje to drobny dług (P2/P3), nie awarie.

---

## 2. Audyt funkcjonalny — smoke‑test ekranów

Każdy ekran renderowany z realnym stanem; sprawdzane, czy nie pada na ekran awaryjny / nie rzuca.

| Ekran | Wynik | Uwaga |
|---|---|---|
| home / lang / settings / translate | ✅ ok | |
| lesson (taby: dialog, słówka, zwroty, gramatyka, ćwiczenia) | ✅ ok | wszystkie taby |
| filmoteka | ✅ ok | panel edycji transkryptu naprawiony (`isSrt`) |
| mywords / myphrases / audiomgr / results | ✅ ok | |
| **songs (Piosenki)** | ❌→✅ | **był rozbity** dla każdego języka; naprawione w tej sesji |

**Wniosek:** na poprawnej lekcji renderuje się wszystko. Jedyny realnie zepsuty ekran (Piosenki) został naprawiony.

---

## 3. Co naprawiono w tej sesji (8 commitów)

Wszystkie z walidacją `node --check`; logika krytyczna dodatkowo testowana w Node.

| Commit | Problem | Naprawa |
|---|---|---|
| `b4fcfc1` | `render()` czyścił root **przed** zbudowaniem widoku → każdy wyjątek = biały ekran bez informacji | Globalna siatka: buduj węzeł w try/catch, czyść root po sukcesie; przy błędzie czytelny ekran z komunikatem+stackiem |
| `44e0112` | `showWordPopup` miał surowy `fetch` (bez timeoutu/retry) | `fetchWithRetry` (backoff 429/503) |
| `887783a` | 3 niemal identyczne bloki budowania inputu z pliku | Helper `buildModelInput`; ujednolicony próg PDF (`PDF_TEXT_MIN_CHARS`) |
| `eb98f65` | 5 rozjeżdżających się literałów schematu JSON lekcji | `lessonJsonSchema()` — jedno źródło |
| `40603cd` | Biały ekran „Dodaj do Moich Lekcji": `line.l.split` gdy kwestia bez `l` | Normalizacja dialogu w `renderLesson` |
| `3cf9719` | Biały ekran Filmoteki: `isSrt is not defined` w panelu edycji transkryptu | Dodana brakująca definicja `const isSrt` |
| `7aa7110` | „Zapisz klip nic nie robi": `topic`/`desc` z auto‑fill jako **tablica** → `.trim` crash | Koercja do stringa w `autoFillClipFromUrl` + handlerze |
| `170197d` | (a) Piosenki rozbite — `h()` nie obsługiwał dzieci liczbowych (`song.year`). (b) Tryby ćwiczeń crashowały na zepsutych danych | (a) `h()` koercja liczb/booleanów na tekst + fallback dla nie‑Node. (b) Wspólny `normalizeLessonData()` w `renderLesson` + `startPractice`/`startBuild`/`startQuiz` |

---

## 4. Klasa błędów „AI zwraca nie‑string" — jak domknięta

Trzy warstwy obrony, od najgłębszej:

1. **`normalizeLessonData(lesson)`** — sprowadza `dialog[].l/s/t`, `fill[].s/a/h/cat`, `vocab/phrases[].w/tr/ipa/pl/ex/exT` do stringów i odrzuca puste kwestie. Wołane w `renderLesson` **oraz** w trzech wejściach do ćwiczeń (wcześniej tylko render lekcji był chroniony — to była luka).
2. **`h()` utwardzony** — liczby/booleany jako dziecko → tekst; cokolwiek nie‑Node → fallback na tekst zamiast wywalić cały render.
3. **Globalna siatka `render()`** — gdy mimo wszystko coś rzuci, użytkownik widzi czytelny błąd (komunikat + skrócony stack + „Wróć"), nie pustkę. To ona umożliwiła błyskawiczne zdiagnozowanie `isSrt` i `addClipTopic`.

Dla wklejanych metadanych klipu doszła koercja w `autoFillClipFromUrl` (tablica → string).

---

## 5. Status rekomendacji z 28 maja

| Pozycja | Priorytet | Status |
|---|---|---|
| `localStorage.setItem` → `safeSetItem` (duże klucze) | P1 | ✅ zrobione (lekcje, audio, wideo, filmy, Drive import) |
| Usunięcie `callGemini` / `deleteSourceFile` / `deleteVideo` | P1 | ✅ usunięte |
| Stała `ARTICLE_RULE` zamiast 8 kopii | P1 | ✅ jedna stała (linia 657) |
| `fetchWithRetry` w `showWordPopup` / `processYouTubeViaGemini` | P2 | ✅ zrobione |
| Helper `buildModelInput` | P2 | ✅ zrobione |
| `lessonJsonSchema()` | P2 | ✅ zrobione |
| Decyzja o `processFilm` (martwy feature) | P3 | ⏳ otwarte |
| `renderSourcePicker` (scalenie 3 paneli upload) | P3 | ⏳ otwarte (świadomie odłożone — YAGNI do 4. panelu) |
| Globalny `unhandledrejection` | P3 | ⏳ niezrobione |

---

## 6. Co jeszcze warto zrobić (pozostały dług)

Żadne z poniższych nie jest awarią — to higiena i odporność.

1. **`buildSyncPayload` — `JSON.parse` bez try/catch (P2).** Przy synchronizacji z Drive parsuje `lingua_word_status` itd. bez ochrony; uszkodzony (obcięty) wpis w localStorage wywróci sync. Te same klucze są bezpiecznie parsowane przy starcie. Poprawka: opakować w `try{...}catch{return {}}`.
2. **`processFilm` — rozstrzygnąć (P3).** Martwy feature (upload pliku film/audio → lekcja przez Gemini), nieosiągalny (brak handlera). Niesie surowy `fetch` do Gemini bez retry, bez `thinkingBudget:0` i własną kopię schematu JSON. **Usunąć** (~57 linii, znika niespójność) **albo** świadomie podpiąć — wtedy koniecznie dodać `fetchWithRetry` + `thinkingBudget:0` + `lessonJsonSchema`.
3. **Globalny `unhandledrejection` (P3).** Tania siatka dla „fire‑and‑forget" handlerów AI — odrzucony Promise bez `.catch` poleci dziś po cichu. Jeden listener z banerem błędu domyka wzorzec.
4. **Reszta duplikacji promptów (P3, drobne).** `COMMON_SECTIONS` (2 kopie) i `targetLangInstr`/`targetLangLabel` (3 kopie) — dokończenie ekstrakcji z 28 maja. Niski zysk, średnie ryzyko.

**Sugestia kolejności:** #1 (szybkie, realna ochrona sync) → #2 (decyzja) → #3 → #4.

---

## 7. Stan repo

- **Lokalnie:** `main` jest **1 commit przed `origin/main`** (`170197d` — naprawa Piosenek + ćwiczeń). **Wymaga pushu**, żeby trafić na żywo.
- Pozostałe 7 dzisiejszych commitów jest już wypchniętych i na żywo.

```
git -C /Users/aleksandrabarwasna/lingua-agent push origin main
```

Po pushu (~40–60 s GitHub Pages) zrób `Cmd+Shift+R` i sprawdź ekran **🎵 Piosenki** (powinien pokazać listę zamiast błędu) oraz dowolny tryb ćwiczeń.

---

## 8. Czego nie obejmuje ten przegląd

- Nie testowano pełnych przepływów wymagających zewnętrznych usług na żywo (realne generowanie lekcji przez Gemini/Claude, STT/TTS, OAuth Drive) — sprawdzono, że ścieżki renderują się i mają obsługę błędów, ale nie wykonano end‑to‑end z prawdziwymi kluczami.
- Worker `wispy-queen-6561.aleksandrabarwasna4.workers.dev` (skonfigurowany w aplikacji obok nowego `lingua-captions`) zwracał **502** w konsoli — to oddzielny, starszy Worker; do diagnozy/przełączenia osobno.
- Nie audytowano CSS ani dostępności (a11y).
