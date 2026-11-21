import styled from '@emotion/styled';
import { STATUS_LABEL } from '../lib/labels';
import { statusColor } from '../theme';
import type { StatusValue } from '../types';

const Badge = styled.span<{ status: StatusValue }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px 3px 8px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  color: ${({ status }) => statusColor[status].fg};
  background: ${({ status }) => statusColor[status].bg};
`;

/** Each status has its own mark, so the meaning never depends on colour alone. */
function Mark({ status }: { status: StatusValue }) {
  const common = { width: 12, height: 12, viewBox: '0 0 12 12', 'aria-hidden': true, focusable: false } as const;

  switch (status) {
    case 'new':
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="4" fill="currentColor" />
        </svg>
      );
    case 'contacted':
      return (
        <svg {...common}>
          <path d="M1.5 3.5h9v5h-5l-2.5 2v-2h-1.5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case 'quoted':
      return (
        <svg {...common}>
          <path d="M2.5 1.5h5l2 2v7h-7z M4.5 6h3 M4.5 8h3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case 'won':
      return (
        <svg {...common}>
          <path d="M2 6.5l2.6 2.6L10 3.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'lost':
      return (
        <svg {...common}>
          <path d="M3 3l6 6M9 3l-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
  }
}

export function StatusBadge({ status }: { status: StatusValue }) {
  return (
    <Badge status={status}>
      <Mark status={status} />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
