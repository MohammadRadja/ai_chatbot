import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  OPENCODE_API_KEY: z.string().optional(),
  OPENCODE_BASE_URL: z
    .string()
    .url()
    .default("https://opencode.ai/zen/v1")
    .refine((value) => new URL(value).hostname === "opencode.ai", {
      message: "Only the official OpenCode API host is supported.",
    }),
  OPENCODE_MODEL: z.string().default("glm-5.3-flash"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  VERCEL_URL: z.string().optional(),
  INGESTION_TOKEN: z.string().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

let cachedEnv: z.infer<typeof envSchema> | undefined;

export function getEnv() {
  if (!cachedEnv) {
    const existingKey =
      process.env.OPENCODE_API_KEY || process.env.OPENAI_API_KEY || undefined;
    cachedEnv = envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      OPENCODE_API_KEY: existingKey,
      OPENCODE_BASE_URL:
        process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1",
      OPENCODE_MODEL: process.env.OPENCODE_MODEL || "glm-5.3-flash",
      APP_URL:
        process.env.APP_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : undefined),
      VERCEL_URL: process.env.VERCEL_URL || undefined,
      INGESTION_TOKEN: process.env.INGESTION_TOKEN || undefined,
      LOG_LEVEL: process.env.LOG_LEVEL || undefined,
    });
  }

  return cachedEnv;
}
