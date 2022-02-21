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
import { Helmet } from 'react-helmet-async';

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

const MapContent = ({
  draggable,
  pos,
  onMarkerDragged,
  isGeolocated,
  defaultZoom,
  manualMode,
  setManualMode
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

  if (!manualMode && map.getCenter() !== { lat: pos[0], lng: pos[1] }) map.setView({ lat: pos[0], lng: pos[1] }, defaultZoom);
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
  const getLocationPos = useCallback(() => [location?.latitude, location?.longitude], [location]);
  const isGeolocated = useCallback(() => location?.latitude !== undefined, [location]);
  const [pos, setPos] = useState(isGeolocated() ? getLocationPos() : defaults.pos);
  const [defaultZoom, setDefaultZoom] = useState(isGeolocated() ? defaults.focusedZoom : defaultUnZoom);

  useEffect(() => {
    if (isGeolocated()) {
      setDefaultZoom(defaults.focusedZoom);
      setPos(getLocationPos());
    }
  }, [location, isGeolocated, getLocationPos]);

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
        />
      </MapContainer>
    </>
  );
};

export default LocationMap;
