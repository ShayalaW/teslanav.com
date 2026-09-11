import { NextRequest, NextResponse } from "next/server";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// In-memory cache: rounded position -> { mph, at }
const cache = new Map<string, { mph: number | null; at: number }>();
const CACHE_TTL_MS = 60 * 1000;

interface MaxspeedEntry {
  speed?: number;
  unit?: string; // "mph" or "km/h"
  unknown?: boolean;
  none?: boolean;
}

function toMph(entry: MaxspeedEntry): number | null {
  if (entry.unknown || entry.none || entry.speed == null) return null;
  return entry.unit === "km/h" ? entry.speed / 1.60934 : entry.speed;
}

export async function POST(request: NextRequest) {
  if (!MAPBOX_TOKEN) {
    return NextResponse.json({ speedLimitMph: null }, { status: 200 });
  }

  let trace: { lng: number; lat: number }[];
  try {
    const body = await request.json();
    trace = body.trace;
  } catch {
    return NextResponse.json({ speedLimitMph: null }, { status: 200 });
  }
  if (!Array.isArray(trace) || trace.length === 0) {
    return NextResponse.json({ speedLimitMph: null }, { status: 200 });
  }
  trace = trace.slice(-4);
  const last = trace[trace.length - 1];

  const cacheKey = `${last.lat.toFixed(3)},${last.lng.toFixed(3)}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json({ speedLimitMph: hit.mph, cached: true });
  }

  const finish = (mph: number | null, source: string) => {
    cache.set(cacheKey, { mph, at: Date.now() });
    if (cache.size > 500) cache.clear();
    return NextResponse.json({ speedLimitMph: mph, source });
  };

  // Primary: map matching with maxspeed annotations
  try {
    const coords = trace.map((p) => `${p.lng},${p.lat}`).join(";");
    const radiuses = trace.map(() => "35").join(";");
    const url = `https://api.mapbox.com/matching/v5/mapbox/driving/${coords}?annotations=maxspeed&overview=full&geometries=geojson&radiuses=${radiuses}&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const match = data.matchings?.[0];
      if (match?.geometry?.coordinates?.length) {
        const geo: [number, number][] = match.geometry.coordinates;
        // Nearest geometry point to current position
        let bestIdx = 0;
        let bestDist = Infinity;
        for (let i = 0; i < geo.length; i++) {
          const d = (geo[i][0] - last.lng) ** 2 + (geo[i][1] - last.lat) ** 2;
          if (d < bestDist) { bestDist = d; bestIdx = i; }
        }
        // Annotation arrays are per-segment across legs; flatten in order
        const entries: MaxspeedEntry[] = [];
        for (const leg of match.legs ?? []) {
          const ann = leg.annotation?.maxspeed;
          if (Array.isArray(ann)) entries.push(...ann);
        }
        if (entries.length > 0) {
          const idx = Math.max(0, Math.min(bestIdx - 1, entries.length - 1));
          // Walk outward from the nearest segment to find a known limit
          for (let off = 0; off < Math.min(entries.length, 40); off++) {
            const fwd = entries[idx + off];
            if (fwd) { const mph = toMph(fwd); if (mph != null) return finish(Math.round(mph), "match"); }
            const bwd = entries[idx - off];
            if (bwd) { const mph = toMph(bwd); if (mph != null) return finish(Math.round(mph), "match"); }
          }
        }
      }
    }
  } catch {
    // fall through to tilequery
  }

  // Fallback: tilequery the streets road layer at the current point
  try {
    const url = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${last.lng},${last.lat}.json?radius=40&limit=5&layers=road&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      for (const f of data.features ?? []) {
        const raw = f.properties?.maxspeed;
        if (!raw) continue;
        const n = parseInt(String(raw), 10);
        if (!isNaN(n)) {
          const mph = /km/.test(String(raw)) ? Math.round(n / 1.60934) : n;
          return finish(mph, "tilequery");
        }
      }
    }
  } catch {
    // no limit available
  }

  return finish(null, "none");
}
