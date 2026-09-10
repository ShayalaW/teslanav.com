import { redis } from "./redis";
import { REPORT_TYPES, REPORT_TYPE_META } from "@/types/report";
import type { ReportType, UserReport } from "@/types/report";

export { REPORT_TYPES, REPORT_TYPE_META };

// All live reports in one hash: field = report id, value = JSON UserReport.
// Report volume is small (community-driven), so bbox filtering server-side is fine.
const REPORTS_HASH = "radar:reports";

// How long each report type stays on the map before expiring.
// A "confirm" vote resets the clock from that moment.
export const REPORT_TTL_MS: Record<ReportType, number> = {
  police_hidden: 90 * 60 * 1000, // 90 min - cops move on
  police_visible: 60 * 60 * 1000, // 60 min - pulled-over clears fastest
  hazard: 4 * 60 * 60 * 1000, // 4 hours
  accident: 3 * 60 * 60 * 1000, // 3 hours
  road_closed: 12 * 60 * 60 * 1000, // 12 hours
};

// A report is removed early once this many more drivers dismiss it than confirm it
const DISMISS_MARGIN = 3;
const MAX_DISMISSES_BEFORE_REVIEW = 3;

function parseReport(raw: unknown): UserReport | null {
  // Upstash auto-deserializes JSON values, so a hash field may come back
  // as an object or as a raw string depending on the client path.
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object") return null;
  const report = parsed as UserReport;
  if (!report.id || !report.type) return null;
  return report;
}

async function pruneExpired(entries: Record<string, unknown>, now: number): Promise<UserReport[]> {
  const live: UserReport[] = [];
  const expiredIds: string[] = [];

  for (const [id, raw] of Object.entries(entries)) {
    const report = parseReport(raw);
    if (!report || report.expiresAt <= now) {
      expiredIds.push(id);
    } else {
      live.push(report);
    }
  }

  if (expiredIds.length > 0) {
    await redis.hdel(REPORTS_HASH, ...expiredIds);
  }

  return live;
}

export async function listReports(): Promise<UserReport[]> {
  const entries = await redis.hgetall<Record<string, unknown>>(REPORTS_HASH);
  if (!entries) return [];
  return pruneExpired(entries, Date.now());
}

export async function createReport(type: ReportType, lat: number, lng: number): Promise<UserReport> {
  const now = Date.now();
  const report: UserReport = {
    id: crypto.randomUUID(),
    type,
    lat,
    lng,
    createdAt: now,
    expiresAt: now + REPORT_TTL_MS[type],
    confirms: 0,
    dismisses: 0,
  };
  await redis.hset(REPORTS_HASH, { [report.id]: JSON.stringify(report) });
  return report;
}

export type VoteResult =
  | { status: "ok"; report: UserReport }
  | { status: "deleted" }
  | { status: "not_found" };

export async function voteReport(id: string, vote: "confirm" | "dismiss"): Promise<VoteResult> {
  const raw = await redis.hget<string>(REPORTS_HASH, id);
  const report = parseReport(raw);
  if (!report || report.expiresAt <= Date.now()) {
    return { status: "not_found" };
  }

  if (vote === "confirm") {
    report.confirms += 1;
    // A confirmation re-ups the report for its full TTL from now
    report.expiresAt = Math.max(report.expiresAt, Date.now() + REPORT_TTL_MS[report.type]);
  } else {
    report.dismisses += 1;
    if (
      report.dismisses >= MAX_DISMISSES_BEFORE_REVIEW &&
      report.dismisses - report.confirms >= DISMISS_MARGIN
    ) {
      await redis.hdel(REPORTS_HASH, id);
      return { status: "deleted" };
    }
  }

  await redis.hset(REPORTS_HASH, { [id]: JSON.stringify(report) });
  return { status: "ok", report };
}

// Rate limit helpers (per IP, fixed window)
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  return count <= limit;
}
