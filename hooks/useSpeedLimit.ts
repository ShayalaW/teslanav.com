"use client";

import { useEffect, useRef, useState } from "react";

interface TracePoint {
  lng: number;
  lat: number;
}

function haversineM(a: TracePoint, b: TracePoint): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const MIN_INTERVAL_MS = 5000;
const MIN_DISTANCE_M = 30;

// Posted speed limit for the road being driven, via server-side Mapbox
// map matching (maxspeed annotation) with a tilequery fallback.
export function useSpeedLimit(
  latitude: number | null,
  longitude: number | null
): number | null {
  const [speedLimitMph, setSpeedLimitMph] = useState<number | null>(null);
  const traceRef = useRef<TracePoint[]>([]);
  const lastFetchRef = useRef<{ at: number; lng: number; lat: number } | null>(null);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const trace = traceRef.current;
    const prev = trace[trace.length - 1];
    if (!prev || haversineM(prev, { lat: latitude, lng: longitude }) > 5) {
      trace.push({ lat: latitude, lng: longitude });
      if (trace.length > 4) trace.shift();
    }
    if (trace.length < 2) return;

    const lastFetch = lastFetchRef.current;
    if (lastFetch) {
      if (Date.now() - lastFetch.at < MIN_INTERVAL_MS) return;
      if (haversineM(lastFetch, { lat: latitude, lng: longitude }) < MIN_DISTANCE_M) return;
    }
    lastFetchRef.current = { at: Date.now(), lat: latitude, lng: longitude };

    fetch("/api/speedlimit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trace }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.speedLimitMph === "number") {
          setSpeedLimitMph(data.speedLimitMph);
        }
      })
      .catch(() => {});
  }, [latitude, longitude]);

  return speedLimitMph;
}
