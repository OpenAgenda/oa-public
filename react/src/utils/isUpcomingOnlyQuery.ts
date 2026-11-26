import type { Agenda, EventQuery } from '../types';

// An agenda whose published events are all past: none current, none
// upcoming, some passed, as its detailed read's summary counts them. Same
// rule as packages/next's.
export function isPastOnlyAgenda(
  agenda?: Pick<Agenda, 'summary'> | null,
): boolean {
  const counts = agenda?.summary?.publishedEvents;

  return (
    !!counts
    && (counts.current || 0) + (counts.upcoming || 0) === 0
    && (counts.passed || 0) > 0
  );
}

// The archives are all past, so reading them is never an upcoming-only read:
// an export of the archives view would otherwise ask the archives for current
// and upcoming events, and come back empty. Same for an agenda whose events
// are all past, which its listing opens on its past events: the default
// upcoming window would export none of what the reader sees. A `relative` the
// query asks for still decides. Same rule as packages/next's.
export default function isUpcomingOnlyQuery(
  query: EventQuery,
  agenda?: Pick<Agenda, 'summary'> | null,
): boolean {
  return (
    (!!query.relative || !isPastOnlyAgenda(agenda))
    && query.archived !== '1'
    && !query.timings
    && query.passed !== '1'
    && (!query.relative || query.relative?.includes('upcoming'))
    && !query.relative?.includes('passed')
  );
}
