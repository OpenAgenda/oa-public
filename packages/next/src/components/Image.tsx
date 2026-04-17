'use client';

import { useEffect, useState } from 'react';
import NextImage, { type ImageProps as NextImageProps } from 'next/image';

type ImageWithFallbackProps = NextImageProps & {
  fallbackSrc?: NextImageProps['src'];
};

function ImageWithFallback({
  src,
  fallbackSrc,
  onLoad,
  onError,
  ref,
  ...rest
}: ImageWithFallbackProps & React.RefAttributes<HTMLImageElement>) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <NextImage
      ref={ref}
      alt=""
      {...rest}
      src={imgSrc}
      onLoad={(e) => {
        if (fallbackSrc && (e.target as HTMLImageElement).naturalWidth === 0) {
          // Broken image
          setImgSrc(fallbackSrc);
        }
        onLoad?.(e);
      }}
      onError={(e) => {
        if (fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
        if (imgSrc === fallbackSrc) {
          onError?.(e);
        }
      }}
    />
  );
}

export default ImageWithFallback;
