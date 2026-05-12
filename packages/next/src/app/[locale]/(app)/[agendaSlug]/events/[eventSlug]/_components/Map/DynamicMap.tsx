import { useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import type { MapContainerProps } from 'react-leaflet';
import { useIntl } from 'react-intl';
import L from 'leaflet';
import shouldForwardProp from '@emotion/is-prop-valid';
import { chakra, system } from '@openagenda/uikit';
const markerIconImg = '/images/markerIcon.png';
import '@openagenda/leaflet-gesture-handling';

import 'leaflet/dist/leaflet.css';
import '@openagenda/leaflet-gesture-handling/dist/leaflet-gesture-handling.css';

const { isValidProperty } = system;

const MAP_TILES = process.env.NEXT_PUBLIC_MAP_TILES;

type MapProps = MapContainerProps & {
  gestureHandling?: boolean;
  gestureHandlingOptions?: {
    text?: Record<string, string>;
    locale?: string;
    duration?: number;
  };
};

const StyledMapContainer = chakra(
  MapContainer,
  {
    base: {
      w: 'full',
      h: 'full',
    },
  },
  {
    shouldForwardProp(prop: string, variantKeys: string[]) {
      // zoom is a valid css prop and should be handled by react-leaflet
      if (prop === 'zoom') {
        return true;
      }
      const chakraSfp = !variantKeys?.includes(prop) && !isValidProperty(prop);
      return shouldForwardProp(prop) || chakraSfp;
    },
  },
);

const markerIcon = new L.Icon({
  iconUrl: markerIconImg,
  iconSize: [18, 25],
  iconAnchor: [9, 25],
});

export default function Map(props: MapProps) {
  const intl = useIntl();
  const mapRef = useRef(undefined);

  const { center } = props;

  const onMapReady = useCallback(({ target: map }) => {
    mapRef.current = map;

    // Remove flag
    map.attributionControl.setPrefix(
      '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">Leaflet</a>',
    );
  }, []);

  return (
    <StyledMapContainer
      gestureHandling
      gestureHandlingOptions={{ locale: intl.locale }}
      doubleClickZoom
      worldCopyJump
      whenReady={onMapReady as () => void}
      {...props}
    >
      <TileLayer
        url={MAP_TILES}
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={center} icon={markerIcon} />
    </StyledMapContainer>
  );
}
