import { NextRequest, NextResponse } from "next/server";
import { trackApiUsage } from "@/lib/redis";

const LOCATIONIQ_TOKEN = process.env.LOCATION_IQ_TOKEN || "";

// LocationIQ API response type
interface LocationIQPlace {
  place_id: string;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: {
    name?: string;
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
  };
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Mapbox Geocoding v6 response shape (fields we use)
interface MapboxFeature {
  id: string;
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    full_address?: string;
    place_formatted?: string;
    feature_type?: string;
  };
}

/**
 * Mapbox Geocoding fallback - much stronger on exact residential addresses
 * (house numbers) than LocationIQ. 100K free requests/month.
 */
async function mapboxGeocode(
  query: string,
  userLng: number | null,
  userLat: number | null
): Promise<{ id: string; place_name: string; text: string; center: [number, number] }[]> {
  if (!MAPBOX_TOKEN) return [];
  const params = new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    q: query,
    country: "us",
    limit: "5",
  });
  if (userLng !== null && userLat !== null) {
    params.set("proximity", `${userLng},${userLat}`);
  }
  const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`);
  if (!response.ok) {
    console.log("[Geocode] Mapbox fallback error:", response.status);
    return [];
  }
  const data = await response.json();
  return (data.features || []).map((f: MapboxFeature) => ({
    id: f.id,
    place_name: f.properties.full_address || f.properties.name || "",
    text: f.properties.name || (f.properties.full_address || "").split(",")[0],
    center: f.geometry.coordinates,
    _featureType: f.properties.feature_type || "",
  }));
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * GET /api/geocode?q=query&proximity=lng,lat
 * Uses LocationIQ Geocoding API (5K free requests/day = 150K/month)
 * Returns results WITH coordinates - sorted by proximity to user!
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const proximity = searchParams.get("proximity");

  if (!query) {
    return NextResponse.json(
      { error: "Missing search query" },
      { status: 400 }
    );
  }

  if (!LOCATIONIQ_TOKEN) {
    return NextResponse.json(
      { error: "LocationIQ token not configured" },
      { status: 500 }
    );
  }

  // Parse user location for proximity sorting
  let userLng: number | null = null;
  let userLat: number | null = null;
  if (proximity) {
    const [lng, lat] = proximity.split(",").map(Number);
    if (!isNaN(lng) && !isNaN(lat)) {
      userLng = lng;
      userLat = lat;
    }
  }
  
  console.log("[Geocode] Query:", query, "| Proximity:", proximity, "| Parsed userLng:", userLng, "userLat:", userLat);

  try {
    // Use LocationIQ Geocoding API - 5K free requests/day!
    const baseUrl = "https://us1.locationiq.com/v1/search";
    
    // Strategy: Get lots of results with viewbox hint (not bounded), then sort by distance
    // This gives us better POI coverage than strict bounding
    const params = new URLSearchParams({
      key: LOCATIONIQ_TOKEN,
      q: query,
      format: "json",
      limit: "20", // Get many results to sort through
      countrycodes: "us",
      addressdetails: "1",
      normalizeaddress: "1",
      dedupe: "1", // Remove duplicate results
    });
    
    // If user has location, use viewbox as a HINT (not bounded)
    // This biases results toward the user's area but doesn't exclude far results
    if (userLng !== null && userLat !== null) {
      const delta = 1.0; // ~100km hint area
      params.set("viewbox", `${userLng - delta},${userLat - delta},${userLng + delta},${userLat + delta}`);
      // NOT using bounded=1 so we get results from everywhere, sorted by relevance
    }

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    let data: LocationIQPlace[] = [];

    // LocationIQ returns 404 with "Unable to geocode" when no results found
    if (response.ok) {
      data = await response.json();
    } else if (response.status === 404) {
      console.log("[Geocode] No results found for query");
      data = [];
    } else {
      const errorText = await response.text();
      throw new Error(`LocationIQ API error: ${response.status} - ${errorText}`);
    }

    // Track API usage (fire and forget - don't block response)
    trackApiUsage("geocoding").catch(console.error);

    // Transform LocationIQ response to match our expected format
    let features = (Array.isArray(data) ? data : []).map((place) => {
      // Build a nice short name from the address components
      const addr = place.address || {};
      const shortName = place.name || 
        addr.name ||
        [addr.house_number, addr.road].filter(Boolean).join(" ") ||
        addr.neighbourhood ||
        addr.suburb ||
        addr.city || addr.town || addr.village ||
        place.display_name.split(",")[0];

      const placeLat = parseFloat(place.lat);
      const placeLng = parseFloat(place.lon);

      return {
        id: place.place_id,
        place_name: place.display_name,
        text: shortName,
        center: [placeLng, placeLat] as [number, number],
        // Add distance for sorting (will be removed before response)
        _distance: userLat !== null && userLng !== null 
          ? getDistanceKm(userLat, userLng, placeLat, placeLng)
          : Infinity,
      };
    });

    // Sort by distance from user and take top 5
    if (userLat !== null && userLng !== null) {
      console.log("[Geocode] Before sort - distances:", features.map(f => ({ text: f.text, dist: Math.round(f._distance) + "km" })));
      features = features
        .sort((a, b) => a._distance - b._distance)
        .slice(0, 5);
      console.log("[Geocode] After sort - top 5:", features.map(f => ({ text: f.text, dist: Math.round(f._distance) + "km" })));
    } else {
      console.log("[Geocode] No proximity - returning unsorted results");
    }

    // LocationIQ is weak on exact house-number addresses and can even return
    // a same-numbered address in the wrong state. For address-like queries
    // (contains digits), always ask Mapbox too; an exact house-number address
    // match outranks everything else, then results sort by distance.
    const queryDigits = query.match(/\d+/);
    const liHasExactHouse = (Array.isArray(data) ? data : []).some((place) => {
      if (!queryDigits || place.address?.house_number !== queryDigits[0]) return false;
      // Guard against same-number-different-town matches: the query's town or
      // state fragment should appear in the display name
      const dn = place.display_name.toLowerCase();
      const qParts = query.toLowerCase().replace(/[0-9]/g, " ").split(/[ ,]+/).filter(w => w.length > 2);
      return qParts.some(w => dn.includes(w));
    });
    if (queryDigits && !liHasExactHouse) {
      console.log("[Geocode] No exact house-number match from LocationIQ - trying Mapbox fallback");
      try {
        const mbFeatures = await mapboxGeocode(query, userLng, userLat);
        if (mbFeatures.length > 0) {
          const withDistance = mbFeatures.map((f) => ({
            ...f,
            _distance: userLat !== null && userLng !== null
              ? getDistanceKm(userLat, userLng, f.center[1], f.center[0])
              : Infinity,
          }));
          const merged = [...features, ...withDistance];
          // Exact house-number address results first, then by distance
          const exactAddr = (f: { text: string; _featureType?: string } & Record<string, unknown>) =>
            f._featureType === "address" && queryDigits && f.text.includes(queryDigits[0]) ? 0 : 1;
          merged.sort((a, b) => exactAddr(a) - exactAddr(b) || a._distance - b._distance);
          // Dedupe by rounded coordinates (same place from both providers)
          const seen = new Set<string>();
          features = merged.filter((f) => {
            const key = `${f.center[0].toFixed(4)},${f.center[1].toFixed(4)}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          }).slice(0, 5);
          console.log("[Geocode] Merged results:", features.map(f => f.text));
        }
      } catch (e) {
        console.log("[Geocode] Mapbox fallback failed:", e);
      }
    }

    // Remove internal _distance field before returning
    const cleanedFeatures = features.map((f) => {
      const { _distance, ...rest } = f as typeof f & { _featureType?: string };
      delete (rest as Record<string, unknown>)._featureType;
      return rest;
    });

    return NextResponse.json({ features: cleanedFeatures });
  } catch (error) {
    console.error("Geocoding error:", error);
    // LocationIQ failed entirely (outage, rate limit) - try Mapbox directly
    try {
      const mbFeatures = await mapboxGeocode(query, userLng, userLat);
      if (mbFeatures.length > 0) {
        return NextResponse.json({ features: mbFeatures });
      }
    } catch (e) {
      console.error("Mapbox fallback also failed:", e);
    }
    return NextResponse.json(
      { error: "Geocoding request failed" },
      { status: 500 }
    );
  }
}

