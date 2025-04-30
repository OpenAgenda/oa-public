import { Box, HStack, Link, Text } from '@openagenda/uikit';
import { useIntl } from 'react-intl';
import { getLocaleValue } from '@openagenda/intl';
import Image from 'components/Image';
import { thumborLoader } from 'utils/imageLoader';
import graylogo140 from '../../../public/images/graylogo140.png';

import messages from './messages';

function EventImage({ src, fallbackSrc = null, loader = null }) {
  return (
    <Box asChild borderRadius="full" h="56px" minW="56px" objectFit="cover">
      <Image
        width="56"
        height="56"
        src={src}
        fallbackSrc={fallbackSrc}
        alt=""
        draggable={false}
        loader={loader}
      />
    </Box>
  );
}

export default function EventItem({ event, agenda }) {
  const isDev = process.env.NODE_ENV === 'development';

  const intl = useIntl();

  return (
    <Link
      href={`https://openagenda.com/agendas/${agenda.uid}/events/${event.uid}`}
    >
      <HStack>
        {event.image ? (
          <EventImage
            src={
              isDev
                ? `${process.env.NEXT_PUBLIC_DEV_S3_BUCKET}/${event.image.filename}`
                : `${process.env.NEXT_PUBLIC_S3_BUCKET}/${event.image.filename}`
            }
            fallbackSrc={
              isDev
                ? `${process.env.NEXT_PUBLIC_S3_BUCKET}/${event.image.filename}`
                : undefined
            }
            loader={thumborLoader}
          />
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
