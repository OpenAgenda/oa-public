import { useMemo } from 'react';
import NextLink from 'next/link';
import { useIntl } from 'react-intl';
import qs from 'qs';
import {
  Box,
  Flex,
  LinkBox,
  LinkOverlay,
  Tag,
  HStack,
  Icon,
} from '@openagenda/uikit';
import { getLocaleValue, DEFAULT_LANG } from '@openagenda/intl';
import attendanceModesMessages from '@openagenda/common-labels/event/attendanceModes';
import Image from 'components/Image';
import { useEmbedLayoutData } from 'components/EmbedLayout';
import useLocationQuery from 'hooks/useLocationQuery';
import { thumborLoader } from 'utils/imageLoader';
import { sidebar as messages } from 'views/EventShow/messages';
import getContentLocale from 'views/EventShow/utils/getContentLocale';
import { FaIcon } from 'icons';
import { faThumbtack } from 'icons/solid';

const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;
const DEV_S3_BUCKET = process.env.NEXT_PUBLIC_DEV_S3_BUCKET;

function isValidUrl(url: string) {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function useEventLink({
  baseUrl,
  baseUrlTarget,
  agenda,
  event,
  nc,
  referrer,
  locale,
  contentLocale,
}) {
  return useMemo(() => {
    if (baseUrl === 'oa') {
      const target = baseUrlTarget || '_blank';
      return {
        target,
        rel: target === '_blank' ? 'nofollow noopener' : '',
        url: `${process.env.NEXT_PUBLIC_ROOT}/${locale}/${agenda.slug}/events/${event.slug}${qs.stringify({ nc, cl: contentLocale }, { addQueryPrefix: true })}`,
      };
    }

    if (isValidUrl(baseUrl)) {
      const target = baseUrlTarget || '_blank';
      const trailingSlash = baseUrl.endsWith('/');
      return {
        target,
        rel: target === '_blank' ? 'nofollow noopener' : '',
        url: `${baseUrl}${trailingSlash ? '' : '/'}${event.slug}`,
      };
    }

    return {
      target: '_self',
      url: `/embed/agendas/${agenda.uid}/events/${event.slug}${qs.stringify({ nc, host: referrer || undefined }, { addQueryPrefix: true })}`,
    };
  }, [baseUrl, agenda.uid, agenda.slug, event.slug, nc]);
}

export default function EventItem({
  event,
  agenda,
  hideLocation = false,
  referrer,
  // nav
  from = 0,
  first = true,
  last = true,
}) {
  const intl = useIntl();

  const query = useLocationQuery();

  const { baseUrl, baseUrlTarget, primaryColor, imageList, sort, prefilter } =
    useEmbedLayoutData();

  const languages = Object.keys(event.title);
  const contentLocale = getContentLocale(languages, prefilter.cl, intl.locale);

  const nc = useMemo(
    () => ({
      ...query,
      sort: query.search?.length
        ? 'score'
        : sort || 'lastTimingWithFeatured.asc',
      passed: undefined,
      from,
      first: first || undefined,
      last: last || undefined,
    }),
    [first, from, last, query],
  );

  const eventLink = useEventLink({
    baseUrl,
    baseUrlTarget,
    agenda,
    event,
    nc,
    referrer,
    locale: intl.locale,
    contentLocale: prefilter.cl,
  });

  const imageHeight = imageList ? imageList.height : '170px';

  return (
    <LinkBox
      as="article"
      display="flex"
      flexDirection="column"
      border="1px solid #00000026"
      _hover={{
        border: '1px solid #00000052',
      }}
    >
      {event.featured ? (
        <Box
          pos="absolute"
          top="0px"
          left="0px"
          w="52px"
          h="52px"
          bgGradient="to-br"
          gradientFrom="white 36px"
          gradientTo="transparent 0"
          zIndex="docked"
          // filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"
        >
          <Box
            pos="absolute"
            top="0px"
            left="0px"
            w="52px"
            h="52px"
            bgGradient="to-br"
            gradientFrom="{colors.primary.500} 32px"
            gradientTo="transparent 0"
            zIndex="docked"
            // filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"
          >
            <Icon mt="6px" ml="6px" color="primaryContrast" fontSize="lg">
              <FaIcon icon={faThumbtack} />
            </Icon>
          </Box>
        </Box>
      ) : null}
      {event.image ? (
        <Box pos="relative" h={imageHeight} maxH={imageList?.maxHeight}>
          <Box
            asChild
            pos="unset !important"
            objectFit={imageList?.objectFit || 'cover'}
            maxH={imageList?.maxHeight}
            aspectRatio={imageList?.aspectRatio}
          >
            <Image
              alt=""
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
              loader={thumborLoader}
              fill
              sizes="(max-width: 629px) 100vw,
                 (max-width: 954px) 50vw,
                 (max-width: 1279px) 33.33vw,
                 (max-width: 1590px) 25vw,
                 20vw"
            />
          </Box>
        </Box>
      ) : (
        <Box h={imageHeight} />
      )}
      <Flex direction="column" p="6" gap="2" grow="1" minH="170px">
        <HStack color={primaryColor ? 'primary.500' : null} fontWeight="bold">
          <span>
            {getLocaleValue(event.dateRange, contentLocale, [
              intl.locale,
              DEFAULT_LANG,
            ])}
          </span>
          {!event.nextTiming ? (
            <Tag.Root
              borderRadius="full"
              variant="outline"
              colorPalette="oaGray"
              flexShrink="0"
            >
              <Tag.Label>
                <b>{intl.formatMessage(messages.passed)}</b>
              </Tag.Label>
            </Tag.Root>
          ) : null}
        </HStack>
        <LinkOverlay asChild>
          <NextLink
            target={eventLink.target}
            rel={eventLink.rel}
            href={eventLink.url}
          >
            <b>{event.title[contentLocale]}</b>
          </NextLink>
        </LinkOverlay>
        <Box color="#545454">{event.description[contentLocale]}</Box>
        {(!hideLocation && event.location) || event.onlineAccessLink ? (
          <Box fontSize="sm" color="#545454" mt="auto">
            {!hideLocation && event.location ? (
              <div>
                {event.location.name}
                {event.location.city ? `, ${event.location.city}` : ''}
              </div>
            ) : null}
            {event.onlineAccessLink ? (
              <div>{intl.formatMessage(attendanceModesMessages.online)}</div>
            ) : null}
          </Box>
        ) : null}
      </Flex>
    </LinkBox>
  );
}
