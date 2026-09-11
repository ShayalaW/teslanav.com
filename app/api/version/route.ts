import { NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/version";

export const dynamic = "force-dynamic";

// The page polls this to detect new deploys and reload itself (the Tesla
// browser keeps pages open for days without ever re-fetching the HTML)
export async function GET() {
  return NextResponse.json(
    {
      version: APP_VERSION,
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
    },
    { headers: { "Cache-Control": "no-store, must-revalidate" } }
  );
}
