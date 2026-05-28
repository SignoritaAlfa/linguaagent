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
