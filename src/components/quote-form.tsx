"use client";

import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuoteForm({ conversationId }: { conversationId?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setStatus("sending");
    setError("");
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      conversationId,
    };
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          body?.error ?? "We couldn’t save that request. Please try again.",
        );
      }
      setStatus("sent");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We couldn’t save that request. Please try again.",
      );
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="border border-teal-line bg-teal-wash p-4 text-sm text-teal-ink">
        <Check className="mb-2 h-5 w-5" />
        <p className="font-semibold">Your quote request is saved.</p>
        <p className="mt-1 text-xs">
          A PlacidWay team member can follow up using the details you shared.
        </p>
      </div>
    );
  }

  return (
    <form action={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-ink">
          Name
          <input
            name="name"
            required
            maxLength={80}
            className="mt-1.5 min-h-11 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-terracotta"
            placeholder="Your name"
          />
        </label>
        <label className="block text-xs font-semibold text-ink">
          Email
          <input
            name="email"
            type="email"
            required
            maxLength={160}
            className="mt-1.5 min-h-11 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-terracotta"
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label className="block text-xs font-semibold text-ink">
        What would you like to know?
        <textarea
          name="message"
          maxLength={500}
          rows={3}
          className="mt-1.5 w-full resize-y rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-terracotta"
          placeholder="Optional treatment or travel question"
        />
      </label>
      {error && (
        <p className="text-xs font-medium text-terracotta" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={status === "sending"} size="sm">
        {status === "sending" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}{" "}
        Request a free quote
      </Button>
    </form>
  );
}
