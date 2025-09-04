import React, { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import useSWRInfinite from 'swr/infinite';
import qs from 'qs';
import { useInView } from 'react-intersection-observer';
import { Center, Spinner, VStack } from '@openagenda/uikit';
import SearchInput from '../SearchInput';
import AccordionItem from '../AccordionItem';
import messages from './messages';
import AgendaItem from './AgendaItem';

const PAGE_SIZE = 20;

export default function ShareOnOA({ agenda, event }) {
  const intl = useIntl();

  const [searchValue, setSearchValue] = useState('');

  const onSubmit = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      search: { value: string };
    };

    setSearchValue(target.search.value);
  }, []);

  const {
    data: pages,
    error,
    size,
    setSize,
    // isValidating,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (pageIndex === 0) return ['shareModal', 'agendas', searchValue, 1, 0];

      if (previousPageData) {
        // second route
        if (
          !previousPageData.secondRoutePage
          && previousPageData.agendas?.length < PAGE_SIZE
        ) {
          return ['shareModal', 'agendas', searchValue, pageIndex + 1, 1];
        }
        // continue on second route
        if (previousPageData.secondRoutePage) {
          return [
            'shareModal',
            'agendas',
            searchValue,
            pageIndex + 1,
            previousPageData.secondRoutePage + 1,
          ];
        }
      }
      // continue on first route
      return ['shareModal', 'agendas', searchValue, pageIndex + 1, 0];
    },
    ([_comp, _requestId, search, page, secondRoutePage]) => {
      const route = secondRoutePage ? '/api/agendas' : '/home/agendas';

      const searchParamsStr = qs.stringify({
        search: search !== '' ? search : undefined,
        page: secondRoutePage || page,
        contributionType: secondRoutePage ? 1 : undefined,
        includeImagePath: 0,
        useDefaultImage: 0,
      });

      return fetch(`${route}?${searchParamsStr}`)
        .then((r) => {
          if (r.ok) return r.json();
          throw new Error("Can't list agendas");
        })
        .then((result) => ({
          ...result,
          secondRoutePage,
        }));
    },
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      // revalidateOnMount: false,
      // revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // use: [swrLaggyMiddleware],
    },
  );

  const isLoadingInitialData = !pages && !error;
  const isLoadingMore = isLoadingInitialData
    || (size > 0 && pages && pages[size - 1] === undefined);
  // const isEmpty = pages
  //   && pages[pages.length - 1]?.secondRoutePage
  //   && pages[pages.length - 1]?.agendas?.length === 0;
  const isReachingEnd = pages
    && pages[pages.length - 1]?.secondRoutePage
    && pages[pages.length - 1]?.agendas?.length < PAGE_SIZE;

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && !isReachingEnd && !isLoadingMore) {
        setSize(size + 1).catch(() => null);
      }
    },
  });

  if (isLoadingInitialData) {
    return (
      <AccordionItem value="on-oa" title={intl.formatMessage(messages.onOA)}>
        <Center h="100px">
          <Spinner size="xl" />
        </Center>
      </AccordionItem>
    );
  }

  const uniqueAgendaUids = new Set();

  return (
    <AccordionItem value="on-oa" title={intl.formatMessage(messages.onOA)}>
      <form onSubmit={onSubmit}>
        <SearchInput onChange={setSearchValue} autoComplete="off" />
      </form>

      <VStack gap="4" pt="4" align="start">
        {pages.map((page) =>
          page.agendas
            .filter((targetAgenda) => {
              if (uniqueAgendaUids.has(targetAgenda.uid)) {
                return false;
              }
              uniqueAgendaUids.add(targetAgenda.uid);
              return true;
            })
            .map((targetAgenda) => (
              <AgendaItem
                key={targetAgenda.uid}
                agenda={agenda}
                targetAgenda={targetAgenda}
                event={event}
              />
            )))}
      </VStack>

      <div ref={ref} />
    </AccordionItem>
  );
}
