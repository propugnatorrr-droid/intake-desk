import styled from '@emotion/styled';
import { useCallback } from 'react';
import { useLoaderData, useNavigation, useSearchParams, type LoaderFunctionArgs } from 'react-router';
import { listIntakes } from '../api/client';
import { FilterBar } from '../components/FilterBar';
import { IntakeCard } from '../components/IntakeCard';
import { EmptyState, ListSkeleton } from '../components/States';
import { Eyebrow, LinkButton, Muted, PageTitle } from '../components/ui';
import { SORT_VALUES, STATUS_ORDER } from '../lib/labels';
import { useTitle } from '../lib/useTitle';
import { bp, space } from '../theme';
import type { IntakeList, ListQuery, SortValue, StatusValue } from '../types';

const Head = styled.div`
  display: grid;
  gap: ${space(1)};
  margin-bottom: ${space(3)};

  @media (min-width: ${bp.tablet}) {
    grid-template-columns: 1fr auto;
    align-items: end;
  }
`;

const List = styled.ul<{ busy: boolean }>`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: ${space(1.5)};
  opacity: ${({ busy }) => (busy ? 0.55 : 1)};
  transition: opacity 160ms ease;
`;

export function readQuery(params: URLSearchParams): ListQuery {
  const status = params.get('status') ?? '';
  const sort = params.get('sort') ?? 'newest';

  return {
    status: (STATUS_ORDER as string[]).includes(status) ? (status as StatusValue) : '',
    q: params.get('q') ?? '',
    sort: (SORT_VALUES as readonly string[]).includes(sort) ? (sort as SortValue) : 'newest',
  };
}

export async function listLoader({ request }: LoaderFunctionArgs): Promise<IntakeList> {
  const query = readQuery(new URL(request.url).searchParams);
  return listIntakes(query, request.signal);
}

export function ListHydrateFallback() {
  return <ListSkeleton />;
}

export function ListPage() {
  const data = useLoaderData() as IntakeList;
  const navigation = useNavigation();
  const [params, setParams] = useSearchParams();
  const query = readQuery(params);
  const busy = navigation.state === 'loading';
  const filtered = Boolean(query.status || query.q);

  useTitle('Enquiries');

  const update = useCallback(
    (next: Partial<ListQuery>) => {
      setParams(
        (current) => {
          const merged = new URLSearchParams(current);
          for (const [key, value] of Object.entries(next)) {
            if (!value || (key === 'sort' && value === 'newest')) merged.delete(key);
            else merged.set(key, value);
          }
          return merged;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return (
    <>
      <Head>
        <div>
          <Eyebrow>Client intake</Eyebrow>
          <PageTitle>Enquiries</PageTitle>
          <Muted>Every message from a prospective client, from first hello to signed work.</Muted>
        </div>
        <LinkButton to="/new">Log an enquiry</LinkButton>
      </Head>

      <FilterBar query={query} counts={data.counts} total={data.total} onChange={update} />

      {data.items.length === 0 ? (
        <EmptyState filtered={filtered} onClear={() => setParams({}, { replace: true })} />
      ) : (
        <List busy={busy} aria-busy={busy} role="list">
          {data.items.map((intake) => (
            <IntakeCard key={intake.id} intake={intake} />
          ))}
        </List>
      )}
    </>
  );
}
