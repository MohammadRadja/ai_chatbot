import { describe, expect, it } from "vitest";
import { parseHtml } from "./parser";
import { chunkText } from "./chunker";

describe("ingestion parser", () => {
  it("removes navigation and scripts while retaining readable blocks", () => {
    const page = parseHtml(
      "<title>Package</title><nav>Ignore me</nav><h1>Package price</h1><p>$18,995 starting from</p><script>alert(1)</script>",
      "Fallback",
    );
    expect(page.title).toBe("Package");
    expect(page.text).toContain("$18,995 starting from");
    expect(page.text).not.toContain("Ignore me");
    expect(page.text).not.toContain("alert");
    expect(page.headings).toEqual(["Package price"]);
  });

  it("creates bounded chunks with searchable text and stable hashes", () => {
    const chunks = chunkText(
      Array.from(
        { length: 30 },
        (_, index) =>
          `Paragraph ${index} about treatment cost and package inclusions.`,
      ).join("\n\n"),
    );
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.content.length <= 1600)).toBe(true);
    expect(chunks.every((chunk) => chunk.contentHash.length > 0)).toBe(true);
    expect(chunks[0].normalizedText).toContain("treatment cost");
  });
});
