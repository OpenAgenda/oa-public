import type { Agenda } from '../types';

type CorpusAgenda = Pick<Agenda, 'summary'> | null | undefined;

// An agenda whose published events have all left for its archives: nothing
// in the active corpus — none current, upcoming or passed — and something in
// the archives, as its detailed read's summary counts them (`archivedEvents`,
// absent where the deployment has no archives). One snapshot for both
// halves, which every archiving move resets (`markSummaryForRefresh`), and
// one that every consumer of the detailed read has.
export function isFullyArchivedAgenda(agenda?: CorpusAgenda): boolean {
  const summary = agenda?.summary;
  const counts = summary?.publishedEvents;

  return (
    !!counts
    && (summary.archivedEvents || 0) > 0
    && (counts.current || 0) + (counts.upcoming || 0) + (counts.passed || 0) === 0
  );
}

// The spellings the API reads for either corpus (`resolveArchivedOption`).
// Anything else — empty, `null` (both corpora, which no listing offers), a
// repeated key — names no corpus, and the default decides.
const ARCHIVES = ['1', 'true', 'yes', 'on'];
const ACTIVE = ['0', 'false', 'no', 'off'];

function askedCorpus(value: unknown): 'archives' | 'active' | undefined {
  if (typeof value !== 'string') return undefined;

  const normalized = value.trim().toLowerCase();

  if (ARCHIVES.includes(normalized)) return 'archives';
  if (ACTIVE.includes(normalized)) return 'active';
  return undefined;
}

// The corpus a listing reads, spelled as the listing reads it: `archived:
// '1'` for the archives, no `archived` for the active events.
//
// A fully archived agenda (`isFullyArchivedAgenda`) opens on its archives:
// its active listing could only say "no event". Only the default: an
// explicit `archived=0` — the archives switch turned off — still reads the
// active corpus. And, as the switch does on the way in, the default drops an
// explicit `relative`: an upcoming window would empty an all-past corpus.
//
// Without an agenda, only the spelling is normalised: what a feed or any
// other address that outlives the page reads, since the default must never
// be written there — the same address has to go back to the active events
// once the agenda has some again.
export default function withDefaultCorpus<Q extends Record<string, any>>(
  query: Q,
  agenda?: CorpusAgenda,
): Q {
  const { archived, ...rest } = query;
  const asked = askedCorpus(archived);

  if (asked === 'archives') return { ...rest, archived: '1' } as unknown as Q;

  if (asked === undefined && isFullyArchivedAgenda(agenda)) {
    const { relative: _relative, ...withoutWindow } = rest;
    return { ...withoutWindow, archived: '1' } as unknown as Q;
  }

  return rest as Q;
}
