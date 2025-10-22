import { useCallback, useMemo } from 'react';
import qs from 'qs';
import { Button, Flex, SimpleGrid } from '@openagenda/uikit';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import useEventsQuery from 'views/AgendaShow/hooks/useEventsQuery';
import { useEmbedLayoutData } from 'components/EmbedLayout';
import { omitParams } from 'utils/embedParams';
import getPrefilteredQuery from '../utils/getPrefilteredQuery';
import messages from '../messages';
import EventItem from './EventItem';
import { EventsSkeleton } from './LoadingPage';

export default function EventsPart({
  agenda,
  filters,
  query,
  includeFields,
  prefilter,
  referrer,
}) {
  const intl = useIntl();
  const router = useRouter();

  const { sort, itemMinWidth, pageSize, hideLocation } = useEmbedLayoutData();

  const {
    data: pages,
    error,
    size,
    setSize,
  } = useEventsQuery({
    suspense: true,
    agenda,
    filters,
    query: omitParams({
      ...getPrefilteredQuery({ query, prefilter, filters }),
      cms: 'embed',
      host: referrer,
    }),
    includeFields,
    pageSize,
    sort,
  });

  const isLoadingInitialData = !pages && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && pages && pages[size - 1] === undefined);
  const isEmpty = pages?.[0]?.events?.length === 0;
  const isReachingEnd =
    isEmpty || (pages && pages[pages.length - 1]?.events?.length < pageSize);

  const seeMoreUrl = useMemo(() => {
    const localePrefix = router.locale === 'default' ? '' : `/${router.locale}`;
    const url = new URL(localePrefix + router.asPath, 'https://n');
    url.search = qs.stringify({
      ...query,
      after: pages?.[pages.length - 1].after?.map(String),
    });
    return url.pathname + url.search;
  }, [router.locale, router.asPath, query, pages]);

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
      <SimpleGrid
        templateColumns={`repeat(auto-fill, minmax(min(${itemMinWidth || '290px'}, 100%), 1fr))`}
        gap="10"
      >
        {pages?.map((page, pageIndex) =>
          page.events.map((event, eventIndex) => (
            <EventItem
              key={event.uid}
              event={event}
              agenda={agenda}
              hideLocation={hideLocation}
              referrer={referrer}
              // nav
              from={pageIndex * pageSize + eventIndex}
              first={pageIndex === 0 && eventIndex === 0}
              last={pageIndex * pageSize + eventIndex === page.total - 1}
            />
          )),
        )}
      </SimpleGrid>

      {!isLoadingInitialData && !isReachingEnd ? (
        <Flex justify="space-around" mt="8">
          <Button
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
