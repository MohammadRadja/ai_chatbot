import { describe, expect, it } from "vitest";
import { KNOWLEDGE_SOURCES } from "@/config/sources";
import { assertAllowedSourceUrl } from "./fetcher";

describe("source boundary", () => {
  it("accepts the exact assessment URL", () => {
    expect(assertAllowedSourceUrl(KNOWLEDGE_SOURCES[0].url).hostname).toBe(
      "www.placidway.com",
    );
  });

  it("rejects arbitrary URLs", () => {
    expect(() =>
      assertAllowedSourceUrl("https://example.com/private"),
    ).toThrow();
    expect(() =>
      assertAllowedSourceUrl("http://www.placidway.com/anything"),
    ).toThrow();
  });
});
