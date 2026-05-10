# LinguaAgent

Aplikacja webowa do nauki języków obcych — angielski, francuski, włoski.

**[→ Otwórz aplikację](https://signoritaalfa.github.io/linguaagent)**

## Co potrafi

- 📚 **Lekcje** — dialog, słowniczek, gramatyka, ćwiczenia
- 🎙️ **TTS** — głosy lektorów (OpenAI nova/echo lub ElevenLabs)
- 📄 **Wgrywanie podręczników** — z PDF / zdjęcia / tekstu generuje lekcję (Anthropic Claude)
- 🎬 **Filmoteka** — krótkie klipy MP4/MP3 z transkrypcją i ćwiczeniami
- ✏️ **Ćwiczenia** — fiszki + uzupełnianie luk
- 🔊 **Nagrania audio** — 3 sloty per lekcja
- 🌙 **Tryb ciemny** — elegancki design (Playfair Display + Jost)

## Stack

Single-file HTML — **bez frameworków, bez backendu, bez Node.js**. Wszystko w jednym `index.html`:
- Vanilla JavaScript
- IndexedDB (pliki wideo)
- localStorage (lekcje, ustawienia, klucze API)
- Hostowane na GitHub Pages

## Wymagane klucze API

W ustawieniach apki (zapisywane lokalnie w localStorage):
- **OpenAI** — TTS + analiza tekstu
- **Anthropic Claude** — generowanie lekcji z PDF/zdjęć/wideo
- **ElevenLabs** *(opcjonalnie)* — alternatywne głosy
- **RapidAPI** *(w trakcie konfiguracji)* — transkrypcja z YouTube

## Dla deweloperów

Pełna instrukcja architektury w [`AGENTS.md`](AGENTS.md). Lokalna kopia robocza: `/Users/aleksandrabarwasna/lingua-agent/`.

## Licencja

Projekt prywatny. Wszelkie prawa zastrzeżone.
