import { NextResponse } from "next/server";
import { getKnowledgeStatus } from "@/server/ingestion/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const status = await getKnowledgeStatus();
    return NextResponse.json(status, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("health route error", error);
    return NextResponse.json(
      { error: "Knowledge status unavailable." },
      { status: 503 },
    );
  }
}
