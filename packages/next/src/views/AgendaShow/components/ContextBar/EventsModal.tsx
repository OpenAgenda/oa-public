import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Center,
  Spinner,
  VStack,
  HStack,
  Text,
  Wrap,
  Link,
} from '@openagenda/uikit';
import useSWRInfinite from 'swr/infinite';
import { useInView } from 'react-intersection-observer';
import { useIntl } from 'react-intl';
import { getLocaleValue } from '@openagenda/intl';
import qs from 'qs';
import Image from 'components/Image';
import swrLaggyMiddleware from 'utils/swrLaggyMiddleware';
import messages from './messages';

const PAGE_SIZE = 20;

function LoadingBody() {
  return (
    <ModalBody pb="4">
      <Center h="100px">
        <Spinner size="xl" />
      </Center>
    </ModalBody>
  );
}

function EventItem({ agenda, event }) {
  const isDev = process.env.NODE_ENV === 'development';

  const intl = useIntl();

  const imageSrc = event.image && `${event.image.base}${event.image.filename}`;

  return (
    <HStack>
      {imageSrc ? (
        <Image
          rounded="full"
          width="56"
          height="56"
          src={imageSrc}
          fallbackSrc={isDev ? imageSrc.replace('cibuldev', 'cibul') : null}
          fallbackStrategy="onError"
          alt=""
          draggable={false}
          unoptimized
          // border="3px solid white"
          h="56px"
          fit="cover"
        />
      ) : null}

      <div>
        {event.draft ? (
          <>
            <Text fontWeight="bold">
              {getLocaleValue(event.title, intl.locale) || intl.formatMessage(messages.undefinedTitle)}
            </Text>
            <div>
              {getLocaleValue(event.description, intl.locale) || intl.formatMessage(messages.undefinedDescription)}
            </div>
            <Link href={`/${agenda.slug}/contribute/event/${event.uid}`} color="primary.500">
              {intl.formatMessage(messages.complete)}
            </Link>
          </>
        ) : (
          <>
            <Text fontWeight="bold">
              {getLocaleValue(event.title, intl.locale)}
            </Text>
            <div>
              {getLocaleValue(event.dateRange, intl.locale)}
            </div>
            <Wrap spacing="3">
              <Link href={`/${agenda.slug}/events/${event.slug}`} color="primary.500">
                {intl.formatMessage(messages.show)}
              </Link>
              <Link href={`/${agenda.slug}/contribute/event/${event.uid}`} color="primary.500">
                {intl.formatMessage(messages.edit)}
              </Link>
            </Wrap>
          </>
        )}
      </div>
    </HStack>
  );
}

function EventsModalBody({ agenda, bundleState }) {
  const intl = useIntl();

  const {
    data: pages,
    error,
    size,
    setSize,
    // isValidating,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      // reached the end
      if (previousPageData && !previousPageData.events) return null;

      // first page, we don't have `previousPageData`
      if (pageIndex === 0) return ['contextBar', 'events', bundleState.key];

      // add the cursor to the API endpoint
      return ['contextBar', 'events', bundleState.key, pageIndex, previousPageData.after];
    },
    (_comp, _requestId, requestedState, page, after) => {
      if (requestedState === 'drafts') {
        const searchParamsStr = qs.stringify({
          offset: (page || 0) * PAGE_SIZE,
          limit: PAGE_SIZE,
        });
        return fetch(`/api/me/agendas/${agenda.uid}/events/drafts?${searchParamsStr}`)
          .then(r => {
            if (r.ok) return r.json();
            throw new Error('Can\'t list events');
          });
      }

      const searchParamsStr = qs.stringify({
        state: requestedState,
        after,
        limit: PAGE_SIZE,
      });
      return fetch(`/api/me/agendas/${agenda.uid}/events?${searchParamsStr}`)
        .then(r => {
          if (r.ok) return r.json();
          throw new Error('Can\'t list events');
        });
    },
    {
      revalidateFirstPage: false,
      // revalidateOnMount: false,
      // revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      use: [swrLaggyMiddleware],
    },
  );

  const isLoadingInitialData = !pages && !error;
  const isLoadingMore = isLoadingInitialData || (size > 0 && pages && pages[size - 1] === undefined);
  const isEmpty = pages?.[0]?.events?.length === 0;
  const isReachingEnd = isEmpty || (pages && pages[pages.length - 1]?.events?.length < PAGE_SIZE);

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

  return (
    <ModalBody pb="4">
      <Box
        px="3"
        py="2"
        mb="6"
        bg="oaGray.10"
        border="1px solid"
        borderColor={bundleState.slug === 'drafts' ? 'orange.300' : 'oaGray.100'}
        borderRadius="base"
      >
        {intl.formatMessage(messages[`${bundleState.slug}ModalInfo`])}
      </Box>

      <VStack spacing="4" align="start">
        {pages.map(
          page => page.events.map(event => (
            <EventItem key={event.uid} agenda={agenda} event={event} />
          )),
        )}
      </VStack>

      <div ref={ref} />
    </ModalBody>
  );
}

export default function EventsModal({ isOpen, onClose, agenda, bundleState }) {
  const intl = useIntl();

  return (
    <Modal
      size="xl"
      isCentered
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent w="xl">
        <ModalHeader
          sx={{
            ':has(> .chakra-modal__close-btn)': {
              pr: 12, // https://github.com/chakra-ui/chakra-ui/issues/7256
            },
          }}
        >
          {intl.formatMessage(messages[`${bundleState.slug}ModalTitle`])}
          <ModalCloseButton />
        </ModalHeader>

        <EventsModalBody agenda={agenda} bundleState={bundleState} />
      </ModalContent>
    </Modal>
  );
}
