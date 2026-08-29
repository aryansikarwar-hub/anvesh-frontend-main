'use client';

import { useState } from 'react';
import { Link } from '@/user/router';
import { Sparkles } from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/ui';
import { useAiDiscover } from '@/user/hooks/use-ai';
import { AiError } from '@/user/components/ai-error';

/** Natural-language place discovery. Every reference is verified server side. */
export function AiDiscoverPanel() {
  const [prompt, setPrompt] = useState('');
  const discover = useAiDiscover();

  return (
    <div className="flex flex-col gap-5">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (prompt.trim().length >= 4) discover.mutate({ prompt: prompt.trim() });
        }}
      >
        <label htmlFor="ai-prompt" className="sr-only">
          What are you looking for?
        </label>
        <Input
          id="ai-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="A quiet waterfall trek in the Western Ghats, after the monsoon"
          className="flex-1"
          minLength={4}
          maxLength={500}
        />
        <Button type="submit" loading={discover.isPending} disabled={prompt.trim().length < 4}>
          <Sparkles aria-hidden="true" />
          Ask
        </Button>
      </form>

      {discover.isError ? (
        <AiError error={discover.error} />
      ) : discover.data ? (
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-5">
              <p className="leading-relaxed text-ink-soft">{discover.data.result.answer}</p>
              <p className="pt-3 text-xs text-ink-faint">
                Answered by {discover.data.result.provider.provider} ·{' '}
                {discover.data.result.placeIds.length} verified place references
              </p>
            </CardContent>
          </Card>

          {discover.data.result.highlights.map((highlight) => (
            <Card key={highlight.placeId}>
              <CardContent className="flex flex-col gap-2 pt-5">
                <p className="text-sm text-ink-soft">{highlight.why}</p>
                <Link
                  href={`/explore?place=${highlight.placeId}`}
                  className="text-sm text-laterite-600 underline"
                >
                  Open in explore
                </Link>
              </CardContent>
            </Card>
          ))}

          {discover.data.result.followUps.length ? (
            <div className="flex flex-wrap gap-2">
              {discover.data.result.followUps.map((followUp) => (
                <Button
                  key={followUp}
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setPrompt(followUp);
                    discover.mutate({ prompt: followUp });
                  }}
                >
                  {followUp}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}