import { useEffect, useState } from 'react';
import NextImage, { type ImageProps as NextImageProps } from 'next/image';
import { Box, HTMLChakraProps, forwardRef } from '@openagenda/uikit';

type ImageProps = Omit<NextImageProps, 'objectFit'> &
  Omit<HTMLChakraProps<'img'>, keyof NextImageProps> & {
    fallbackSrc?: NextImageProps['src'];
    objectFit?: HTMLChakraProps<'img'>['objectFit'];
  };

type ImageWithFallbackProps = ImageProps & {
  nextWidth: NextImageProps['width'];
  nextHeight: NextImageProps['height'];
  nextFill: NextImageProps['fill'];
};

const ImageWithFallback = forwardRef(function ImageWithFallback(
  {
    src,
    fallbackSrc,
    nextWidth,
    nextHeight,
    nextFill,
    ...rest
  }: ImageWithFallbackProps & React.RefAttributes<HTMLImageElement>,
  ref: React.Ref<any>,
) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <NextImage
      ref={ref}
      alt=""
      {...rest}
      objectFit={undefined}
      width={nextWidth}
      height={nextHeight}
      fill={nextFill}
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
});

const Image = forwardRef<ImageProps, 'img'>(function Image(
  props: ImageProps,
  ref,
) {
  const { width, height, fill, ...rest } = props;

  return (
    <Box
      ref={ref}
      as={ImageWithFallback}
      nextWidth={width}
      nextHeight={height}
      nextFill={fill}
      {...rest}
    />
  );
});

export default Image;
