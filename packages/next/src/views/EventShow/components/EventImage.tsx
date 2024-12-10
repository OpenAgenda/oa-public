import { thumborLoader, keyCDNLoader } from 'utils/imageLoader';
import Image from 'components/Image';

const IMAGE_PREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX;
const DEV_IMAGE_PREFIX = process.env.NEXT_PUBLIC_DEV_IMAGE_PREFIX;

const DEV_S3_BUCKET = process.env.NEXT_PUBLIC_DEV_S3_BUCKET;
const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;

export default function EventImage({ event, thumbor = false }) {
  if (!event.image) {
    return null;
  }

  const loader = thumbor ? thumborLoader : keyCDNLoader;
  const devPrefix = thumbor ? DEV_S3_BUCKET + '/' : DEV_IMAGE_PREFIX;
  const prefix = thumbor ? S3_BUCKET + '/' : IMAGE_PREFIX;

  const updatedTs = new Date(event.updatedAt).getTime();

  if (event.image?.size?.width && event.image?.size?.height) {
    return (
      <Image
        src={
          process.env.NODE_ENV === 'development'
            ? `${devPrefix}${event.image.filename}?__ts=${updatedTs}`
            : `${prefix}${event.image.filename}?__ts=${updatedTs}`
        }
        fallbackSrc={
          process.env.NODE_ENV === 'development'
            ? `${prefix}${event.image.filename}?__ts=${updatedTs}`
            : undefined
        }
        width={event.image.size.width}
        height={event.image.size.height}
        loader={loader}
        alt=""
        m="auto"
        w="full"
        priority
      />
    );
  }

  return (
    <Image
      src={
        process.env.NODE_ENV === 'development'
          ? `${devPrefix}${event.image.filename}?__ts=${updatedTs}`
          : `${prefix}${event.image.filename}?__ts=${updatedTs}`
      }
      fallbackSrc={
        process.env.NODE_ENV === 'development'
          ? `${prefix}${event.image.filename}?__ts=${updatedTs}`
          : undefined
      }
      fill
      // @ts-ignore https://github.com/chakra-ui/chakra-ui/issues/7211
      pos="unset !important"
      w="full !important"
      h="auto !important"
      loader={keyCDNLoader}
      alt=""
      m="auto"
      priority
    />
  );
}
