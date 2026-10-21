import { MessageRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { retrieveRelevantChunks } from "@/server/retrieval/retrieve";
import {
  answerWithGrounding,
  extractiveFallback,
  unknownAnswer,
} from "./provider";
import { classifyQuestion, shouldShowDisclaimer } from "./policy";

export type ChatServiceInput = {
  conversationId?: string;
  question: string;
  languageHint?: string;
};

const knownPlaces = [
  "mexico",
  "tijuana",
  "turkey",
  "germany",
  "india",
  "greece",
  "thailand",
  "united states",
  "usa",
];

function lacksComparisonEvidence(
  question: string,
  chunks: Awaited<ReturnType<typeof retrieveRelevantChunks>>,
) {
  if (!/(cheaper|compare|comparison|versus|\bvs\b| or )/i.test(question))
    return false;
  const placesInQuestion = knownPlaces.filter((place) =>
    question.toLocaleLowerCase().includes(place),
  );
  if (placesInQuestion.length < 2) return false;
  const evidence = chunks
    .map((chunk) => `${chunk.content} ${chunk.source.title}`)
    .join(" ")
    .toLocaleLowerCase();
  return placesInQuestion.some((place) => !evidence.includes(place));
}

export async function answerQuestion(input: ChatServiceInput) {
  const conversation = input.conversationId
    ? await prisma.conversation.upsert({
        where: { id: input.conversationId },
        update: {},
        create: { id: input.conversationId },
      })
    : await prisma.conversation.create({ data: {} });
  const history = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    take: 8,
    select: { role: true, content: true },
  });
  const historyForProvider = history.map((message) => ({
    role:
      message.role === MessageRole.USER
        ? ("user" as const)
        : ("assistant" as const),
    content: message.content,
  }));
  const policy = classifyQuestion(input.question);
  let answer = policy.message;
  let provider = "policy";
  let chunks: Awaited<ReturnType<typeof retrieveRelevantChunks>> = [];
  let disclaimer: string | undefined;
  let unanswered = true;

  if (policy.kind === "supported") {
    const searchQuery = [
      ...history
        .filter((message) => message.role === MessageRole.USER)
        .slice(-2)
        .map((message) => message.content),
      input.question,
    ].join(" ");
    chunks = await retrieveRelevantChunks(searchQuery);
    if (lacksComparisonEvidence(input.question, chunks)) {
      answer = unknownAnswer;
      provider = "policy";
      chunks = [];
      unanswered = true;
    } else {
      try {
        const result = await answerWithGrounding({
          question: input.question,
          history: historyForProvider,
          chunks,
          languageHint: input.languageHint,
        });
        answer = result.answer;
        provider = result.provider;
        unanswered =
          chunks.length === 0 ||
          answer.toLocaleLowerCase().includes("couldn’t find") ||
          answer.toLocaleLowerCase().includes("could not find");
      } catch (error) {
        console.error("AI provider error", error);
        const fallback = extractiveFallback(input.question, chunks);
        answer = fallback.answer;
        provider = "grounded-fallback";
        unanswered = chunks.length === 0;
      }
    }
  }

  if (policy.disclaimer && shouldShowDisclaimer(historyForProvider))
    disclaimer = policy.disclaimer;
  if (!answer) answer = unknownAnswer;
  const finalAnswer = disclaimer ? `${answer}\n\n${disclaimer}` : answer;
  const citedChunks = chunks
    .filter(
      (chunk, index, all) =>
        all.findIndex((candidate) => candidate.sourceId === chunk.sourceId) ===
        index,
    )
    .slice(0, 2);

  const assistant = await prisma.$transaction(async (transaction) => {
    await transaction.message.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: input.question,
      },
    });
    const savedAssistant = await transaction.message.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: finalAnswer,
        unanswered,
        metadata: { provider, policy: policy.kind, chunkCount: chunks.length },
      },
    });
    if (citedChunks.length > 0) {
      await transaction.citation.createMany({
        data: citedChunks.map((chunk) => ({
          messageId: savedAssistant.id,
          sourceId: chunk.sourceId,
          chunkId: chunk.id,
          label: chunk.source.title,
          url: chunk.source.url,
        })),
        skipDuplicates: true,
      });
    }
    return savedAssistant;
  });

  return {
    conversationId: conversation.id,
    message: {
      id: assistant.id,
      role: "assistant" as const,
      content: finalAnswer,
      createdAt: assistant.createdAt.toISOString(),
    },
    citations: citedChunks.map((chunk) => ({
      sourceId: chunk.sourceId,
      title: chunk.source.title,
      url: chunk.source.url,
    })),
    unanswered,
    canRequestQuote: unanswered || policy.kind === "booking",
  };
}
