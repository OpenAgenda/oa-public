'use client';

import { useIntl } from 'react-intl';
import { chakra, Text } from '@openagenda/uikit';
import useFiltersBaseQuery from '@/src/app/[locale]/(app)/[agendaSlug]/_hooks/useFiltersBaseQuery';
import useEventsQuery from '@/src/app/[locale]/(app)/[agendaSlug]/_hooks/useEventsQuery';
import FiltersPreview from '@/src/app/[locale]/(app)/[agendaSlug]/_components/FiltersPreview';
import { TotalSkeleton } from '@/src/app/[locale]/(app)/[agendaSlug]/_components/LoadingPage';
import messages from '@/src/app/[locale]/(app)/[agendaSlug]/messages';
import { useEmbedLayoutData } from '@/src/app/[locale]/embed/_components/EmbedLayoutShell';
import isUpcomingOnlyQuery from '@/src/utils/isUpcomingOnlyQuery';
import { omitParams } from '@/src/utils/embedParams';
import applyPrefilterToEventsQuery from '@/src/utils/applyPrefilterToEventsQuery';
import useGetFilterOptions from '../_hooks/useGetFilterOptions';
import FilterPreviewer from './FilterPreviewer';

function Total({ total, upcomingOnly, passed: _passed, disabled: _disabled }) {
  const intl = useIntl();
  // const router = useRouter();

  // const passedUrl = useMemo(() => {
  //   const localePrefix = router.locale === 'default' ? '' : `/${router.locale}`;
  //   const url = new URL(localePrefix + router.asPath, 'https://n');
  //
  //   if (passed) {
  //     url.searchParams.delete('passed');
  //   } else {
  //     url.searchParams.set('passed', '1');
  //   }
  //
  //   return url.pathname + url.search;
  // }, [passed, router.asPath, router.locale]);

  // const togglePassed = useCallback(e => {
  //   e.preventDefault();
  //   if (disabled) return;
  //
  //   router.push(passedUrl, null, { shallow: true });
  // }, [disabled, passedUrl, router]);

  return (
    <Text>
      <chakra.span>
        {intl.formatMessage(
          messages[upcomingOnly ? 'totalUpcomingEvents' : 'totalEvents'],
          { count: total },
        )}
      </chakra.span>
      {/* <Button
        as="a"
        href={passedUrl}
        variant="link"
        colorScheme="primary"
        onClick={togglePassed}
        disabled={disabled}
      >
        {intl.formatMessage(messages[passed ? 'showUpcomingEventsOnly' : 'includePassedEvents'])}
      </Button> */}
    </Text>
  );
}

export default function TotalPart({
  agenda,
  filters,
  query,
  prefilter,
  referrer,
}) {
  const intl = useIntl();

  const upcomingOnly = isUpcomingOnlyQuery(
    applyPrefilterToEventsQuery({ query, prefilter, filters }),
  );

  const { sort, pageSize } = useEmbedLayoutData();

  const { data: filtersBaseData } = useFiltersBaseQuery({
    suspense: true,
    agenda,
    filters,
    query,
    prefilter: omitParams({
      ...prefilter,
      cms: 'embed',
      host: referrer,
    }),
  });
  const {
    data: pages,
    error,
    size,
    // setSize,
  } = useEventsQuery({
    suspense: true,
    agenda,
    filters,
    query: omitParams({
      ...applyPrefilterToEventsQuery({ query, prefilter, filters }),
      cms: 'embed',
      host: referrer,
    }),
    pageSize,
    sort,
  });

  const isLoadingInitialData = !pages && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && pages && pages[size - 1] === undefined);
  // const isEmpty = pages?.[0]?.events?.length === 0;
  // const isReachingEnd = isEmpty || (pages && pages[pages.length - 1]?.events?.length < pageSize);
  // const isRefreshing = isValidating && pages && pages.length === size;

  const getOptions = useGetFilterOptions({
    intl,
    filtersBase: filtersBaseData?.aggregations,
    aggregations: pages?.[0]?.aggregations,
    prefilter,
  });

  if (isLoadingInitialData) {
    return <TotalSkeleton />;
  }

  return (
    <>
      <FiltersPreview
        agenda={agenda}
        filters={filters}
        getOptions={getOptions}
        disabled={isLoadingMore}
        component={FilterPreviewer}
      />

      <Total
        total={pages[0].total}
        upcomingOnly={upcomingOnly}
        passed={query.passed === '1'}
        disabled={isLoadingMore || query.timings}
      />
    </>
  );
}
