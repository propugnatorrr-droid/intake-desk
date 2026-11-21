import { useEffect } from 'react';

const SUFFIX = 'Intake Desk';

/** Keeps the browser tab and history entries meaningful as the route changes. */
export function useTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : SUFFIX;
  }, [title]);
}
