import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const requestSchema = z.object({
  conversationId: z.string().cuid().optional(),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  message: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous";
  if (!consumeRateLimit(`quote:${ip}`, 5, 60 * 60_000).allowed)
    return NextResponse.json(
      { error: "Please wait before sending another quote request." },
      { status: 429 },
    );
  try {
    const body = requestSchema.parse(await request.json());
    await prisma.lead.create({ data: body });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json(
        { error: "Please check your name and email, then try again." },
        { status: 400 },
      );
    console.error("quote route error", error);
    return NextResponse.json(
      { error: "We couldn’t save that request right now." },
      { status: 500 },
    );
  }
}
