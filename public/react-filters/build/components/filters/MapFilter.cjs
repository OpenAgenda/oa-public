var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
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

// src/contexts/FiltersAndWidgetsContext.js
var import_react, FiltersAndWidgetsContext, FiltersAndWidgetsContext_default;
var init_FiltersAndWidgetsContext = __esm({
  "src/contexts/FiltersAndWidgetsContext.js"() {
    import_react = require("react");
    FiltersAndWidgetsContext = (0, import_react.createContext)({
      filters: [],
      widgets: [],
      setFilters: () => {
      },
      setWidgets: () => {
      },
      filtersOptions: {}
    });
    FiltersAndWidgetsContext_default = FiltersAndWidgetsContext;
  }
});

// src/messages/map.js
var import_react_intl, map_default;
var init_map = __esm({
  "src/messages/map.js"() {
    import_react_intl = require("react-intl");
    map_default = (0, import_react_intl.defineMessages)({
      searchHere: {
        id: "ReactFilters.messages.map.searchHere",
        defaultMessage: "Search here"
      }
    });
  }
});

// src/components/fields/MapField/SearchHereControl.js
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
var import_react2, import_react_intl2, import_jsx_runtime;
var init_SearchHereControl = __esm({
  "src/components/fields/MapField/SearchHereControl.js"() {
    import_react2 = require("@emotion/react");
    import_react_intl2 = require("react-intl");
    init_map();
    import_jsx_runtime = require("@emotion/react/jsx-runtime");
  }
});

// src/components/fields/MapField/Map.js
var Map_exports = {};
__export(Map_exports, {
  default: () => Map_default
});
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
var import_react3, import_classnames, import_react_leaflet, import_leaflet, import_react_intl3, import_leaflet_gesture_handling, import_react_final_form, import_jsx_runtime2, padRatio, unpadRatio, worldViewport, Map, Map_default;
var init_Map = __esm({
  "src/components/fields/MapField/Map.js"() {
    import_react3 = __toESM(require("react"), 1);
    import_classnames = __toESM(require("classnames"), 1);
    import_react_leaflet = require("react-leaflet");
    import_leaflet = __toESM(require("leaflet"), 1);
    import_react_intl3 = require("react-intl");
    import_leaflet_gesture_handling = require("@openagenda/leaflet-gesture-handling");
    import_react_final_form = require("react-final-form");
    init_FiltersAndWidgetsContext();
    init_SearchHereControl();
    import_jsx_runtime2 = require("@emotion/react/jsx-runtime");
    padRatio = 0.2;
    unpadRatio = -(1 / ((1 + padRatio + padRatio) / padRatio));
    worldViewport = {
      bottomRight: {
        latitude: -90,
        longitude: 180
      },
      topLeft: {
        latitude: 90,
        longitude: -180
      }
    };
    Map = import_react3.default.forwardRef(
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
    Map_default = Map;
  }
});

// src/components/filters/MapFilter.js
var MapFilter_exports = {};
__export(MapFilter_exports, {
  default: () => MapFilter_default
});
module.exports = __toCommonJS(MapFilter_exports);
var import_react10 = __toESM(require("react"), 1);
var import_react_final_form3 = require("react-final-form");
var import_react_intl7 = require("react-intl");

// src/components/fields/MapField/index.js
var import_react4 = __toESM(require("react"), 1);
var import_react5 = require("@emotion/react");
var import_classnames2 = __toESM(require("classnames"), 1);

// src/components/fields/MapField/LoadableMap.js
var import_loadable = __toESM(require("@openagenda/react-shared/dist/utils/loadable.js"), 1);
var LoadableMapField = (0, import_loadable.default)(
  () => Promise.resolve().then(() => (init_Map(), Map_exports)),
  { ssr: false }
);
var LoadableMap_default = LoadableMapField;

// src/components/fields/MapField/mapStyle.js
var markerClusterStyle = {
  "& .marker-cluster-small": {
    backgroundColor: "rgba(181, 226, 140, 0.6)"
  },
  "& .marker-cluster-small div": {
    backgroundColor: "rgba(110, 204, 57, 0.6)"
  },
  "& .marker-cluster-medium": {
    backgroundColor: "rgba(241, 211, 87, 0.6)"
  },
  "& .marker-cluster-medium div": {
    backgroundColor: "rgba(240, 194, 12, 0.6)"
  },
  "& .marker-cluster-large": {
    backgroundColor: "rgba(253, 156, 115, 0.6)"
  },
  "& .marker-cluster-large div": {
    backgroundColor: "rgba(241, 128, 23, 0.6)"
  },
  "& .marker-cluster": {
    backgroundClip: "padding-box",
    borderRadius: "20px"
  },
  "& .marker-cluster div": {
    width: "30px",
    height: "30px",
    marginLeft: "5px",
    marginTop: "5px",
    textAlign: "center",
    borderRadius: "15px",
    font: "12px 'Helvetica Neue', Arial, Helvetica, sans-serif"
  },
  "& .marker-cluster span": {
    lineHeight: "30px"
  }
};
var gestureHandlingStyle = {
  "&.leaflet-gesture-handling:after": {
    color: "#fff",
    fontFamily: "Roboto, Arial, sans-serif",
    fontSize: "22px",
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    padding: "15px",
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    background: "rgba(0, 0, 0, .5)",
    zIndex: 1001,
    pointerEvents: "none",
    textAlign: "center",
    transition: "opacity .8s ease-in-out",
    opacity: 0,
    content: '""'
  },
  "&.leaflet-gesture-handling-warning:after": {
    transitionDuration: ".3s",
    opacity: 1
  },
  "&.leaflet-gesture-handling-touch:after": {
    content: "attr(data-gesture-handling-touch-content)"
  },
  "&.leaflet-gesture-handling-scroll:after": {
    content: "attr(data-gesture-handling-scroll-content)"
  }
};

// src/components/fields/MapField/index.js
var import_jsx_runtime3 = require("@emotion/react/jsx-runtime");
var mapContainerStyle = import_react5.css`
  position: relative;
`;
var mapStyle = import_react5.css`
  height: 100%;
  ${markerClusterStyle}
  ${gestureHandlingStyle}
`;
function MapField({
  input,
  collapsed,
  // name,
  filter,
  tileAttribution,
  tileUrl,
  loadGeoData,
  initialViewport,
  defaultViewport,
  className,
  mapClass
}, ref) {
  return !collapsed ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { css: mapContainerStyle, className: (0, import_classnames2.default)(className, mapClass), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    LoadableMap_default,
    {
      ref,
      input,
      filter,
      tileAttribution,
      tileUrl,
      loadGeoData,
      initialViewport,
      defaultViewport,
      css: mapStyle
    }
  ) }) : null;
}
var MapField_default = import_react4.default.forwardRef(MapField);

// src/components/Title.js
var import_react7 = __toESM(require("react"), 1);
var import_react_final_form2 = require("react-final-form");

// src/hooks/useFilterTitle.js
var import_react6 = require("react");
var import_react_intl5 = require("react-intl");

// src/utils/getFilterTitle.js
var import_intl = require("@openagenda/intl");

// src/messages/filterTitles.js
var import_react_intl4 = require("react-intl");
var filterTitles_default = (0, import_react_intl4.defineMessages)({
  geo: {
    id: "ReactFilters.messages.filterTitles.geo",
    defaultMessage: "Map"
  },
  search: {
    id: "ReactFilters.messages.filterTitles.search",
    defaultMessage: "Search"
  },
  addMethod: {
    id: "ReactFilters.messages.filterTitles.addMethod",
    defaultMessage: "Provenance"
  },
  memberUid: {
    id: "ReactFilters.messages.filterTitles.memberUid",
    defaultMessage: "Member"
  },
  locationUid: {
    id: "ReactFilters.messages.filterTitles.locationUid",
    defaultMessage: "Location"
  },
  sourceAgendaUid: {
    id: "ReactFilters.messages.filterTitles.sourceAgendaUid",
    defaultMessage: "Source agenda"
  },
  originAgendaUid: {
    id: "ReactFilters.messages.filterTitles.originAgendaUid",
    defaultMessage: "Origin agenda"
  },
  featured: {
    id: "ReactFilters.messages.filterTitles.featured",
    defaultMessage: "Featured"
  },
  relative: {
    id: "ReactFilters.messages.filterTitles.relative",
    defaultMessage: "Passed / current / upcoming"
  },
  region: {
    id: "ReactFilters.messages.filterTitles.region",
    defaultMessage: "Region"
  },
  department: {
    id: "ReactFilters.messages.filterTitles.department",
    defaultMessage: "Department"
  },
  countryCode: {
    id: "ReactFilters.messages.filterTitles.countryCode",
    defaultMessage: "Country"
  },
  city: {
    id: "ReactFilters.messages.filterTitles.city",
    defaultMessage: "City"
  },
  adminLevel3: {
    id: "ReactFilters.messages.filterTitles.adminLevel3",
    defaultMessage: "Administrative level 3"
  },
  timings: {
    id: "ReactFilters.messages.filterTitles.timings",
    defaultMessage: "Date"
  },
  createdAt: {
    id: "ReactFilters.messages.filterTitles.createdAt",
    defaultMessage: "Creation date"
  },
  updatedAt: {
    id: "ReactFilters.messages.filterTitles.updatedAt",
    defaultMessage: "Date of update"
  },
  keyword: {
    id: "ReactFilters.messages.filterTitles.keyword",
    defaultMessage: "Keywords"
  },
  state: {
    id: "ReactFilters.messages.filterTitles.state",
    defaultMessage: "State"
  },
  attendanceMode: {
    id: "ReactFilters.messages.filterTitles.attendanceMode",
    defaultMessage: "Attendance mode"
  },
  status: {
    id: "ReactFilters.messages.filterTitles.status",
    defaultMessage: "Status"
  },
  district: {
    id: "ReactFilters.messages.filterTitles.district",
    defaultMessage: "District"
  },
  accessibility: {
    id: "ReactFilters.messages.filterTitles.accessibility",
    defaultMessage: "Accessibility"
  },
  languages: {
    id: "ReactFilters.messages.filterTitles.languages",
    defaultMessage: "Languages"
  }
});

// src/utils/getFilterTitle.js
function getFilterTitle(intl, providedMessages, messageKey, fieldSchema) {
  const messages3 = providedMessages ?? filterTitles_default;
  if (fieldSchema == null ? void 0 : fieldSchema.label) {
    return (0, import_intl.getLocaleValue)(fieldSchema.label, intl.locale);
  }
  if (messages3[messageKey]) {
    return intl.formatMessage(messages3[messageKey]);
  }
  return messageKey;
}

// src/hooks/useFilterTitle.js
function useFilterTitle(messageKey, fieldSchema, messages3) {
  const intl = (0, import_react_intl5.useIntl)();
  return (0, import_react6.useMemo)(
    () => getFilterTitle(intl, messages3, messageKey, fieldSchema),
    [intl, messages3, messageKey, fieldSchema]
  );
}

// src/components/Title.js
var import_jsx_runtime4 = require("@emotion/react/jsx-runtime");
var subscription = { value: true };
function Title({ name, filter, component, ...rest }) {
  var _a;
  const title = useFilterTitle(name, filter.fieldSchema);
  const field = (0, import_react_final_form2.useField)(name, { subscription });
  const { input } = field;
  if (!((_a = input.value) == null ? void 0 : _a.length) && !(typeof input.value === "object" && input.value !== null)) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: title });
  }
  if (!component) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex-auto", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "padding-right-xs", children: title }),
    import_react7.default.createElement(component, {
      name,
      filter,
      className: "oa-filter-value-preview",
      withTitle: false,
      ...rest
    })
  ] });
}

// src/components/Panel.js
var import_react8 = require("react");
var import_classnames3 = __toESM(require("classnames"), 1);
var import_a11yButtonActionHandler = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);
var import_jsx_runtime5 = require("@emotion/react/jsx-runtime");
function Panel({
  collapsed = true,
  setCollapsed,
  header,
  children
}) {
  const internalState = (0, import_react8.useState)(collapsed);
  const value = typeof setCollapsed === "function" ? collapsed : internalState[0];
  const updater = typeof setCollapsed === "function" ? setCollapsed : internalState[1];
  const toggleCollapsed = (0, import_react8.useMemo)(
    () => (0, import_a11yButtonActionHandler.default)((e) => {
      e.preventDefault();
      updater((v) => !v);
    }),
    [updater]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    "div",
    {
      className: (0, import_classnames3.default)("oa-collapse-item", { "oa-collapse-item-active": !value }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
          "div",
          {
            className: "oa-collapse-header",
            role: "tab",
            tabIndex: "0",
            "aria-expanded": !value,
            onClick: toggleCollapsed,
            onKeyPress: toggleCollapsed,
            children: [
              header,
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "oa-collapse-arrow", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                "i",
                {
                  className: (0, import_classnames3.default)("fa fa-lg", {
                    "fa-angle-up": !value,
                    "fa-angle-down": value
                  }),
                  "aria-hidden": "true"
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "div",
          {
            className: (0, import_classnames3.default)("oa-collapse-content", {
              "oa-collapse-content-active": !value,
              "oa-collapse-content-inactive": value
            }),
            role: "tabpanel",
            children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "oa-collapse-content-box", children })
          }
        )
      ]
    }
  );
}

// src/components/ValueBadge.js
var import_classnames4 = __toESM(require("classnames"), 1);
var import_react_intl6 = require("react-intl");
var import_react9 = require("@emotion/react");
var import_intl2 = require("@openagenda/intl");
var import_jsx_runtime6 = require("@emotion/react/jsx-runtime");
var messages = (0, import_react_intl6.defineMessages)({
  removeFilter: {
    id: "ReactFilters.ValueBadge.removeFilter",
    defaultMessage: "Remove filter"
  },
  removeFilterWithTitle: {
    id: "ReactFilters.ValueBadge.removeFilterWithTitle",
    defaultMessage: "Remove filter ({title})"
  }
});
function ValueBadge({ label, title, onRemove, disabled }) {
  const intl = (0, import_react_intl6.useIntl)();
  const titleLabel = (title == null ? void 0 : title.length) ? intl.formatMessage(messages.removeFilterWithTitle, { title }) : intl.formatMessage(messages.removeFilter);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
    "button",
    {
      type: "button",
      title: titleLabel,
      className: (0, import_classnames4.default)("btn badge badge-pill badge-info margin-right-xs", {
        disabled
      }),
      css: import_react9.css`
        line-height: 18px;
        padding-top: 0;
        padding-bottom: 0;

        :hover {
          color: #da4453;
          border-color: #d43f3a;
        }
      `,
      onClick: onRemove,
      children: [
        (0, import_intl2.getLocaleValue)(label, intl.locale),
        "\xA0",
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("i", { className: "fa fa-times", "aria-hidden": "true" })
      ]
    }
  );
}

// src/components/FilterPreviewer.js
var import_jsx_runtime7 = require("@emotion/react/jsx-runtime");
function FilterPreviewer({
  withTitle = true,
  name,
  filter,
  label,
  valueOptions,
  onRemove,
  disabled,
  className
}) {
  const title = useFilterTitle(name, filter.fieldSchema);
  if (valueOptions == null ? void 0 : valueOptions.length) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_jsx_runtime7.Fragment, { children: valueOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      ValueBadge,
      {
        label: option.label,
        onRemove: onRemove(option),
        disabled,
        title: withTitle ? title : null
      }
    ) }, option.value)) });
  }
  if (label) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      ValueBadge,
      {
        label,
        onRemove,
        disabled,
        title: withTitle ? title : null
      }
    ) });
  }
  return null;
}

// src/components/filters/MapFilter.js
var import_jsx_runtime8 = require("@emotion/react/jsx-runtime");
var subscription2 = { value: true };
var messages2 = (0, import_react_intl7.defineMessages)({
  previewLabel: {
    id: "ReactFilters.filters.MapFilter.previewLabel",
    defaultMessage: "Map"
  }
});
function Preview({
  name,
  filter,
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = (0, import_react_intl7.useIntl)();
  const { input } = (0, import_react_final_form3.useField)(name, { subscription: subscription2 });
  const onRemove = (0, import_react10.useCallback)(
    (e) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      input.onChange(void 0);
    },
    [input, disabled]
  );
  if (!input.value || input.value === "") {
    return null;
  }
  return import_react10.default.createElement(component, {
    name,
    filter,
    label: intl.formatMessage(messages2.previewLabel),
    onRemove,
    disabled,
    ...rest
  });
}
function MapFilter({
  name,
  filter,
  disabled,
  collapsed,
  className,
  component = MapField_default,
  ...rest
}, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    import_react_final_form3.Field,
    {
      collapsed,
      ref,
      name,
      subscription: subscription2,
      component,
      filter,
      disabled,
      className,
      ...rest
    }
  );
}
var Collapsable = import_react10.default.forwardRef(function Collapsable2({ name, filter, disabled, ...rest }, ref) {
  const [collapsed, setCollapsed] = (0, import_react10.useState)(true);
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    Panel,
    {
      header: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        Title,
        {
          name,
          filter,
          component: Preview,
          disabled
        }
      ),
      collapsed,
      setCollapsed,
      children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        MapFilter,
        {
          ref,
          name,
          filter,
          disabled,
          collapsed,
          ...rest
        }
      )
    }
  );
});
var exported = import_react10.default.memo(import_react10.default.forwardRef(MapFilter));
exported.Preview = Preview;
exported.Collapsable = Collapsable;
var MapFilter_default = exported;
//# sourceMappingURL=MapFilter.cjs.map