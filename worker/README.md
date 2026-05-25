# Lingua Agent — YouTube Captions Worker

Cloudflare Worker który pobiera napisy z YouTube i zwraca je jako JSON + SRT. Pozwala apce **auto-pobierać transkrypcję** klipu po kliknięciu zamiast manualnego wklejania.

## Co robi

- Wejście: `GET https://YOUR-WORKER/?id=VIDEOID&lang=en`
- Pobiera stronę YouTube po stronie serwera (bez CORS)
- Wyciąga `captionTracks` z konfigu odtwarzacza
- Pobiera XML napisów
- Zwraca JSON z `cues` (start, end, text) i gotowy `srt`

Free tier Cloudflare Workers: **100 000 requestów/dzień** — Ty tyle nie zrobisz w życiu.

## Setup (jednorazowo, ~5-10 min)

### Krok 1 — Konto Cloudflare

1. Wejdź na **dash.cloudflare.com** → Sign Up (jeśli nie masz)
2. Email + hasło → potwierdź mailem → zaloguj

### Krok 2 — Stwórz Worker

1. Lewe menu → **Workers & Pages**
2. Klik **Create application** → zakładka **Workers** → **Create Worker**
3. Nazwa: np. `lingua-captions` → **Deploy** (deploy domyślnego "hello world" żeby Worker w ogóle powstał)

### Krok 3 — Wklej kod

1. Po deployu pojawi się przycisk **Edit code** (lub "Quick edit") — klik
2. W edytorze po lewej masz `worker.js` z domyślnym hello world — **wykasuj wszystko** (Cmd+A → Delete)
3. Otwórz plik `worker/worker.js` z tego repo (`/Users/aleksandrabarwasna/lingua-agent/worker/worker.js`) → Cmd+A → Cmd+C
4. Wklej w edytor Cloudflare (Cmd+V)
5. Klik **Save and deploy** (prawy górny)

### Krok 4 — Skopiuj URL

1. Po deployu na górze widzisz URL typu: `https://lingua-captions.TWOJA-NAZWA.workers.dev`
2. Skopiuj cały URL

### Krok 5 — Wklej w apce

1. Otwórz Lingua Agent → Ustawienia
2. Sekcja "🎬 Worker do transkrypcji YouTube" → wklej URL → Zapisz
3. Wracaj do Filmoteki → klip → klik **"🤖 Auto pobierz transkrypt"** → leci sam

## Test ręczny (opcjonalnie)

W terminalu:

```bash
curl "https://YOUR-WORKER.workers.dev/?id=6z6g8mKEs9k" | head -50
```

Powinno zwrócić JSON z `cues` (lista linii dialogu) i `srt` (gotowy plik napisów).

## Co kiedy nie działa

- **HTTP 404 "No captions available"** — to wideo nie ma napisów na YouTube. Pobierz audio i użyj Whisper, albo wybierz inny klip
- **HTTP 502** — YouTube zwrócił błąd. Spróbuj ponownie za chwilę
- **CORS w przeglądarce** — Worker ma `Access-Control-Allow-Origin: *` więc powinno działać; jeśli nie, sprawdź czy wkleiłaś URL z `https://` na początku

## Aktualizacja

Jeśli kiedyś poprawimy kod Workera:
1. Otwórz Worker w Cloudflare dashboard
2. Edit code → wklej nową wersję → Save and deploy
3. URL Workera się nie zmienia, apka nadal działa
