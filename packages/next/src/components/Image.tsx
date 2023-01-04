import NextImage, { ImageProps as NextImageProps } from 'next/image';
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
  htmlWidth?: string | number
  /**
   * The native HTML `height` attribute to the passed to the `img`
   */
  htmlHeight?: string | number
}

interface NativeImageProps extends
  Omit<PropsOf<'img'>, 'src' | 'placeholder'>,
  NextImageProps,
  NativeImageOptions {}

const InnerImage = forwardRef(function InnerImage(
  props: NativeImageProps & React.RefAttributes<HTMLImageElement>,
  ref: React.Ref<any>,
) {
  const { htmlWidth, htmlHeight, ...rest } = props;

  return (
    <NextImage ref={ref} width={htmlWidth} height={htmlHeight} {...rest} />
  );
});

interface ImageProps extends
  Omit<NextImageProps, keyof Omit<ChakraImageProps, 'src' | 'width' | 'height' | 'layout'>>,
  Omit<ChakraImageProps, 'src' | 'width' | 'height' | 'htmlWidth' | 'htmlHeight'> {}

const Image = forwardRef<ImageProps, 'img'>(function Image(props: ImageProps, ref) {
  const { src, width, height, ...rest } = props;

  return (
    <ChakraImage
      ref={ref}
      as={InnerImage}
      src={src as string}
      htmlWidth={width}
      htmlHeight={height}
      {...rest}
    />
  );
});

export default Image;
