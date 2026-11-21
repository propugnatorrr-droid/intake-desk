import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import { STATUS_LABEL, STATUS_ORDER } from '../lib/labels';
import { bp, color, radius, space } from '../theme';
import type { IntakeList, ListQuery, SortValue, StatusValue } from '../types';

const Bar = styled.div`
  display: grid;
  gap: ${space(2)};
  margin-bottom: ${space(3)};
`;

const Controls = styled.div`
  display: grid;
  gap: ${space(1.5)};

  @media (min-width: ${bp.tablet}) {
    grid-template-columns: 1fr auto;
    align-items: end;
  }
`;

const Label = styled.label`
  display: grid;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${color.muted};
`;

const inputStyles = `
  min-height: 44px;
  padding: 0 14px;
  border-radius: ${radius.md};
  border: 1.5px solid ${color.lineStrong};
  background: ${color.surface};
  font-size: 1rem;
  font-weight: 400;
  color: ${color.ink};
  &::placeholder { color: ${color.muted}; opacity: 1; }
`;

const Search = styled.input`
  ${inputStyles}
`;

const Select = styled.select`
  ${inputStyles}
  padding-right: 32px;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${space(1)};
`;

const Chip = styled('button', { shouldForwardProp: (prop) => prop !== 'selected' })<{ selected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 ${space(2)};
  border-radius: 999px;
  border: 1.5px solid ${({ selected }) => (selected ? color.primary : color.lineStrong)};
  background: ${({ selected }) => (selected ? color.primary : color.surface)};
  color: ${({ selected }) => (selected ? color.onPrimary : color.ink)};
  font-weight: 600;
  cursor: pointer;
  transition: background-color 140ms ease, border-color 140ms ease;

  span {
    font-variant-numeric: tabular-nums;
    font-size: 0.85rem;
    opacity: 0.85;
  }
`;

interface Props {
  query: ListQuery;
  counts: IntakeList['counts'] | undefined;
  total: number | undefined;
  onChange: (next: Partial<ListQuery>) => void;
}

export function FilterBar({ query, counts, total, onChange }: Props) {
  const [text, setText] = useState(query.q);
  const lastSent = useRef(query.q);

  // Keep the field in step when the URL changes from elsewhere (back button, "Clear filters").
  useEffect(() => {
    if (query.q !== lastSent.current) {
      lastSent.current = query.q;
      setText(query.q);
    }
  }, [query.q]);

  useEffect(() => {
    if (text === lastSent.current) return;
    const timer = window.setTimeout(() => {
      lastSent.current = text;
      onChange({ q: text });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [text, onChange]);

  const all = counts ? Object.values(counts).reduce((sum, n) => sum + n, 0) : undefined;

  return (
    <Bar>
      <Controls>
        <Label>
          Search enquiries
          <Search
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Name, company or email"
            autoComplete="off"
          />
        </Label>
        <Label>
          Sort by
          <Select value={query.sort} onChange={(event) => onChange({ sort: event.target.value as SortValue })}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Client name</option>
          </Select>
        </Label>
      </Controls>

      <Chips role="group" aria-label="Filter by status">
        <Chip type="button" selected={query.status === ''} aria-pressed={query.status === ''} onClick={() => onChange({ status: '' })}>
          All {all !== undefined && <span>{all}</span>}
        </Chip>
        {STATUS_ORDER.map((status: StatusValue) => (
          <Chip
            key={status}
            type="button"
            selected={query.status === status}
            aria-pressed={query.status === status}
            onClick={() => onChange({ status })}
          >
            {STATUS_LABEL[status]} {counts && <span>{counts[status]}</span>}
          </Chip>
        ))}
      </Chips>

      <p role="status" aria-live="polite" style={{ color: color.muted, fontSize: '0.9rem' }}>
        {total === undefined ? '' : `${total} ${total === 1 ? 'enquiry' : 'enquiries'} shown`}
      </p>
    </Bar>
  );
}
