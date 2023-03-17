import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import { chakra, Button, Text } from '@openagenda/uikit';
import { useGetFilterOptions } from '@openagenda/react-filters';
import useFiltersBaseQuery from '../hooks/useFiltersBaseQuery';
import useEventsQuery from '../hooks/useEventsQuery';
import messages from '../messages';
import FiltersPreview from './FiltersPreview';
import { TotalSkeleton } from './LoadingPage';

function Total({ total, upcomingOnly, passed, disabled }) {
  const intl = useIntl();
  const router = useRouter();

  const passedUrl = useMemo(() => {
    const localePrefix = router.locale === 'default' ? '' : `/${router.locale}`;
    const url = new URL(localePrefix + router.asPath, 'http://n');

    if (passed) {
      url.searchParams.delete('passed');
    } else {
      url.searchParams.set('passed', '1');
    }

    return url.pathname + url.search;
  }, [passed, router.asPath, router.locale]);

  const togglePassed = useCallback(e => {
    e.preventDefault();
    if (disabled) return;

    router.push(passedUrl, null, { shallow: true });
  }, [disabled, passedUrl, router]);

  return (
    <Text
      align="center"
      display={{ base: 'flex', sm: 'block' }}
      flexDirection="column"
    >
      <chakra.span _after={{ content: { base: 'none', sm: '" - "' } }}>
        {intl.formatMessage(messages[upcomingOnly ? 'totalUpcomingEvents' : 'totalEvents'], { count: total })}
      </chakra.span>
      <Button
        as="a"
        href={passedUrl}
        variant="link"
        colorScheme="primary"
        onClick={togglePassed}
        disabled={disabled}
      >
        {intl.formatMessage(messages[passed ? 'showUpcomingEventsOnly' : 'includePassedEvents'])}
      </Button>
    </Text>
  );
}

export default function TotalPart({ agenda, filters, query, includeFields }) {
  const intl = useIntl();

  const upcomingOnly = !query.timings && query.passed !== '1';

  const { data: filtersBaseData } = useFiltersBaseQuery({
    suspense: true,
    agenda,
    filters,
    query,
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
    query,
    includeFields,
  });

  const isLoadingInitialData = !pages && !error;
  const isLoadingMore = isLoadingInitialData || (size > 0 && pages && pages[size - 1] === undefined);
  // const isEmpty = pages?.[0]?.events?.length === 0;
  // const isReachingEnd = isEmpty || (pages && pages[pages.length - 1]?.events?.length < PAGE_SIZE);
  // const isRefreshing = isValidating && pages && pages.length === size;

  const getOptions = useGetFilterOptions(
    intl,
    filtersBaseData?.aggregations,
    pages?.[0]?.aggregations,
  );

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
