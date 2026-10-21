import { NextResponse } from "next/server";
import { z } from "zod";
import { answerQuestion } from "@/server/chat/service";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const requestSchema = z.object({
  conversationId: z.string().cuid().optional(),
  question: z.string().trim().min(2).max(1000),
  languageHint: z.string().trim().max(20).optional(),
});

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous";
  const rate = consumeRateLimit(`chat:${ip}`, 30, 60_000);
  if (!rate.allowed)
    return NextResponse.json(
      {
        error:
          "Too many questions in a short period. Please try again in a minute.",
      },
      { status: 429 },
    );
  try {
    const body = requestSchema.parse(await request.json());
    const result = await answerQuestion(body);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json(
        { error: "Please enter a question of up to 1,000 characters." },
        { status: 400 },
      );
    console.error("chat route error", error);
    return NextResponse.json(
      { error: "The research desk is temporarily unavailable." },
      { status: 500 },
    );
  }
}
