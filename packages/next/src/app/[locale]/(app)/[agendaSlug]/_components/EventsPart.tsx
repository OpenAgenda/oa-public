'use client';

import { useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useIntl } from 'react-intl';
import { useInView } from 'react-intersection-observer';
import qs from 'qs';
import { Button, Flex } from '@openagenda/uikit';
import useEventsQuery from '../_hooks/useEventsQuery';
import messages from '../messages';
import EventItem from './EventItem';
import { EventsSkeleton } from './LoadingPage';

const PAGE_SIZE = 10;

export default function EventsPart({ agenda, filters, query }) {
  const intl = useIntl();
  const pathname = usePathname();

  const {
    data: pages,
    error,
    size,
    setSize,
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
  const isEmpty = pages?.[0]?.events?.length === 0;
  const isReachingEnd =
    isEmpty || (pages && pages[pages.length - 1]?.events?.length < PAGE_SIZE);
  // const isRefreshing = isValidating && pages && pages.length === size;

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && !isReachingEnd && !isLoadingMore) {
        setSize(size + 1).catch(() => null);
      }
    },
  });

  const seeMoreUrl = useMemo(() => {
    const search = qs.stringify({
      ...query,
      after: pages?.[pages.length - 1].after?.map(String),
    });
    return search ? `${pathname}?${search}` : pathname;
  }, [pathname, query, pages]);

  const nextPage = useCallback(
    (e) => {
      e.preventDefault();
      setSize((s) => s + 1);
    },
    [setSize],
  );

  if (isLoadingInitialData) {
    return <EventsSkeleton />;
  }

  if (isEmpty) {
    return null;
  }

  return (
    <>
      <Flex direction="column" flex="2" gap="10" mb="12">
        {pages?.map((page, pageIndex) =>
          page.events.map((event, eventIndex) => (
            <EventItem
              key={event.uid}
              event={event}
              agenda={agenda}
              imagePriority={pageIndex === 0 && eventIndex <= 1}
              // nav
              from={pageIndex * PAGE_SIZE + eventIndex}
              first={pageIndex === 0 && eventIndex === 0}
              last={pageIndex * PAGE_SIZE + eventIndex === page.total - 1}
            />
          )),
        )}
      </Flex>

      {!isLoadingInitialData && !isReachingEnd ? (
        <Flex ml={{ base: 'full', xl: '25%' }} justify="space-around">
          <Button
            ref={ref}
            asChild
            onClick={nextPage}
            variant="link"
            loading={isLoadingMore}
          >
            <a href={seeMoreUrl}>{intl.formatMessage(messages.seeMore)}</a>
          </Button>
        </Flex>
      ) : null}
    </>
  );
}
