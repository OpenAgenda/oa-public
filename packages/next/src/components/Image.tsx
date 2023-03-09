import NextImage, { ImageProps as NextImageProps } from 'next/future/image';
import {
  Image as ChakraImage,
  ImageProps as ChakraImageProps,
  forwardRef,
  PropsOf,
} from '@openagenda/uikit';

interface NativeImageOptions {
  /**
   * The native HTML `width` attribute to the passed to the `img`
   */
  nextWidth?: string | number
  /**
   * The native HTML `height` attribute to the passed to the `img`
   */
  nextHeight?: string | number
  nextFill?: boolean
}

interface NativeImageProps extends
  Omit<PropsOf<'img'>, 'src' | 'alt' | 'placeholder'>,
  NextImageProps,
  NativeImageOptions {}

const InnerImage = forwardRef(function InnerImage(
  props: NativeImageProps & React.RefAttributes<HTMLImageElement>,
  ref: React.Ref<any>,
) {
  const { nextWidth, nextHeight, nextFill, ...rest } = props;

  return (
    <NextImage ref={ref} width={nextWidth} height={nextHeight} fill={nextFill} {...rest} />
  );
});

interface ImageProps extends
  Omit<NextImageProps, keyof Omit<ChakraImageProps, 'src' | 'width' | 'height' | 'fill'>>,
  Omit<ChakraImageProps, 'src' | 'width' | 'height' | 'htmlWidth' | 'htmlHeight' | 'fill'> {}

const Image = forwardRef<ImageProps, 'img'>(function Image(props: ImageProps, ref) {
  const { src, width, height, fill, ...rest } = props;

  return (
    <ChakraImage
      ref={ref}
      as={InnerImage}
      src={src as string}
      nextWidth={width}
      nextHeight={height}
      nextFill={fill}
      {...rest}
    />
  );
});

export default Image;
