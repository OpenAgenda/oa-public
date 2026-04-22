import { useIntl } from 'react-intl';
import React, { forwardRef, useCallback, useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import qs from 'qs';
import { useInView } from 'react-intersection-observer';
import { chakra, Button, Text, VStack, Link } from '@openagenda/uikit';
import { DialogBody, DialogFooter } from '@openagenda/uikit/snippets';
// import swrLaggyMiddleware from 'utils/swrLaggyMiddleware';
import ModalLoadingBody from 'components/ModalLoadingBody';
import SearchInput from 'components/SearchInput';
import Description from './Description';
import AgendaItem from './AgendaItem';
import messages from './messages';

const PAGE_SIZE = 20;

interface LoggedBodyProps {
  agenda: Record<string, any>;
}

const LoggedBody = forwardRef<HTMLDivElement, LoggedBodyProps>(
  function LoggedBody({ agenda }, ref) {
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

        return fetch(`/home/agendas?${searchParamsStr}`).then((r) => {
          if (r.ok) return r.json();
          throw new Error("Can't list agendas");
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
    const isLoadingMore =
      isLoadingInitialData ||
      (size > 0 && pages && pages[size - 1] === undefined);
    const isEmpty = pages?.[0]?.agendas?.length === 0;
    const isReachingEnd =
      isEmpty ||
      (pages && pages[pages.length - 1]?.agendas?.length < PAGE_SIZE);

    const noAgendas = isEmpty && searchValue === '';

    const { ref: intersectionRef } = useInView({
      onChange: (inView) => {
        if (inView && !isReachingEnd && !isLoadingMore) {
          setSize(size + 1).catch(() => null);
        }
      },
    });

    if (isLoadingInitialData) {
      return <ModalLoadingBody />;
    }

    // TODO if noAgendas return (/* ... */)

    return (
      <>
        <DialogBody ref={ref} tabIndex={-1}>
          <Description agenda={agenda} />

          {!noAgendas ? (
            <chakra.form onSubmit={onSubmit} mb="4">
              <SearchInput onChange={setSearchValue} />
            </chakra.form>
          ) : null}

          <VStack gap="4" align="start">
            {pages.map((page) =>
              page.agendas.map((targetAgenda) => (
                <AgendaItem
                  key={targetAgenda.uid}
                  agenda={agenda}
                  targetAgenda={targetAgenda}
                />
              )),
            )}

            {noAgendas ? (
              <Text>
                {intl.formatMessage(messages.noAgenda, {
                  agenda: agenda.title,
                })}
              </Text>
            ) : null}
          </VStack>

          <div ref={intersectionRef} />
        </DialogBody>

        {noAgendas ? (
          <DialogFooter>
            <Button asChild>
              <Link unstyled href="/agendas/new">
                {intl.formatMessage(messages.createAgenda)}
              </Link>
            </Button>
          </DialogFooter>
        ) : null}
      </>
    );
  },
);

export default LoggedBody;
