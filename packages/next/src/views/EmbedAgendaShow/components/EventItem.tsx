import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import qs from 'qs';
import { Box, Flex, LinkBox } from '@openagenda/uikit';
import { getLocaleValue } from '@openagenda/intl';
import Image from 'components/Image';
import NextChakraLinkOverlay from 'components/NextChakraLinkOverlay';
import { useEmbedLayoutData } from 'components/EmbedLayout';
import useLocationQuery from 'hooks/useLocationQuery';

const IMAGE_PREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX;
const DEV_IMAGE_PREFIX = process.env.NEXT_PUBLIC_DEV_IMAGE_PREFIX;

function isValidUrl(url: string) {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function useEventLink({ baseUrl, agenda, event, nc }) {
  return useMemo(() => {
    if (baseUrl === 'oa') {
      return {
        isExternal: true,
        url: `${process.env.NEXT_PUBLIC_ROOT}/${agenda.slug}/events/${event.slug}${qs.stringify({ nc }, { addQueryPrefix: true })}`,
      };
    }

    if (isValidUrl(baseUrl)) {
      const trailingSlash = baseUrl.endsWith('/');
      return {
        isExternal: true,
        url: `${baseUrl}${trailingSlash ? '' : '/'}${event.slug}`,
      };
    }

    return {
      isExternal: false,
      url: `/embed/agendas/${agenda.uid}/events/${event.slug}${qs.stringify({ nc }, { addQueryPrefix: true })}`,
    };
  }, [baseUrl, agenda.uid, agenda.slug, event.slug, nc]);
}

export default function EventItem({
  event,
  agenda,
  // nav
  from = 0,
  first = true,
  last = true,
}) {
  const intl = useIntl();

  const query = useLocationQuery();

  const { baseUrl, primaryColor } = useEmbedLayoutData();

  const upcomingOnly = !query.timings && query.passed !== '1';

  const nc = useMemo(
    () => ({
      ...query,
      sort: query.search?.length ? 'score' : 'lastTimingWithFeatured.asc',
      passed: undefined,
      from,
      first: first || undefined,
      last: last || undefined,
    }),
    [first, from, last, query, upcomingOnly],
  );

  const eventLink = useEventLink({ baseUrl, agenda, event, nc });

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
        <Box pos="relative" h="170px">
          <Image
            alt=""
            src={
              process.env.NODE_ENV === 'development'
                ? `${DEV_IMAGE_PREFIX}${event.image.filename}`
                : `${IMAGE_PREFIX}${event.image.filename}`
            }
            fallbackSrc={
              process.env.NODE_ENV === 'development'
                ? `${IMAGE_PREFIX}${event.image.filename}`
                : undefined
            }
            fill
            objectFit="cover"
            sizes="(max-width: 629px) 100vw,
                 (max-width: 954px) 50vw,
                 (max-width: 1279px) 33.33vw,
                 (max-width: 1590px) 25vw,
                 12.5vw"
          />
        </Box>
      ) : (
        <Box h="170px" />
      )}
      <Flex direction="column" p="6" gap="2" grow="1" minH="170px">
        <Box color={primaryColor ? 'primary.500' : null} fontWeight="bold">
          {getLocaleValue(event.dateRange, intl.locale)}
        </Box>
        <NextChakraLinkOverlay
          isExternal={eventLink.isExternal}
          href={eventLink.url}
        >
          <b>{getLocaleValue(event.title, intl.locale)}</b>
        </NextChakraLinkOverlay>
        <Box color="#545454">
          {getLocaleValue(event.description, intl.locale)}
        </Box>
        {event.location ? (
          <Box fontSize="sm" color="#545454" mt="auto">
            {event.location.name}
            {event.location.city ? `, ${event.location.city}` : ''}
          </Box>
        ) : null}
      </Flex>
    </LinkBox>
  );
}
