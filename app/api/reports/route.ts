import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createReport,
  listReports,
  checkRateLimit,
  REPORT_TYPES,
} from "@/lib/reports";
import type { ReportType } from "@/types/report";

const createSchema = z.object({
  type: z.enum(REPORT_TYPES as [ReportType, ...ReportType[]]),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// GET /api/reports?left=&right=&bottom=&top= - live reports inside a bounding box
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const west = parseFloat(searchParams.get("left") || "");
    const east = parseFloat(searchParams.get("right") || "");
    const south = parseFloat(searchParams.get("bottom") || "");
    const north = parseFloat(searchParams.get("top") || "");

    const all = await listReports();

    const hasBounds = [west, east, south, north].every((n) => Number.isFinite(n));
    const reports = hasBounds
      ? all.filter(
          (r) => r.lng >= west && r.lng <= east && r.lat >= south && r.lat <= north
        )
      : all;

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Reports GET error:", error);
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}

// POST /api/reports { type, lat, lng } - submit a report at the driver's location
export async function POST(request: NextRequest) {
  try {
    const allowed = await checkRateLimit(
      `radar:ratelimit:create:${clientIp(request)}`,
      10, // max 10 reports per hour per IP
      3600
    );
    if (!allowed) {
      return NextResponse.json({ error: "Too many reports" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid report" }, { status: 400 });
    }

    const report = await createReport(parsed.data.type, parsed.data.lat, parsed.data.lng);
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Reports POST error:", error);
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
  }
}
