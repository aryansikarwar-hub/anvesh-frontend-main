'use client';

import { Card, CardContent } from '@/ui';
import { describeError } from '@/user/lib/api';

/**
 * How an assistant failure is shown.
 *
 * AI_HALLUCINATED_REFERENCE gets its own explanation because it is the one
 * error where nothing went wrong: the guardrail caught the model referring to
 * a place that does not exist and threw the whole answer away.
 */
export function AiError({ error }: { error: unknown }) {
  const described = describeError(error);
  const rejected = described.code === 'AI_HALLUCINATED_REFERENCE';

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 pt-5">
        <h3 className="font-semibold text-danger-700">{described.title}</h3>
        <p className="text-sm text-ink-soft">{described.description}</p>
        {rejected ? (
          <p className="text-sm text-ink-muted">
            The assistant referenced a place that is not in the database, so Anvesh threw the whole
            answer away rather than showing you something that does not exist. Try asking again.
          </p>
        ) : null}
        {described.requestId ? (
          <p className="font-mono text-xs text-ink-faint">{described.requestId}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}