import { chakra, Box, SimpleGrid } from '@openagenda/uikit';
import useSWRImmutable from 'swr/immutable';
import { FetchStatus } from 'config/types';
import keyCDNLoader from 'utils/keyCDNLoader';
import Image from 'components/Image';
import graylogo140 from '../../../../public/images/graylogo140.png';

const isDev = process.env.NODE_ENV === 'development';
const IMAGE_PREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX;
const DEV_IMAGE_PREFIX = process.env.NEXT_PUBLIC_DEV_IMAGE_PREFIX;

function fetcher(url) {
  return fetch(url)
    .then(
      r => {
        if (r.ok) return r.json();
        // TODO should recreate an error with data in `await r.json()` and/or status
        throw new Error('Error');
      },
    );
}

function getImageSrcProps(image?: string) {
  if (!image) {
    return {
      src: graylogo140,
    };
  }

  if (isDev) {
    return {
      src: `${DEV_IMAGE_PREFIX}${image}`,
      fallbackSrc: `${IMAGE_PREFIX}${image}`,
    };
  }

  return {
    src: `${IMAGE_PREFIX}${image}`,
  };
}

export default function References({ agenda, event }) {
  const {
    data: {
      references,
    } = {},
    status,
  } = useSWRImmutable(
    `/api/agendas/${agenda.uid}/events/${event.uid}/references`,
    fetcher,
  );

  if (status === FetchStatus.Fetching) return null;

  if (!references?.length) return null;

  console.log({ references, status });

  return (
    <SimpleGrid columns={3} spacing="2">
      {references.map(agendaReference => (
        <Box key={agendaReference.uid} title={agendaReference.title} textAlign="center">
          <Image
            rounded="full"
            width="70"
            height="70"
            {...getImageSrcProps(agendaReference.image)}
            fallbackStrategy="onError"
            alt=""
            draggable={false}
            loader={agendaReference.image ? keyCDNLoader : null}
            border="3px solid white"
            h="70px"
            fit="cover"
            m="auto"
          />

          <chakra.span noOfLines={2}>
            {agendaReference.title}
          </chakra.span>
        </Box>
      ))}
    </SimpleGrid>
  );
}
