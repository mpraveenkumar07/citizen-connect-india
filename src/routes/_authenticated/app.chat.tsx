import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { sendChatMessage } from "@/lib/civic.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Send, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/chat")({
  head: () => ({ meta: [{ title: "AI Citizen Assistant — CivicOS" }] }),
  component: ChatPage,
});

type Msg = { id: string; role: "user" | "assistant"; content: string };
type Thread = { id: string; title: string; updatedAt: number; messages: Msg[] };

const STORAGE_KEY = "civicos.chat.threads.v1";

function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveThreads(t: Thread[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  } catch {
    // ignore
  }
}

function ChatPage() {
  const fnSend = useServerFn(sendChatMessage);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = loadThreads();
    setThreads(t);
    if (t.length > 0) setActiveId(t[0].id);
  }, []);

  useEffect(() => {
    saveThreads(threads);
  }, [threads]);

  const active = threads.find((t) => t.id === activeId) ?? null;
  const messages = active?.messages ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, sending]);

  const newThread = () => {
    const t: Thread = {
      id: crypto.randomUUID(),
      title: "New chat",
      updatedAt: Date.now(),
      messages: [],
    };
    setThreads((prev) => [t, ...prev]);
    setActiveId(t.id);
  };

  const removeThread = (id: string) => {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (activeId === id) setActiveId(next[0]?.id ?? null);
      return next;
    });
  };

  const send = async () => {
    if (!input.trim() || sending) return;
    const userContent = input.trim();
    setInput("");

    let threadId = activeId;
    let baseThreads = threads;
    if (!threadId) {
      const t: Thread = {
        id: crypto.randomUUID(),
        title: userContent.slice(0, 60),
        updatedAt: Date.now(),
        messages: [],
      };
      baseThreads = [t, ...threads];
      threadId = t.id;
      setActiveId(threadId);
    }

    const userMsg: Msg = { id: "u-" + Date.now(), role: "user", content: userContent };
    const updated = baseThreads.map((t) =>
      t.id === threadId
        ? {
            ...t,
            title: t.messages.length === 0 ? userContent.slice(0, 60) : t.title,
            updatedAt: Date.now(),
            messages: [...t.messages, userMsg],
          }
        : t
    );
    setThreads(updated);

    setSending(true);
    try {
      const history = updated
        .find((t) => t.id === threadId)!
        .messages.map((m) => ({ role: m.role, content: m.content }));
      const { assistant } = await fnSend({ data: { messages: history } });
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                updatedAt: Date.now(),
                messages: [
                  ...t.messages,
                  { id: "a-" + Date.now(), role: "assistant", content: assistant },
                ],
              }
            : t
        )
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto grid h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 gap-4 p-4 md:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="hidden md:block">
        <Card className="flex h-full flex-col p-3">
          <Button size="sm" onClick={newThread} className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" /> New chat
          </Button>
          <div className="mt-3 flex-1 space-y-1 overflow-y-auto">
            {threads.map((t) => (
              <div
                key={t.id}
                className={`group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-muted ${
                  activeId === t.id ? "bg-muted" : ""
                }`}
              >
                <button
                  onClick={() => setActiveId(t.id)}
                  className="flex-1 truncate text-left"
                  title={t.title}
                >
                  {t.title}
                </button>
                <button
                  onClick={() => removeThread(t.id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
            {threads.length === 0 && (
              <p className="px-2 py-4 text-xs text-muted-foreground">No chats yet.</p>
            )}
          </div>
        </Card>
      </aside>

      {/* Chat */}
      <Card className="flex h-full flex-col overflow-hidden p-0">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.length === 0 && !sending && (
            <div className="mx-auto mt-12 max-w-md text-center">
              <h2 className="text-xl font-semibold">Ask CivicOS anything</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try: "How do I apply for PM-KISAN?" · "What documents do I need for a passport?" ·
                "मेरे राज्य में विधवा पेंशन कैसे मिलेगी?"
              </p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] rounded-2xl bg-primary px-4 py-2 text-primary-foreground"
                    : "max-w-[80%] rounded-2xl bg-muted px-4 py-3 text-sm leading-relaxed"
                }
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> CivicOS is thinking…
              </div>
            </div>
          )}
        </div>
        <div className="border-t p-3">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask about a scheme, right, complaint, or document…"
              rows={2}
              className="min-h-[52px] resize-none"
            />
            <Button onClick={send} disabled={sending || !input.trim()} size="icon" className="h-auto">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            CivicOS uses AI. Verify official details before acting. Chats are stored locally in your browser.
          </p>
        </div>
      </Card>
    </div>
  );
}
