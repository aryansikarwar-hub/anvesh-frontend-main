'use client';

import { Link } from '@/user/router';
import { AnveshMark, Card, CardContent, TAGLINE } from '@/ui';

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <Link href="/" aria-label="Anvesh home">
          <AnveshMark className="size-8 text-laterite-600" />
        </Link>
        <h1 className="text-2xl">{title}</h1>
        <p className="text-sm text-ink-muted">{description}</p>
      </div>

      <Card>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>

      {footer ? <div className="text-center text-sm text-ink-muted">{footer}</div> : null}
      <p className="text-center text-xs text-ink-faint">{TAGLINE}</p>
    </div>
  );
}