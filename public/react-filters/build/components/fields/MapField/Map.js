import {
  SearchHereControl
} from "../../../chunk-PZZBZOAV.js";
import "../../../chunk-HFJTJKDH.js";
import {
  FiltersAndWidgetsContext_default
} from "../../../chunk-KG7QE6MN.js";
import "../../../chunk-EVM6BVMO.js";

// src/components/fields/MapField/Map.js
import React, {
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import cn from "classnames";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
  useMap
} from "react-leaflet";
import L from "leaflet";
import { useIntl } from "react-intl";
import "@openagenda/leaflet-gesture-handling";
import { useForm } from "react-final-form";
import { Fragment, jsx, jsxs } from "@emotion/react/jsx-runtime";
var padRatio = 0.2;
var unpadRatio = -(1 / ((1 + padRatio + padRatio) / padRatio));
var worldViewport = {
  bottomRight: {
    latitude: -90,
    longitude: 180
  },
  topLeft: {
    latitude: 90,
    longitude: -180
  }
};
function loadGestureHandlingLocale(gestureHandling, locale) {
  import(`@openagenda/leaflet-gesture-handling/dist/locales/${locale}.js`).then((m) => {
    const content = m.default || m;
    const scrollWarning = gestureHandling._isMacUser() ? content.scrollMac : content.scroll;
    gestureHandling._map._container.setAttribute(
      "data-gesture-handling-touch-content",
      content.touch
    );
    gestureHandling._map._container.setAttribute(
      "data-gesture-handling-scroll-content",
      scrollWarning
    );
    gestureHandling._touchWarning = content.touch;
    gestureHandling._scrollWarning = scrollWarning;
  }).catch((e) => {
    console.log(`Cannot load gestureHandling locale "${locale}"`, e);
  });
}
function waitMapBounds(map, interval = 16) {
  return new Promise((resolve, _reject) => {
    const attemptGetBounds = () => {
      try {
        const bounds = map.getBounds();
        if (bounds) {
          resolve(bounds);
        } else {
          throw new Error("Bounds not available");
        }
      } catch (error) {
        setTimeout(attemptGetBounds, interval);
      }
    };
    setTimeout(() => attemptGetBounds());
  });
}
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
      longitude: southEast.lng
    },
    topLeft: {
      latitude: northWest.lat,
      longitude: northWest.lng
    }
  };
}
function viewportToBounds(viewport) {
  return new L.LatLngBounds(
    new L.LatLng(viewport.bottomRight.latitude, viewport.bottomRight.longitude),
    new L.LatLng(viewport.topLeft.latitude, viewport.topLeft.longitude)
  );
}
function isEqualBounds(a, b) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  return String((_a = a == null ? void 0 : a.northEast) == null ? void 0 : _a.lat) === String((_b = b == null ? void 0 : b.northEast) == null ? void 0 : _b.lat) && String((_c = a == null ? void 0 : a.northEast) == null ? void 0 : _c.lng) === String((_d = b == null ? void 0 : b.northEast) == null ? void 0 : _d.lng) && String((_e = a == null ? void 0 : a.southWest) == null ? void 0 : _e.lat) === String((_f = b == null ? void 0 : b.southWest) == null ? void 0 : _f.lat) && String((_g = a == null ? void 0 : a.southWest) == null ? void 0 : _g.lng) === String((_h = b == null ? void 0 : b.southWest) == null ? void 0 : _h.lng);
}
function normalizeBounds(bounds, bufferRatio = 1) {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const height = Math.abs(sw.lat - ne.lat);
  const width = Math.abs(sw.lng - ne.lng);
  const heightBuffer = height * bufferRatio;
  const widthBuffer = Math.min(width, 360) * bufferRatio;
  const south = height > 170 ? sw.lat : sw.lat - heightBuffer;
  const west = width > 360 ? -180 : sw.lng - widthBuffer;
  const north = height > 170 ? ne.lat : ne.lat + heightBuffer;
  const east = width > 360 ? 180 : ne.lng + widthBuffer;
  return new L.LatLngBounds(
    new L.LatLng(south, west),
    new L.LatLng(north, east)
  );
}
function convertToKFormat(intl, number) {
  if (number >= 1e3) {
    return `${intl.formatNumber((number / 1e3).toFixed(1))}k`;
  }
  return number.toString();
}
function MarkerClusterIcon({ latitude, longitude, eventCount }) {
  const intl = useIntl();
  const map = useMap();
  const position = useMemo(() => [latitude, longitude], [latitude, longitude]);
  const icon = useMemo(
    () => new L.DivIcon({
      html: `<div style="pointer-events: none;"><span>${convertToKFormat(intl, eventCount)}</span></div>`,
      className: cn("marker-cluster leaflet-interactive", {
        "marker-cluster-small": eventCount < 10,
        "marker-cluster-medium": eventCount < 100,
        "marker-cluster-large": eventCount >= 100
      }),
      iconSize: new L.Point(40, 40)
    }),
    [eventCount]
  );
  return /* @__PURE__ */ jsx(
    Marker,
    {
      position,
      icon,
      eventHandlers: {
        click: () => {
          map.setView(position, Math.min(map.getZoom() + 1, map.getMaxZoom()));
        }
      }
    }
  );
}
function OnMapMove({ onChange }) {
  useMapEvents({
    moveend() {
      onChange();
    }
  });
  return null;
}
var Map = React.forwardRef(
  ({
    input,
    tileAttribution,
    tileUrl,
    loadGeoData,
    initialViewport,
    defaultViewport,
    className,
    searchHereControl: SearchHereControlComponent = SearchHereControl
  }, ref) => {
    const intl = useIntl();
    const form = useForm();
    const {
      filtersOptions: { manualSubmit }
    } = useContext(FiltersAndWidgetsContext_default);
    const mapRef = useRef();
    const programmaticMoveRef = useRef(false);
    const [viewport] = useState(() => input.value ? valueToViewport(input.value) : initialViewport);
    const skipMoveRef = useRef(true);
    const [data, setData] = useState(() => []);
    const [displayedMarkers, setDisplayedMarkers] = useState(false);
    const [bounds] = useState(() => viewportToBounds(viewport || defaultViewport || worldViewport).pad(
      padRatio
    ));
    useImperativeHandle(ref, () => ({
      setData,
      onQueryChange: (newViewport) => {
        const map = mapRef.current;
        function reloadData() {
          waitMapBounds(map).then((bounds1) => {
            const innerBounds = normalizeBounds(bounds1, unpadRatio);
            const innerZoom = map.getBoundsZoom(bounds1);
            loadGeoData(innerBounds, innerZoom).then((newData) => setData((newData == null ? void 0 : newData.reverse()) ?? [])).catch((err) => {
              console.log("Failed to load geo data", err);
            });
          });
        }
        if (!skipMoveRef.current) {
          map.once("moveend", () => reloadData());
          programmaticMoveRef.current = true;
          map.fitBounds(
            viewportToBounds(
              newViewport || defaultViewport || worldViewport
            ).pad(padRatio)
          );
        } else {
          reloadData();
        }
        skipMoveRef.current = false;
      }
    }));
    const onMapReady = useCallback(
      ({ target: map }) => {
        mapRef.current = map;
        loadGestureHandlingLocale(map.gestureHandling, intl.locale);
        map.attributionControl.setPrefix(
          '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">Leaflet</a>'
        );
        waitMapBounds(map).then((bounds1) => {
          const innerBounds = normalizeBounds(bounds1, unpadRatio);
          const innerZoom = map.getBoundsZoom(bounds1);
          loadGeoData(innerBounds, innerZoom).then((newData) => {
            setData((newData == null ? void 0 : newData.reverse()) ?? []);
            setDisplayedMarkers(true);
          }).catch((err) => {
            console.log("Failed to load geo data", err);
          }).finally(() => {
            skipMoveRef.current = false;
          });
        });
      },
      [bounds, loadGeoData]
    );
    const searchHere = useCallback(
      (e) => {
        e.preventDefault();
        const map = mapRef.current;
        if (!map) return;
        skipMoveRef.current = true;
        const innerBounds = normalizeBounds(map.getBounds(), unpadRatio);
        const northEast = innerBounds.getNorthEast().wrap();
        const southWest = innerBounds.getSouthWest().wrap();
        input.onChange({
          northEast: {
            lat: String(northEast.lat),
            lng: String(northEast.lng)
          },
          southWest: {
            lat: String(southWest.lat),
            lng: String(southWest.lng)
          }
        });
        if (manualSubmit) {
          form.submit();
        }
      },
      [input, mapRef]
    );
    const [latestBounds, setLatestBounds] = useState(false);
    const onChange = useCallback(() => {
      const map = mapRef.current;
      const bounds1 = map.getBounds();
      const innerBounds = normalizeBounds(bounds1, unpadRatio);
      const innerZoom = map.getBoundsZoom(bounds1);
      setLatestBounds(innerBounds);
      if (programmaticMoveRef.current) {
        programmaticMoveRef.current = false;
        return;
      }
      const { current: mapElem } = ref;
      loadGeoData(innerBounds, innerZoom).then((data1) => mapElem.setData((data1 == null ? void 0 : data1.reverse()) ?? [])).catch((err) => {
        console.log("Failed to geo data", err);
      });
    }, [loadGeoData, ref]);
    const disabledMapSearch = useMemo(
      () => !latestBounds || isEqualBounds(input.value, {
        northEast: latestBounds.getNorthEast().wrap(),
        southWest: latestBounds.getSouthWest().wrap()
      }),
      [input.value, latestBounds]
    );
    const gestureHandlingOptions = useMemo(
      () => ({
        locale: intl.locale
      }),
      [intl.locale]
    );
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(
        MapContainer,
        {
          className,
          bounds,
          whenReady: onMapReady,
          gestureHandling: true,
          gestureHandlingOptions,
          doubleClickZoom: true,
          worldCopyJump: true,
          children: [
            /* @__PURE__ */ jsx(TileLayer, { attribution: tileAttribution, url: tileUrl }),
            displayedMarkers ? data.map((entry) => /* @__PURE__ */ jsx(
              MarkerClusterIcon,
              {
                eventCount: entry.eventCount,
                latitude: entry.latitude,
                longitude: entry.longitude
              },
              entry.key
            )) : null,
            /* @__PURE__ */ jsx(OnMapMove, { onChange })
          ]
        }
      ),
      !disabledMapSearch ? /* @__PURE__ */ jsx(SearchHereControlComponent, { searchHere }) : null
    ] });
  }
);
var Map_default = Map;
export {
  Map_default as default
};
//# sourceMappingURL=Map.js.map