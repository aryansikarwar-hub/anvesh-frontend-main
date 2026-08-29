'use client';

import { useId, useState } from 'react';
import { Bot, Info, Loader2, Send, Sparkles } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button, Card, CardContent, cn } from '@/ui';
import { Link } from '@/user/router';
import { useAiDiscover, useAiStatus } from '@/user/hooks/use-ai';
import { useCurrentUser } from '@/user/hooks/use-session';
import { AiError } from '@/user/components/ai-error';
import type { AiDiscoveryResult } from '@/lib/types';

type ChatTurn =
  | { role: 'user'; id: string; text: string }
  | { role: 'assistant'; id: string; result: AiDiscoveryResult };

/**
 * Floating AI assistant, reachable from anywhere in the traveller portal.
 *
 * This is not a separate integration — it drives the exact same
 * `POST /ai/discover` endpoint as `/ai` (see `ai-discover.tsx`), just
 * surfaced as a persistent chat bubble instead of a full page. Every answer
 * is still built only from real database records, and the same
 * degraded-provider notice (no `GEMINI_API_KEY` configured) applies here.
 */
export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const status = useAiStatus();
  const discover = useAiDiscover();
  const { isAuthenticated } = useCurrentUser();
  const inputId = useId();

  function ask(text: string) {
    const value = text.trim();
    if (value.length < 4) return;
    setTurns((prev) => [...prev, { role: 'user', id: crypto.randomUUID(), text: value }]);
    setPrompt('');
    discover.mutate(
      { prompt: value },
      {
        onSuccess: (data) => {
          setTurns((prev) => [
            ...prev,
            { role: 'assistant', id: crypto.randomUUID(), result: data.result },
          ]);
        },
      },
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open Anvesh AI assistant"
          className="fixed bottom-24 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-laterite-500 text-white shadow-lift transition-transform hover:scale-105 md:bottom-6"
        >
          <Bot className="size-6" aria-hidden="true" />
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-line px-5 py-4 text-left">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-laterite-600" aria-hidden="true" />
            Ask Anvesh
          </SheetTitle>
          <SheetDescription>
            Describe a place, mood or trip and get real database recommendations — nothing here is
            invented.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {status.data?.provider.degraded ? (
            <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-card)] bg-gold-50 p-3 text-xs text-ink-soft ring-1 ring-gold-300/50">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <p>
                Running on the deterministic fallback provider (no Gemini key configured) — answers
                still come from real listings, just without generated prose.
              </p>
            </div>
          ) : null}

          {!isAuthenticated ? (
            <Card>
              <CardContent className="pt-5 text-sm text-ink-muted">
                <Link href="/login" className="font-medium text-laterite-600 underline">
                  Sign in
                </Link>{' '}
                to chat with the assistant.
              </CardContent>
            </Card>
          ) : turns.length === 0 ? (
            <div className="flex flex-col gap-2 text-sm text-ink-muted">
              <p>Try asking things like:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'A quiet waterfall trek after the monsoon',
                  'Local food spots that are not touristy',
                  'A 2-day heritage trip near Indore',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => ask(suggestion)}
                    className="rounded-full border border-line px-3 py-1.5 text-left text-xs text-ink-soft transition-colors hover:bg-paper-raised"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ol className="flex flex-col gap-4">
              {turns.map((turn) => (
                <li key={turn.id}>
                  {turn.role === 'user' ? (
                    <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-laterite-500 px-4 py-2.5 text-sm text-white">
                      {turn.text}
                    </div>
                  ) : (
                    <AssistantTurn result={turn.result} />
                  )}
                </li>
              ))}
            </ol>
          )}

          {discover.isPending ? (
            <div className="mt-4 flex items-center gap-2 text-xs text-ink-faint">
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Searching real listings…
            </div>
          ) : null}

          {discover.isError ? (
            <div className="mt-4">
              <AiError error={discover.error} />
            </div>
          ) : null}
        </div>

        {isAuthenticated ? (
          <form
            className="flex items-center gap-2 border-t border-line p-3"
            onSubmit={(event) => {
              event.preventDefault();
              ask(prompt);
            }}
          >
            <label htmlFor={inputId} className="sr-only">
              Ask the assistant
            </label>
            <input
              id={inputId}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask about a place, trip or mood…"
              minLength={4}
              maxLength={500}
              className="h-10 flex-1 rounded-full border border-line bg-paper px-4 text-sm outline-none focus:ring-2 focus:ring-laterite-300"
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 rounded-full"
              loading={discover.isPending}
              disabled={prompt.trim().length < 4}
              aria-label="Send"
            >
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function AssistantTurn({ result }: { result: AiDiscoveryResult }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-paper-raised px-4 py-2.5 text-sm leading-relaxed text-ink-soft ring-1 ring-line">
        {result.answer}
        <p className="pt-2 text-[11px] text-ink-faint">
          {result.provider.provider} · {result.placeIds.length} verified place reference
          {result.placeIds.length === 1 ? '' : 's'}
        </p>
      </div>

      {result.highlights.length ? (
        <div className="flex flex-col gap-1.5 pl-1">
          {result.highlights.map((highlight) => (
            <Link
              key={highlight.placeId}
              href={`/explore?place=${highlight.placeId}`}
              className={cn(
                'rounded-lg border border-line px-3 py-2 text-xs text-ink-soft transition-colors',
                'hover:border-laterite-300 hover:bg-paper-raised',
              )}
            >
              {highlight.why}
            </Link>
          ))}
        </div>
      ) : null}

      {result.followUps.length ? (
        <div className="flex flex-wrap gap-1.5 pl-1">
          {result.followUps.map((followUp) => (
            <span
              key={followUp}
              className="rounded-full bg-ghat-50 px-2.5 py-1 text-[11px] text-ghat-700"
            >
              {followUp}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
