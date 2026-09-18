import { NextRequest, NextResponse } from "next/server";
import { redis, trackApiUsage } from "@/lib/redis";

const LOCATIONIQ_TOKEN = process.env.LOCATION_IQ_TOKEN || "";

// Cache reverse geocode results for 24 hours (locations don't change)
const CACHE_TTL = 86400; // 24 hours in seconds

// Round coordinates to create cache key (2 decimal places = ~1.1km grid)
function getCacheKey(lng: number, lat: number): string {
  const roundedLng = Math.round(lng * 100) / 100;
  const roundedLat = Math.round(lat * 100) / 100;
  // v2: payload now includes road/town components alongside placeName
  return `geocode:reverse:v2:${roundedLat},${roundedLng}`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lng = searchParams.get("lng");
  const lat = searchParams.get("lat");

  if (!lng || !lat) {
    return NextResponse.json(
      { error: "Missing coordinates" },
      { status: 400 }
    );
  }

  if (!LOCATIONIQ_TOKEN) {
    return NextResponse.json(
      { error: "LocationIQ token not configured" },
      { status: 500 }
    );
  }

  const lngNum = parseFloat(lng);
  const latNum = parseFloat(lat);
  const cacheKey = getCacheKey(lngNum, latNum);

  try {
    // Check cache first
    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      // Upstash auto-deserializes on read, so cached may already be an object
      const payload = typeof cached === "string" ? JSON.parse(cached) : cached;
      return NextResponse.json({ ...payload, cached: true });
    }

    // Not cached - fetch from LocationIQ
    const params = new URLSearchParams({
      key: LOCATIONIQ_TOKEN,
      lat: lat,
      lon: lng,
      format: "json",
      addressdetails: "1",
      normalizeaddress: "1",
    });

    const response = await fetch(
      `https://us1.locationiq.com/v1/reverse?${params.toString()}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LocationIQ API error: ${response.status} - ${errorText}`);
    }

    // Track API usage (only when actually calling LocationIQ, not from cache)
    trackApiUsage("reverse_geocoding").catch(console.error);

    const data = await response.json();
    
    // Build a nice place name from LocationIQ response
    const addr = data.address || {};
    const placeName = data.display_name || 
                      [addr.road, addr.city || addr.town || addr.village, addr.state].filter(Boolean).join(", ") ||
                      `${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`;

    // Structured components for the current-street chip (Tesla-style).
    // House number intentionally excluded from the chip.
    const road: string | null =
      addr.road || addr.pedestrian || addr.footway || addr.path || null;
    const town: string | null =
      addr.city || addr.town || addr.village || addr.hamlet || addr.county || null;
    const payload = { placeName, road, town };

    // Cache the result
    await redis.set(cacheKey, JSON.stringify(payload), { ex: CACHE_TTL });

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return NextResponse.json(
      { error: "Reverse geocoding request failed" },
      { status: 500 }
    );
  }
}

