import { createHash } from "node:crypto";
import { normalizeForSearch, normalizeText, tokenize } from "@/lib/text";

export type ContentChunk = {
  chunkIndex: number;
  heading?: string;
  content: string;
  normalizedText: string;
  contentHash: string;
  tokenCount: number;
};

const MAX_CHARS = 1400;
export function chunkText(text: string): ContentChunk[] {
  const paragraphs = normalizeText(text)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const chunks: ContentChunk[] = [];
  let current = "";
  let heading: string | undefined;

  const push = () => {
    const content = normalizeText(current);
    if (!content) return;
    const normalizedText = normalizeForSearch(content);
    chunks.push({
      chunkIndex: chunks.length,
      heading,
      content,
      normalizedText,
      contentHash: createHash("sha256").update(normalizedText).digest("hex"),
      tokenCount: tokenize(content).length,
    });
  };

  for (const paragraph of paragraphs) {
    if (
      /^(#{1,4}\s|[A-Z][^.!?]{3,80}:?$)/.test(paragraph) &&
      paragraph.length < 100
    ) {
      heading = paragraph.replace(/^#+\s*/, "");
    }

    if (
      (current.length + paragraph.length + 2 > MAX_CHARS ||
        current.length > 0) &&
      current.length + paragraph.length + 2 > MAX_CHARS
    ) {
      push();
      current = "";
    }

    current = current ? `${current}\n\n${paragraph}` : paragraph;
  }

  push();
  return chunks;
}
