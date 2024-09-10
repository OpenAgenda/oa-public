import { keyCDNLoader } from 'utils/imageLoader';
import Image from 'components/Image';

const IMAGE_PREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX;
const DEV_IMAGE_PREFIX = process.env.NEXT_PUBLIC_DEV_IMAGE_PREFIX;

export default function EventImage({ event }) {
  if (!event.image) {
    return null;
  }

  const updatedTs = new Date(event.updatedAt).getTime();

  if (event.image?.size?.width && event.image?.size?.height) {
    return (
      <Image
        src={
          process.env.NODE_ENV === 'development'
            ? `${DEV_IMAGE_PREFIX}${event.image.filename}?__ts=${updatedTs}`
            : `${IMAGE_PREFIX}${event.image.filename}?__ts=${updatedTs}`
        }
        fallbackSrc={
          process.env.NODE_ENV === 'development'
            ? `${IMAGE_PREFIX}${event.image.filename}?__ts=${updatedTs}`
            : undefined
        }
        width={event.image.size.width}
        height={event.image.size.height}
        loader={keyCDNLoader}
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
          ? `${DEV_IMAGE_PREFIX}${event.image.filename}?__ts=${updatedTs}`
          : `${IMAGE_PREFIX}${event.image.filename}?__ts=${updatedTs}`
      }
      fallbackSrc={
        process.env.NODE_ENV === 'development'
          ? `${IMAGE_PREFIX}${event.image.filename}?__ts=${updatedTs}`
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
