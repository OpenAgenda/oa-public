import type { EventQuery } from '../types';

// The archives are all past, so reading them is never an upcoming-only read:
// an export of the archives view would otherwise ask the archives for current
// and upcoming events, and come back empty. Same rule as packages/next's.
export default function isUpcomingOnlyQuery(query: EventQuery): boolean {
  return (
    query.archived !== '1'
    && !query.timings
    && query.passed !== '1'
    && (!query.relative || query.relative?.includes('upcoming'))
    && !query.relative?.includes('passed')
  );
}
