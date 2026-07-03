'use client';

import { useCallback, useMemo } from 'react';
import qs from 'qs';
import { Button, Flex, SimpleGrid } from '@openagenda/uikit';
import { useIntl } from 'react-intl';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import useEventsQuery from '@/src/app/[locale]/(app)/[agendaSlug]/_hooks/useEventsQuery';
import { useEmbedLayoutData } from '@/src/app/[locale]/embed/_components/EmbedLayoutShell';
import { omitParams } from '@/src/utils/embedParams';
import applyPrefilterToEventsQuery from '@/src/utils/applyPrefilterToEventsQuery';
import messages from '../messages';
import EventItem from './EventItem';
import { EventsSkeleton } from './LoadingPage';

export default function EventsPart({
  agenda,
  filters,
  query,
  prefilter,
  referrer,
}) {
  const intl = useIntl();
  const params = useParams<{ locale: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { sort, itemMinWidth, itemLayout, pageSize, hideLocation } =
    useEmbedLayoutData();

  const isHorizontal = itemLayout === 'horizontal';

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
  const isEmpty = pages?.[0]?.events?.length === 0;
  const isReachingEnd =
    isEmpty || (pages && pages[pages.length - 1]?.events?.length < pageSize);

  const seeMoreUrl = useMemo(() => {
    const locale = params?.locale;
    const localePrefix = !locale || locale === 'default' ? '' : `/${locale}`;
    const search = searchParams.toString();
    const asPath = search ? `${pathname}?${search}` : pathname;
    const url = new URL(localePrefix + asPath, 'https://n');
    url.search = qs.stringify({
      ...query,
      after: pages?.[pages.length - 1].after?.map(String),
    });
    return url.pathname + url.search;
  }, [params?.locale, pathname, searchParams, query, pages]);

  const nextPage = useCallback(
    (e) => {
      e.preventDefault();
      setSize((s) => s + 1);
    },
    [setSize],
  );

  if (isLoadingInitialData) {
    return <EventsSkeleton isHorizontal={isHorizontal} />;
  }

  if (isEmpty) {
    return null;
  }

  return (
    <>
      <SimpleGrid
        templateColumns={
          isHorizontal
            ? '1fr'
            : `repeat(auto-fill, minmax(min(${itemMinWidth || '290px'}, 100%), 1fr))`
        }
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
