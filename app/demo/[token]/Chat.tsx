"use client";

import { useState } from "react";

const starters = ["What's on the menu?", "What are your hours?", "How do I book a table?"];

type Turn = { role: "user" | "assistant"; text: string; error?: boolean };

function replaceAssistant(turns: Turn[], text: string, error: boolean) {
  const next = turns.slice();
  const last = next[next.length - 1];
  if (!last || last.role !== "assistant") return turns;
  next[next.length - 1] = { role: "assistant", text, error };
  return next;
}

export function DemoChat({ token, slug }: { token: string; slug?: string }) {
  const key = slug || token;
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);

  async function ask(message: string) {
    const text = message.trim();
    if (!text || busy) return;
    setDraft("");
    setBusy(true);
    setTurns((current) => [...current, { role: "user", text }, { role: "assistant", text: "" }]);
    try {
      const res = await fetch(`/api/demo/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok || !res.body) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setTurns((current) => replaceAssistant(current, body?.error || "The demo could not answer.", true));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        const next = full;
        setTurns((current) => replaceAssistant(current, next, false));
      }
    } catch {
      setTurns((current) => replaceAssistant(current, "The demo could not answer.", true));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 border border-line">
      <div className="flex max-h-[420px] min-h-[220px] flex-col gap-4 overflow-y-auto px-4 py-4" aria-live="polite">
        {turns.length === 0 ? (
          <p className="text-mute">Ask about the menu, hours, reservations, or ordering.</p>
        ) : null}
        {turns.map((turn, index) => (
          <p
            key={`${turn.role}-${index}`}
            data-testid={turn.role === "assistant" ? "assistant-message" : undefined}
            className={turn.role === "user" ? "text-paper" : turn.error ? "text-mute" : "whitespace-pre-wrap text-paper"}
          >
            {turn.role === "user" ? <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-dim">You</span> : null}
            {turn.role === "user" ? <span className="mt-1 block">{turn.text}</span> : turn.text || (busy ? "…" : "")}
          </p>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
        {starters.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={busy}
            onClick={() => ask(prompt)}
            className="border border-line px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.08em] text-mute hover:border-paper hover:text-paper disabled:opacity-40"
          >
            {prompt}
          </button>
        ))}
      </div>
      <form
        className="grid grid-cols-1 gap-3 border-t border-line p-4 sm:grid-cols-[1fr_auto] sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(draft);
        }}
      >
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-dim">Message</span>
          <textarea
            value={draft}
            maxLength={800}
            rows={3}
            onChange={(event) => setDraft(event.target.value)}
            className="mt-2 w-full resize-y bg-transparent text-base text-paper outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="border border-paper bg-paper px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-ink disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
