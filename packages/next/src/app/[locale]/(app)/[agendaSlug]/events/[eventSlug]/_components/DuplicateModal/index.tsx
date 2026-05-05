import { VStack, H3, HStack, Separator, Text } from '@openagenda/uikit';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
  DialogBody,
} from '@openagenda/uikit/snippets';
import { useIntl } from 'react-intl';
import React, { useCallback, useEffect, useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import qs from 'qs';
import { useInView } from 'react-intersection-observer';
import ModalLoadingBody from '@/src/components/ModalLoadingBody';
import SearchInput from '@/src/components/SearchInput';
import { duplicateModal as messages } from '../../messages';
import AgendaItem from './AgendaItem';

const PAGE_SIZE = 20;

function CustomSeparator({ children, ...props }) {
  return (
    <HStack {...props}>
      <Separator flex="1" />
      <Text flexShrink="0">{children}</Text>
      <Separator flex="1" />
    </HStack>
  );
}

function DuplicateModalBody({ agenda, event }) {
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
      if (previousPageData && previousPageData.agendas?.length < PAGE_SIZE) {
        // reached the end of second route
        if (previousPageData.secondRoutePage) return null;
        // reached the end of first route
        return ['duplicateModal', 'agendas', searchValue, pageIndex + 1, 1];
      }

      // first page, we don't have `previousPageData`
      if (pageIndex === 0)
        return ['duplicateModal', 'agendas', searchValue, 1, 0];

      if (previousPageData.secondRoutePage) {
        return [
          'duplicateModal',
          'agendas',
          searchValue,
          pageIndex + 1,
          previousPageData.secondRoutePage + 1,
        ];
      }

      return ['duplicateModal', 'agendas', searchValue, pageIndex + 1, 0];
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

  // reset page size on unmount
  useEffect(
    () => () => {
      setSize(1);
    },
    [setSize],
  );

  const isLoadingInitialData = !pages && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && pages && pages[size - 1] === undefined);
  const isEmpty = pages?.[0]?.agendas?.length === 0;
  const isReachingEnd =
    isEmpty ||
    (pages &&
      pages[pages.length - 1]?.secondRoutePage &&
      pages[pages.length - 1]?.agendas?.length < PAGE_SIZE);

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && !isReachingEnd && !isLoadingMore) {
        setSize(size + 1).catch(() => null);
      }
    },
  });

  if (isLoadingInitialData) {
    return <ModalLoadingBody />;
  }

  const uniqueAgendaUids = new Set([agenda.uid]);

  return (
    <DialogBody>
      <H3>{intl.formatMessage(messages.bigSentence)}</H3>

      <Text mt="4" color="oaGray.500">
        {intl.formatMessage(messages.reminder)}
      </Text>

      <Text mt="4" mb="2">
        {intl.formatMessage(messages.createNewEventIn)}
      </Text>

      <AgendaItem agenda={agenda} targetAgenda={agenda} event={event} />

      <CustomSeparator my="8">
        {intl.formatMessage(messages.or)}
      </CustomSeparator>

      <form onSubmit={onSubmit}>
        <SearchInput onChange={setSearchValue} />
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
            )),
        )}
      </VStack>

      <div ref={ref} />
    </DialogBody>
  );
}

export default function DuplicateModal({ isOpen, onClose, agenda, event }) {
  const intl = useIntl();

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose} placement="center">
      <DialogContent>
        <DialogHeader fontSize="xl" fontWeight="semibold">
          {intl.formatMessage(messages.selectAnAgenda)}
        </DialogHeader>
        <DialogCloseTrigger />
        <DuplicateModalBody agenda={agenda} event={event} />
      </DialogContent>
    </DialogRoot>
  );
}
