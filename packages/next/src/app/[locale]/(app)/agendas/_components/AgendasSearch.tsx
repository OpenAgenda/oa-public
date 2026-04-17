'use client';

import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import useSWRInfinite from 'swr/infinite';
import { useInView } from 'react-intersection-observer';
import qs from 'qs';
import { VStack, Container, H1, Text, Button, Flex } from '@openagenda/uikit';
import messages from '../messages';
import AgendaItem from './AgendaItem';

const PAGE_SIZE = 20;

type AgendasSearchProps = {
  initialAgendas: any;
  network: any;
  locationSet: any;
  query: {
    search?: string;
    network?: string;
    locationSet?: string;
  };
  locale: string;
};

function PageHead({
  total,
  network,
  locationSet,
  search,
}: {
  total: number;
  network: any;
  locationSet: any;
  search?: string;
}) {
  const intl = useIntl();

  if (search) {
    return (
      <>
        <H1 fontSize="4xl" mb="2">
          {intl.formatMessage(messages.searchResultsHead, { search })}
        </H1>
        <Text mb="8">
          {total >= 10000
            ? intl.formatMessage(messages.bigTotal, { limit: 10000 })
            : intl.formatMessage(messages.total, { count: total })}
        </Text>
      </>
    );
  }

  if (network) {
    return (
      <H1 fontSize="4xl" mb="8">
        {network.title}
      </H1>
    );
  }

  if (locationSet) {
    return (
      <H1 fontSize="4xl" mb="8">
        {locationSet.title}
      </H1>
    );
  }

  return (
    <H1 fontSize="4xl" mb="8">
      {intl.formatMessage(messages.latestUpdated)}
    </H1>
  );
}

function buildAgendasUrl(query: AgendasSearchProps['query'], after?: string[]) {
  return `/api/agendas${qs.stringify(
    {
      ...query,
      after: after?.map(String),
      includeImagePath: 0,
      useDefaultImage: 0,
      fields: ['summary', 'network', 'locationSet'],
    },
    { addQueryPrefix: true },
  )}`;
}

export default function AgendasSearch({
  initialAgendas,
  network,
  locationSet,
  query,
  locale,
}: AgendasSearchProps) {
  const intl = useIntl();

  const {
    data: pages,
    error,
    size,
    setSize,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (previousPageData && !previousPageData.agendas?.length) return null;
      if (pageIndex === 0) return buildAgendasUrl(query);
      return buildAgendasUrl(query, previousPageData.after);
    },
    {
      fallbackData: initialAgendas ? [initialAgendas] : undefined,
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );

  const isLoadingInitialData = !pages && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && pages && pages[size - 1] === undefined);
  const isEmpty = pages?.[0]?.agendas?.length === 0;
  const isReachingEnd =
    isEmpty || (pages && pages[pages.length - 1]?.agendas?.length < PAGE_SIZE);

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && !isReachingEnd && !isLoadingMore) {
        setSize(size + 1).catch(() => null);
      }
    },
  });

  const seeMoreUrl = useMemo(() => {
    const url = new URL(`/${locale}/agendas`, 'https://n');
    url.search = qs.stringify({
      ...query,
      after: pages?.[pages.length - 1]?.after?.map(String),
    });
    return url.pathname + url.search;
  }, [locale, query, pages]);

  const nextPage = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setSize((s) => s + 1);
    },
    [setSize],
  );

  if (isLoadingInitialData) {
    return null;
  }

  return (
    <Container maxW="3xl" bg="white" my="20" p="12">
      <PageHead
        total={pages[0].total}
        network={network}
        locationSet={locationSet}
        search={query.search}
      />

      <VStack align="stretch" gap="8">
        {pages.map((page) =>
          page.agendas.map((agenda) => (
            <AgendaItem key={agenda.uid} agenda={agenda} />
          )),
        )}
      </VStack>

      {!isReachingEnd ? (
        <Flex justify="space-around" mt="8">
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
    </Container>
  );
}
