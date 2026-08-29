'use client';

import { Badge } from '@/ui';
import { type ContentStatus } from '@/lib/types';

const VARIANT: Record<ContentStatus, 'neutral' | 'success' | 'warn' | 'danger'> = {
  DRAFT: 'neutral',
  PENDING_REVIEW: 'warn',
  PUBLISHED: 'success',
  REJECTED: 'danger',
  ARCHIVED: 'neutral',
};

const LABEL: Record<ContentStatus, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Awaiting moderation',
  PUBLISHED: 'Published',
  REJECTED: 'Changes needed',
  ARCHIVED: 'Archived',
};

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}