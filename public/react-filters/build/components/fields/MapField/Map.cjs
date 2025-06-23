var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/components/fields/MapField/Map.js
var Map_exports = {};
__export(Map_exports, {
  default: () => Map_default
});
module.exports = __toCommonJS(Map_exports);
var import_react3 = __toESM(require("react"), 1);
var import_classnames = __toESM(require("classnames"), 1);
var import_react_leaflet = require("react-leaflet");
var import_leaflet = __toESM(require("leaflet"), 1);
var import_react_intl3 = require("react-intl");
var import_leaflet_gesture_handling = require("@openagenda/leaflet-gesture-handling");
var import_react_final_form = require("react-final-form");

// src/contexts/FiltersAndWidgetsContext.js
var import_react = require("react");
var FiltersAndWidgetsContext = (0, import_react.createContext)({
  filters: [],
  widgets: [],
  setFilters: () => {
  },
  setWidgets: () => {
  },
  filtersOptions: {}
});
var FiltersAndWidgetsContext_default = FiltersAndWidgetsContext;

// src/components/fields/MapField/SearchHereControl.js
var import_react2 = require("@emotion/react");
var import_react_intl2 = require("react-intl");

// src/messages/map.js
var import_react_intl = require("react-intl");
var map_default = (0, import_react_intl.defineMessages)({
  searchHere: {
    id: "ReactFilters.messages.map.searchHere",
    defaultMessage: "Search here"
  }
});

// src/components/fields/MapField/SearchHereControl.js
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
function SearchHereControl({ searchHere }) {
  const intl = (0, import_react_intl2.useIntl)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      css: import_react2.css`
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        z-index: 400;
      `,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          onClick: searchHere,
          css: import_react2.css`
          outline: none;
          overflow: hidden;
          transition-duration: 0.2s;
          cursor: pointer;
          background: white;
          height: 24px;
          border-radius: 16px;
          padding: 0px 12px;
          box-shadow: rgba(0, 0, 0, 0.16) 0px 2px 8px 0px;
          border: 0px;

          &:hover {
            background-color: #f3f3f3;
          }

          &:active {
            background-color: #eaeaea;
          }
        `,
          children: intl.formatMessage(map_default.searchHere)
        }
      )
    }
  );
}

// src/components/fields/MapField/Map.js
var import_jsx_runtime2 = require("@emotion/react/jsx-runtime");
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
  const bounds = new import_leaflet.default.LatLngBounds(
    new import_leaflet.default.LatLng(value.northEast.lat, value.northEast.lng),
    new import_leaflet.default.LatLng(value.southWest.lat, value.southWest.lng)
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
  return new import_leaflet.default.LatLngBounds(
    new import_leaflet.default.LatLng(viewport.bottomRight.latitude, viewport.bottomRight.longitude),
    new import_leaflet.default.LatLng(viewport.topLeft.latitude, viewport.topLeft.longitude)
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
  return new import_leaflet.default.LatLngBounds(
    new import_leaflet.default.LatLng(south, west),
    new import_leaflet.default.LatLng(north, east)
  );
}
function convertToKFormat(intl, number) {
  if (number >= 1e3) {
    return `${intl.formatNumber((number / 1e3).toFixed(1))}k`;
  }
  return number.toString();
}
function MarkerClusterIcon({ latitude, longitude, eventCount }) {
  const intl = (0, import_react_intl3.useIntl)();
  const map = (0, import_react_leaflet.useMap)();
  const position = (0, import_react3.useMemo)(() => [latitude, longitude], [latitude, longitude]);
  const icon = (0, import_react3.useMemo)(
    () => new import_leaflet.default.DivIcon({
      html: `<div style="pointer-events: none;"><span>${convertToKFormat(intl, eventCount)}</span></div>`,
      className: (0, import_classnames.default)("marker-cluster leaflet-interactive", {
        "marker-cluster-small": eventCount < 10,
        "marker-cluster-medium": eventCount < 100,
        "marker-cluster-large": eventCount >= 100
      }),
      iconSize: new import_leaflet.default.Point(40, 40)
    }),
    [eventCount]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    import_react_leaflet.Marker,
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
  (0, import_react_leaflet.useMapEvents)({
    moveend() {
      onChange();
    }
  });
  return null;
}
var Map = import_react3.default.forwardRef(
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
    const intl = (0, import_react_intl3.useIntl)();
    const form = (0, import_react_final_form.useForm)();
    const {
      filtersOptions: { manualSubmit }
    } = (0, import_react3.useContext)(FiltersAndWidgetsContext_default);
    const mapRef = (0, import_react3.useRef)();
    const programmaticMoveRef = (0, import_react3.useRef)(false);
    const [viewport] = (0, import_react3.useState)(() => input.value ? valueToViewport(input.value) : initialViewport);
    const skipMoveRef = (0, import_react3.useRef)(true);
    const [data, setData] = (0, import_react3.useState)(() => []);
    const [displayedMarkers, setDisplayedMarkers] = (0, import_react3.useState)(false);
    const [bounds] = (0, import_react3.useState)(() => viewportToBounds(viewport || defaultViewport || worldViewport).pad(
      padRatio
    ));
    (0, import_react3.useImperativeHandle)(ref, () => ({
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
    const onMapReady = (0, import_react3.useCallback)(
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
    const searchHere = (0, import_react3.useCallback)(
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
    const [latestBounds, setLatestBounds] = (0, import_react3.useState)(false);
    const onChange = (0, import_react3.useCallback)(() => {
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
    const disabledMapSearch = (0, import_react3.useMemo)(
      () => !latestBounds || isEqualBounds(input.value, {
        northEast: latestBounds.getNorthEast().wrap(),
        southWest: latestBounds.getSouthWest().wrap()
      }),
      [input.value, latestBounds]
    );
    const gestureHandlingOptions = (0, import_react3.useMemo)(
      () => ({
        locale: intl.locale
      }),
      [intl.locale]
    );
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        import_react_leaflet.MapContainer,
        {
          className,
          bounds,
          whenReady: onMapReady,
          gestureHandling: true,
          gestureHandlingOptions,
          doubleClickZoom: true,
          worldCopyJump: true,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_leaflet.TileLayer, { attribution: tileAttribution, url: tileUrl }),
            displayedMarkers ? data.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              MarkerClusterIcon,
              {
                eventCount: entry.eventCount,
                latitude: entry.latitude,
                longitude: entry.longitude
              },
              entry.key
            )) : null,
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(OnMapMove, { onChange })
          ]
        }
      ),
      !disabledMapSearch ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(SearchHereControlComponent, { searchHere }) : null
    ] });
  }
);
var Map_default = Map;
//# sourceMappingURL=Map.cjs.map