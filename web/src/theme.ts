import type { StatusValue } from './types';

export const color = {
  paper: '#f4efe6',
  surface: '#fffdf8',
  ink: '#1c2321',
  muted: '#566260',
  line: '#d9d1c3',
  lineStrong: '#8f8570',
  primary: '#1d3b34',
  primaryHover: '#13291f',
  onPrimary: '#f8f4ec',
  accent: '#e0a33a',
  focus: '#0f5fa8',
  danger: '#9b2c2c',
  dangerSoft: '#f8e6e3',
} as const;

export const statusColor: Record<StatusValue, { fg: string; bg: string }> = {
  new: { fg: '#1b4478', bg: '#e1ebf7' },
  contacted: { fg: '#6f4400', bg: '#fbeccd' },
  quoted: { fg: '#46297d', bg: '#ebe5f6' },
  won: { fg: '#14502a', bg: '#d9efe0' },
  lost: { fg: '#672828', bg: '#f5e0dd' },
};

export const space = (n: number): string => `${n * 8}px`;

export const font = {
  heading: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
  body: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
} as const;

export const radius = { sm: '6px', md: '10px', lg: '16px' } as const;

export const shadow = {
  card: '0 1px 0 rgba(28, 35, 33, 0.04), 0 8px 24px -12px rgba(28, 35, 33, 0.18)',
} as const;

export const bp = { tablet: '720px', desktop: '1040px' } as const;
