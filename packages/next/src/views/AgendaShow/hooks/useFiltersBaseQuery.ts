import useSWRImmutable from 'swr/immutable';
import { getEvents } from '@openagenda/react-filters';

export default function useFiltersBaseQuery({
  agenda,
  filters,
  query,
  suspense = false,
  prefilter = null,
}) {
  const upcomingOnly = !query.timings && query.passed !== '1';

  return useSWRImmutable(
    ['AgendaShow', 'filtersBase', agenda.slug, { upcomingOnly, ...prefilter }],
    () =>
      getEvents(
        null, // apiClient
        `/api/agendas/slug/${agenda.slug}/events`,
        agenda,
        filters,
        {
          size: 0,
          relative: upcomingOnly ? ['current', 'upcoming'] : undefined,
          ...prefilter,
          passed: undefined, // omit passed
        },
        null, // pageParam
        true, // filtersBase
      ),
    { suspense },
  );
}
