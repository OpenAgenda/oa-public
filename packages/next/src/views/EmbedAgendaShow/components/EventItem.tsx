import { useIntl } from 'react-intl';
import { Box, Flex, LinkBox } from '@openagenda/uikit';
import { getLocaleValue } from '@openagenda/intl';
import Image from 'components/Image';
import NextChakraLinkOverlay from 'components/NextChakraLinkOverlay';

const IMAGE_PREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX;
const DEV_IMAGE_PREFIX = process.env.NEXT_PUBLIC_DEV_IMAGE_PREFIX;

export default function EventItem({ event, agenda }) {
  const intl = useIntl();

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
            src={process.env.NODE_ENV === 'development'
              ? `${DEV_IMAGE_PREFIX}${event.image.filename}`
              : `${IMAGE_PREFIX}${event.image.filename}`}
            fallbackSrc={process.env.NODE_ENV === 'development'
              ? `${IMAGE_PREFIX}${event.image.filename}`
              : undefined}
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
        <Box color="#e73f57" fontWeight="semibold">
          {getLocaleValue(event.dateRange, intl.locale)}
        </Box>
        <NextChakraLinkOverlay
          target="_blank"
          href={`${process.env.NEXT_PUBLIC_ROOT}/${agenda.slug}/events/${event.slug}`}
        >
          <b>{getLocaleValue(event.title, intl.locale)}</b>
        </NextChakraLinkOverlay>
        <Box fontSize="sm" color="#545454" mt="auto">
          {event.location.name}
        </Box>
      </Flex>
    </LinkBox>
  );
}
