import { Box, HStack, Text, Link, NoBreak } from '@openagenda/uikit';
import Image from 'components/Image';
import OfficialAgenda from 'components/OfficialAgenda';
import LockIcon from 'components/LockIcon';
import { thumborLoader } from 'utils/imageLoader';
import graylogo140 from '../../../../../public/images/graylogo140.png';

const isDev = process.env.NODE_ENV === 'development';

function getImageSrc(image) {
  if (!image) return null;

  return isDev
    ? `${process.env.NEXT_PUBLIC_DEV_S3_BUCKET}/${image}`
    : `${process.env.NEXT_PUBLIC_S3_BUCKET}/${image}`;
}

export default function AgendaItem({ agenda, targetAgenda, event }) {
  const imageSrc = getImageSrc(targetAgenda.image);

  return (
    <Link
      href={`/${targetAgenda.slug}/contribute/event/${event.uid}/from/${agenda.uid}`}
      color="fg"
    >
      <HStack>
        <Box
          asChild
          borderRadius="full"
          border="3px solid white"
          h="40px"
          minW="40px"
          objectFit="cover"
        >
          <Image
            width="40"
            height="40"
            src={imageSrc || graylogo140}
            fallbackSrc={
              isDev && typeof imageSrc === 'string'
                ? imageSrc
                    .replace('dev', 'main')
                    .replace('images-', 'imagesdev-')
                : undefined
            }
            alt=""
            draggable={false}
            loader={imageSrc ? thumborLoader : null}
          />
        </Box>

        <Text fontSize="lg">
          {targetAgenda.title}
          {targetAgenda.official ? (
            <NoBreak>
              <OfficialAgenda
                ml="2"
                tooltipProps={{
                  contentProps: {
                    css: { '--tooltip-bg': 'black' },
                    color: 'white',
                  },
                }}
              />
            </NoBreak>
          ) : null}
          {targetAgenda.private ? (
            <NoBreak>
              <LockIcon
                type="agenda"
                ml="2"
                tooltipProps={{
                  contentProps: {
                    css: { '--tooltip-bg': 'black' },
                    color: 'white',
                  },
                }}
              />
            </NoBreak>
          ) : null}
        </Text>
      </HStack>
    </Link>
  );
}
