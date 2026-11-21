import styled from '@emotion/styled';
import { Link } from 'react-router';
import { SERVICE_LABEL, formatWhen } from '../lib/labels';
import { bp, color, font, radius, shadow, space } from '../theme';
import type { Intake } from '../types';
import { StatusBadge } from './StatusBadge';

const Item = styled.li`
  list-style: none;
`;

const CardLink = styled(Link)`
  display: grid;
  gap: ${space(1)};
  padding: ${space(2.5)};
  background: ${color.surface};
  border: 1px solid ${color.line};
  border-radius: ${radius.lg};
  text-decoration: none;
  transition: border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease;

  &:hover {
    border-color: ${color.primary};
    box-shadow: ${shadow.card};
  }

  @media (min-width: ${bp.tablet}) {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) auto;
    align-items: center;
    gap: ${space(3)};
    padding: ${space(2.5)} ${space(3)};
  }
`;

const Who = styled.div`
  min-width: 0;
  display: grid;
  gap: 2px;

  strong {
    font-family: ${font.heading};
    font-size: 1.1rem;
    overflow-wrap: anywhere;
  }
  span {
    color: ${color.muted};
    font-size: 0.9rem;
    overflow-wrap: anywhere;
  }
`;

const Work = styled.div`
  min-width: 0;
  display: grid;
  gap: 2px;
  font-size: 0.92rem;

  b {
    font-weight: 700;
  }
  span {
    color: ${color.muted};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${space(1.5)};

  time {
    color: ${color.muted};
    font-size: 0.85rem;
    white-space: nowrap;
  }

  @media (min-width: ${bp.tablet}) {
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
  }
`;

export function IntakeCard({ intake }: { intake: Intake }) {
  return (
    <Item>
      <CardLink to={`/intakes/${intake.id}`}>
        <Who>
          <strong>{intake.clientName}</strong>
          <span>{intake.company || intake.email}</span>
        </Who>
        <Work>
          <b>{SERVICE_LABEL[intake.service]}</b>
          <span>{intake.message}</span>
        </Work>
        <Meta>
          <StatusBadge status={intake.status} />
          <time dateTime={intake.createdAt}>{formatWhen(intake.createdAt)}</time>
        </Meta>
      </CardLink>
    </Item>
  );
}
