import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import cn from 'classnames';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import { css } from '@emotion/react';
import { useIntl } from 'react-intl';
import { usePrevious } from 'react-use';
import '@raruto/leaflet-gesture-handling';

const padRatio = 0.2;
const unpadRatio = -(1 / ((1 + padRatio + padRatio) / padRatio));

const worldViewport = {
  bottomRight: {
    latitude: -90,
    longitude: 180,
  },
  topLeft: {
    latitude: 90,
    longitude: -180,
  },
};

const markerClusterStyle = css`
  .marker-cluster-small {
    background-color: rgba(181, 226, 140, 0.6);
  }
  .marker-cluster-small div {
    background-color: rgba(110, 204, 57, 0.6);
  }

  .marker-cluster-medium {
    background-color: rgba(241, 211, 87, 0.6);
  }
  .marker-cluster-medium div {
    background-color: rgba(240, 194, 12, 0.6);
  }

  .marker-cluster-large {
    background-color: rgba(253, 156, 115, 0.6);
  }
  .marker-cluster-large div {
    background-color: rgba(241, 128, 23, 0.6);
  }

  .marker-cluster {
    background-clip: padding-box;
    border-radius: 20px;
  }
  .marker-cluster div {
    width: 30px;
    height: 30px;
    margin-left: 5px;
    margin-top: 5px;

    text-align: center;
    border-radius: 15px;
    font: 12px 'Helvetica Neue', Arial, Helvetica, sans-serif;
  }
  .marker-cluster span {
    line-height: 30px;
  }
`;

const gestureHandlingStyle = css`
  &.leaflet-gesture-handling:after {
    color: #fff;
    font-family: Roboto, Arial, sans-serif;
    font-size: 22px;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    padding: 15px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, .5);
    z-index: 1001;
    pointer-events: none;
    text-align: center;
    -webkit-transition: opacity .8s ease-in-out;
    transition: opacity .8s ease-in-out;
    opacity: 0;
    content: ""
  }
  
  &.leaflet-gesture-handling-warning:after {
    -webkit-transition-duration: .3s;
    transition-duration: .3s;
    opacity: 1
  }
  
  &.leaflet-gesture-handling-touch:after {
    content: attr(data-gesture-handling-touch-content)
  }
  
  &.leaflet-gesture-handling-scroll:after {
    content: attr(data-gesture-handling-scroll-content)
  }
`;

function valueToViewport(value) {
  const bounds = new L.LatLngBounds(
    new L.LatLng(value.northEast.lat, value.northEast.lng),
    new L.LatLng(value.southWest.lat, value.southWest.lng)
  );

  const southEast = bounds.getSouthEast();
  const northWest = bounds.getNorthWest();

  return {
    bottomRight: {
      latitude: southEast.lat,
      longitude: southEast.lng,
    },
    topLeft: {
      latitude: northWest.lat,
      longitude: northWest.lng,
    },
  };
}

function viewportToBounds(viewport) {
  return new L.LatLngBounds(
    new L.LatLng(viewport.bottomRight.latitude, viewport.bottomRight.longitude),
    new L.LatLng(viewport.topLeft.latitude, viewport.topLeft.longitude)
  );
}

/*
Returns bounds created by extending or retracting the current bounds by a given ratio in each direction.
For example, a ratio of 0.5 extends the bounds by 50% in each direction.
Negative values will retract the bounds.
Skip the padding if the whole map is seen.
*/
function normalizeBounds(bounds, bufferRatio = 1) {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const height = Math.abs(sw.lat - ne.lat); // 85 * 2 is the whole map
  const width = Math.abs(sw.lng - ne.lng); // 180 * 2 is the whole map
  const heightBuffer = height * bufferRatio;
  const widthBuffer = Math.min(width, 360) * bufferRatio;

  // For positive pad
  const south = height > 170 ? sw.lat : sw.lat - heightBuffer;
  const west = width > 360 ? -180 : sw.lng - widthBuffer;
  const north = height > 170 ? ne.lat : ne.lat + heightBuffer;
  const east = width > 360 ? 180 : ne.lng + widthBuffer;

  return new L.LatLngBounds(
    new L.LatLng(south, west),
    new L.LatLng(north, east)
  );
}

function isEmptyValue(value) {
  return !value || value === '';
}

function MarkerClusterIcon({ latitude, longitude, eventCount }) {
  const map = useMap();
  const position = useMemo(() => [latitude, longitude], [latitude, longitude]);
  const icon = useMemo(
    () => new L.DivIcon({
      html: `<div><span>${eventCount}</span></div>`,
      className: cn('marker-cluster', {
        'marker-cluster-small': eventCount < 10,
        'marker-cluster-medium': eventCount < 100,
        'marker-cluster-large': eventCount >= 100,
      }),
      iconSize: new L.Point(40, 40),
    }),
    [eventCount]
  );

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: () => {
          map.setView(position, Math.min(map.getZoom() + 1, map.getMaxZoom()));
        },
      }}
    />
  );
}

function OnMapMove({ onChange, programmaticMoveRef }) {
  const map = useMapEvents({
    moveend() {
      if (programmaticMoveRef.current) {
        programmaticMoveRef.current = false;
        return;
      }

      const innerBounds = normalizeBounds(map.getBounds(), unpadRatio);
      const innerZoom = map.getBoundsZoom(map.getBounds());

      onChange({
        bounds: innerBounds,
        zoom: innerZoom,
      });
    },
  });

  return null;
}

const Map = React.forwardRef(
  (
    {
      input,
      filter,
      tileAttribution,
      tileUrl,
      loadGeoData,
      initialViewport,
      defaultViewport,
      onChange,
      userControlled,
    },
    ref
  ) => {
    const intl = useIntl();
    const mapRef = useRef();
    const programmaticMoveRef = useRef(false);

    const [viewport] = useState(() => (input.value ? valueToViewport(input.value) : initialViewport));
    const [data, setData] = useState(() => []);

    const [displayedMarkers, setDisplayedMarkers] = useState(false);
    const [bounds] = useState(() => viewportToBounds(viewport || defaultViewport || worldViewport).pad(padRatio));
    useImperativeHandle(ref, () => ({
      setData,
      onQueryChange: newViewport => {
        // Just reload data if it's user controlled
        const map = mapRef.current;
        const needFitBounds = !userControlled || isEmptyValue(input.value);

        function reloadData() {
          const innerBounds = normalizeBounds(map.getBounds(), unpadRatio);
          const innerZoom = map.getBoundsZoom(map.getBounds());

          loadGeoData(filter, innerBounds, innerZoom)
            .then(newData => setData(newData?.reverse() ?? []));
        }

        if (needFitBounds) {
          map.once('moveend', () => reloadData());

          programmaticMoveRef.current = true;
          map.fitBounds(viewportToBounds(newViewport || defaultViewport || worldViewport).pad(padRatio));
        } else {
          reloadData();
        }
      },
    }));

    const onMapCreate = useCallback(
      map => {
        mapRef.current = map;

        const innerBounds = normalizeBounds(map.getBounds(), unpadRatio);
        const innerZoom = map.getBoundsZoom(map.getBounds());

        loadGeoData(filter, innerBounds, innerZoom).then(newData => {
          setData(newData?.reverse() ?? []);
          setDisplayedMarkers(true);
        });
      },
      [filter, loadGeoData]
    );

    const previousUserControlled = usePrevious(userControlled);

    // useEffect(() => {
    //   // Become not user controlled if value is cleared
    //   if (!isEmptyValue(previousValue) && isEmptyValue(input.value) && userControlled) {
    //     setUserControlled(false);
    //   }
    // });

    useEffect(() => {
      const map = mapRef.current;

      if (!map || !displayedMarkers) return;

      if (previousUserControlled === false && userControlled === true) {
        const innerBounds = mapRef.current.getBounds();
        const innerZoom = mapRef.current.getBoundsZoom(innerBounds);

        onChange({
          bounds: innerBounds,
          zoom: innerZoom,
        });
      }

      if (previousUserControlled === true && userControlled === false) {
        onChange(undefined);
      }
    }, [displayedMarkers, onChange, previousUserControlled, userControlled]);

    const gestureHandlingOptions = useMemo(() => ({
      locale: intl.locale
    }), [intl.locale]);

    return (
      <MapContainer
        css={css`
          height: 100%;
          ${markerClusterStyle}
          ${gestureHandlingStyle}
        `}
        bounds={bounds}
        whenCreated={onMapCreate}
        // scrollWheelZoom={false}
        gestureHandling
        gestureHandlingOptions={gestureHandlingOptions}
        doubleClickZoom
        worldCopyJump
        // minZoom={1}
      >
        <TileLayer attribution={tileAttribution} url={tileUrl} />

        {displayedMarkers
          ? data.map(entry => (
            <MarkerClusterIcon
              key={entry.key}
              eventCount={entry.eventCount}
              latitude={entry.latitude}
              longitude={entry.longitude}
            />
          ))
          : null}

        <OnMapMove onChange={onChange} programmaticMoveRef={programmaticMoveRef} />
      </MapContainer>
    );
  }
);

export default Map;
