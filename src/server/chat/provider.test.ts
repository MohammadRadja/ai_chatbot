import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RetrievedChunk } from "@/server/retrieval/retrieve";

const chunk: RetrievedChunk = {
  id: "chunk-1",
  sourceId: "source-1",
  content: "The package price starts from $18,995 USD.",
  heading: "Package price",
  source: {
    title: "Treatment package",
    url: "https://www.placidway.com/package/example",
    kind: "package",
  },
  score: 10,
};

describe("OpenCode grounding adapter", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses the configured OpenCode Zen chat-completions endpoint", async () => {
    vi.stubEnv("DATABASE_URL", "mysql://root@localhost:3306/chatbot");
    vi.stubEnv("OPENCODE_API_KEY", "test-opencode-key");
    vi.stubEnv("OPENCODE_BASE_URL", "https://opencode.ai/zen/v1");
    vi.stubEnv("OPENCODE_MODEL", "glm-5.3-flash");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "Grounded answer" } }],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { answerWithGrounding } = await import("./provider");
    const result = await answerWithGrounding({
      question: "How much does it cost?",
      history: [],
      chunks: [chunk],
    });

    expect(result).toEqual({
      answer: "Grounded answer",
      provider: "opencode-zen",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://opencode.ai/zen/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-opencode-key",
        }),
      }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string).model).toBe(
      "glm-5.3-flash",
    );
  });

  it("keeps an extractive answer when OpenCode is unavailable", async () => {
    vi.stubEnv("DATABASE_URL", "mysql://root@localhost:3306/chatbot");
    const { answerWithGrounding } = await import("./provider");

    await expect(
      answerWithGrounding({
        question: "How much does it cost?",
        history: [],
        chunks: [chunk],
      }),
    ).resolves.toMatchObject({
      provider: "grounded-fallback",
      answer: expect.stringContaining("$18,995 USD"),
    });
  });

  it("does not duplicate the chat path when a full endpoint is configured", async () => {
    vi.stubEnv("DATABASE_URL", "mysql://root@localhost:3306/chatbot");
    vi.stubEnv("OPENCODE_API_KEY", "test-opencode-key");
    vi.stubEnv(
      "OPENCODE_BASE_URL",
      "https://opencode.ai/zen/v1/chat/completions",
    );
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "Grounded answer" } }],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { answerWithGrounding } = await import("./provider");
    await answerWithGrounding({
      question: "How much does it cost?",
      history: [],
      chunks: [chunk],
    });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://opencode.ai/zen/v1/chat/completions",
    );
  });
});
