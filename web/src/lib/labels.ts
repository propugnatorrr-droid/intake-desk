import type { ServiceValue, StatusValue } from '../types';

export const STATUS_ORDER: StatusValue[] = ['new', 'contacted', 'quoted', 'won', 'lost'];

export const STATUS_LABEL: Record<StatusValue, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
};

/** What each move means, phrased as the button a person would press. */
export const STATUS_ACTION: Record<StatusValue, string> = {
  new: 'Reopen as new',
  contacted: 'Mark contacted',
  quoted: 'Send quote',
  won: 'Mark won',
  lost: 'Mark lost',
};

export const SERVICE_LABEL: Record<ServiceValue, string> = {
  website: 'Website',
  'web-app': 'Web app',
  integration: 'Integration',
  maintenance: 'Maintenance',
};

export const SERVICES = Object.keys(SERVICE_LABEL) as ServiceValue[];

export const SORT_VALUES = ['newest', 'oldest', 'name'] as const;

export function formatWhen(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const minutes = Math.round((now.getTime() - then.getTime()) / 60_000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;

  return then.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
