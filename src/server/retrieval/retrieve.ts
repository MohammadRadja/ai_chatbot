import { prisma } from "@/lib/prisma";
import { normalizeForSearch, tokenize } from "@/lib/text";

export type RetrievedChunk = {
  id: string;
  sourceId: string;
  content: string;
  heading: string | null;
  source: { title: string; url: string; kind: string };
  score: number;
};

function scoreChunk(
  queryTokens: string[],
  chunk: {
    content: string;
    normalizedText: string;
    heading: string | null;
    source: { title: string; kind: string };
  },
) {
  if (queryTokens.length === 0) return 0;
  const haystack = chunk.normalizedText;
  const title = normalizeForSearch(
    `${chunk.heading ?? ""} ${chunk.source.title} ${chunk.source.kind}`,
  );
  let score = 0;
  for (const token of queryTokens) {
    if (haystack.includes(token)) score += 1;
    if (title.includes(token)) score += token.length > 5 ? 3 : 0.5;
  }
  const phrase = queryTokens.join(" ");
  if (phrase.length > 8 && haystack.includes(phrase)) score += 4;
  const priceQuestion = queryTokens.some((token) =>
    [
      "cost",
      "price",
      "prices",
      "pricing",
      "cheap",
      "cheaper",
      "starting",
    ].includes(token),
  );
  if (
    priceQuestion &&
    /(\$|€|£|usd|price|cost|starting from)/i.test(
      `${chunk.heading ?? ""} ${chunk.content}`,
    )
  )
    score += 5;
  if (
    priceQuestion &&
    /(package price|price starting from|treatment costs start|total cost|program type)/i.test(
      `${chunk.heading ?? ""} ${chunk.content}`,
    )
  )
    score += 8;
  const inclusionQuestion = queryTokens.some((token) =>
    ["include", "included", "package", "what"].includes(token),
  );
  if (
    inclusionQuestion &&
    /(included|program includes|package includes)/i.test(
      `${chunk.heading ?? ""} ${chunk.content}`,
    )
  )
    score += 3;
  const recoveryQuestion = queryTokens.some((token) =>
    ["recovery", "recover", "duration", "time", "weeks"].includes(token),
  );
  if (
    recoveryQuestion &&
    /(recovery|three weeks|6 weeks|follow-up|discharge)/i.test(
      `${chunk.heading ?? ""} ${chunk.content}`,
    )
  )
    score += 3;
  return score / Math.sqrt(queryTokens.length);
}

export async function retrieveRelevantChunks(
  query: string,
  limit = 5,
): Promise<RetrievedChunk[]> {
  const queryTokens = tokenize(query).slice(0, 32);
  if (queryTokens.length === 0) return [];
  const chunks = await prisma.knowledgeChunk.findMany({
    where: { source: { isActive: true } },
    select: {
      id: true,
      sourceId: true,
      content: true,
      normalizedText: true,
      heading: true,
      source: { select: { title: true, url: true, kind: true } },
    },
    take: 500,
  });

  return chunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(queryTokens, chunk) }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
