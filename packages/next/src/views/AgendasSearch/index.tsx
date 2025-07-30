import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import useSWRInfinite from 'swr/infinite';
import { useInView } from 'react-intersection-observer';
import qs from 'qs';
import { VStack, Container, H1, Text, Button, Flex } from '@openagenda/uikit';
import { useNavbarSearch } from 'contexts/NavbarSearchManager';
import useLocationQuery from 'hooks/useLocationQuery';
import useNetwork from './hooks/useNetwork';
import useLocationSet from './hooks/useLocationSet';
import AgendaItem from './components/AgendaItem';
import Metas from './components/Metas';
import messages from './messages';
import fetchLocale from './locales';

const PAGE_SIZE = 20;

export type AgendasSearchProps = {
  preload?: string[];
};

function Head({ total, network, locationSet }) {
  const intl = useIntl();
  const query = useLocationQuery() as {
    search?: string;
    network?: string;
    locationSet?: string;
  };

  if (query.search) {
    return (
      <>
        <H1 fontSize="4xl" mb="2">
          {intl.formatMessage(messages.searchResultsHead, {
            search: query.search,
          })}
        </H1>
        <Text mb="8">
          {total >= 10000
            ? intl.formatMessage(messages.bigTotal, { limit: 10000 })
            : intl.formatMessage(messages.total, { total })}
        </Text>
      </>
    );
  }

  if (query.network && network) {
    return (
      <H1 fontSize="4xl" mb="8">
        {network.title}
      </H1>
    );
  }

  if (query.locationSet && locationSet) {
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

function AgendasSearch({ preload }: AgendasSearchProps) {
  const intl = useIntl();
  const router = useRouter();
  const { searchValue: search } = useNavbarSearch();
  const query = useLocationQuery();

  const { network } = useNetwork();
  const { locationSet } = useLocationSet();

  const {
    data: pages,
    error,
    size,
    setSize,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      // reached the end
      if (previousPageData && !previousPageData.agendas?.length) return null;

      const reqQuery = {
        search: search || 'search' in query ? search : undefined,
        network: query.network,
        locationSet: query.locationSet,
      };

      // first page, we don't have `previousPageData`
      if (pageIndex === 0)
        return ['AgendasSearch', 'agendas', reqQuery, pageIndex, query.after];

      // add the cursor to the API endpoint
      return [
        'AgendasSearch',
        'agendas',
        reqQuery,
        pageIndex,
        previousPageData.after,
      ];
    },
    ([_comp, _requestId, reqQuery, _pageIndex, after]) =>
      fetch(
        `/api/agendas${qs.stringify(
          {
            ...reqQuery,
            after: after?.map(String),
            includeImagePath: 0,
            useDefaultImage: 0,
            fields: ['summary', 'network', 'locationSet'],
          },
          {
            addQueryPrefix: true,
          },
        )}`,
      ).then((r) => {
        if (r.ok) return r.json();
        throw new Error("Can't list agendas");
      }),
    {
      keepPreviousData: true,
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
    // TODO loading
    return <Metas preload={preload} />;
  }

  return (
    <>
      <Metas
        preload={preload}
        networkTitle={network?.title}
        locationSetTitle={locationSet?.title}
      />

      <Container maxW="3xl" bg="white" my="20" p="12">
        <Head
          total={pages[0].total}
          network={network}
          locationSet={locationSet}
        />

        <VStack align="stretch" gap="8">
          {pages.map((page) =>
            page.agendas.map((agenda) => (
              <AgendaItem key={agenda.uid} agenda={agenda} />
            )),
          )}
        </VStack>

        {!isLoadingInitialData && !isReachingEnd ? (
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
    </>
  );
}

AgendasSearch.fetchLocale = (locale: string) =>
  Promise.all([fetchLocale(locale)]).then((results) =>
    Object.assign({}, ...results),
  );

export default AgendasSearch;
