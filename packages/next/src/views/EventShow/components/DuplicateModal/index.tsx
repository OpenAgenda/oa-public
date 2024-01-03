import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  VStack,
  H3,
  Flex,
  Divider,
  Text,
} from '@openagenda/uikit';
import React, { useCallback, useEffect, useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import qs from 'qs';
import { useInView } from 'react-intersection-observer';
import ModalLoadingBody from 'components/ModalLoadingBody';
import SearchInput from 'components/SearchInput';
import AgendaItem from './AgendaItem';

const PAGE_SIZE = 20;

function CustomDivider({ children, ...flexProps }) {
  return (
    <Flex {...flexProps}>
      <Divider margin="auto" borderColor="oaGray.500" />
      <Text as="span" flexShrink="0" px={2}>
        {children}
      </Text>
      <Divider margin="auto" borderColor="oaGray.500" />
    </Flex>
  );
}

function DuplicateModalBody({ agenda, event }) {
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
      if (previousPageData && previousPageData.agendas?.length < PAGE_SIZE) {
        // reached the end of second route
        if (previousPageData.secondRoutePage) return null;
        // reached the end of first route
        return ['duplicateModal', 'agendas', searchValue, pageIndex + 1, 1];
      }

      // first page, we don't have `previousPageData`
      if (pageIndex === 0) return ['duplicateModal', 'agendas', searchValue, 1, 0];

      if (previousPageData.secondRoutePage) {
        return ['duplicateModal', 'agendas', searchValue, pageIndex + 1, previousPageData.secondRoutePage + 1];
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
        .then(r => {
          if (r.ok) return r.json();
          throw new Error('Can\'t list agendas');
        })
        .then(result => ({
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
  useEffect(() => () => {
    setSize(1);
  }, [setSize]);

  const isLoadingInitialData = !pages && !error;
  const isLoadingMore = isLoadingInitialData || (size > 0 && pages && pages[size - 1] === undefined);
  const isEmpty = pages?.[0]?.agendas?.length === 0;
  const isReachingEnd = isEmpty
    || (pages && pages[pages.length - 1]?.secondRoutePage && pages[pages.length - 1]?.agendas?.length < PAGE_SIZE);

  const { ref } = useInView({
    onChange: inView => {
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
    <ModalBody>
      <H3>
        Vous êtes sur le point de créer un nouvel événement sur la base d’un précédent.
      </H3>

      <Text mt="4" color="oaGray.500">
        Rappel: un événement unique peut être partagé sur plusieurs agendas. Ne créez pas de doublon ! La duplication permet de créer une annonce différente, généralement pour une nouvelle édition ailleurs dans le temps ou l’espace, en évitant des copier-coller.
      </Text>

      <Text mt="4" mb="2">
        Créer le nouvel événement dans
      </Text>

      <AgendaItem agenda={agenda} targetAgenda={agenda} event={event} />

      <CustomDivider my="8">
        Ou
      </CustomDivider>

      <form onSubmit={onSubmit}>
        <SearchInput onChange={setSearchValue} />
      </form>

      <VStack spacing="4" pt="4" align="start">
        {pages.map(
          page => page.agendas.filter(targetAgenda => {
            if (uniqueAgendaUids.has(targetAgenda.uid)) {
              return false;
            }
            uniqueAgendaUids.add(targetAgenda.uid);
            return true;
          }).map(targetAgenda => (
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
    </ModalBody>
  );
}

export default function DuplicateModal({
  isOpen,
  onClose,
  agenda,
  event,
}) {
  return (
    <Modal
      size="xl"
      isCentered
      // scrollBehavior="inside"
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          sx={{
            ':has(> .chakra-modal__close-btn)': {
              pr: 12, // https://github.com/chakra-ui/chakra-ui/issues/7256
            },
          }}
        >
          Sélectionner un agenda
          <ModalCloseButton />
        </ModalHeader>
        <DuplicateModalBody agenda={agenda} event={event} />
      </ModalContent>
    </Modal>
  );
}
