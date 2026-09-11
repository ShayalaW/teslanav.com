import { NextRequest, NextResponse } from "next/server";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// In-memory cache: rounded origin -> { payload, at }
const cache = new Map<string, { payload: unknown; at: number }>();
const CACHE_TTL_MS = 60 * 1000;

const AHEAD_METERS = 2500;

function destinationPoint(lat: number, lng: number, bearingDeg: number, distM: number) {
  const R = 6371000;
  const brng = (bearingDeg * Math.PI) / 180;
  const d = distM / R;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lng * Math.PI) / 180;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng));
  const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: (lat2 * 180) / Math.PI, lng: ((((lon2 * 180) / Math.PI) + 540) % 360) - 180 };
}

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const lat = parseFloat(p.get("lat") || "");
  const lng = parseFloat(p.get("lng") || "");
  const heading = parseFloat(p.get("heading") || "");
  if ([lat, lng, heading].some((v) => Number.isNaN(v))) {
    return NextResponse.json({ closures: [], incidents: [] });
  }

  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)},${Math.round(heading / 45)}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json(hit.payload);
  }

  if (!MAPBOX_TOKEN) {
    return NextResponse.json({ closures: [], incidents: [] });
  }

  try {
    const dest = destinationPoint(lat, lng, heading, AHEAD_METERS);
    const coords = `${lng},${lat};${dest.lng},${dest.lat}`;
    const url =
      `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coords}` +
      `?overview=full&geometries=geojson&annotations=closure&steps=false&notifications=all` +
      `&continue_straight=true&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ closures: [], incidents: [] });
    }
    const data = await res.json();
    const route = data.routes?.[0];
    const geo: [number, number][] = route?.geometry?.coordinates ?? [];

    const closures: { lat: number; lng: number }[] = [];
    const incidents: { lat: number; lng: number; description: string }[] = [];

    for (const leg of route?.legs ?? []) {
      for (const c of leg.annotation?.closure ?? []) {
        const idx = c.geometry_index_start;
        if (typeof idx === "number" && geo[idx]) {
          closures.push({ lat: geo[idx][1], lng: geo[idx][0] });
        }
      }
      // Incidents are present on driving-traffic legs when they affect the route
      for (const inc of leg.incidents ?? []) {
        const idx = inc.geometry_index_start;
        const pt = typeof idx === "number" && geo[idx] ? geo[idx] : geo[Math.floor(geo.length / 2)];
        if (pt) {
          incidents.push({
            lat: pt[1],
            lng: pt[0],
            description: String(inc.type || inc.description || "incident").replace(/_/g, " "),
          });
        }
      }
    }

    const payload = { closures, incidents };
    cache.set(cacheKey, { payload, at: Date.now() });
    if (cache.size > 200) cache.clear();
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ closures: [], incidents: [] });
  }
}
