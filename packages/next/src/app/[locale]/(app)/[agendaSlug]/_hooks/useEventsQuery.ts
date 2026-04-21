import useSWRInfinite from 'swr/infinite';
import { getEvents } from '@openagenda/react-filters';
import isUpcomingOnlyQuery from '@/src/utils/isUpcomingOnlyQuery';
import { includeFields } from '../_utils/includeFields';
import { eventsKey } from '../_utils/swrKeys';

export default function useEventsQuery({
  agenda,
  filters,
  query,
  sort = null,
  suspense = false,
  pageSize = 10,
}) {
  const getKey = eventsKey(agenda.slug, query);
  const result = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (previousPageData && !previousPageData.events) return null;
      return getKey(pageIndex);
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
