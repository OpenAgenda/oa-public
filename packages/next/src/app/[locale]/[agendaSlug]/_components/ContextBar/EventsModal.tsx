import { Box, VStack, HStack, Text, Wrap, Link } from '@openagenda/uikit';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
} from '@openagenda/uikit/snippets';
import useSWRInfinite from 'swr/infinite';
import { useInView } from 'react-intersection-observer';
import { useIntl } from 'react-intl';
import { getLocaleValue } from '@openagenda/intl';
import qs from 'qs';
import Image from '@/src/components/Image';
import ModalLoadingBody from '@/src/components/ModalLoadingBody';
// import swrLaggyMiddleware from 'utils/swrLaggyMiddleware';
import { thumborLoader } from '@/src/utils/imageLoader';
import useLocalePath from '@/src/utils/useLocalePath';
const graylogo140 = '/images/graylogo140.png';
import messages from './messages';

const PAGE_SIZE = 20;

const isDev = process.env.NODE_ENV === 'development';

function EventImage({ src, loader = null }) {
  return (
    <Box
      asChild
      rounded="full"
      // border="3px solid white"
      h="56px"
      minW="56px"
      objectFit="cover"
    >
      <Image
        width="56"
        height="56"
        src={src}
        fallbackSrc={
          isDev && typeof src === 'string'
            ? src
                .replace('dev', 'main')
                .replace(
                  process.env.NEXT_PUBLIC_IMAGE_PREFIX,
                  process.env.NEXT_PUBLIC_DEV_IMAGE_PREFIX,
                )
            : undefined
        }
        alt=""
        draggable={false}
        loader={loader}
      />
    </Box>
  );
}

function getImageSrc(image) {
  if (!image) return null;

  return isDev
    ? `${process.env.NEXT_PUBLIC_DEV_S3_BUCKET}/${image}`
    : `${process.env.NEXT_PUBLIC_S3_BUCKET}/${image}`;
}

function EventItem({ agenda, event }) {
  const intl = useIntl();
  const localePath = useLocalePath();

  const imageSrc = event.image && getImageSrc(event.image.filename);

  return (
    <HStack>
      {imageSrc ? (
        <EventImage src={imageSrc} loader={thumborLoader} />
      ) : (
        <EventImage src={graylogo140} />
      )}

      <div>
        {event.draft ? (
          <>
            <Text fontWeight="bold">
              {getLocaleValue(event.title, intl.locale) ||
                intl.formatMessage(messages.undefinedTitle)}
            </Text>
            <div>
              {getLocaleValue(event.description, intl.locale) ||
                intl.formatMessage(messages.undefinedDescription)}
            </div>
            <Link href={`/${agenda.slug}/contribute/event/${event.uid}`}>
              {intl.formatMessage(messages.complete)}
            </Link>
          </>
        ) : (
          <>
            <Text fontWeight="bold">
              {getLocaleValue(event.title, intl.locale)}
            </Text>
            <div>{getLocaleValue(event.dateRange, intl.locale)}</div>
            <Wrap gap="3">
              <Link href={localePath(`/${agenda.slug}/events/${event.slug}`)}>
                {intl.formatMessage(messages.show)}
              </Link>
              <Link href={`/${agenda.slug}/contribute/event/${event.uid}`}>
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
      return [
        'contextBar',
        'events',
        bundleState.key,
        pageIndex,
        previousPageData.after,
      ];
    },
    ([_comp, _requestId, requestedState, page, after]) => {
      if (requestedState === 'drafts') {
        const searchParamsStr = qs.stringify({
          offset: (page || 0) * PAGE_SIZE,
          limit: PAGE_SIZE,
          useDefaultImage: false,
        });
        return fetch(
          `/api/me/agendas/${agenda.uid}/events/drafts?${searchParamsStr}`,
        ).then((r) => {
          if (r.ok) return r.json();
          throw new Error("Can't list events");
        });
      }

      const searchParamsStr = qs.stringify({
        state: requestedState === 0 ? [0, 1] : requestedState, // works only for contribs
        after,
        limit: PAGE_SIZE,
      });
      return fetch(
        `/api/me/agendas/${agenda.uid}/events?${searchParamsStr}`,
      ).then((r) => {
        if (r.ok) return r.json();
        throw new Error("Can't list events");
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
  const isEmpty = pages?.[0]?.events?.length === 0;
  const isReachingEnd =
    isEmpty || (pages && pages[pages.length - 1]?.events?.length < PAGE_SIZE);

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

  return (
    <DialogBody>
      <Box
        px="3"
        py="2"
        mb="6"
        bg="oaGray.10"
        border="1px solid"
        borderColor={
          bundleState.slug === 'drafts' ? 'orange.300' : 'oaGray.100'
        }
        borderRadius="base"
      >
        {intl.formatMessage(messages[`${bundleState.slug}ModalInfo`])}
      </Box>

      <VStack gap="4" align="start">
        {pages.map((page) =>
          page.events.map((event) => (
            <EventItem key={event.uid} agenda={agenda} event={event} />
          )),
        )}
      </VStack>

      <div ref={ref} />
    </DialogBody>
  );
}

export default function EventsModal({ isOpen, onClose, agenda, bundleState }) {
  const intl = useIntl();

  return (
    <DialogRoot
      size="md"
      placement="center"
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogHeader fontSize="xl" fontWeight="semibold">
          {intl.formatMessage(messages[`${bundleState.slug}ModalTitle`])}
        </DialogHeader>
        <DialogCloseTrigger />

        <EventsModalBody agenda={agenda} bundleState={bundleState} />
      </DialogContent>
    </DialogRoot>
  );
}
