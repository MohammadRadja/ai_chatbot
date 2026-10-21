import { describe, expect, it } from "vitest";
import { classifyQuestion } from "./policy";

describe("question safety policy", () => {
  it("refuses medical safety questions", () => {
    expect(classifyQuestion("Is this surgery safe for my diabetes?").kind).toBe(
      "medical",
    );
  });

  it("does not promise appointments", () => {
    expect(
      classifyQuestion("Can you book me an appointment for tomorrow?").kind,
    ).toBe("booking");
  });

  it("declines unrelated questions", () => {
    expect(classifyQuestion("What is the weather in Cancun?").kind).toBe(
      "out-of-scope",
    );
  });
});
