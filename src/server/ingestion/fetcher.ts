import { getEnv } from "@/config/env";
import {
  ALLOWED_SOURCE_URLS,
  type KnowledgeSourceConfig,
} from "@/config/sources";
import { parseHtml, type ParsedPage } from "./parser";

const REQUEST_TIMEOUT_MS = 20_000;

export function assertAllowedSourceUrl(rawUrl: string) {
  if (!ALLOWED_SOURCE_URLS.has(rawUrl))
    throw new Error("Source URL is outside the configured knowledge boundary.");
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" || url.hostname !== "www.placidway.com") {
    throw new Error("Source URL must use the approved HTTPS host.");
  }
  return url;
}

export async function fetchSource(
  source: KnowledgeSourceConfig,
): Promise<{ status: number; page: ParsedPage }> {
  const url = assertAllowedSourceUrl(source.url);
  const env = getEnv();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": `PlacidWayKnowledgeChatbot/0.1 (+${env.APP_URL}; assessment ingestion)`,
      },
      redirect: "error",
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error(`Source returned HTTP ${response.status}.`);
    const html = await response.text();
    const page = parseHtml(html, source.title);
    if (page.text.length < 80)
      throw new Error("Source returned too little readable content.");
    return { status: response.status, page };
  } finally {
    clearTimeout(timeout);
  }
}
