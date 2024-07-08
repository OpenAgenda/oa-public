import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { Box, Flex, LinkBox } from '@openagenda/uikit';
import { getLocaleValue } from '@openagenda/intl';
import Image from 'components/Image';
import NextChakraLinkOverlay from 'components/NextChakraLinkOverlay';

const IMAGE_PREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX;
const DEV_IMAGE_PREFIX = process.env.NEXT_PUBLIC_DEV_IMAGE_PREFIX;

function isValidUrl(url: string) {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

function eventUrlMaker({ baseUrl }) {
  return ({ agenda, event }) => {
    if (isValidUrl(baseUrl)) {
      const trailingSlash = baseUrl.endsWith('/');
      return `${baseUrl}${trailingSlash ? '' : '/'}${event.slug}`;
    }

    return `${process.env.NEXT_PUBLIC_ROOT}/${agenda.slug}/events/${event.slug}`;
  };
}

export default function EventItem({ event, agenda }) {
  const intl = useIntl();
  const router = useRouter();

  const { baseUrl } = router.query;
  const getEventUrl = useMemo(() => eventUrlMaker({ baseUrl }), [baseUrl]);

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
            fallbackSrc={process.env.NODE_ENV === 'development' ? `${IMAGE_PREFIX}${event.image.filename}` : undefined}
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
        <div>{getLocaleValue(event.dateRange, intl.locale)}</div>
        <NextChakraLinkOverlay isExternal href={getEventUrl({ agenda, event })}>
          <b>{getLocaleValue(event.title, intl.locale)}</b>
        </NextChakraLinkOverlay>
        <Box color="#545454">{getLocaleValue(event.description, intl.locale)}</Box>
        <Box fontSize="sm" color="#545454" mt="auto">
          {event.location.name}
        </Box>
      </Flex>
    </LinkBox>
  );
}
