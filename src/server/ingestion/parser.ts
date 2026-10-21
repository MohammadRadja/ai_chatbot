import { createHash } from "node:crypto";
import { normalizeText } from "@/lib/text";

export type ParsedPage = {
  title: string;
  text: string;
  headings: string[];
  contentHash: string;
};

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    );
}

function cleanHtmlFragment(value: string) {
  return decodeEntities(
    value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "),
  ).trim();
}

export function parseHtml(html: string, fallbackTitle: string): ParsedPage {
  const withoutNoise = html
    .replace(
      /<(script|style|noscript|svg|form|nav|header|footer|aside)[^>]*>[\s\S]*?<\/\1>/gi,
      " ",
    )
    .replace(/<!--[\s\S]*?-->/g, " ");
  const title = cleanHtmlFragment(
    withoutNoise.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ??
      fallbackTitle,
  );
  const headings = [
    ...withoutNoise.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi),
  ]
    .map((match) => cleanHtmlFragment(match[1]))
    .filter(Boolean);
  const blocks = [
    ...withoutNoise.matchAll(
      /<(?:p|li|td|th|h[1-4]|blockquote)[^>]*>([\s\S]*?)<\/(?:p|li|td|th|h[1-4]|blockquote)>/gi,
    ),
  ]
    .map((match) => cleanHtmlFragment(match[1]))
    .filter((block) => block.length > 2);
  const text = normalizeText(Array.from(new Set(blocks)).join("\n\n"));

  return {
    title: title || fallbackTitle,
    text,
    headings,
    contentHash: createHash("sha256").update(text).digest("hex"),
  };
}
