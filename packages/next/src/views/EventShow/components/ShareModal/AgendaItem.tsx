import { HStack, Text, Link, NoBreak } from '@openagenda/uikit';
import Image from 'components/Image';
import OfficialAgenda from 'components/OfficialAgenda';
import LockIcon from 'components/LockIcon';
import keyCDNLoader from 'utils/keyCDNLoader';
import graylogo140 from '../../../../../public/images/graylogo140.png';

export default function AgendaItem({ agenda, targetAgenda, event }) {
  const isDev = process.env.NODE_ENV === 'development';

  const imageSrc = targetAgenda.image && `${process.env.NEXT_PUBLIC_IMAGE_PREFIX}${targetAgenda.image}`;

  return (
    <Link href={`/${targetAgenda.slug}/contribute/event/${event.uid}/from/${agenda.uid}`}>
      <HStack>
        <Image
          rounded="full"
          width="40"
          height="40"
          src={imageSrc || graylogo140}
          fallbackSrc={isDev && typeof imageSrc === 'string'
            ? imageSrc.replace('cibuldev', 'cibul').replace('images-', 'imagesdev-')
            : undefined}
          fallbackStrategy="onError"
          alt=""
          draggable={false}
          loader={imageSrc ? keyCDNLoader : null}
          border="3px solid white"
          h="40px"
          fit="cover"
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
