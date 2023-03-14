import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { useInView } from 'react-intersection-observer';
import qs from 'qs';
import { Button, Flex } from '@openagenda/uikit';
import useEventsQuery from '../hooks/useEventsQuery';
import messages from '../messages';
import EventItem from './EventItem';
import { EventsSkeleton } from './LoadingPage';

const PAGE_SIZE = 10;

export default function EventsPart({ agenda, filters, query, includeFields }) {
  const intl = useIntl();
  const router = useRouter();

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
    includeFields,
  });

  const isLoadingInitialData = !pages && !error;
  const isLoadingMore = isLoadingInitialData || (size > 0 && pages && pages[size - 1] === undefined);
  const isEmpty = pages?.[0]?.events?.length === 0;
  const isReachingEnd = isEmpty || (pages && pages[pages.length - 1]?.events?.length < PAGE_SIZE);
  // const isRefreshing = isValidating && pages && pages.length === size;

  const { ref } = useInView({
    onChange: inView => {
      if (inView && !isReachingEnd && !isLoadingMore) {
        setSize(size + 1).catch(() => null);
      }
    },
  });

  const seeMoreUrl = useMemo(() => {
    const url = new URL(router.asPath, process.env.NEXT_PUBLIC_SITE_ROOT);
    url.search = qs.stringify({
      ...query,
      after: pages?.[pages.length - 1].after?.map(String),
    });
    return url.pathname + url.search;
  }, [router.asPath, query, pages]);

  const nextPage = useCallback(e => {
    e.preventDefault();
    setSize(s => s + 1);
  }, [setSize]);

  if (isLoadingInitialData) {
    return <EventsSkeleton />;
  }

  return (
    <>
      <Flex direction="column" flex="2" gap="10" mb="12">
        {pages?.map((page, pageIndex) => page.events.map((event, eventIndex) => (
          <EventItem
            key={event.uid}
            event={event}
            agenda={agenda}
            imagePriority={pageIndex === 0 && eventIndex <= 1}
          />
        )))}
      </Flex>

      {!isLoadingInitialData && !isReachingEnd ? (
        <Flex ml={{ base: 'full', xl: '25%' }} justify="space-around">
          <Button
            ref={ref}
            as="a"
            href={seeMoreUrl}
            onClick={nextPage}
            variant="link"
            colorScheme="primary"
            isLoading={isLoadingMore}
          >
            {intl.formatMessage(messages.seeMore)}
          </Button>
        </Flex>
      ) : null}
    </>
  );
}
