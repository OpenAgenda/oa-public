'use client';

import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { chakra, Button, Text } from '@openagenda/uikit';
import { useGetFilterOptions } from '@openagenda/react-filters';
import isUpcomingOnlyQuery from '@/src/utils/isUpcomingOnlyQuery';
import useFiltersBaseQuery from '../_hooks/useFiltersBaseQuery';
import useEventsQuery from '../_hooks/useEventsQuery';
import messages from '../messages';
import FiltersPreview from './FiltersPreview';
import { TotalSkeleton } from './LoadingPage';

function Total({ total, upcomingOnly, passed, disabled }) {
  const intl = useIntl();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const passedUrl = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (passed) {
      params.delete('passed');
    } else {
      params.set('passed', '1');
    }
    const search = params.toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [passed, pathname, searchParams]);

  const togglePassed = useCallback(
    (e) => {
      e.preventDefault();
      if (disabled) return;

      router.push(passedUrl, { scroll: false });
    },
    [disabled, passedUrl, router],
  );

  return (
    <Text
      textAlign="center"
      display={{ base: 'flex', sm: 'block' }}
      flexDirection="column"
    >
      <chakra.span _after={{ content: { base: 'none', sm: '" - "' } }}>
        {intl.formatMessage(
          messages[upcomingOnly ? 'totalUpcomingEvents' : 'totalEvents'],
          { count: total },
        )}
      </chakra.span>
      <Button asChild variant="link" onClick={togglePassed} disabled={disabled}>
        <a href={passedUrl}>
          {intl.formatMessage(
            messages[passed ? 'showUpcomingEventsOnly' : 'includePassedEvents'],
          )}
        </a>
      </Button>
    </Text>
  );
}

export default function TotalPart({ agenda, filters, query }) {
  const intl = useIntl();

  const upcomingOnly = isUpcomingOnlyQuery(query);

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
  });

  const isLoadingInitialData = !pages && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && pages && pages[size - 1] === undefined);
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
