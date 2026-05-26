// Cloudflare Worker — pobiera napisy YouTube i zwraca jako SRT/JSON
//
// Deploy: workers.cloudflare.com → Create Worker → wklej ten plik → Save and Deploy
// Endpoint: https://YOUR-WORKER.YOUR-NAME.workers.dev/?id=VIDEOID&lang=en
//
// Returns JSON: { videoId, language, cueCount, cues:[{start,end,text}], srt }

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const videoId = url.searchParams.get("id");
    const wantLang = url.searchParams.get("lang") || "en";

    if (!videoId) {
      return jsonResp({ error: "Missing ?id=VIDEOID parameter" }, 400);
    }
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      return jsonResp({ error: "Invalid video id format" }, 400);
    }

    try {
      const watchResp = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (!watchResp.ok) {
        return jsonResp({ error: "YouTube fetch failed: HTTP " + watchResp.status }, 502);
      }

      const html = await watchResp.text();

      const tracksMatch = html.match(/"captionTracks":\s*(\[[^\]]+\])/);
      if (!tracksMatch) {
        return jsonResp({ error: "No captions available for this video (movie has no subtitles)" }, 404);
      }

      let tracks;
      try {
        tracks = JSON.parse(tracksMatch[1]);
      } catch (e) {
        return jsonResp({ error: "Failed to parse captionTracks: " + e.message }, 500);
      }

      if (!Array.isArray(tracks) || tracks.length === 0) {
        return jsonResp({ error: "Empty caption tracks" }, 404);
      }

      let track =
        tracks.find((t) => t.languageCode === wantLang && t.kind !== "asr") ||
        tracks.find((t) => t.languageCode === wantLang) ||
        tracks.find((t) => t.languageCode === "en" && t.kind !== "asr") ||
        tracks.find((t) => t.languageCode === "en") ||
        tracks[0];

      let baseUrl = String(track.baseUrl || "").replace(/\\u0026/g, "&");
      if (!baseUrl) {
        return jsonResp({ error: "No baseUrl in caption track" }, 500);
      }
      // Force json3 format for predictable parsing (YouTube returns srv3 XML by default, varies)
      baseUrl = baseUrl.replace(/&fmt=[^&]*/g, "") + "&fmt=json3";

      const capResp = await fetch(baseUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!capResp.ok) {
        return jsonResp({ error: "Caption fetch failed: HTTP " + capResp.status }, 502);
      }

      const raw = await capResp.text();
      const cues = parseCaptions(raw);

      if (cues.length === 0) {
        // Try fallback: explicitly request srv1 XML format
        const srv1Url = baseUrl.replace(/&fmt=json3/, "&fmt=srv1");
        const altResp = await fetch(srv1Url, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (altResp.ok) {
          const altRaw = await altResp.text();
          const altCues = parseCaptions(altRaw);
          if (altCues.length > 0) {
            return buildResponse(videoId, track, altCues);
          }
        }
        return jsonResp({ error: "Captions returned but no cues parsed (response head: " + raw.slice(0, 200) + ")" }, 500);
      }

      return buildResponse(videoId, track, cues);
    } catch (e) {
      return jsonResp({ error: "Worker exception: " + e.message }, 500);
    }
  },
};

function parseCaptions(raw) {
  if (!raw || !raw.trim()) return [];
  // Try JSON3 format first
  try {
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.events)) {
      const cues = [];
      for (const ev of data.events) {
        if (!ev.segs) continue;
        const text = ev.segs.map((s) => s.utf8 || "").join("").replace(/\s+/g, " ").trim();
        if (!text) continue;
        const start = (ev.tStartMs || 0) / 1000;
        const duration = (ev.dDurationMs || 0) / 1000;
        cues.push({ start, end: +(start + duration).toFixed(3), text });
      }
      if (cues.length > 0) return cues;
    }
  } catch (e) {
    // Not JSON, try XML
  }
  // Try srv1 XML: <text start="0.0" dur="3.5">text</text>
  const cues = [];
  const srv1Re = /<text\s+start="([\d.]+)"\s+dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  let m;
  while ((m = srv1Re.exec(raw))) {
    const start = parseFloat(m[1]);
    const duration = parseFloat(m[2]);
    const text = decodeHtml(m[3]).replace(/\s+/g, " ").trim();
    if (text) cues.push({ start, end: +(start + duration).toFixed(3), text });
  }
  if (cues.length > 0) return cues;
  // Try srv3 XML: <p t="0" d="3500">text</p>
  const srv3Re = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  while ((m = srv3Re.exec(raw))) {
    const start = parseInt(m[1], 10) / 1000;
    const duration = parseInt(m[2], 10) / 1000;
    // srv3 inner may have <s> segments — strip tags
    const text = decodeHtml(m[3].replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
    if (text) cues.push({ start, end: +(start + duration).toFixed(3), text });
  }
  return cues;
}

function buildResponse(videoId, track, cues) {
  const srt = cues
    .map(
      (c, i) =>
        `${i + 1}\n${secToSrt(c.start)} --> ${secToSrt(c.end)}\n${c.text}`
    )
    .join("\n\n");
  return jsonResp({
    videoId,
    language: track.languageCode,
    languageName: (track.name && track.name.simpleText) || "",
    kind: track.kind || "manual",
    cueCount: cues.length,
    cues,
    srt,
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, max-age=3600",
  };
}

function jsonResp(obj, status) {
  return new Response(JSON.stringify(obj, null, 2), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders() },
  });
}

function decodeHtml(s) {
  return String(s)
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function secToSrt(sec) {
  const ms = Math.round((sec - Math.floor(sec)) * 1000);
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `${pad(h, 2)}:${pad(mm, 2)}:${pad(r, 2)},${pad(ms, 3)}`;
}

function pad(n, len) {
  return String(n).padStart(len, "0");
}
