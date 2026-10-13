import type { Agenda, EventQuery } from '../types';

type CorpusAgenda = Pick<Agenda, 'summary' | 'hasArchives'> | null | undefined;

// An agenda whose published events have all left for its archives: nothing
// in the active corpus, something in the archives (`hasArchives`, on the
// listing's read). Same rule as packages/next's.
export function isFullyArchivedAgenda(agenda?: CorpusAgenda): boolean {
  const counts = agenda?.summary?.publishedEvents;

  return (
    !!agenda?.hasArchives
    && !!counts
    && (counts.current || 0) + (counts.upcoming || 0) + (counts.passed || 0) === 0
  );
}

// The spellings the API reads for either corpus; anything else names none.
const ARCHIVES = ['1', 'true', 'yes', 'on'];
const ACTIVE = ['0', 'false', 'no', 'off'];

function askedCorpus(value: unknown): 'archives' | 'active' | undefined {
  if (typeof value !== 'string') return undefined;

  const normalized = value.trim().toLowerCase();

  if (ARCHIVES.includes(normalized)) return 'archives';
  if (ACTIVE.includes(normalized)) return 'active';
  return undefined;
}

// The corpus the listing shows: `archived: '1'` for the archives, which a
// fully archived agenda opens on unless the query says `archived=0`; the
// default drops an explicit `relative`, which would empty an all-past corpus.
// For what is downloaded now, never for an address that outlives the page.
// Same rule as packages/next's.
export default function withDefaultCorpus(
  query: EventQuery,
  agenda?: CorpusAgenda,
): EventQuery {
  const { archived, ...rest } = query;
  const asked = askedCorpus(archived);

  if (asked === 'archives') return { ...rest, archived: '1' };

  if (asked === undefined && isFullyArchivedAgenda(agenda)) {
    const { relative: _relative, ...withoutWindow } = rest;
    return { ...withoutWindow, archived: '1' };
  }

  return rest;
}
