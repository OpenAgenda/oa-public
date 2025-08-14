import useSWRInfinite from 'swr/infinite';
import { getEvents } from '@openagenda/react-filters';
import isUpcomingOnlyQuery from 'utils/isUpcomingOnlyQuery';

export default function useEventsQuery({
  agenda,
  filters,
  query,
  sort = null,
  includeFields,
  suspense = false,
  pageSize = 10,
}) {
  const result = useSWRInfinite(
    (pageIndex, previousPageData) => {
      // reached the end
      if (previousPageData && !previousPageData.events) return null;

      // first page, we don't have `previousPageData`
      if (pageIndex === 0)
        return ['AgendaShow', 'events', agenda.slug, query, pageIndex];

      // add the cursor to the API endpoint
      return ['AgendaShow', 'events', agenda.slug, query, pageIndex];
    },
    ([_page, _requestId, _slug, _query, pageIndex]) =>
      getEvents(
        null, // apiClient
        `/api/agendas/slug/${agenda.slug}/events`,
        agenda,
        pageIndex === 0 ? filters : [], // need aggs only for first page
        {
          sort: query.search?.length
            ? 'score'
            : sort || 'lastTimingWithFeatured.asc',
          size: pageSize,
          ...isUpcomingOnlyQuery(query)
            ? {
                relative: ['current', 'upcoming'],
              }
            : null,
          ...query,
          from: pageIndex * pageSize,
          passed: undefined, // omit passed
          includeFields,
          includeImageTimestamps: true,
        },
      ),
    {
      suspense,
      keepPreviousData: true,
      revalidateFirstPage: false,
      revalidateOnMount: false,
      // revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // use: [swrLaggyMiddleware],
    },
  );

  return { ...result };
}
