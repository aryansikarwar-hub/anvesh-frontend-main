'use client';

import { Link } from '@/user/router';
import { Info } from 'lucide-react';
import { Card, CardContent, PageHeader, PageShell, cn } from '@/ui';
import { useAiStatus } from '@/user/hooks/use-ai';
import { useCurrentUser } from '@/user/hooks/use-session';
import { AiDiscoverPanel } from '@/user/components/ai-discover';

/**
 * The conversational assistant. Ask for a kind of place in your own words and
 * get back real database records with a reason for each.
 */
export default function AiPage() {
  const status = useAiStatus();
  const { isAuthenticated } = useCurrentUser();
  const provider = status.data?.provider;

  return (
    <PageShell className="flex max-w-4xl flex-col gap-6 py-8">
      <PageHeader
        eyebrow="Assistant"
        title="Ask Anvesh"
        description="Describe the kind of place you want. Answers are built only from places that exist in the Anvesh database — nothing is invented."
      />

      {provider ? <ProviderNotice provider={provider} /> : null}

      {isAuthenticated ? (
        <AiDiscoverPanel />
      ) : (
        <Card>
          <CardContent className="pt-5 text-sm text-ink-muted">
            <Link href="/login" className="font-medium text-laterite-600 underline">
              Sign in
            </Link>{' '}
            to use the assistant. Requests are rate limited and counted against a monthly quota per
            account.
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}

/** Says plainly which provider answered, and whether it is the degraded one. */
export function ProviderNotice({
  provider,
}: {
  provider: { provider: string; model: string; degraded: boolean };
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-[var(--radius-card)] p-4 text-sm ring-1',
        provider.degraded
          ? 'bg-gold-50 text-ink-soft ring-gold-300/50'
          : 'bg-paper-raised text-ink-muted ring-line',
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>
        <p>
          Answering with <strong>{provider.provider}</strong> ({provider.model}).
        </p>
        {provider.degraded ? (
          <p className="pt-1 leading-relaxed">
            This deployment has no Gemini key, so a deterministic local provider is answering. It
            selects and ranks real database records; it does not generate prose from a model. Set
            GEMINI_API_KEY and AI_PROVIDER=gemini for the real assistant.
          </p>
        ) : null}
      </div>
    </div>
  );
}