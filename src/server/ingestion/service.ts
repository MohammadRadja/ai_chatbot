import { IngestionStatus } from "@prisma/client";
import { KNOWLEDGE_SOURCES } from "@/config/sources";
import { prisma } from "@/lib/prisma";
import { chunkText } from "./chunker";
import { fetchSource } from "./fetcher";

const POLITE_DELAY_MS = 1_050;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function refreshKnowledgeBase() {
  const run = await prisma.ingestionRun.create({
    data: { sourceCount: KNOWLEDGE_SOURCES.length },
  });
  let successCount = 0;
  let failureCount = 0;
  let chunkCount = 0;
  const errors: string[] = [];

  for (const [index, sourceConfig] of KNOWLEDGE_SOURCES.entries()) {
    if (index > 0) await sleep(POLITE_DELAY_MS);
    try {
      const { status, page } = await fetchSource(sourceConfig);
      const chunks = chunkText(page.text);
      const source = await prisma.knowledgeSource.upsert({
        where: { key: sourceConfig.key },
        update: {
          title: sourceConfig.title,
          kind: sourceConfig.kind,
          url: sourceConfig.url,
          content: page.text,
          contentHash: page.contentHash,
          fetchedAt: new Date(),
          httpStatus: status,
          isActive: true,
        },
        create: {
          key: sourceConfig.key,
          title: sourceConfig.title,
          kind: sourceConfig.kind,
          url: sourceConfig.url,
          content: page.text,
          contentHash: page.contentHash,
          fetchedAt: new Date(),
          httpStatus: status,
        },
      });

      await prisma.$transaction(async (transaction) => {
        await transaction.knowledgeChunk.deleteMany({
          where: { sourceId: source.id },
        });
        if (chunks.length > 0) {
          await transaction.knowledgeChunk.createMany({
            data: chunks.map((chunk) => ({ ...chunk, sourceId: source.id })),
          });
        }
      });
      successCount += 1;
      chunkCount += chunks.length;
    } catch (error) {
      failureCount += 1;
      errors.push(
        `${sourceConfig.title}: ${error instanceof Error ? error.message : "Unknown ingestion error"}`,
      );
    }
  }

  const status: IngestionStatus =
    successCount === 0 ? "FAILED" : failureCount > 0 ? "PARTIAL" : "COMPLETED";
  const completed = await prisma.ingestionRun.update({
    where: { id: run.id },
    data: {
      status,
      successCount,
      failureCount,
      chunkCount,
      errorSummary: errors.length > 0 ? errors.join("\n") : null,
      completedAt: new Date(),
    },
  });

  return { ...completed, errors };
}

export async function getKnowledgeStatus() {
  const [sources, latestRun, chunkCount] = await Promise.all([
    prisma.knowledgeSource.findMany({
      where: { isActive: true },
      select: {
        key: true,
        title: true,
        kind: true,
        url: true,
        fetchedAt: true,
        httpStatus: true,
        _count: { select: { chunks: true } },
      },
      orderBy: { title: "asc" },
    }),
    prisma.ingestionRun.findFirst({ orderBy: { startedAt: "desc" } }),
    prisma.knowledgeChunk.count(),
  ]);
  return { sources, latestRun, chunkCount };
}
