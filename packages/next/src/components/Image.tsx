import { useEffect, useState } from 'react';
import NextImage, { type ImageProps as NextImageProps } from 'next/image';

type ImageWithFallbackProps = NextImageProps & {
  fallbackSrc?: NextImageProps['src'];
};

function ImageWithFallback({
  src,
  fallbackSrc,
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
      }}
      onError={() => {
        if (fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}

export default ImageWithFallback;
