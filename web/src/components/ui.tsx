import styled from '@emotion/styled';
import { Link } from 'react-router';
import { bp, color, font, radius, shadow, space } from '../theme';

const buttonBase = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${space(1)};
  min-height: 44px;
  padding: 0 ${space(2.5)};
  border-radius: ${radius.md};
  border: 1.5px solid transparent;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 140ms ease, border-color 140ms ease, transform 140ms ease;
  &:active:not(:disabled) { transform: translateY(1px); }
  &:disabled, &[aria-disabled='true'] { opacity: 0.55; cursor: not-allowed; }
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  ${buttonBase}
  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'secondary':
        return `background: ${color.surface}; border-color: ${color.lineStrong}; color: ${color.ink};
          &:hover:not(:disabled) { border-color: ${color.primary}; }`;
      case 'danger':
        return `background: ${color.surface}; border-color: ${color.danger}; color: ${color.danger};
          &:hover:not(:disabled) { background: ${color.dangerSoft}; }`;
      default:
        return `background: ${color.primary}; color: ${color.onPrimary};
          &:hover:not(:disabled) { background: ${color.primaryHover}; }`;
    }
  }}
`;

export const LinkButton = styled(Link, { shouldForwardProp: (prop) => prop !== 'variant' })<{ variant?: 'primary' | 'secondary' }>`
  ${buttonBase}
  ${({ variant = 'primary' }) =>
    variant === 'primary'
      ? `background: ${color.primary}; color: ${color.onPrimary}; &:hover { background: ${color.primaryHover}; }`
      : `background: ${color.surface}; border-color: ${color.lineStrong}; color: ${color.ink}; &:hover { border-color: ${color.primary}; }`}
`;

export const Card = styled.section`
  background: ${color.surface};
  border: 1px solid ${color.line};
  border-radius: ${radius.lg};
  box-shadow: ${shadow.card};
  padding: ${space(3)};

  @media (min-width: ${bp.tablet}) {
    padding: ${space(4)};
  }
`;

export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const PageTitle = styled.h1`
  font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.2rem);
  letter-spacing: -0.01em;
`;

export const Muted = styled.p`
  color: ${color.muted};
  font-size: 0.95rem;
`;

export const Eyebrow = styled.p`
  font-family: ${font.body};
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${color.muted};
`;
