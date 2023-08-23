import { Heading, NoBreak, Stack, VStack } from '@openagenda/uikit';
import Image from 'components/Image';
import OfficialAgenda from 'components/OfficialAgenda';
import LockIcon from 'components/LockIcon';
import NextChakraLink from 'components/NextChakraLink';
import keyCDNLoader from 'utils/keyCDNLoader';

const isDev = process.env.NODE_ENV === 'development';
const keyCdnUrl = new URL(process.env.NEXT_PUBLIC_IMAGE_PREFIX);

function getImageSrc(src) {
  const url = new URL(src);
  url.host = keyCdnUrl.host;
  return url.href;
}

export default function AgendaHeader({ agenda }) {
  return (
    <Stack spacing="8" direction={{ base: 'column', md: 'row' }} align="center">
      {agenda.image ? (
        <Image
          rounded="full"
          width="56"
          height="56"
          src={getImageSrc(agenda.image)}
          fallbackSrc={isDev
            ? agenda.image.replace('cibuldev', 'cibul').replace('images-', 'imagesdev-')
            : undefined}
          fallbackStrategy="onError"
          loader={keyCDNLoader}
          priority
          draggable={false}
          alt=""
          border="3px solid white"
          h="56px"
          fit="cover"
        />
      ) : null}

      <VStack spacing="3" align={{ base: 'center', md: 'start' }}>
        <Heading as="h1" fontSize="2xl" textAlign={{ base: 'center', md: 'start' }}>
          {agenda.title}
          {agenda.official ? (
            <NoBreak>
              <OfficialAgenda ml="4" />
            </NoBreak>
          ) : null}
          {agenda.private ? (
            <NoBreak>
              <LockIcon type="agenda" ml="4" />
            </NoBreak>
          ) : null}
        </Heading>

        <NextChakraLink href={`/${encodeURIComponent(agenda.slug)}`}>
          Voir tous les événements
        </NextChakraLink>
      </VStack>
    </Stack>
  );
}
