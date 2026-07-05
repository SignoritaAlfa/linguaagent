# CLAUDE.md - LinguaAgent (apka do nauki języków)

> PRZEPISANY 2026-07-04: poprzednia wersja opisywała React+FastAPI+PostgreSQL - stack INNEGO projektu, sprzeczny z rzeczywistością. Backup: CLAUDE.md.backup-2026-07-04.

## Źródło prawdy o projekcie

**`AGENTS.md` w tym folderze** - stack, architektura ekranów, struktura danych lekcji, API i klucze, design system, zasady pracy z kodem. Przeczytaj PRZED jakąkolwiek zmianą. Ten plik tylko uzupełnia go o metodykę.

Fakty twarde (z AGENTS.md - nie zmieniaj bez decyzji Aleksandry):
- JEDEN plik `index.html` (vanilla JS + CSS variables), zero frameworków, zero Node, zero backendu
- Dane: localStorage + IndexedDB (wideo). Klucze API tylko w localStorage - NIGDY w kodzie
- Repo: `SignoritaAlfa/linguaagent` (GitHub Pages); klon roboczy: `~/lingua-agent/`; kopia w vaulcie = snapshot, sprawdź aktualność przed pracą

## Protokół Fable 5 (metodyka - jak wszyscy agenci Aleksandry)

1. **Na starcie**: przeczytaj (Read) `../.claude/rules/fable5-core.md` (root vaulta). Obowiązują zwłaszcza: #1 (plan przed działaniem - przy zmianie >1 funkcji opisz logikę w punktach i czekaj na OK), #3 (poziomy pewności), #12 (licz narzędziem), #13 (Grep przed Read - index.html ma ~240 KB, NIGDY nie czytaj całości; `grep -n "function\|=>" index.html` do nawigacji).
2. **Backup przed edycją**: `cp index.html index.html.backup-YYYY-MM-DD` (hook backupów vaulta obejmuje tylko xlsx - tu robisz ręcznie).
3. **Nie zgaduj API**: składnia wywołań OpenAI/ElevenLabs/Anthropic - z AGENTS.md albo z oficjalnych docs (WebSearch), nigdy z pamięci. Modele i voice ID są w AGENTS.md.
4. **Samokontrola przed <DONE>** (odpowiednik fable5-core #8): (a) zmiana minimalna - nie ruszyłeś kodu, o który nie proszono? (b) otwórz apkę w przeglądarce, przeklikaj zmieniony ekran, konsola bez nowych błędów; (c) iOS-wymagania z AGENTS.md zachowane? (d) zero hardkodowanych kluczy? (e) sekcja "co zmieniłem + jak przetestowałem" w odpowiedzi.
5. **Sprzeczność między moim poleceniem a AGENTS.md** -> zgłoś przed wykonaniem (nie wykonuj po cichu żadnej wersji).

## Zasady komunikacji (zachowane z poprzedniej wersji - działały)

- Plan/logika w punktach PRZED kodem przy większych zmianach; czekaj na "OK"
- Partial updates: pokazuj zmieniony fragment, nie cały plik
- Minimal changes; kod czystszy niż zastany; bez oczywistych komentarzy
- Feedback po polsku; błąd w architekturze wytykaj wprost, zanim napiszesz kod
- Koniec zadania = tag <DONE>, bez dopisków po nim

## Styl tekstów lekcji

Treści lekcji (dialogi, słowniczki) wg `../.claude/skills/ai-writing-patterns.md` + poziomy CEFR spójne z deklarowanym poziomem lekcji.
