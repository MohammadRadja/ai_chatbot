export type QuestionPolicy = {
  kind: "supported" | "medical" | "booking" | "out-of-scope";
  message?: string;
  disclaimer?: string;
};

const medicalSignals = [
  "safe for my",
  "is this surgery safe",
  "should i",
  "can i take",
  "diagnose",
  "diagnosis",
  "side effect",
  "cure me",
  "will this cure",
  "my diabetes",
  "my cancer",
  "medical advice",
];

const bookingSignals = [
  "book me",
  "book an appointment",
  "appointment tomorrow",
  "schedule me",
  "availability tomorrow",
  "can you book",
];
const outOfScopeSignals = [
  "weather",
  "stock price",
  "football",
  "news today",
  "recipe",
  "write me a poem",
  "flight status",
];

export function classifyQuestion(question: string): QuestionPolicy {
  const normalized = question.toLocaleLowerCase().replace(/[?!.,]/g, "");
  if (medicalSignals.some((signal) => normalized.includes(signal))) {
    return {
      kind: "medical",
      message:
        "I can share information from the supplied PlacidWay pages, but I can’t assess whether a treatment is safe for your health or provide a diagnosis. Please speak with a licensed healthcare professional about your situation.",
      disclaimer:
        "This chatbot is informational only and does not replace advice from a qualified healthcare professional.",
    };
  }
  if (bookingSignals.some((signal) => normalized.includes(signal))) {
    return {
      kind: "booking",
      message:
        "I can’t book or confirm an appointment. I can help summarize the listed treatment information, or you can request a free quote from PlacidWay.",
    };
  }
  if (outOfScopeSignals.some((signal) => normalized.includes(signal))) {
    return {
      kind: "out-of-scope",
      message:
        "I can only answer questions using the supplied PlacidWay treatment, clinic, video, and pricing pages.",
    };
  }
  return { kind: "supported" };
}

export function shouldShowDisclaimer(
  history: Array<{ role: "user" | "assistant"; content: string }>,
) {
  return !history.some(
    (message) =>
      message.role === "assistant" &&
      message.content.includes("informational only"),
  );
}
