import type { EventQuery } from '../types';

export default function isUpcomingOnlyQuery(query: EventQuery): boolean {
  return (
    !query.timings
    && query.passed !== '1'
    && (!query.relative || query.relative?.includes('upcoming'))
    && !query.relative?.includes('passed')
  );
}
