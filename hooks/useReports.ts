"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { UserReport, ReportType } from "@/types/report";
import type { MapBounds } from "@/types/waze";

const VOTED_STORAGE_PREFIX = "radar-voted:";

function hasVoted(id: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(VOTED_STORAGE_PREFIX + id) !== null;
}

function markVoted(id: string, vote: "confirm" | "dismiss"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOTED_STORAGE_PREFIX + id, vote);
}

const OWN_REPORTS_KEY = "radar-my-reports";

function getOwnIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(OWN_REPORTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function markOwn(id: string): void {
  if (typeof window === "undefined") return;
  const ids = getOwnIds();
  ids.push(id);
  localStorage.setItem(OWN_REPORTS_KEY, JSON.stringify(ids.slice(-50)));
}

function isOwn(id: string): boolean {
  return getOwnIds().includes(id);
}

interface UseReportsOptions {
  bounds: MapBounds | null;
  refreshInterval?: number;
  debounceMs?: number;
}

export function useReports({
  bounds,
  refreshInterval = 30000,
  debounceMs = 400,
}: UseReportsOptions) {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastBounds = useRef<MapBounds | null>(null);

  const fetchReports = useCallback(async (b: MapBounds) => {
    try {
      const params = new URLSearchParams({
        left: b.west.toString(),
        right: b.east.toString(),
        bottom: b.south.toString(),
        top: b.north.toString(),
      });
      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) return;
      const data = await response.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  }, []);

  // Debounced fetch on bounds change
  useEffect(() => {
    if (!bounds) return;
    lastBounds.current = bounds;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchReports(bounds), debounceMs);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [bounds, debounceMs, fetchReports]);

  // Periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastBounds.current) fetchReports(lastBounds.current);
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, fetchReports]);

  const submitReport = useCallback(
    async (type: ReportType, lat: number, lng: number): Promise<UserReport | null> => {
      setSubmitting(true);
      try {
        const response = await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, lat, lng }),
        });
        if (!response.ok) return null;
        const data = await response.json();
        const report = data.report as UserReport;
        setReports((prev) => [...prev.filter((r) => r.id !== report.id), report]);
        markOwn(report.id);
        return report;
      } catch (err) {
        console.error("Failed to submit report:", err);
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const vote = useCallback(
    async (id: string, voteKind: "confirm" | "dismiss"): Promise<void> => {
      if (hasVoted(id)) return;
      markVoted(id, voteKind);
      try {
        const response = await fetch(`/api/reports/${id}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vote: voteKind }),
        });
        if (!response.ok) return;
        const data = await response.json();
        if (data.deleted) {
          setReports((prev) => prev.filter((r) => r.id !== id));
        } else if (data.report) {
          setReports((prev) =>
            prev.map((r) => (r.id === id ? (data.report as UserReport) : r))
          );
        }
      } catch (err) {
        console.error("Failed to vote on report:", err);
      }
    },
    []
  );

  return { reports, submitting, submitReport, vote, hasVoted, isOwn };
}
