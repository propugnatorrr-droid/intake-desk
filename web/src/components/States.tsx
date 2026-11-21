import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { color, radius, space } from '../theme';
import { Button, LinkButton, VisuallyHidden } from './ui';

const Panel = styled.div<{ tone?: 'neutral' | 'error' }>`
  display: grid;
  justify-items: start;
  gap: ${space(1.5)};
  padding: ${space(4)} ${space(3)};
  border-radius: ${radius.lg};
  border: 1.5px dashed ${({ tone }) => (tone === 'error' ? color.danger : color.lineStrong)};
  background: ${({ tone }) => (tone === 'error' ? color.dangerSoft : 'transparent')};

  h2 {
    font-size: 1.25rem;
  }
  p {
    max-width: 52ch;
    color: ${color.muted};
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${space(1.5)};
  margin-top: ${space(1)};
`;

export function EmptyState({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  return (
    <Panel>
      <h2>{filtered ? 'No enquiries match those filters' : 'The desk is clear'}</h2>
      <p>
        {filtered
          ? 'Try a different status or a shorter search. Nothing has been deleted.'
          : 'When a client gets in touch, log it here so it never sits in someone’s inbox again.'}
      </p>
      <Actions>
        {filtered ? (
          <Button variant="secondary" type="button" onClick={onClear}>
            Clear filters
          </Button>
        ) : (
          <LinkButton to="/new">Log the first enquiry</LinkButton>
        )}
      </Actions>
    </Panel>
  );
}

export function ErrorPanel({ title, message, onRetry, children }: { title: string; message: string; onRetry?: () => void; children?: ReactNode }) {
  return (
    <Panel tone="error" role="alert">
      <h2>{title}</h2>
      <p style={{ color: color.ink }}>{message}</p>
      <Actions>
        {onRetry && (
          <Button type="button" onClick={onRetry}>
            Try again
          </Button>
        )}
        {children}
      </Actions>
    </Panel>
  );
}

const SkeletonList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: ${space(1.5)};
`;

const SkeletonRow = styled.li`
  height: 92px;
  border-radius: ${radius.lg};
  border: 1px solid ${color.line};
  background: linear-gradient(100deg, ${color.surface} 30%, #f1ebde 50%, ${color.surface} 70%);
  background-size: 220% 100%;
  animation: shimmer 1.4s ease-in-out infinite;

  @keyframes shimmer {
    from {
      background-position: 120% 0;
    }
    to {
      background-position: -120% 0;
    }
  }
`;

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite">
      <VisuallyHidden>Loading enquiries</VisuallyHidden>
      <SkeletonList aria-hidden="true">
        {Array.from({ length: rows }, (_, index) => (
          <SkeletonRow key={index} />
        ))}
      </SkeletonList>
    </div>
  );
}
