import { Box } from '@openagenda/uikit';
import { thumborLoader } from 'utils/imageLoader';
import Image from 'components/Image';

const DEV_S3_BUCKET = process.env.NEXT_PUBLIC_DEV_S3_BUCKET;
const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;

export default function EventImage({ event, sizes = null }) {
  if (!event.image) {
    return null;
  }

  if (event.image?.size?.width && event.image?.size?.height) {
    return (
      <Box asChild m="auto" w="full">
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
          sizes={sizes}
          loader={thumborLoader}
          alt=""
          priority
        />
      </Box>
    );
  }

  return (
    <Box
      asChild
      pos="unset !important"
      w="full !important"
      h="auto !important"
      m="auto"
    >
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
        sizes={sizes}
        loader={thumborLoader}
        alt=""
        priority
      />
    </Box>
  );
}
