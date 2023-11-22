import dynamic from 'next/dynamic';
import { AspectRatio, AspectRatioProps } from '@openagenda/uikit';
import type { MapContainerProps } from 'react-leaflet';

const DynamicMap = dynamic(() => import('./DynamicMap'), {
  ssr: false,
});

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 600;

type MapProps = MapContainerProps & {
  width?: number
  height?: number
  aspectRatioProps?: AspectRatioProps
};

export default function Map({ width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, aspectRatioProps, ...rest }: MapProps) {
  return (
    <AspectRatio ratio={width / height} {...aspectRatioProps}>
      <DynamicMap {...rest} />
    </AspectRatio>
  );
}
