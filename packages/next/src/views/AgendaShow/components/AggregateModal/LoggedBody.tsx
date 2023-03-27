import { useIntl } from 'react-intl';
import React, { useCallback, useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import qs from 'qs';
import { useInView } from 'react-intersection-observer';
import { Button, ModalBody, ModalFooter, Text, VStack, Link } from '@openagenda/uikit';
// import swrLaggyMiddleware from 'utils/swrLaggyMiddleware';
import LoadingBody from './LoadingBody';
import Description from './Description';
import SearchInput from './SearchInput';
import AgendaItem from './AgendaItem';
import messages from './messages';

const PAGE_SIZE = 20;

export default function LoggedBody({ agenda }) {
  const intl = useIntl();
  const [searchValue, setSearchValue] = useState('');

  const onSubmit = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      search: { value: string }
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
      // reached the end
      if (previousPageData && !previousPageData.agendas) return null;

      // first page, we don't have `previousPageData`
      if (pageIndex === 0) return ['aggregateModal', 'agendas', searchValue];

      // add the cursor to the API endpoint
      return ['aggregateModal', 'agendas', searchValue, pageIndex + 1];
    },
    ([_comp, _requestId, search, page]) => {
      const searchParamsStr = qs.stringify({
        role: 'administrator',
        search: search !== '' ? search : undefined,
        page,
        includeImagePath: false,
        useDefaultImage: false,
      });

      return fetch(`/home/agendas?${searchParamsStr}`)
        .then(r => {
          if (r.ok) return r.json();
          throw new Error('Can\'t list agendas');
        });
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
  const isLoadingMore = isLoadingInitialData || (size > 0 && pages && pages[size - 1] === undefined);
  const isEmpty = pages?.[0]?.agendas?.length === 0;
  const isReachingEnd = isEmpty || (pages && pages[pages.length - 1]?.agendas?.length < PAGE_SIZE);

  const noAgendas = isEmpty && searchValue === '';

  const { ref } = useInView({
    onChange: inView => {
      if (inView && !isReachingEnd && !isLoadingMore) {
        setSize(size + 1).catch(() => null);
      }
    },
  });

  if (isLoadingInitialData) {
    return <LoadingBody />;
  }

  // TODO if noAgendas return (/* ... */)

  return (
    <>
      <ModalBody pb={noAgendas ? null : 4}>
        <Description agenda={agenda} />

        {!noAgendas ? (
          <form onSubmit={onSubmit}>
            <SearchInput onChange={setSearchValue} />
          </form>
        ) : null}

        <VStack spacing="4" pt="4" align="start">
          {pages.map(
            page => page.agendas.map(targetAgenda => (
              <AgendaItem
                key={targetAgenda.uid}
                agenda={agenda}
                targetAgenda={targetAgenda}
              />
            )),
          )}

          {noAgendas ? (
            <Text>{intl.formatMessage(messages.noAgenda, { agenda: agenda.title })}</Text>
          ) : null}
        </VStack>

        <div ref={ref} />
      </ModalBody>

      {noAgendas ? (
        <ModalFooter>
          <Button
            as={Link}
            href="/new"
            colorScheme="primary"
          >
            {intl.formatMessage(messages.createAgenda)}
          </Button>
        </ModalFooter>
      ) : null}
    </>
  );
}
