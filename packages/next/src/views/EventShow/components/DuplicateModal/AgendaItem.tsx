import { HStack, Text, Link, NoBreak } from '@openagenda/uikit';
import Image from 'components/Image';
import OfficialAgenda from 'components/OfficialAgenda';
import LockIcon from 'components/LockIcon';
import { keyCDNLoader } from 'utils/imageLoader';
import graylogo140 from '../../../../../public/images/graylogo140.png';

const keyCdnUrl = new URL(process.env.NEXT_PUBLIC_IMAGE_PREFIX);

function getImageSrc(src, updatedAt) {
  const url = new URL(src, 'https://n');
  url.host = keyCdnUrl.host;
  url.searchParams.append('__ts', updatedAt);
  return url.href;
}

export default function AgendaItem({ agenda, targetAgenda, event }) {
  const isDev = process.env.NODE_ENV === 'development';

  const imageSrc = targetAgenda.image
    ? getImageSrc(targetAgenda.image, targetAgenda.updatedAt)
    : null;

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
          loader={imageSrc ? keyCDNLoader : null}
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
