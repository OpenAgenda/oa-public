import { HStack, Text, Link, NoBreak } from '@openagenda/uikit';
import Image from 'components/Image';
import OfficialAgenda from 'components/OfficialAgenda';
import LockIcon from 'components/LockIcon';
import { thumborLoader } from 'utils/imageLoader';
import graylogo140 from '../../../../../public/images/graylogo140.png';

const DEV_S3_BUCKET = process.env.NEXT_PUBLIC_DEV_S3_BUCKET;
const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;

function getImageSrc(src) {
  if (!src) return null;

  if (src.startsWith('https://')) {
    return new URL(src).pathname.replace(/^\//, '');
  }

  return process.env.NODE_ENV === 'development'
    ? `${DEV_S3_BUCKET}/${src}`
    : `${S3_BUCKET}/${src}`;
}

export default function AgendaItem({ agenda, targetAgenda, event }) {
  const isDev = process.env.NODE_ENV === 'development';

  const imageSrc = getImageSrc(targetAgenda.image);

  return (
    <Link
      href={`/${targetAgenda.slug}/contribute?agendaUid=${agenda.uid}&eventUid=${event.uid}`}
    >
      <HStack>
        <Image
          rounded="full"
          width="40"
          height="40"
          src={imageSrc || graylogo140}
          fallbackSrc={
            isDev && typeof imageSrc === 'string'
              ? imageSrc.replace('dev', 'main').replace('images-', 'imagesdev-')
              : undefined
          }
          alt=""
          draggable={false}
          loader={imageSrc ? thumborLoader : null}
          border="3px solid white"
          h="40px"
          objectFit="cover"
        />

        <Text fontSize="xl">
          {targetAgenda.title}
          {targetAgenda.official ? (
            <NoBreak>
              <OfficialAgenda
                ml="2"
                tooltipProps={{
                  bg: 'black',
                  color: 'white',
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
                  bg: 'black',
                  color: 'white',
                }}
              />
            </NoBreak>
          ) : null}
        </Text>
      </HStack>
    </Link>
  );
}
