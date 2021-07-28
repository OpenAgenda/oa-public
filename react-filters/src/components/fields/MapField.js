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
import '@raruto/leaflet-gesture-handling';

const paddingRatio = 0.2;
const unpadRatio = -(1 / ((1 + paddingRatio) / paddingRatio));

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
  return new L.LatLngBounds(
    new L.LatLng(viewport.bottomRight.latitude, viewport.bottomRight.longitude),
    new L.LatLng(viewport.topLeft.latitude, viewport.topLeft.longitude)
  );
}

function isEmptyValue(value) {
  return !value || value === '';
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

function OnMapMove({ onChange, programmaticMoveRef }) {
  const map = useMapEvents({
    moveend() {
      if (programmaticMoveRef.current) {
        programmaticMoveRef.current = false;
        return;
      }

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
      initialViewport,
      defaultViewport = worldViewport,
      onChange,
      userControlled,
      className,
    },
    ref
  ) => {
    const intl = useIntl();
    const mapRef = useRef();
    const programmaticMoveRef = useRef(false);

    const [viewport] = useState(() => (input.value ? valueToViewport(input.value) : initialViewport));
    const [data, setData] = useState(() => []);

    const [displayedMarkers, setDisplayedMarkers] = useState(false);
    const [bounds] = useState(() => viewportToBounds(viewport || defaultViewport).pad(paddingRatio));

    useImperativeHandle(ref, () => ({
      setData,
      onQueryChange: newViewport => {
        // Just reload data if it's user controlled
        const map = mapRef.current;
        const needFitBounds = !userControlled || isEmptyValue(input.value);

        function reloadData() {
          const innerBounds = map.getBounds().pad(unpadRatio);
          const innerZoom = map.getBoundsZoom(innerBounds);

          loadGeoData(filter, innerBounds, innerZoom)
            .then(newData => setData(newData?.reverse() ?? []));
        }

        if (needFitBounds) {
          map.once('moveend', () => reloadData());

          programmaticMoveRef.current = true;
          map.fitBounds(viewportToBounds(newViewport || defaultViewport).pad(paddingRatio));
        } else {
          reloadData();
        }
      },
    }));

    const onMapCreate = useCallback(
      map => {
        mapRef.current = map;

        const innerBounds = map.getBounds().pad(unpadRatio);
        const innerZoom = map.getBoundsZoom(innerBounds);

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

    const gestureHandlingOptions = useMemo(() => ({
      locale: intl.locale
    }), [intl.locale]);

    return (
      <>
        <MapContainer
          className={className}
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
          worldCopyJump
          // minZoom={1}
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

          <OnMapMove onChange={onChange} programmaticMoveRef={programmaticMoveRef} />
        </MapContainer>
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
    initialViewport,
    defaultViewport,
    className,
    searchMessage,
    searchWithMap,
  },
  ref
) {
  const intl = useIntl();
  const seed = useUIDSeed();
  const [userControlled, setUserControlled] = useState(
    () => (typeof searchWithMap === 'boolean' ? searchWithMap : !!input.value)
  );
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
        northEast: {
          lat: northEast.lat,
          lng: northEast.lng,
        },
        southWest: {
          lat: southWest.lat,
          lng: southWest.lng,
        },
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
          initialViewport={initialViewport}
          defaultViewport={defaultViewport}
          onChange={onChange}
          userControlled={userControlled}
          setUserControlled={setUserControlled}
          className={className}
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
          {searchMessage || intl.formatMessage(messages.searchWithMap)}
        </label>
      </div>
    </>
  );
}

export default React.forwardRef(MapField);
