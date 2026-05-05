import type { Agenda } from '@/src/types';

export type StashedAgenda = {
  agenda: Agenda;
};

/**
 * Module-level store that lets the proxy hand off an already-fetched agenda
 * to the downstream Server Component tree, keyed by a per-request UUID
 * carried in the `x-agenda-req-id` request header.
 *
 * Proxy stashes; any Server Component peeks (read-only). The 10s safety timer
 * is the sole cleanup so multiple lookups within the same request all succeed
 * (e.g. fetchAgenda called from generateMetadata then re-called with different
 * args from a deeper subtree where React.cache misses).
 *
 * This avoids a duplicate HTTP fetch within a single request without
 * introducing a time-based cache.
 */
const store = new Map<string, StashedAgenda>();

export const REQUEST_AGENDA_HEADER = 'x-agenda-req-id';

export function stashAgenda(requestId: string, entry: StashedAgenda): void {
  store.set(requestId, entry);
  const timer = setTimeout(() => store.delete(requestId), 10_000);
  timer.unref?.();
}

export function peekAgenda(requestId: string): StashedAgenda | null {
  return store.get(requestId) ?? null;
}
