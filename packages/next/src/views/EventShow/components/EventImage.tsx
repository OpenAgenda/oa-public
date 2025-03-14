import { thumborLoader } from 'utils/imageLoader';
import Image from 'components/Image';

const DEV_S3_BUCKET = process.env.NEXT_PUBLIC_DEV_S3_BUCKET;
const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;

export default function EventImage({ event }) {
  if (!event.image) {
    return null;
  }

  if (event.image?.size?.width && event.image?.size?.height) {
    return (
      <Image
        src={
          process.env.NODE_ENV === 'development'
            ? `${DEV_S3_BUCKET}/${event.image.filename}`
            : `${S3_BUCKET}/${event.image.filename}`
        }
        fallbackSrc={
          process.env.NODE_ENV === 'development'
            ? `${S3_BUCKET}/${event.image.filename}`
            : undefined
        }
        width={event.image.size.width}
        height={event.image.size.height}
        loader={thumborLoader}
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
          ? `${DEV_S3_BUCKET}/${event.image.filename}`
          : `${S3_BUCKET}/${event.image.filename}`
      }
      fallbackSrc={
        process.env.NODE_ENV === 'development'
          ? `${S3_BUCKET}/${event.image.filename}`
          : undefined
      }
      fill
      // @ts-ignore https://github.com/chakra-ui/chakra-ui/issues/7211
      pos="unset !important"
      w="full !important"
      h="auto !important"
      loader={thumborLoader}
      alt=""
      m="auto"
      priority
    />
  );
}
