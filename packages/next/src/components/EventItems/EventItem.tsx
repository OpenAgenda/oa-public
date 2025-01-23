import { HStack, Link, Text } from '@openagenda/uikit';
import { useIntl } from 'react-intl';
import { getLocaleValue } from '@openagenda/intl';
import Image from 'components/Image';
import { keyCDNLoader } from 'utils/imageLoader';
import graylogo140 from '../../../public/images/graylogo140.png';

import messages from './messages';

const getImageSrc = (event) =>
  event.image &&
  `${process.env.NEXT_PUBLIC_IMAGE_PREFIX}${event.image.filename}`;

function EventImage({ src, loader = null }) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <Image
      rounded="full"
      width="56"
      height="56"
      src={src}
      fallbackSrc={
        isDev && typeof src === 'string'
          ? src
              .replace('dev', 'main')
              .replace(
                process.env.NEXT_PUBLIC_IMAGE_PREFIX,
                process.env.NEXT_PUBLIC_DEV_IMAGE_PREFIX,
              )
          : undefined
      }
      alt=""
      draggable={false}
      loader={loader}
      h="56px"
      objectFit="cover"
    />
  );
}

export default function EventItem({ event, agenda }) {
  const intl = useIntl();

  return (
    <Link
      href={`https://openagenda.com/agendas/${agenda.uid}/events/${event.uid}`}
    >
      <HStack>
        {event.image ? (
          <EventImage src={getImageSrc(event)} loader={keyCDNLoader} />
        ) : (
          <EventImage src={graylogo140} />
        )}
        <div>
          <Text fontWeight="bold">
            {getLocaleValue(event.title, intl.locale) ||
              intl.formatMessage(messages.undefinedTitle)}
          </Text>
          <div>{getLocaleValue(event.dateRange, intl.locale)}</div>
        </div>
      </HStack>
    </Link>
  );
}
