# Code Review — lingua-agent (`index.html`)

- **Data:** 2026-05-28
- **Plik:** `index.html`
- **Rozmiar:** 9170 linii (`wc -l index.html`)
- **Liczba funkcji top-level:** 165 (`grep -cE '^(async )?function '`)

Ten dokument to **przegląd read-only**. Nie zmieniam tu kodu aplikacji — `index.html` pozostaje nietknięty (`git diff --stat` pusty). To baza do dalszej analizy: dead-code, duplikacje, refaktor. Kolejne sekcje (US-002+) dopisują ustalenia poniżej inwentarza.

Inwentarz obejmuje tylko deklaracje top-level pasujące do `^(async )?function ` — funkcje strzałkowe, metody obiektów i handlery inline nie są tu liczone.

---

## 1. Inwentarz

165 funkcji pogrupowanych tematycznie. Kolumna `async` = `✓` dla funkcji asynchronicznych.

### IndexedDB — pliki źródłowe i wideo
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 576 | `openDB` | |
| 590 | `saveSourceFile` | ✓ |
| 607 | `loadSourceFile` | ✓ |
| 616 | `deleteSourceFile` | ✓ |
| 625 | `saveVideo` | ✓ |
| 634 | `loadVideo` | ✓ |
| 643 | `deleteVideo` | ✓ |

### Głos / TTS / odtwarzanie audio
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 697 | `isFemaleVoice` | |
| 702 | `getVoiceId` | |
| 2235 | `getBrowserVoice` | |
| 2251 | `_audioCacheStore` | |
| 2260 | `_audioCachePlay` | |
| 2270 | `browserSpeak` | |
| 2283 | `elSpeak` | ✓ |
| 2301 | `oaiSpeak` | ✓ |
| 2337 | `speak` | ✓ |
| 2378 | `playDialog` | ✓ |
| 2404 | `stopDialog` | |
| 2406 | `playVocabList` | ✓ |
| 2438 | `stopVocabPlayback` | |

### Google Drive — synchronizacja
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 1945 | `initDriveTokenClient` | |
| 1974 | `buildSyncPayload` | |
| 2000 | `applyDriveData` | |
| 2023 | `driveFindFile` | ✓ |
| 2044 | `pushToDrive` | ✓ |
| 2103 | `pullFromDrive` | ✓ |
| 2133 | `driveSync` | ✓ |
| 2159 | `connectDrive` | |
| 2175 | `disconnectDrive` | |
| 2189 | `driveInvalidateToken` | |
| 2196 | `driveSilentReconnect` | |
| 2217 | `scheduleDriveSync` | |
| 2228 | `renderIfStatusVisible` | |

### Stan aplikacji
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 2232 | `set` | |

### Odtwarzacz YouTube
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 2451 | `destroyYtPlayer` | |
| 2460 | `initYtPlayer` | |
| 2485 | `highlightCurrentCue` | |
| 2514 | `seekYtTo` | |

### localStorage — limity i zapis
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 2525 | `getLocalStorageUsageKB` | |
| 2537 | `safeSetItem` | |
| 2559 | `checkStorageQuota` | |

### Lekcje i foldery — CRUD
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 2569 | `saveMyLesson` | |
| 2578 | `deleteMyLesson` | |
| 2587 | `folderName` | |
| 2588 | `folderScope` | |
| 2589 | `getFolders` | |
| 2593 | `isVideoLesson` | |
| 2597 | `createFolder` | |
| 2611 | `renameFolder` | |
| 2630 | `deleteFolder` | |
| 2642 | `toggleFolderCollapsed` | |
| 2652 | `isFolderCollapsed` | |
| 2656 | `renameLesson` | |
| 2674 | `moveLessonToFolder` | |

### Filmy / klipy
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 2684 | `saveMyFilm` | |
| 2691 | `deleteMyFilm` | |
| 2697 | `addClipToMyFilm` | |
| 2712 | `fetchClipMetadataSuggestion` | ✓ |
| 2761 | `autoFillClipFromUrl` | ✓ |
| 2782 | `editClipMetadata` | |
| 2915 | `deleteClipFromMyFilm` | |
| 2920 | `saveFilmClipUrl` | |
| 2933 | `getFilmClips` | |

### Generowanie AI / parsing treści
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 2949 | `vocabItemNeedsFix` | |
| 2957 | `fixVocabArticles` | ✓ |
| 3023 | `renderAIGenerateButton` | |
| 3125 | `parseLessonJson` | |
| 3189 | `tolerantParseJson` | |
| 3228 | `rawTextToPlain` | |
| 3240 | `extractPdfText` | ✓ |
| 3283 | `pdfToImages` | ✓ |
| 3310 | `callGemini` | ✓ |
| 3337 | `processUpload` | ✓ |
| 3444 | `processCustomExercises` | ✓ |
| 3518 | `saveCustomExercisesToLesson` | |
| 3539 | `openSourceFileViewer` | |
| 3597 | `deleteCustomExercise` | |
| 3616 | `processAddDialog` | ✓ |
| 3675 | `saveAddedDialog` | |

### Pliki / konwersja / audio lekcji
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 3702 | `fileToB64` | |
| 3716 | `normalizeImageForUpload` | ✓ |
| 3742 | `saveLessonAudio` | |
| 3750 | `deleteLessonAudio` | |
| 3757 | `fileToDataUrl` | |
| 3766 | `stopAudio` | |
| 3771 | `playAudio` | |
| 3781 | `playDialogWithAudio` | ✓ |
| 3803 | `processFilm` | ✓ |

### Ćwiczenia / praktyka / wymowa
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 3865 | `startPractice` | |
| 3880 | `normalizeAnswer` | |
| 3890 | `normalizeTranslation` | |
| 3894 | `checkTranslationMatch` | |
| 3908 | `renderAccentBar` | |
| 3933 | `getEnrichedVocabEntry` | |
| 3960 | `nextCard` | |
| 3967 | `nextWritingCard` | |
| 3977 | `stripAccents` | |
| 3980 | `stripArticles` | |
| 3991 | `normalizeForSTT` | |
| 4001 | `comparePronunciation` | |
| 4020 | `stopPronunciationSTT` | |
| 4023 | `startPronunciationSTT` | |
| 4056 | `rateLabel` | |
| 4063 | `testElKey` | ✓ |

### Helpery widoku
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 4075 | `h` | |

### Renderowanie widoków
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 4102 | `renderTopNav` | |
| 4127 | `renderHome` | |
| 4157 | `renderLang` | |
| 4393 | `showWordPopup` | |
| 4529 | `markWord` | |
| 4544 | `renderVocabList` | |
| 4706 | `openEditEntryForm` | |
| 4849 | `renderAddEntryForm` | |
| 4939 | `renderUploadPanel` | |
| 5055 | `renderCustomExerciseUploadPanel` | |
| 5174 | `renderAddDialogPanel` | |
| 5275 | `renderLesson` | |
| 6144 | `renderPractice` | |
| 6703 | `renderResults` | |
| 6723 | `renderSettings` | |
| 7104 | `renderAudioMgr` | |
| 7170 | `renderAudioSlot` | |

### Transkrypty YouTube / budowanie lekcji
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 7215 | `extractYtId` | |
| 7220 | `fetchYouTubeTranscript` | ✓ |
| 7266 | `isSrtFormat` | |
| 7271 | `parseSrt` | |
| 7292 | `formatTime` | |
| 7309 | `getLessonModelConfig` | |
| 7321 | `fetchWithRetry` | ✓ |
| 7343 | `callLessonModel` | ✓ |
| 7415 | `lessonCacheKey` | |
| 7422 | `getCachedLesson` | |
| 7435 | `setCachedLesson` | |
| 7458 | `clearLessonCache` | |
| 7464 | `buildLessonFromTranscript` | ✓ |
| 7538 | `showRegenStatus` | |
| 7551 | `regenerateLessonDialog` | ✓ |
| 7640 | `processTranscriptToLesson` | ✓ |
| 7712 | `fetchAndProcessTranscript` | ✓ |
| 7731 | `fetchViaWorker` | ✓ |
| 7752 | `processYouTubeViaGemini` | ✓ |
| 7816 | `fetchAndProcessViaWorker` | ✓ |
| 7850 | `fetchAndProcessViaGemini` | ✓ |
| 7878 | `confirmDraftAndCreate` | ✓ |
| 7901 | `processManualPasteTranscript` | ✓ |

### Filmoteka / piosenki — widoki
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 7913 | `renderFilmoteka` | |
| 8358 | `renderSongs` | |

### SRS / quiz / budowanie zdań
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 8665 | `getSrsKey` | |
| 8666 | `updateSrs` | |
| 8679 | `getDueWords` | |
| 8685 | `startQuiz` | |
| 8700 | `startBuild` | |

### Tłumaczenie
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 8713 | `stopTranslateSpeech` | |
| 8717 | `startTranslateSpeech` | |
| 8756 | `doTranslate` | ✓ |
| 8778 | `addTranslateToLesson` | |
| 8813 | `renderTranslate` | |

### Mój słownik — widoki
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 8939 | `renderMyVocab` | |
| 9051 | `renderMyWords` | |
| 9062 | `renderMyPhrases` | |

### Import / eksport danych
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 9075 | `exportAllData` | |
| 9082 | `importData` | |

### Motyw / paleta
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 9099 | `applyTheme` | |
| 9132 | `applyPalette` | |

### Główny render
| Linia | Funkcja | async |
|------:|---------|:-----:|
| 9141 | `render` | |

---

## 2. Dead code (kandydaci)

Metoda: dla każdej z 165 funkcji z inwentarza policzono wystąpienia nazwy w `index.html` przez `grep -oE "\bNAZWA\b"`. Liczba == 1 → tylko definicja, zero odwołań (także zero w stringach `onclick`, w `window.X`, w komentarzach). Liczba == 2 → definicja + jedno odwołanie; każde z 62 takich wystąpień sprawdzono ręcznie, czy to realne wywołanie/handler, czy tylko string lub komentarz.

Numery linii względem stanu pliku na moment tej analizy (kilka przesunęło się o ~5 wobec inwentarza w sekcji 1 — równoległe edycje `index.html`, patrz learnings US-001).

### 2.1 Funkcje — kandydaci

| Funkcja | Linia | Wystąpień | Ocena | Rozmiar | Uwaga |
|---------|------:|:---------:|-------|--------:|-------|
| `callGemini` | 3310 | 1 | **pewny dead** | ~27 linii | Generyczny helper fetch do Gemini. Zastąpiony przez `callLessonModel` (14 wystąpień), który idzie przez `getLessonModelConfig`. Zero odwołań. |
| `deleteSourceFile` | 616 | 1 | **pewny dead** | ~9 linii | Para `saveSourceFile`/`loadSourceFile` używana (2 wyst. każda), `deleteSourceFile` nigdy nie wołany. |
| `deleteVideo` | 643 | 1 | **pewny dead** | ~10 linii | Analogicznie: `saveVideo`/`loadVideo` używane, `deleteVideo` nie. Wideo z IndexedDB nigdy nie jest kasowane. |
| `processFilm` | 3808 | 2 | **do weryfikacji** | ~62 linie | Drugie wystąpienie (linia 3865) to string `"processFilm error:"` w jej własnym bloku `catch` — NIE wywołanie. Brak jakiegokolwiek `onclick`/handlera, który by ją uruchamiał → funkcja nieosiągalna. To cała funkcja feature'u (upload pliku film/audio → lekcja przez Gemini). Decyzja człowieka: dopiąć brakujący przycisk czy usunąć martwy feature. |

### 2.2 Stałe (const)

Sprawdzono wszystkie 25 globalnych stałych UPPERCASE (kolumna 0). Każda ma ≥2 wystąpienia (definicja + co najmniej jedno użycie) — **brak martwych stałych**. Odpowiednika usuniętej wcześniej `OAI_VOICES` już nie ma.

Najniższe liczniki (definicja + 1 użycie, wszystkie żywe): `ACCENT_CHARS`, `DB_NAME`, `DB_VER`, `DRIVE_SCOPE`, `FEMALE_NAMES`, `_AUDIO_CACHE_MAX`.

### 2.3 Podsumowanie

- **Pewny dead (do usunięcia bez ryzyka):** `callGemini`, `deleteSourceFile`, `deleteVideo` — razem ~46 linii.
- **Do weryfikacji:** `processFilm` (~62 linie) — nieosiągalna, ale to porzucony feature, nie śmieć po refaktorze. Wymaga decyzji: rewire vs usuń.
- **Stałe:** zero martwych.

Pozostałe 161 funkcji ma ≥2 wystąpienia i potwierdzone realne wywołanie/handler. Funkcje typu `render*` wołane są w dispatcherze `render()` (linie ~9153–9164) albo zagnieżdżone w innych widokach — nie są dead.

Nic nie usunięto — to wyłącznie raport (`git diff --stat index.html` pusty).

---

## 3. Niespójności i ryzyka

Numery linii względem stanu pliku z momentu tej analizy (9175 linii). Sekcja wyłapuje wzorce, które przy edycji mogą cicho wprowadzić bug — głównie: zapisy do localStorage z pominięciem ochrony quota, wywołania AI z pominięciem retry, oraz braki `thinkingBudget:0` w martwym kodzie.

### 3.1 `localStorage.setItem` zamiast `safeSetItem` — RYZYKO WYSOKIE

`safeSetItem` (linia 2537) łapie `QuotaExceededError`, liczy zużycie i pokazuje bannerem komunikat usercie. Problem: jest wywoływane tylko w **4 miejscach** (wszystkie dla `lingua_my_lessons`):

| Linia | Funkcja | Klucz |
|------:|---------|-------|
| 2573 | `saveMyLesson` | `lingua_my_lessons` |
| 3530 | `saveCustomExercisesToLesson` | `lingua_my_lessons` |
| 3607 | `deleteCustomExercise` | `lingua_my_lessons` |
| 3699 | `saveAddedDialog` | `lingua_my_lessons` |

Pozostałe **~75 wywołań `localStorage.setItem`** idzie surowo, bez obsługi quota. Gdy przeglądarka odrzuci zapis (limit ~5 MB), w funkcji bez `try-catch` poleci nieobsłużony wyjątek → przerwany render / cicha utrata danych. Najgroźniejsze (duże dane):

| Linia | Funkcja | Klucz | Ryzyko |
|------:|---------|-------|--------|
| 3751 | `saveLessonAudio` | `lingua_audio` | **Krytyczne** — base64 audio (setki KB–MB na slot). Najszybciej przepełni quota, a zapis surowy. |
| 3758 | `deleteLessonAudio` | `lingua_audio` | Zapis całego obiektu audio surowo. |
| 2012 | `applyDriveData` | `lingua_audio` | Bulk import z Drive — `lingua_audio` + `lingua_my_lessons` + 18 innych kluczy, wszystkie surowo, bez quota. Pull dużego konta = pewny throw. |
| 3858 | `processFilm` | `lingua_lesson_videos` | (funkcja martwa, patrz 2.1) |
| 2581 | `deleteMyLesson` | `lingua_my_lessons` | Niespójne z `saveMyLesson` (obok, używa `safeSetItem`). |
| 3010, 3080, 3108, 4833, 4924, 5327, 5338, 5435, 5647, 5660, 5704, 5717, 5935, 6033, 6082, 6108, 7622, 8051, 8095, 8474, 8518, 8798, 8811 | inline edycje lekcji (`render*`, callbacki) | `lingua_my_lessons` | ~23 surowych zapisów tego samego dużego klucza, który `saveMyLesson` chroni. Edytując lekcję omijasz ochronę. |
| 9092–9096 | `importData` | `lingua_my_lessons`, `lingua_my_films`, `lingua_word_status`, `lingua_srs` | Import pliku usera — duży payload, surowo. |
| 7435, 7452, 7458 | cache lekcji | `lingua_lesson_cache` | Cache do 30 lekcji, surowo (ma jednak własny `try` przy odczycie). |

**Sugestia:** podmienić surowe `localStorage.setItem` na `safeSetItem` przynajmniej dla trzech dużych kluczy — `lingua_audio`, `lingua_my_lessons`, `lingua_lesson_videos` — oraz w `applyDriveData` i `importData`. Wyjątki, które już mają własny `try/catch` inline (`4452`, `4457` — `POPUP_CACHE`), można zostawić.

### 3.2 Bezpośredni `fetch()` do AI z pominięciem `fetchWithRetry` — RYZYKO ŚREDNIE

`fetchWithRetry` (linia 7326) robi backoff 2s→4s→8s na 429/500/503/529. Używają go poprawnie obie ścieżki w `callLessonModel`: Gemini (7363) i Anthropic (7403). Ale dwa **żywe** wywołania do `generativelanguage` idą bezpośrednim `fetch` — brak auto-retry na chwilowe 503/429:

| Linia | Funkcja | Stan | Uwaga |
|------:|---------|------|-------|
| 4469 | `showWordPopup` (popup tłumaczenia słowa) | **żywa** | Surowy `fetch`. Ma inline komunikat dla 429, ale bez ponowienia — przy 503 popup pokazuje błąd zamiast spróbować ponownie. |
| 7788 | `processYouTubeViaGemini` | **żywa** | Surowy `fetch` (z `fileData` YT). Obsługuje 429/400, ale nie ponawia 503 ("model przeciążony"), który na Gemini bywa częsty. |
| 3311 | `callGemini` | **martwa** (patrz 2.1) | Surowy `fetch`, brak retry. |
| 3832 | `processFilm` | **martwa/nieosiągalna** (patrz 2.1) | Surowy `fetch`, brak retry. |

**Sugestia:** przepiąć `4469` i `7788` na `fetchWithRetry`. `showWordPopup` używa łańcucha `.then()` — wystarczy zamienić `fetch(...)` na `fetchWithRetry(...)`, sygnatura odpowiedzi jest zgodna (zwraca `Response`).

### 3.3 `thinkingBudget:0` w wywołaniach Gemini — żywe ścieżki OK

Wszystkie 5 wywołań `generativelanguage`:

| Linia | Funkcja | `thinkingConfig:{thinkingBudget:0}` | Stan |
|------:|---------|:-----------------------------------:|------|
| 4469 | `showWordPopup` | ✅ (4478) | żywa |
| 7364 | `callLessonModel` (Gemini) | ✅ (7372) | żywa |
| 7789 | `processYouTubeViaGemini` | ✅ (7801) | żywa |
| 3312 | `callGemini` | ❌ brak | martwa |
| 3832 | `processFilm` | ❌ brak `generationConfig` w ogóle | martwa/nieosiągalna |

**Wniosek:** każda **żywa** ścieżka ma `thinkingBudget:0` — spójne. Brak go tylko w martwym kodzie. **Landmina:** jeśli `processFilm` zostanie podpięta z powrotem (decyzja z 2.1), to wpada w pułapkę z dwóch stron naraz — brak `thinkingBudget:0` (Gemini 2.5 zżera output na "myślenie" → urwany/pusty JSON) **oraz** brak retry. Przy ożywianiu tej funkcji trzeba dodać oba.

### 3.4 `try-catch` przy wywołaniach AI — wzorzec spójny (throw-w-głąb, catch-na-wejściu)

Funkcje rdzeniowe (`callLessonModel` 7348, `buildLessonFromTranscript` 7469, `processTranscriptToLesson` 7645, `processYouTubeViaGemini` 7757) **świadomie rzucają** wyjątki bez własnego `try-catch`, a łapią je punkty wejścia (handlery `onclick` / akcje usera). Sprawdzone — wszystkie wejścia mają `try-catch` ustawiający komunikat błędu w stanie:

| Wejście (łapie) | Linia `catch` | Wywołuje AI |
|-----------------|:-------------:|-------------|
| `doTranslate` | 8778 | `callLessonModel` (8773) |
| `confirmDraftAndCreate` | 7900 | `processTranscriptToLesson` → `callLessonModel` |
| `regenerateLessonDialog` | 7585 | `buildLessonFromTranscript` → `callLessonModel` |
| `fixVocabArticles` | 3013 | `callLessonModel` (2994) |
| `showWordPopup` | `.catch` 4521 | `fetch` Gemini |
| callbacki w `renderLesson` / `openEditEntryForm` | 5961+, 4882+ | `callLessonModel` |

**Ocena:** brak krytycznej luki. Ryzyko jest inne — wzorzec jest niejawny. Kto doda nowy `onclick:()=>jakasFunkcjaAI()` (fire-and-forget) i zapomni `try-catch`, dostanie nieobsłużony rejection bez komunikatu dla usera. **Sugestia:** trzymać konwencję „każdy nowy handler wołający AI ma własny `try-catch` + `set({...Error})}`" — tak jak istniejące. Ewentualnie globalny `window.addEventListener("unhandledrejection", ...)` jako siatka bezpieczeństwa.

### 3.5 Podsumowanie ryzyk

| # | Ryzyko | Waga | Lokalizacja | Sugestia |
|---|--------|------|-------------|----------|
| 1 | Duże zapisy (`lingua_audio`, `lingua_my_lessons`) omijają `safeSetItem` → uncaught QuotaExceededError | **Wysoka** | 3751, 3758, 2012, ~23× inline, 9092 | Podmienić na `safeSetItem` dla 3 dużych kluczy |
| 2 | Żywe wywołania Gemini bez `fetchWithRetry` → brak retry na 503 | Średnia | 4469, 7788 | Przepiąć na `fetchWithRetry` |
| 3 | `processFilm` przy ożywieniu: brak `thinkingBudget:0` + brak retry | Średnia (warunkowa) | 3832 | Dodać oba przy decyzji z 2.1 |
| 4 | Wzorzec `try-catch` AI niejawny — łatwo pominąć w nowym handlerze | Niska | konwencja | Trzymać konwencję / `unhandledrejection` |

Nic nie zmieniono w `index.html` — to wyłącznie raport (`git diff --stat index.html` pusty).
