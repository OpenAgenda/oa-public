'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { AspectRatio, AspectRatioProps } from '@openagenda/uikit';
import type { MapContainerProps } from 'react-leaflet';

const DynamicMap = dynamic(() => import('./DynamicMap'), {
  ssr: false,
});

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 600;

type MapProps = MapContainerProps & {
  width?: number;
  height?: number;
  aspectRatioProps?: AspectRatioProps;
};

export default function Map({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  aspectRatioProps,
  ...rest
}: MapProps) {
  const [isVisible, setIsVisible] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    });

    const map = mapRef.current;

    if (map) {
      observer.observe(map);
    }

    return () => {
      observer.disconnect();
    };
  }, [mapRef]);

  return (
    <AspectRatio ref={mapRef} ratio={width / height} {...aspectRatioProps}>
      {isVisible ? <DynamicMap {...rest} /> : <div />}
    </AspectRatio>
  );
}
