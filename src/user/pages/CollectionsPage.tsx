'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Field,
  Input,
  PageHeader,
  PageShell,
  Textarea,
} from '@/ui';
import { useCollections, useCreateCollection, useDeleteCollection } from '@/user/hooks/use-personal';
import { QueryBoundary } from '@/user/components/query-boundary';
import { RequireAuth } from '@/user/components/require-auth';

export default function CollectionsPage() {
  return (
    <PageShell className="flex flex-col gap-6 py-8">
      <PageHeader
        eyebrow="Yours"
        title="Collections"
        description="Group saved places into lists — a monsoon shortlist, a Kutch craft run, a maybe pile."
      />
      <RequireAuth>
        <CollectionsList />
      </RequireAuth>
    </PageShell>
  );
}

function CollectionsList() {
  const collections = useCollections();
  const create = useCreateCollection();
  const remove = useDeleteCollection();
  const [form, setForm] = useState({ name: '', description: '' });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <QueryBoundary
        isLoading={collections.isLoading}
        isError={collections.isError}
        error={collections.error}
        data={collections.data}
        isEmpty={(data) => data.collections.length === 0}
        onRetry={() => void collections.refetch()}
        emptyTitle="No collections yet"
        emptyDescription="Create one on the right, then assign saved places to it."
        skeleton="rows"
      >
        {(data) => (
          <div className="flex flex-col gap-3">
            {data.collections.map((collection) => (
              <Card key={collection.id}>
                <CardContent className="flex items-start justify-between gap-4 pt-5">
                  <div>
                    <h2 className="text-lg">{collection.name}</h2>
                    {collection.description ? (
                      <p className="pt-1 text-sm text-ink-muted">{collection.description}</p>
                    ) : null}
                    <p className="pt-1 text-xs text-ink-faint">
                      {collection.itemCount} place{collection.itemCount === 1 ? '' : 's'} ·{' '}
                      {collection.isPublic ? 'public' : 'private'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${collection.name}`}
                    onClick={() => remove.mutate(collection.id)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </QueryBoundary>

      <Card className="h-fit">
        <CardContent className="pt-5">
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              create.mutate(
                { ...form, isPublic: false },
                { onSuccess: () => setForm({ name: '', description: '' }) },
              );
            }}
          >
            <h2 className="text-lg">New collection</h2>
            <Field label="Name" htmlFor="collection-name" required>
              <Input
                id="collection-name"
                required
                maxLength={80}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Monsoon shortlist"
              />
            </Field>
            <Field label="Description" htmlFor="collection-description">
              <Textarea
                id="collection-description"
                maxLength={400}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </Field>
            <Button type="submit" loading={create.isPending}>
              <Plus aria-hidden="true" />
              Create
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}