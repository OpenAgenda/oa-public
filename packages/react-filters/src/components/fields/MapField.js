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
  MapContainer, Marker, TileLayer, useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import { css } from '@emotion/react';
import { useUIDSeed } from 'react-uid';
import { defineMessages, useIntl } from 'react-intl';
import { usePrevious } from 'react-use';

const paddingRatio = 0.2;
const unpadRatio = -(1 / ((1 + paddingRatio) / paddingRatio));

const worldBounds = [
  [-90, -180],
  [90, 180],
];

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

const messages = defineMessages({
  searchWithMap: {
    id: 'ReactFilters.MapField.searchWithMap',
    defaultMessage: 'Search with map',
  },
});

function valueToViewport(value) {
  const bounds = new L.LatLngBounds(
    new L.LatLng(value.northEast.lat, value.northEast.lng),
    new L.LatLng(value.southWest.lat, value.southWest.lng)
  );

  const southEast = bounds.getSouthEast().wrap();
  const northWest = bounds.getNorthWest().wrap();

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
  if (!viewport) {
    return new L.LatLngBounds(worldBounds);
  }

  return new L.LatLngBounds(
    new L.LatLng(viewport.bottomRight.latitude, viewport.bottomRight.longitude),
    new L.LatLng(viewport.topLeft.latitude, viewport.topLeft.longitude)
  );
}

function MarkerClusterIcon({ latitude, longitude, eventCount }) {
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

  return <Marker position={position} icon={icon} />;
}

function OnMapMove({ onChange }) {
  const map = useMapEvents({
    moveend() {
      const innerBounds = map.getBounds().pad(unpadRatio);
      const innerZoom = map.getBoundsZoom(innerBounds);

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
      getViewport,
      onChange,
      userControlled,
    },
    ref
  ) => {
    const mapRef = useRef();

    const [viewport] = useState(() => (input.value ? valueToViewport(input.value) : getViewport()));
    const [data, setData] = useState(() => []);

    const [displayedMarkers, setDisplayedMarkers] = useState(false);
    const [bounds] = useState(() => viewportToBounds(viewport).pad(paddingRatio));

    useImperativeHandle(ref, () => ({
      setData,
      onQueryChange: newViewport => {
        // Just reload data if it's user controlled
        if (input.value) {
          const innerBounds = mapRef.current.getBounds().pad(unpadRatio);
          const innerZoom = mapRef.current.getBoundsZoom(innerBounds);

          loadGeoData(filter, innerBounds, innerZoom).then(newData => setData(newData?.reverse() ?? []));
        } else {
          const newBounds = newViewport
            ? viewportToBounds(newViewport).pad(paddingRatio)
            : new L.LatLngBounds(worldBounds);

          mapRef.current.fitBounds(newBounds);
        }
      },
    }));

    const onMapCreate = useCallback(
      map => {
        mapRef.current = map;

        const innerBounds = map.getBounds().pad(unpadRatio);
        const innerZoom = map.getBoundsZoom(innerBounds);

        if (innerZoom !== 1) {
          loadGeoData(filter, innerBounds, innerZoom).then(newData => {
            setData(newData?.reverse() ?? []);
            setDisplayedMarkers(true);
          });
        } else {
          setDisplayedMarkers(true);
        }
      },
      [filter, loadGeoData]
    );

    const previousUserControlled = usePrevious(userControlled);

    useEffect(() => {
      const map = mapRef.current;

      if (!map || !displayedMarkers) return;

      if (previousUserControlled === false && userControlled === true) {
        const innerBounds = mapRef.current.getBounds().pad(unpadRatio);
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

    return (
      <>
        <MapContainer
          bounds={bounds}
          scrollWheelZoom={false}
          css={css`
            height: 180px;
            ${markerClusterStyle}
          `}
          whenCreated={onMapCreate}
          worldCopyJump
          minZoom={1}
          noWrap
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

          <OnMapMove onChange={onChange} />
        </MapContainer>

        {/* TODO 'Rechercher avec la carte' */}
      </>
    );
  }
);

function MapField(
  {
    input,
    collapsed,
    name,
    filter,
    tileAttribution,
    tileUrl,
    loadGeoData,
    getViewport,
  },
  ref
) {
  const intl = useIntl();
  const seed = useUIDSeed();
  const [userControlled, setUserControlled] = useState(() => !!input.value);
  const toggleUserControlled = useCallback(
    e => setUserControlled(e.target.checked),
    []
  );

  const onChange = useCallback(
    value => {
      if (!userControlled) {
        if (value) {
          loadGeoData(filter, value.bounds, value.zoom).then(data => ref.current.setData(data?.reverse() ?? []));
        }

        return input.onChange(undefined);
      }

      const northEast = value.bounds.getNorthEast().wrap();
      const southWest = value.bounds.getSouthWest().wrap();

      input.onChange({
        northEast,
        southWest,
      });
    },
    [filter, input, loadGeoData, ref, userControlled]
  );

  return (
    <>
      {!collapsed ? (
        <Map
          ref={ref}
          input={input}
          filter={filter}
          tileAttribution={tileAttribution}
          tileUrl={tileUrl}
          loadGeoData={loadGeoData}
          getViewport={getViewport}
          onChange={onChange}
          userControlled={userControlled}
        />
      ) : null}

      <div className="checkbox">
        <label htmlFor={seed('input')}>
          <input
            name={`${name}-userControlled`}
            type="checkbox"
            id={seed('input')}
            checked={userControlled}
            onChange={toggleUserControlled}
          />{' '}
          {intl.formatMessage(messages.searchWithMap)}
        </label>
      </div>
    </>
  );
}

export default React.forwardRef(MapField);
