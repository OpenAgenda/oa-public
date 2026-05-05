import { useState, useLayoutEffect, useCallback } from 'react';
import { Box } from '@openagenda/uikit';
import { thumborLoader } from '@/src/utils/imageLoader';
import Image from '@/src/components/Image';

const DEV_S3_BUCKET = process.env.NEXT_PUBLIC_DEV_S3_BUCKET;
const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;

export default function EventImage({ event, sizes = null }) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageKey, setCurrentImageKey] = useState(
    event?.image?.filename || '',
  );

  useLayoutEffect(() => {
    if (event?.image?.filename && event.image.filename !== currentImageKey) {
      setIsLoading(true);
      setCurrentImageKey(event.image.filename);
    }
  }, [event?.image?.filename, currentImageKey]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  if (!event.image) {
    return null;
  }

  if (event.image?.size?.width && event.image?.size?.height) {
    return (
      <Box
        key={event.uid}
        asChild
        m="auto"
        w="full"
        opacity={isLoading ? 0 : 1}
        transition="opacity 0.1s ease-in-out"
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
          width={event.image.size.width}
          height={event.image.size.height}
          sizes={sizes}
          loader={thumborLoader}
          alt=""
          preload
          onLoad={handleImageLoad}
          onError={handleImageLoad}
        />
      </Box>
    );
  }

  return (
    <Box
      key={event.uid}
      asChild
      pos="unset !important"
      w="full !important"
      h="auto !important"
      m="auto"
      opacity={isLoading ? 0 : 1}
      transition="opacity 0.1s ease-in-out"
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
        preload
        onLoad={handleImageLoad}
        onError={handleImageLoad}
      />
    </Box>
  );
}
