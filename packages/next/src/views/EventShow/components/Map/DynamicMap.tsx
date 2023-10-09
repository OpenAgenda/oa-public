import { useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import type { MapContainerProps } from 'react-leaflet';
import { useIntl } from 'react-intl';
import L from 'leaflet';
import { chakra } from '@openagenda/uikit';
import markerIconImg from '../../../../../public/images/markerIcon.png';
import '@raruto/leaflet-gesture-handling';

import 'leaflet/dist/leaflet.css';
import '@raruto/leaflet-gesture-handling/dist/leaflet-gesture-handling.css';

const MAP_TILES = process.env.NEXT_PUBLIC_MAP_TILES;

type MapProps = MapContainerProps & {
  gestureHandling?: boolean,
  gestureHandlingOptions?: {
    text?: Record<string, string>
    locale?: string
    duration?: number
  }
};

const StyledMapContainer = chakra(MapContainer, {
  baseStyle: {
    w: 'full',
    h: 'full',
  },
});

const markerIcon = new L.Icon({
  iconUrl: markerIconImg.src,
  iconSize: [18, 25],
  iconAnchor: [9, 25],
});

export default function Map(props: MapProps) {
  const intl = useIntl();
  const mapRef = useRef();

  const { center } = props;

  const onMapReady = useCallback(
    ({ target: map }) => {
      mapRef.current = map;

      // Remove flag
      map.attributionControl.setPrefix(
        '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">Leaflet</a>',
      );
    },
    [],
  );

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
        attribution="&copy; <a href=&quot;https://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
      />
      <Marker position={center} icon={markerIcon} />
    </StyledMapContainer>
  );
}
