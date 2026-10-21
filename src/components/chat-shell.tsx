"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  CheckCircle2,
  CircleHelp,
  Database,
  ExternalLink,
  Loader2,
  Menu,
  RefreshCw,
  Send,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuoteForm } from "@/components/quote-form";
import { cn, formatRelativeDate } from "@/lib/utils";

type Citation = { sourceId: string; title: string; url: string };
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  unanswered?: boolean;
  createdAt?: string;
};
type SourceStatus = {
  key: string;
  title: string;
  kind: string;
  url: string;
  fetchedAt: string | null;
  httpStatus: number | null;
  _count: { chunks: number };
};
type KnowledgeStatus = {
  sources: SourceStatus[];
  latestRun: {
    status: string;
    completedAt: string | null;
    startedAt: string;
  } | null;
  chunkCount: number;
};

const starterPrompts = [
  "What is included in the adenocarcinoma package?",
  "How much does the treatment cost?",
  "Is it cheaper in Mexico or elsewhere?",
];

function MessageBody({ content }: { content: string }) {
  return <div className="whitespace-pre-wrap leading-7">{content}</div>;
}

export function ChatShell() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I can help you explore the seven supplied PlacidWay pages. Ask about treatments, packages, clinics, videos, or pricing — and I’ll show where the answer came from.",
    },
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string>();
  const [status, setStatus] = useState<"idle" | "sending" | "refreshing">(
    "idle",
  );
  const [knowledge, setKnowledge] = useState<KnowledgeStatus>();
  const [error, setError] = useState("");
  const [showQuote, setShowQuote] = useState(false);
  const [mobileSourcesOpen, setMobileSourcesOpen] = useState(false);
  const mobileDialogRef = useRef<HTMLDivElement>(null);

  async function loadKnowledge() {
    const response = await fetch("/api/health", { cache: "no-store" });
    if (!response.ok) throw new Error("Knowledge status is unavailable.");
    setKnowledge((await response.json()) as KnowledgeStatus);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: KnowledgeStatus | null) => {
        if (!cancelled && data) setKnowledge(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mobileSourcesOpen) return;
    mobileDialogRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileSourcesOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileSourcesOpen]);

  const indexedSources =
    knowledge?.sources.filter((source) => source._count.chunks > 0).length ?? 0;
  const lastRefresh = useMemo(
    () => knowledge?.latestRun?.completedAt ?? knowledge?.latestRun?.startedAt,
    [knowledge],
  );

  async function sendQuestion(question = input) {
    const trimmed = question.trim();
    if (!trimmed || status !== "idle") return;
    setInput("");
    setError("");
    setStatus("sending");
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", content: trimmed },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, question: trimmed }),
      });
      const payload = (await response.json().catch(() => null)) as {
        conversationId?: string;
        message?: Message;
        citations?: Citation[];
        error?: string;
        canRequestQuote?: boolean;
      } | null;
      if (!response.ok || !payload?.message)
        throw new Error(
          payload?.error ?? "The desk couldn’t answer right now.",
        );
      setConversationId(payload.conversationId);
      setMessages((current) => [
        ...current,
        {
          ...payload.message!,
          citations: payload.citations,
          unanswered: payload.message?.unanswered,
        },
      ]);
      setShowQuote(Boolean(payload.canRequestQuote));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The desk couldn’t answer right now.",
      );
    } finally {
      setStatus("idle");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendQuestion();
  }

  async function refresh() {
    if (status !== "idle") return;
    setStatus("refreshing");
    setError("");
    try {
      const response = await fetch("/api/ingest", { method: "POST" });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok)
        throw new Error(
          payload?.error ??
            "Refresh failed. The current knowledge snapshot is still in use.",
        );
      await loadKnowledge();
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Refresh failed. The current knowledge snapshot is still in use.",
      );
    } finally {
      setStatus("idle");
    }
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-line bg-paper">
        <div className="shell flex min-h-[76px] items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark className="text-terracotta" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-[-0.01em] text-ink">
                PlacidWay
              </p>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
                Evidence desk
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="status-chip hidden sm:inline-flex">
              <span className="status-dot h-2 w-2 rounded-full bg-teal" />
              Knowledge live
            </span>
            <button
              type="button"
              aria-label="Open knowledge sources"
              className="icon-button lg:hidden"
              onClick={() => setMobileSourcesOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <section className="shell pb-8 pt-10 sm:pb-10 sm:pt-14">
        <div className="max-w-4xl">
          <h1 className="display-title">
            Ask the source.
            <br />
            Keep the context.
          </h1>
          <p className="hero-copy mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            A focused research desk for seven supplied PlacidWay pages. Every
            answer stays inside that evidence set and shows its source trail.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-4 text-xs text-muted">
          <span className="inline-flex items-center gap-2">
            <Database className="h-4 w-4 text-teal" />
            <strong className="font-semibold text-ink">
              {indexedSources}/7 indexed
            </strong>
          </span>
          <span>Curated pages only</span>
          <span>No invented medical guidance</span>
        </div>
      </section>

      <div className="shell pb-10 sm:pb-14">
        <div className="workspace-grid">
          <section className="flex min-h-[min(680px,calc(100vh-300px))] min-w-0 flex-col border border-line bg-surface">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Research thread
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Ask a question, then inspect the evidence.
                </p>
              </div>
              <Badge>{indexedSources}/7 sources</Badge>
            </div>

            <div
              className="flex-1 space-y-6 px-5 py-6 sm:px-7"
              aria-live="polite"
            >
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={cn(
                    "reveal flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[min(720px,94%)]",
                      message.role === "user" ? "order-2" : "order-1",
                    )}
                  >
                    <div
                      className={cn(
                        "mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted",
                        message.role === "user" && "justify-end",
                      )}
                    >
                      {message.role === "assistant" ? (
                        <>
                          <Bot className="h-3.5 w-3.5 text-terracotta" />
                          <span>Desk</span>
                        </>
                      ) : (
                        <>
                          <span>You</span>
                          <UserRound className="h-3.5 w-3.5" />
                        </>
                      )}
                    </div>
                    <div
                      className={cn(
                        "px-4 py-3.5 text-sm sm:px-5",
                        message.role === "user"
                          ? "rounded-2xl rounded-br-sm bg-ink text-paper"
                          : "rounded-2xl rounded-bl-sm border border-line bg-paper text-ink",
                      )}
                    >
                      <MessageBody content={message.content} />
                    </div>
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-3 space-y-2" aria-label="Sources">
                        {message.citations.map((citation, index) => (
                          <a
                            key={citation.sourceId}
                            href={citation.url}
                            target="_blank"
                            rel="noreferrer"
                            className="citation-link"
                          >
                            <span className="citation-index">{index + 1}</span>
                            <span className="min-w-0 truncate">
                              {citation.title}
                            </span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
              {status === "sending" && (
                <div
                  className="flex gap-3"
                  role="status"
                  aria-label="Desk is thinking"
                >
                  <div className="rounded-2xl rounded-bl-sm border border-line bg-paper px-5 py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-terracotta" />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-line px-5 py-5 sm:px-7">
              {error && (
                <div role="alert" className="feedback-error mb-4">
                  {error}
                </div>
              )}
              <div className="mb-4 flex flex-wrap gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendQuestion(prompt)}
                    disabled={status !== "idle"}
                    className="prompt-button"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="relative">
                <label htmlFor="question" className="sr-only">
                  Ask a question
                </label>
                <textarea
                  id="question"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendQuestion();
                    }
                  }}
                  rows={3}
                  maxLength={1000}
                  aria-describedby="question-hint"
                  placeholder="Ask about a treatment, package, clinic, price, or inclusion…"
                  className="question-input"
                />
                <button
                  type="submit"
                  aria-label="Send question"
                  disabled={!input.trim() || status !== "idle"}
                  className="send-button"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <p id="question-hint" className="mt-2 text-xs text-muted">
                Enter to send · Shift + Enter for a new line · Informational,
                not medical advice.
              </p>
            </div>
          </section>

          <KnowledgePanel
            knowledge={knowledge}
            lastRefresh={lastRefresh}
            status={status}
            onRefresh={refresh}
            showQuote={showQuote}
            conversationId={conversationId}
          />
        </div>
      </div>

      {mobileSourcesOpen && (
        <div
          className="mobile-overlay fixed inset-0 z-20 p-0 lg:hidden"
          onClick={() => setMobileSourcesOpen(false)}
        >
          <div
            ref={mobileDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-sources-title"
            tabIndex={-1}
            className="ml-auto h-full w-[min(100%,390px)] overflow-y-auto border-l border-line bg-paper px-5 py-6 outline-none"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
              <h2 id="mobile-sources-title" className="text-sm font-semibold">
                Knowledge sources
              </h2>
              <button
                type="button"
                aria-label="Close source panel"
                onClick={() => setMobileSourcesOpen(false)}
                className="icon-button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <KnowledgePanel
              knowledge={knowledge}
              lastRefresh={lastRefresh}
              status={status}
              onRefresh={refresh}
              showQuote={showQuote}
              conversationId={conversationId}
              mobile
            />
          </div>
        </div>
      )}
    </main>
  );
}

function KnowledgePanel({
  knowledge,
  lastRefresh,
  status,
  onRefresh,
  showQuote,
  conversationId,
  mobile = false,
}: {
  knowledge?: KnowledgeStatus;
  lastRefresh?: string;
  status: "idle" | "sending" | "refreshing";
  onRefresh: () => Promise<void>;
  showQuote: boolean;
  conversationId?: string;
  mobile?: boolean;
}) {
  return (
    <aside
      aria-label="Knowledge base"
      className={cn("space-y-8", !mobile && "hidden lg:block")}
    >
      <section className="border-y border-line py-5">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="section-label">Knowledge base</p>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em]">
              Seven fixed sources
            </h2>
          </div>
          <BookOpen className="h-5 w-5 text-teal" />
        </div>
        <p className="text-sm leading-6 text-muted">
          This desk searches only the pages listed in the assessment. No open
          web crawling, no invented context.
        </p>
        <div className="mt-5 divide-y divide-line border-y border-line">
          {knowledge?.sources.length ? (
            knowledge.sources.map((source) => (
              <a
                key={source.key}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="source-row group"
              >
                <span
                  className={cn(
                    "source-dot",
                    source._count.chunks > 0 ? "bg-teal" : "bg-line",
                  )}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm leading-5 text-ink group-hover:text-terracotta">
                    {source.title}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    {source._count.chunks > 0
                      ? `${source._count.chunks} passages indexed`
                      : "Not indexed"}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-terracotta" />
              </a>
            ))
          ) : (
            <p className="px-1 py-4 text-sm text-muted">
              Connect MySQL and run the first refresh to index the source pages.
            </p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => void onRefresh()}
          disabled={status !== "idle"}
          className="mt-5 w-full"
        >
          {status === "refreshing" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {status === "refreshing"
            ? "Refreshing sources…"
            : "Refresh knowledge"}
        </Button>
        <p className="mt-2 text-center text-xs text-muted">
          Polite refresh · about 1 request / second
        </p>
      </section>

      <section className="border-b border-line pb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-teal" />
          <h2 className="text-sm font-semibold">How this stays honest</h2>
        </div>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
          <li className="flex gap-2">
            <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-teal" />
            Retrieved passages are treated as evidence, not instructions.
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-teal" />
            Prices keep their currency and “starting from” context.
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-teal" />
            Unknown and medical questions are not guessed.
          </li>
        </ul>
        {lastRefresh && (
          <p className="mt-5 border-t border-line pt-4 text-xs text-muted">
            Last refresh · {formatRelativeDate(lastRefresh)}
          </p>
        )}
      </section>

      {showQuote && (
        <section className="quote-panel px-4 py-5 sm:px-5">
          <div className="mb-3 flex items-center gap-2 text-teal-ink">
            <CircleHelp className="h-4 w-4" />
            <h2 className="text-sm font-semibold">
              Need a more specific answer?
            </h2>
          </div>
          <p className="mb-4 text-sm leading-6 text-teal-ink">
            Share your details for a free quote request. This saves the request;
            it does not promise appointment availability.
          </p>
          <QuoteForm conversationId={conversationId} />
        </section>
      )}
    </aside>
  );
}
