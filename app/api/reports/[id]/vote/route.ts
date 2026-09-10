import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { voteReport, checkRateLimit } from "@/lib/reports";

const voteSchema = z.object({
  vote: z.enum(["confirm", "dismiss"]),
});

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// POST /api/reports/:id/vote { vote: "confirm" | "dismiss" }
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const allowed = await checkRateLimit(
      `radar:ratelimit:vote:${clientIp(request)}`,
      60, // max 60 votes per hour per IP
      3600
    );
    if (!allowed) {
      return NextResponse.json({ error: "Too many votes" }, { status: 429 });
    }

    const { id } = await ctx.params;
    const body = await request.json();
    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
    }

    const result = await voteReport(id, parsed.data.vote);
    if (result.status === "not_found") {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    if (result.status === "deleted") {
      return NextResponse.json({ deleted: true });
    }
    return NextResponse.json({ report: result.report });
  } catch (error) {
    console.error("Report vote error:", error);
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
  }
}
