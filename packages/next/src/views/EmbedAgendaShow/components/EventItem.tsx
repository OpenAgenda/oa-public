import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import qs from 'qs';
import { Box, Flex, LinkBox, Tag, HStack } from '@openagenda/uikit';
import { getLocaleValue } from '@openagenda/intl';
import attendanceModesMessages from '@openagenda/common-labels/event/attendanceModes';
import Image from 'components/Image';
import NextChakraLinkOverlay from 'components/NextChakraLinkOverlay';
import { useEmbedLayoutData } from 'components/EmbedLayout';
import useLocationQuery from 'hooks/useLocationQuery';
import { thumborLoader } from 'utils/imageLoader';
import { sidebar as messages } from 'views/EventShow/messages';

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

function useEventLink({ baseUrl, baseUrlTarget, agenda, event, nc, referrer }) {
  return useMemo(() => {
    if (baseUrl === 'oa') {
      const target = baseUrlTarget || '_blank';
      return {
        target,
        rel: target === '_blank' ? 'nofollow noopener' : '',
        url: `${process.env.NEXT_PUBLIC_ROOT}/${agenda.slug}/events/${event.slug}${qs.stringify({ nc }, { addQueryPrefix: true })}`,
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
      url: `/embed/agendas/${agenda.uid}/events/${event.slug}${qs.stringify({ nc, host: referrer }, { addQueryPrefix: true })}`,
    };
  }, [baseUrl, agenda.uid, agenda.slug, event.slug, nc]);
}

export default function EventItem({
  event,
  agenda,
  referrer,
  // nav
  from = 0,
  first = true,
  last = true,
}) {
  const intl = useIntl();

  const query = useLocationQuery();

  const { baseUrl, baseUrlTarget, primaryColor, imageList, sort } =
    useEmbedLayoutData();

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
      {event.image ? (
        <Box pos="relative" h={imageHeight} maxH={imageList?.maxHeight}>
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
            // @ts-ignore https://github.com/chakra-ui/chakra-ui/issues/7211
            pos="unset !important"
            objectFit={imageList?.objectFit || 'cover'}
            maxH={imageList?.maxHeight}
            aspectRatio={imageList?.aspectRatio}
            sizes="(max-width: 629px) 100vw,
                 (max-width: 954px) 50vw,
                 (max-width: 1279px) 33.33vw,
                 (max-width: 1590px) 25vw,
                 12.5vw"
          />
        </Box>
      ) : (
        <Box h={imageHeight} />
      )}
      <Flex direction="column" p="6" gap="2" grow="1" minH="170px">
        <HStack color={primaryColor ? 'primary.500' : null} fontWeight="bold">
          <span>{getLocaleValue(event.dateRange, intl.locale)}</span>
          {!event.nextTiming ? (
            <Tag
              borderRadius="full"
              variant="outline"
              colorScheme="oaGray"
              flexShrink="0"
            >
              <b>{intl.formatMessage(messages.passed)}</b>
            </Tag>
          ) : null}
        </HStack>
        <NextChakraLinkOverlay
          target={eventLink.target}
          rel={eventLink.rel}
          href={eventLink.url}
        >
          <b>{getLocaleValue(event.title, intl.locale)}</b>
        </NextChakraLinkOverlay>
        <Box color="#545454">
          {getLocaleValue(event.description, intl.locale)}
        </Box>
        {event.location || event.onlineAccessLink ? (
          <Box fontSize="sm" color="#545454" mt="auto">
            {event.location ? (
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
