import dynamic from 'next/dynamic';
import { AspectRatio } from '@openagenda/uikit';
import type { MapContainerProps } from 'react-leaflet';

const DynamicMap = dynamic(() => import('./DynamicMap'), {
  ssr: false,
});

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 600;

type MapProps = MapContainerProps & {
  width?: number
  height?: number
};

export default function Map({ width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, ...rest }: MapProps) {
  return (
    <AspectRatio ratio={width / height}>
      <DynamicMap {...rest} />
    </AspectRatio>
  );
}
