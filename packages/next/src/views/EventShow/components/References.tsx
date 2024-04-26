import { chakra, SimpleGrid } from '@openagenda/uikit';
import useSWRImmutable from 'swr/immutable';
import { FetchStatus } from 'config/types';
import { keyCDNLoader } from 'utils/imageLoader';
import Image from 'components/Image';
import NextChakraLink from 'components/NextChakraLink';
import graylogo140 from '../../../../public/images/graylogo140.png';

const isDev = process.env.NODE_ENV === 'development';
const IMAGE_PREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX;
const DEV_IMAGE_PREFIX = process.env.NEXT_PUBLIC_DEV_IMAGE_PREFIX;

function getImageSrcProps(image?: string, updatedAt?: string) {
  if (!image) {
    return {
      src: graylogo140,
    };
  }

  const updatedTs = new Date(updatedAt).getTime();

  if (isDev) {
    return {
      src: `${DEV_IMAGE_PREFIX}${image}?__ts=${updatedTs}`,
      fallbackSrc: `${IMAGE_PREFIX}${image}?__ts=${updatedTs}`,
    };
  }

  return {
    src: `${IMAGE_PREFIX}${image}?__ts=${updatedTs}`,
  };
}

export default function References({ agenda, event }) {
  const {
    data: {
      references,
    } = {},
    status,
  } = useSWRImmutable(`/api/agendas/${agenda.uid}/events/${event.uid}/references`);

  if (status === FetchStatus.Fetching) return null;

  if (!references?.length) return null;

  return (
    <SimpleGrid columns={3} spacing="2">
      {references.map(agendaReference => (
        <NextChakraLink
          key={agendaReference.uid}
          href={`/${agendaReference.slug}/events/${event.slug}`}
          title={agendaReference.title}
          textAlign="center"
          _hover={{ color: 'primary.500', textDecoration: 'underline' }}
        >
          <Image
            rounded="full"
            width="70"
            height="70"
            {...getImageSrcProps(agendaReference.image, agendaReference.updatedAt)}
            alt=""
            draggable={false}
            loader={agendaReference.image ? keyCDNLoader : null}
            border="3px solid white"
            h="70px"
            objectFit="cover"
            m="auto"
          />

          <chakra.span noOfLines={2}>
            {agendaReference.title}
          </chakra.span>
        </NextChakraLink>
      ))}
    </SimpleGrid>
  );
}
