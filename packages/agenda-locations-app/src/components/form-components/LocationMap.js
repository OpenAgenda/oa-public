import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback
} from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import '@raruto/leaflet-gesture-handling';
import { useIntl } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import { css } from '@emotion/react';

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

const defaults = {
  tiles:
    '//api.mapbox.com/styles/v1/kaore/ckhn90pz00mut19pi1pt29nhi/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2FvcmUiLCJhIjoidDZ1UW5HWSJ9.VspmN8kRdEgRm2A91RjNow',
  markerIcon: 'https://oastatic.s3.eu-central-1.amazonaws.com/oa-blue-marker.png',
  markerShadow: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconAnchor: [12, 41],
  pos: [40, 0],
  focusedZoom: 13,
  iconSize: [25, 41]
};

const posDiff = (pos1, pos2) => {
  if (pos1[0] === pos2[0] && pos1[1] === pos2[1]) return false;
  return true;
};

const MapContent = ({
  draggable,
  pos,
  onMarkerDragged,
  isGeolocated,
  defaultZoom,
  manualMode,
  setManualMode,
  locationPos
}) => {
  const map = useMap();
  const markerRef = useRef(null);
  const icon = L.icon({
    iconUrl: defaults.markerIcon,
    shadowUrl: defaults.markerShadow,
    iconAnchor: defaults.iconAnchor,
    iconSize: defaults.iconSize,
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        setManualMode(true);
        setTimeout(() => {
          const marker = markerRef.current;
          if (marker != null) {
            const newPos = marker.getLatLng();
            onMarkerDragged(newPos);
          }
        }, 500);
      },
    }),
    [onMarkerDragged, setManualMode],
  );

  if (isGeolocated() && !manualMode && posDiff(pos, locationPos)) {
    map.setView({ lat: locationPos[0], lng: locationPos[1] }, defaults.focusedZoom);
  }
  if (isGeolocated()) {
    return (
      <Marker
        draggable={draggable}
        eventHandlers={eventHandlers}
        position={pos}
        ref={markerRef}
        icon={icon}
      />
    );
  }
  return null;
};

const LocationMap = ({
  enabled = true,
  draggableMarker = false,
  scrollable = true,
  defaultUnZoom = 2,
  location = { latitude: undefined, longitude: undefined },
  tiles,
  onMarkerDragged,
  manualMode,
  setManualMode,
}) => {
  const intl = useIntl();
  const getLocationPos = useCallback(() => [location?.latitude, location?.longitude], [location]);
  const isGeolocated = useCallback(() => location?.latitude !== undefined, [location]);
  const [pos, setPos] = useState(isGeolocated() ? getLocationPos() : defaults.pos);
  const [defaultZoom, setDefaultZoom] = useState(isGeolocated() ? defaults.focusedZoom : defaultUnZoom);
  useEffect(() => {
    if (isGeolocated() && posDiff(pos, getLocationPos())) {
      setPos(getLocationPos());
      setDefaultZoom(defaults.focusedZoom);
    }
  }, [location, isGeolocated, getLocationPos, pos]);

  const gestureHandlingOptions = useMemo(() => ({
    locale: intl.locale
  }), [intl.locale]);

  return (
    <>
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
      <MapContainer
        center={pos}
        zoom={defaultZoom}
        scrollWheelZoom={scrollable && enabled}
        style={{ height: '300px' }}
        gestureHandling
        gestureHandlingOptions={gestureHandlingOptions}
        css={css`
        height: 100%;
        ${gestureHandlingStyle}
      `}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tiles || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
        />
        <MapContent
          isGeolocated={isGeolocated}
          pos={pos}
          draggable={draggableMarker}
          onMarkerDragged={onMarkerDragged}
          defaultZoom={defaultZoom}
          manualMode={manualMode}
          setManualMode={setManualMode}
          locationPos={getLocationPos()}
        />
      </MapContainer>
    </>
  );
};

export default LocationMap;
