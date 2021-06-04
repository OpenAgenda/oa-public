import _ from 'lodash';
import React, {
  useRef,
  useCallback,
  useState,
  useEffect
} from 'react';

import {
  MapContainer,
  TileLayer,
  useMapEvents
} from 'react-leaflet';

import { usePrevious } from 'react-use';

import {
  produce
} from 'immer';

import { Helmet } from 'react-helmet-async';

const autoMode = {
  center: [47.1413835095447, 2.7386084664240578],
  zoom: 4
};

function OnMapMove({ onChange }) {
  const map = useMapEvents({
    moveend() {
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      onChange({
        neLat: ne.lat,
        neLng: ne.lng,
        swLat: sw.lat,
        swLng: sw.lng
      });
    }
  });

  return null;
}

export default ({
  defaultTiles,
  embed,
  onChange
}) => {
  const mapRef = useRef(null);
  const {
    config: {
      layout: {
        mapCorners: corners,
        mapPositionMode,
        mapTiles
      }
    }
  } = embed;
  const prevMapPositionMode = usePrevious(mapPositionMode);
  const prevTiles = usePrevious(mapTiles);
  const [mapKey, setMapKey] = useState(0);

  const [mapContainerProps] = useState(() => {
    const result = {
      style: {
        height: '220px',
      },
      scrollWheelZoom: false
    };

    if (corners.neLat) {
      result.bounds = [
        [corners.neLat, corners.neLng],
        [corners.swLat, corners.swLng]
      ];
    } else {
      result.center = autoMode.center;
      result.zoom = autoMode.zoom;
    }

    return result;
  });

  const onMapCreate = useCallback(map => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    if (mapPositionMode !== prevMapPositionMode) {
      map.setView(autoMode.center, autoMode.zoom);
    }
  }, [mapPositionMode, prevMapPositionMode]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    if (mapTiles !== prevTiles) {
      setMapKey(i => i + 1);
    }
  }, [mapTiles, prevTiles]);

  return (
    <div>
      <Helmet>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
          integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
          crossOrigin=""
        />
        <script
          src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
          integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
          crossOrigin=""
        />
      </Helmet>
      <MapContainer key={mapKey} {...mapContainerProps} whenCreated={onMapCreate}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url={mapTiles || defaultTiles}
        />
        <OnMapMove
          onChange={updatedCorners => {
            if (mapPositionMode !== 'manual') {
              return;
            }
            onChange(produce(embed, draft => {
              _.set(draft, 'config.layout.mapCorners', updatedCorners);
            }));
          }}
        />
      </MapContainer>
    </div>
  );
};
