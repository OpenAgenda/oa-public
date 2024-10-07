import useSWRImmutable from 'swr/immutable';
import { getEvents } from '@openagenda/react-filters';
import getPrefilteredQuery from '../../EmbedAgendaShow/utils/getPrefilteredQuery';

export default function useFiltersBaseQuery({
  agenda,
  filters,
  query,
  suspense = false,
  prefilter = null,
}) {
  const prefilteredQuery = getPrefilteredQuery({ prefilter, query, filters });
  const upcomingOnly = !prefilteredQuery.timings && prefilteredQuery.passed !== '1';

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
