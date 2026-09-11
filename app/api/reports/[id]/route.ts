import { NextRequest, NextResponse } from "next/server";
import { deleteReport, checkRateLimit } from "@/lib/reports";

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// DELETE /api/reports/:id - remove a report (offered in-app for your own reports)
export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const allowed = await checkRateLimit(
      `radar:ratelimit:delete:${clientIp(request)}`,
      30,
      3600
    );
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    const { id } = await ctx.params;
    const deleted = await deleteReport(id);
    if (!deleted) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("Delete report error:", err);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}
