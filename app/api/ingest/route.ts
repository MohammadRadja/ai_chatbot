import { NextResponse } from "next/server";
import { getEnv } from "@/config/env";
import { consumeRateLimit } from "@/lib/rate-limit";
import { refreshKnowledgeBase } from "@/server/ingestion/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous";
  const rate = consumeRateLimit(`ingest:${ip}`, 2, 10 * 60_000);
  if (!rate.allowed)
    return NextResponse.json(
      { error: "Refresh is limited to two attempts every ten minutes." },
      { status: 429 },
    );
  try {
    const env = getEnv();
    if (env.INGESTION_TOKEN) {
      const token = request.headers
        .get("authorization")
        ?.replace(/^Bearer\s+/i, "");
      if (token !== env.INGESTION_TOKEN)
        return NextResponse.json(
          { error: "Refresh authorization is required." },
          { status: 401 },
        );
    }
    const result = await refreshKnowledgeBase();
    return NextResponse.json({
      status: result.status,
      successCount: result.successCount,
      failureCount: result.failureCount,
      chunkCount: result.chunkCount,
      errors: result.errors,
    });
  } catch (error) {
    console.error("ingestion route error", error);
    return NextResponse.json(
      {
        error:
          "Refresh failed. The current knowledge snapshot is still in use.",
      },
      { status: 500 },
    );
  }
}
