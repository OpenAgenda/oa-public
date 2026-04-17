'use client';

import NextLink from 'next/link';
import { chakra, Box, SimpleGrid, Link } from '@openagenda/uikit';
import useSWRImmutable from 'swr/immutable';
import { FetchStatus } from '@/src/config/types';
import { thumborLoader } from '@/src/utils/imageLoader';
import useLocalePath from '@/src/utils/useLocalePath';
import Image from '@/src/components/Image';
const graylogo140 = '/images/graylogo140.png';

const isDev = process.env.NODE_ENV === 'development';
const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;
const DEV_S3_BUCKET = process.env.NEXT_PUBLIC_DEV_S3_BUCKET;

function getImageSrcProps(image?: string) {
  if (!image) {
    return {
      src: graylogo140,
    };
  }

  if (isDev) {
    return {
      src: `${DEV_S3_BUCKET}/${image}`,
      fallbackSrc: `${S3_BUCKET}/${image}`,
    };
  }

  return {
    src: `${S3_BUCKET}/${image}`,
  };
}

export default function References({ agenda, event }) {
  const localePath = useLocalePath();
  const { data: { references } = {}, status } = useSWRImmutable(
    `/api/agendas/${agenda.uid}/events/${event.uid}/references`,
  );

  if (status === FetchStatus.Fetching) return null;

  if (!references?.length) return null;

  return (
    <SimpleGrid columns={3} gap="2">
      {references.map((agendaReference) => (
        <Link
          asChild
          key={agendaReference.uid}
          display="block"
          textAlign="center"
          color="fg"
          _hover={{ color: 'primary.500', textDecoration: 'underline' }}
        >
          <NextLink
            href={localePath(`/${agendaReference.slug}/events/${event.slug}`)}
            title={agendaReference.title}
          >
            <Box
              asChild
              rounded="full"
              border="3px solid white"
              h="70px"
              minW="70px"
              objectFit="cover"
              m="auto"
            >
              <Image
                width="70"
                height="70"
                {...getImageSrcProps(agendaReference.image)}
                alt=""
                draggable={false}
                loader={agendaReference.image ? thumborLoader : null}
              />
            </Box>

            <chakra.span lineClamp={2}>{agendaReference.title}</chakra.span>
          </NextLink>
        </Link>
      ))}
    </SimpleGrid>
  );
}
