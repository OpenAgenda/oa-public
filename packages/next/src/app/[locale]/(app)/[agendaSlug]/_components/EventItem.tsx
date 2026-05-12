import NextLink from 'next/link';
import isEqual from 'lodash/isEqual';
import { useCallback, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { formatDistance } from 'date-fns';
import qs from 'qs';
import useLocalStorageState from 'use-local-storage-state';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  List,
  LinkBox,
  LinkOverlay,
  Text,
  HStack,
} from '@openagenda/uikit';
import { getLocaleValue } from '@openagenda/intl';
import { useForm } from '@openagenda/react-filters';
import { EventShareModal } from '@openagenda/react';
import attendanceModesMessages from '@openagenda/common-labels/event/attendanceModes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faStar,
  faLocationDot,
} from '@fortawesome/pro-regular-svg-icons';
import {
  faLink,
  faShare,
  faStar as fasStar,
} from '@fortawesome/pro-solid-svg-icons';
import useShareModal from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_hooks/useShareModal';
import EmailConfirmationAlert from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_components/EmailConfirmationAlert';
import useDateFnsLocale from '@/src/hooks/useDateFnsLocale';
import useIsMounted from '@/src/hooks/useIsMounted';
import useLocationQuery from '@/src/hooks/useLocationQuery';
import useLocalePath from '@/src/hooks/useLocalePath';
import useUser from '@/src/hooks/useUser';
import isUpcomingOnlyQuery from '@/src/utils/isUpcomingOnlyQuery';
import upperFirst from '@/src/utils/upperFirst';
import { thumborLoader } from '@/src/utils/imageLoader';
import Image from '@/src/components/Image';
import {
  EventStatusBadge,
  EventStatusTooltip,
} from '@/src/components/EventStatus';
import Featured from '@/src/components/Featured';
const graylogo140 = '/images/graylogo140.png';

const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;
const DEV_S3_BUCKET = process.env.NEXT_PUBLIC_DEV_S3_BUCKET;

const messages = defineMessages({
  featured: {
    id: 'next.views.AgendaShow.EventItem.featured',
    defaultMessage: 'Featured',
  },
  addToFavorites: {
    id: 'next.views.AgendaShow.EventItem.addToFavorites',
    defaultMessage: 'Add to favorites',
  },
  removeFromFavorites: {
    id: 'next.views.AgendaShow.EventItem.removeFromFavorites',
    defaultMessage: 'Remove from favorites',
  },
  share: {
    id: 'next.views.AgendaShow.EventItem.share',
    defaultMessage: 'Share',
  },
});

function FavoriteButton({ agenda, event }) {
  const intl = useIntl();
  const form = useForm();
  const [favorites, setFavorites] = useLocalStorageState('favorites');
  const agendaFavorites = favorites?.[agenda.uid];
  const isFavorite = agendaFavorites?.includes(event.uid);

  const toggleFavorite = useCallback(() => {
    setFavorites((prev) => {
      if (isFavorite) {
        // remove favorite
        const newValue = prev[agenda.uid].filter((v) => v !== event.uid);
        return {
          ...prev,
          [agenda.uid]: newValue.length ? newValue : undefined,
        };
      }
      return {
        // add favorite
        ...prev,
        [agenda.uid]: [...prev?.[agenda.uid] || [], event.uid],
      };
    });
  }, [agenda.uid, event.uid, isFavorite, setFavorites]);

  // Watch value change
  useEffect(() => {
    // const active = agendaFavorites?.includes(event.uid);

    // updateCustomFilter(widget, active);

    const formValues = form.getState().values;
    const value = agendaFavorites?.map(String);

    // if favorties filter checked
    if (formValues.favorites && !isEqual(formValues.uid, value)) {
      form.change('uid', agendaFavorites?.length ? value : ['-1']);
    }
  }, [form, event.uid, agendaFavorites]);

  return (
    <IconButton
      aria-label={intl.formatMessage(
        messages[isFavorite ? 'removeFromFavorites' : 'addToFavorites'],
      )}
      variant="link"
      colorPalette={isFavorite ? 'primary' : 'oaGray'}
      onClick={toggleFavorite}
      size="lg"
      fontSize="xl"
      minW="0"
      ml="6"
      alignSelf="flex-start"
    >
      <FontAwesomeIcon icon={isFavorite ? fasStar : faStar} />
    </IconButton>
  );
}

function RelativeTime({ closestTiming }) {
  const dateFnsLocale = useDateFnsLocale();
  const isMounted = useIsMounted();

  return (
    <Text color="oaGray.500">
      {isMounted
        ? upperFirst(
            formatDistance(new Date(closestTiming.begin), new Date(), {
              locale: dateFnsLocale,
              addSuffix: true,
            }),
          )
        : null}
    </Text>
  );
}

function EventImage({ src, fallbackSrc = null, loader = null }) {
  return (
    <Box asChild borderRadius="full" h="56px" minW="56px" objectFit="cover">
      <Image
        width="56"
        height="56"
        src={src}
        fallbackSrc={fallbackSrc}
        alt=""
        draggable={false}
        loader={loader}
      />
    </Box>
  );
}

function ShareEventItem({ event }) {
  const isDev = process.env.NODE_ENV === 'development';

  const intl = useIntl();

  return (
    <HStack
      px="3"
      py="2"
      mb="6"
      bg="oaGray.10"
      border="1px solid"
      borderColor="oaGray.100"
      borderRadius="base"
    >
      {event.image ? (
        <EventImage
          src={
            isDev
              ? `${process.env.NEXT_PUBLIC_DEV_S3_BUCKET}/${event.image.filename}`
              : `${process.env.NEXT_PUBLIC_S3_BUCKET}/${event.image.filename}`
          }
          fallbackSrc={
            isDev
              ? `${process.env.NEXT_PUBLIC_S3_BUCKET}/${event.image.filename}`
              : undefined
          }
          loader={thumborLoader}
        />
      ) : (
        <EventImage src={graylogo140} />
      )}
      <div>
        <Text fontWeight="bold">
          {getLocaleValue(event.title, intl.locale)}
        </Text>
        <div>{getLocaleValue(event.dateRange, intl.locale)}</div>
      </div>
    </HStack>
  );
}

export default function EventItem({
  event,
  agenda,
  imagePriority = false,
  // nav
  from = 0,
  first = true,
  last = true,
}) {
  const intl = useIntl();
  const localePath = useLocalePath();

  const query = useLocationQuery();

  const { user } = useUser();

  const closestTiming = event.nextTiming ? event.nextTiming : event.lastTiming;

  const upcomingOnly = isUpcomingOnlyQuery(query);

  const {
    shareIsOpen,
    shareOnOpen,
    shareOnClose,
    emailSent,
    emailSentIsOpen,
    emailSentOnClose,
    onEmailSent,
  } = useShareModal();

  return (
    <Flex
      as="article"
      direction={{ base: 'column', xl: 'row' }}
      gap={{ base: '2', xl: '8' }}
      mx={{ base: 'auto', xl: '0' }}
      px={{ base: '4', xl: '0' }}
      maxW={{ base: 'xl', xl: 'none' }}
      w="full"
    >
      <Box as="aside" w={{ base: 'full', xl: '25%' }} mt={{ xl: '4' }}>
        <Flex justify={{ base: 'flex-start', xl: 'flex-end' }}>
          <div>
            <Featured featured={event.featured} size="sm" />
            <RelativeTime closestTiming={closestTiming} />
          </div>
        </Flex>
      </Box>

      <EventStatusTooltip intl={intl} status={event.status}>
        <LinkBox
          as="section"
          display="flex"
          flexDirection="column"
          gap="4"
          position="relative"
          // py="4"
          pt="4"
          w={{ base: 'full', xl: '75%' }}
          bg="white"
          // border="1px solid"
          // borderColor="oaGray.100"
          borderRadius="sm"
          // _hover={{
          //   borderColor: 'primary.500',
          // }}
        >
          <Flex
            direction="row"
            align="center"
            px="6"
            justify="space-between"
            alignItems="flex-start"
          >
            <Heading as="h2" fontSize="lg">
              {event.status !== 1 ? (
                <EventStatusBadge intl={intl} status={event.status} />
              ) : null}
              <LinkOverlay
                asChild
                _hover={{
                  _before: {
                    border: '1px solid',
                    borderColor: 'primary.500',
                  },
                }}
              >
                <NextLink
                  href={`${localePath(`/${agenda.slug}/events/${event.uid}_${event.slug}`)}${qs.stringify(
                    {
                      nc: {
                        ...query,
                        state: [2],
                        sort: query.search?.length
                          ? 'score'
                          : 'lastTimingWithFeatured.asc',
                        passed: undefined,
                        ...upcomingOnly && !query.relative
                          ? {
                              relative: ['current', 'upcoming'],
                            }
                          : null,
                        from,
                        first: first || undefined,
                        last: last || undefined,
                      },
                    },
                    { addQueryPrefix: true },
                  )}`}
                >
                  {getLocaleValue(event.title, intl.locale)}
                </NextLink>
              </LinkOverlay>
            </Heading>

            <FavoriteButton agenda={agenda} event={event} />
          </Flex>

          {/* eslint-disable-next-line no-nested-ternary */}
          {event.image ? 
            event.image?.size?.width && event.image?.size?.height ? (
              <Box asChild m="auto" w="full">
                <Image
                  src={
                    process.env.NODE_ENV === 'development'
                      ? `${DEV_S3_BUCKET}/${event.image.filename}`
                      : `${S3_BUCKET}/${event.image.filename}`
                  }
                  fallbackSrc={
                    process.env.NODE_ENV === 'development'
                      ? `${S3_BUCKET}/${event.image.filename}`
                      : undefined
                  }
                  width={event.image.size.width}
                  height={event.image.size.height}
                  // >= 1280 : 577px
                  // >= 992 : 476px
                  // < 520 : 100vw
                  sizes="(max-width: 520px) 100vw, (max-width: 1280px) 476px, 577px"
                  loader={thumborLoader}
                  alt=""
                  priority={imagePriority}
                />
              </Box>
            ) : (
              <Box
                asChild
                pos="unset !important"
                w="full !important"
                h="auto !important"
                m="auto"
              >
                <Image
                  src={
                    process.env.NODE_ENV === 'development'
                      ? `${DEV_S3_BUCKET}/${event.image.filename}`
                      : `${S3_BUCKET}/${event.image.filename}`
                  }
                  fallbackSrc={
                    process.env.NODE_ENV === 'development'
                      ? `${S3_BUCKET}/${event.image.filename}`
                      : undefined
                  }
                  fill
                  // >= 1280 : 577px
                  // >= 992 : 476px
                  // < 520 : 100vw
                  sizes="(max-width: 520px) 100vw, (max-width: 1280px) 476px, 577px"
                  loader={thumborLoader}
                  alt=""
                  priority={imagePriority}
                />
              </Box>
            )
           : null}

          {/* TODO: add a title with a precise date */}
          <Text px="6">{getLocaleValue(event.description, intl.locale)}</Text>

          <Flex justify="space-between">
            <List.Root
              variant="plain"
              gap="2"
              align="center"
              color="oaGray.500"
              pb="4"
              ml="6"
            >
              <List.Item>
                <List.Indicator asChild w="4" h="4">
                  <FontAwesomeIcon size="sm" icon={faClock} />
                </List.Indicator>
                {getLocaleValue(event.dateRange, intl.locale)}
              </List.Item>
              {event.onlineAccessLink ? (
                <List.Item>
                  <List.Indicator asChild w="4" h="4">
                    <FontAwesomeIcon size="sm" icon={faLink} />
                  </List.Indicator>
                  {intl.formatMessage(attendanceModesMessages.online)}
                </List.Item>
              ) : null}
              {event.location ? (
                <List.Item>
                  <List.Indicator asChild w="4" h="4">
                    <FontAwesomeIcon size="sm" icon={faLocationDot} />
                  </List.Indicator>
                  {event.location.name}
                  {event.location.city ? `, ${event.location.city}` : ''}
                </List.Item>
              ) : null}
            </List.Root>

            <Box
              float="right"
              display="flex"
              alignItems="flex-end"
              alignSelf="flex-end"
            >
              <Button
                borderRadius="xs"
                display={{ base: 'none', sm: 'inline-flex' }}
                onClick={shareOnOpen}
                disabled={!!event.private}
              >
                {intl.formatMessage(messages.share)}
              </Button>

              <Button
                borderRadius="sm"
                display={{ base: 'inline-flex', sm: 'none' }}
                onClick={shareOnOpen}
                disabled={!!event.private}
              >
                <FontAwesomeIcon icon={faShare} />
              </Button>
            </Box>
          </Flex>
        </LinkBox>
      </EventStatusTooltip>

      <EventShareModal
        isOpen={shareIsOpen}
        onClose={shareOnClose}
        user={user}
        agenda={agenda}
        event={event}
        contentLocale={intl.locale}
        onEmailSent={onEmailSent}
        rootUrl={process.env.NEXT_PUBLIC_ROOT}
      >
        <ShareEventItem event={event} />
      </EventShareModal>

      <EmailConfirmationAlert
        isOpen={emailSentIsOpen}
        onClose={emailSentOnClose}
        count={emailSent}
      />
    </Flex>
  );
}
