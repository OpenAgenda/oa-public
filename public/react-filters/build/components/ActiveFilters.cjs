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
var import_react_intl15, map_default;
var init_map = __esm({
  "src/messages/map.js"() {
    import_react_intl15 = require("react-intl");
    map_default = (0, import_react_intl15.defineMessages)({
      searchHere: {
        id: "ReactFilters.messages.map.searchHere",
        defaultMessage: "Search here"
      }
    });
  }
});

// src/components/fields/MapField/SearchHereControl.js
function SearchHereControl({ searchHere }) {
  const intl = (0, import_react_intl16.useIntl)();
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
    "div",
    {
      css: import_react23.css`
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        z-index: 400;
      `,
      children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
        "button",
        {
          type: "button",
          onClick: searchHere,
          css: import_react23.css`
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
var import_react23, import_react_intl16, import_jsx_runtime18;
var init_SearchHereControl = __esm({
  "src/components/fields/MapField/SearchHereControl.js"() {
    import_react23 = require("@emotion/react");
    import_react_intl16 = require("react-intl");
    init_map();
    import_jsx_runtime18 = require("@emotion/react/jsx-runtime");
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
  const intl = (0, import_react_intl17.useIntl)();
  const map = (0, import_react_leaflet.useMap)();
  const position = (0, import_react24.useMemo)(() => [latitude, longitude], [latitude, longitude]);
  const icon = (0, import_react24.useMemo)(
    () => new import_leaflet.default.DivIcon({
      html: `<div style="pointer-events: none;"><span>${convertToKFormat(intl, eventCount)}</span></div>`,
      className: (0, import_classnames5.default)("marker-cluster leaflet-interactive", {
        "marker-cluster-small": eventCount < 10,
        "marker-cluster-medium": eventCount < 100,
        "marker-cluster-large": eventCount >= 100
      }),
      iconSize: new import_leaflet.default.Point(40, 40)
    }),
    [eventCount]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
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
var import_react24, import_classnames5, import_react_leaflet, import_leaflet, import_react_intl17, import_leaflet_gesture_handling, import_react_final_form10, import_jsx_runtime19, padRatio, unpadRatio, worldViewport, Map, Map_default;
var init_Map = __esm({
  "src/components/fields/MapField/Map.js"() {
    import_react24 = __toESM(require("react"), 1);
    import_classnames5 = __toESM(require("classnames"), 1);
    import_react_leaflet = require("react-leaflet");
    import_leaflet = __toESM(require("leaflet"), 1);
    import_react_intl17 = require("react-intl");
    import_leaflet_gesture_handling = require("@openagenda/leaflet-gesture-handling");
    import_react_final_form10 = require("react-final-form");
    init_FiltersAndWidgetsContext();
    init_SearchHereControl();
    import_jsx_runtime19 = require("@emotion/react/jsx-runtime");
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
    Map = import_react24.default.forwardRef(
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
        const intl = (0, import_react_intl17.useIntl)();
        const form = (0, import_react_final_form10.useForm)();
        const {
          filtersOptions: { manualSubmit }
        } = (0, import_react24.useContext)(FiltersAndWidgetsContext_default);
        const mapRef = (0, import_react24.useRef)();
        const programmaticMoveRef = (0, import_react24.useRef)(false);
        const [viewport] = (0, import_react24.useState)(() => input.value ? valueToViewport(input.value) : initialViewport);
        const skipMoveRef = (0, import_react24.useRef)(true);
        const [data, setData] = (0, import_react24.useState)(() => []);
        const [displayedMarkers, setDisplayedMarkers] = (0, import_react24.useState)(false);
        const [bounds] = (0, import_react24.useState)(() => viewportToBounds(viewport || defaultViewport || worldViewport).pad(
          padRatio
        ));
        (0, import_react24.useImperativeHandle)(ref, () => ({
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
        const onMapReady = (0, import_react24.useCallback)(
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
        const searchHere = (0, import_react24.useCallback)(
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
        const [latestBounds, setLatestBounds] = (0, import_react24.useState)(false);
        const onChange = (0, import_react24.useCallback)(() => {
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
        const disabledMapSearch = (0, import_react24.useMemo)(
          () => !latestBounds || isEqualBounds(input.value, {
            northEast: latestBounds.getNorthEast().wrap(),
            southWest: latestBounds.getSouthWest().wrap()
          }),
          [input.value, latestBounds]
        );
        const gestureHandlingOptions = (0, import_react24.useMemo)(
          () => ({
            locale: intl.locale
          }),
          [intl.locale]
        );
        return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(import_jsx_runtime19.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
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
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_react_leaflet.TileLayer, { attribution: tileAttribution, url: tileUrl }),
                displayedMarkers ? data.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
                  MarkerClusterIcon,
                  {
                    eventCount: entry.eventCount,
                    latitude: entry.latitude,
                    longitude: entry.longitude
                  },
                  entry.key
                )) : null,
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(OnMapMove, { onChange })
              ]
            }
          ),
          !disabledMapSearch ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(SearchHereControlComponent, { searchHere }) : null
        ] });
      }
    );
    Map_default = Map;
  }
});

// src/components/ActiveFilters.js
var ActiveFilters_exports = {};
__export(ActiveFilters_exports, {
  default: () => ActiveFilters
});
module.exports = __toCommonJS(ActiveFilters_exports);

// src/hooks/useActiveFilters.js
var import_react_final_form3 = require("react-final-form");
var import_react9 = require("react");

// src/utils/staticRangesFirst.js
function staticRangesFirst(a, b) {
  if (a.staticRanges && !b.staticRanges) {
    return -1;
  }
  if (!a.staticRanges && b.staticRanges) {
    return 1;
  }
  return 0;
}

// src/utils/customFirst.js
function customFirst(a, b) {
  if (a.type === "custom" && b.type !== "custom") {
    return -1;
  }
  if (a.type !== "custom" && b.type === "custom") {
    return 1;
  }
  return 0;
}

// src/components/filters/DateRangeFilter.js
var import_react8 = __toESM(require("react"), 1);
var import_react_final_form2 = require("react-final-form");
var import_react_intl5 = require("react-intl");
var import_date_fns2 = require("date-fns");
var import_date_fns_tz = require("date-fns-tz");

// src/components/fields/DateRangePicker.js
var import_isEqual = __toESM(require("lodash/isEqual.js"), 1);
var import_isDate = __toESM(require("lodash/isDate.js"), 1);
var import_react3 = __toESM(require("react"), 1);
var import_react_intl = require("react-intl");
var import_useIsomorphicLayoutEffect = __toESM(require("react-use/lib/useIsomorphicLayoutEffect.js"), 1);
var import_useLatest = __toESM(require("react-use/lib/useLatest.js"), 1);
var import_usePrevious = __toESM(require("react-use/lib/usePrevious.js"), 1);
var import_classnames = __toESM(require("classnames"), 1);
var import_date_fns = require("date-fns");
var import_en_US = __toESM(require("date-fns/locale/en-US/index.js"), 1);
var import_react_date_range = require("@openagenda/react-date-range");
var import_intl = require("@openagenda/intl");
init_FiltersAndWidgetsContext();

// src/utils/convertPhpDateFormatToDateFns.js
function convertPhpDateFormatToDateFns(phpFormat) {
  const formatMapping = {
    // Days
    d: "dd",
    // Day of the month, 2 digits with leading zeros (01 to 31)
    D: "EEE",
    // A textual representation of a day (Mon through Sun)
    j: "d",
    // Day of the month without leading zeros (1 to 31)
    l: "EEEE",
    // A full textual representation of the day of the week (Sunday through Saturday)
    N: "i",
    // ISO-8601 numeric representation of the day of the week (1 for Monday through 7 for Sunday)
    S: "o",
    // English ordinal suffix for the day of the month, 2 characters (st, nd, rd or th)
    w: "e",
    // Numeric representation of the day of the week (0 for Sunday through 6 for Saturday)
    z: "D",
    // The day of the year (starting from 0) (0 through 365)
    // Weeks
    W: "I",
    // ISO-8601 week number of year, weeks starting on Monday
    // Months
    F: "MMMM",
    // A full textual representation of a month (January through December)
    m: "MM",
    // Numeric representation of a month, with leading zeros (01 to 12)
    M: "MMM",
    // A short textual representation of a month (Jan through Dec)
    n: "M",
    // Numeric representation of a month, without leading zeros (1 to 12)
    t: "",
    // Number of days in the given month (28 through 31) (no direct equivalent in date-fns)
    // Years
    L: "",
    // Whether it's a leap year (1 if it is a leap year, 0 otherwise) (no direct equivalent in date-fns)
    o: "RRRR",
    // ISO-8601 week-numbering year (4 digits)
    Y: "yyyy",
    // A full numeric representation of a year, 4 digits
    y: "yy",
    // A two digit representation of a year
    // Time
    a: "aaa",
    // Lowercase Ante meridiem and Post meridiem (am or pm)
    A: "a",
    // Uppercase Ante meridiem and Post meridiem (AM or PM)
    B: "",
    // Swatch Internet time (000 through 999) (no direct equivalent in date-fns)
    g: "h",
    // 12-hour format of an hour without leading zeros (1 through 12)
    G: "H",
    // 24-hour format of an hour without leading zeros (0 through 23)
    h: "hh",
    // 12-hour format of an hour with leading zeros (01 through 12)
    H: "HH",
    // 24-hour format of an hour with leading zeros (00 through 23)
    i: "mm",
    // Minutes with leading zeros (00 to 59)
    s: "ss",
    // Seconds with leading zeros (00 through 59)
    u: "SSS",
    // Microseconds (added as milliseconds in date-fns)
    // Timezone
    e: "zzz",
    // Timezone identifier (e.g., America/Los_Angeles) (not directly supported, use zzz for generic support)
    T: "zz",
    // Timezone abbreviation (e.g., MST)
    Z: "X"
    // Timezone offset in seconds (e.g., -43200 to 43200)
  };
  let dateFnsFormat = "";
  let inLiteral = false;
  for (let i = 0; i < phpFormat.length; i++) {
    const char = phpFormat[i];
    if (char === "\\") {
      if (!inLiteral) {
        dateFnsFormat += "'";
        inLiteral = true;
      }
      i += 1;
      dateFnsFormat += phpFormat[i] || "";
      continue;
    }
    if (inLiteral) {
      dateFnsFormat += "'";
      inLiteral = false;
    }
    if (formatMapping[char] !== void 0) {
      dateFnsFormat += formatMapping[char];
    } else {
      dateFnsFormat += char;
    }
  }
  if (inLiteral) {
    dateFnsFormat += "'";
  }
  return dateFnsFormat;
}

// src/hooks/useLoadTimingsData.js
var import_react2 = require("react");
var import_qs = __toESM(require("qs"), 1);

// src/utils/getQuerySeparator.js
function getQuerySeparator(url) {
  try {
    const urlObj = new URL(url, "http://n");
    return urlObj.search ? "&" : "?";
  } catch (error) {
    console.error("Invalid URL:", error);
    return "?";
  }
}

// src/hooks/useLoadTimingsData.js
function useLoadTimingsData(res, queryOrFn, options = {}) {
  const { searchMethod = "get" } = options;
  return (0, import_react2.useCallback)(
    async (additionalQuery = {}, { interval, timezone } = {}) => {
      const query = typeof queryOrFn === "function" ? queryOrFn() : queryOrFn;
      const params = {
        // oaq: { passed: 1 },
        size: 0,
        ...query,
        ...additionalQuery,
        aggregations: [
          {
            type: "timings",
            // size: 2000,
            interval,
            timezone
          }
        ]
      };
      const result = await (searchMethod === "get" ? fetch(
        `${res}${getQuerySeparator(res)}${import_qs.default.stringify(params, {
          skipNulls: true
        })}`
      ) : fetch(res, {
        method: "post",
        body: JSON.stringify(params),
        headers: {
          "Content-Type": "application/json"
        }
      })).then((r) => {
        if (r.ok) return r.json();
        throw new Error("Can't load timings data");
      });
      return result.aggregations.timings;
    },
    [res, queryOrFn, searchMethod]
  );
}

// src/components/fields/DateRangePicker.js
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
var useIsomorphicLayoutEffect = import_useIsomorphicLayoutEffect.default.default || import_useIsomorphicLayoutEffect.default;
var useLatest = import_useLatest.default.default || import_useLatest.default;
var usePrevious = import_usePrevious.default.default || import_usePrevious.default;
var dateDisplayFormats = {
  en: "MMM d, yyyy",
  // Jan 1, 2024
  fr: "d MMM yyyy",
  // 1 janv. 2024
  de: "d. MMM yyyy",
  // 1. Jan. 2024
  it: "d MMM yyyy",
  // 1 gen 2024
  es: "d MMM yyyy"
  // 1 ene 2024
};
var defaultGetInitialValue = () => [
  {
    startDate: null,
    endDate: -1,
    key: "selection"
  }
];
function normalizeValue(value) {
  if (!(value == null ? void 0 : value.length)) {
    return value;
  }
  return value.map((v) => ({
    startDate: (0, import_isDate.default)(v.startDate) ? v.startDate.getTime() : v.startDate,
    endDate: (0, import_isDate.default)(v.endDate) ? v.endDate.getTime() : v.endDate,
    key: v.key
  }));
}
function getDateDisplayFormat(dateFormatStyle, dateFormat, locale) {
  if (dateFormat) {
    return dateFormatStyle === "php" ? convertPhpDateFormatToDateFns(dateFormat) : dateFormat;
  }
  const fallbackChain = (0, import_intl.getFallbackChain)(locale);
  for (const fallback of fallbackChain) {
    if (dateDisplayFormats[fallback]) {
      return dateDisplayFormats[fallback];
    }
  }
  return dateDisplayFormats[Object.keys(dateDisplayFormats).shift()];
}
function focusedDateToTimingsQuery(focusedDate) {
  return {
    gte: (0, import_date_fns.startOfMonth)(focusedDate),
    lte: (0, import_date_fns.endOfMonth)(focusedDate),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}
function DateRangePicker({
  input,
  meta,
  staticRanges = [],
  inputRanges = [],
  rangeColor = "#41acdd",
  disabled,
  className,
  dateFormatStyle,
  dateFormat,
  minDate,
  maxDate,
  shownDate,
  getQuery,
  ...otherProps
}, ref) {
  const intl = (0, import_react_intl.useIntl)();
  const dateRangeRef = (0, import_react3.useRef)(null);
  const [data, setData] = (0, import_react3.useState)(() => []);
  const {
    filtersOptions: { dateFnsLocale, searchMethod, res }
  } = (0, import_react3.useContext)(FiltersAndWidgetsContext_default);
  const [ranges, setRanges] = (0, import_react3.useState)(
    () => input.value ?? defaultGetInitialValue()
  );
  const [dragStatus, setDragStatus] = (0, import_react3.useState)(false);
  const [focusedRange, setFocusedRange] = (0, import_react3.useState)([0, 0]);
  const latestRanges = useLatest(ranges);
  const latestFocusedRange = useLatest(focusedRange);
  const previousValue = usePrevious(input.value);
  const { onChange } = input;
  const onSelectPreviewChange = (0, import_react3.useCallback)(
    (value) => {
      var _a;
      const dateRange = dateRangeRef.current;
      setDragStatus((_a = dateRangeRef.current) == null ? void 0 : _a.calendar.state.drag.status);
      dateRange.updatePreview(value ? dateRange.calcNewSelection(value) : null);
    },
    [dateRangeRef]
  );
  const onDefinedPreviewChange = (0, import_react3.useCallback)(
    (value) => {
      const dateRange = dateRangeRef.current;
      return dateRange.updatePreview(
        value ? dateRange.calcNewSelection(value, typeof value === "string") : null
      );
    },
    [dateRangeRef]
  );
  const onTemporaryChange = (0, import_react3.useCallback)(
    (item) => {
      const value = [(item == null ? void 0 : item.selection) ? item.selection : item.range1];
      setRanges(value);
      if (latestFocusedRange.current[0] === 0 && latestFocusedRange.current[1] === 0 && value[0].startDate.getTime() !== value[0].endDate.getTime()) {
        onChange(value);
      }
      if (latestFocusedRange.current[0] === 0 && latestFocusedRange.current[1] === 1) {
        onChange(value);
      }
    },
    [latestFocusedRange, onChange]
  );
  const onDefinedRangeChange = (0, import_react3.useCallback)(
    (item) => {
      const value = [(item == null ? void 0 : item.selection) ? item.selection : item.range1];
      setRanges(value);
      onChange(value);
    },
    [onChange]
  );
  const disabledDay = (0, import_react3.useCallback)(() => disabled, [disabled]);
  const rdrNoSelection = (0, import_react3.useMemo)(() => {
    const range = ranges == null ? void 0 : ranges[0];
    const hasRange = range && range.endDate !== null;
    return !hasRange && !dragStatus;
  }, [ranges, dragStatus]);
  const [focusedDate, setFocusedDate] = (0, import_react3.useState)(null);
  const loadTimingsData = useLoadTimingsData(res, getQuery, { searchMethod });
  useIsomorphicLayoutEffect(() => {
    if (previousValue && !(0, import_isEqual.default)(normalizeValue(input.value), normalizeValue(previousValue)) && !(0, import_isEqual.default)(
      normalizeValue(input.value),
      normalizeValue(latestRanges.current)
    )) {
      setRanges(input.value);
    }
  }, [input.value, previousValue, latestRanges, dateRangeRef, shownDate]);
  const onShownDateChange = async (newFocusedDate) => {
    if (input.name !== "timings") {
      return;
    }
    setFocusedDate(newFocusedDate);
  };
  useIsomorphicLayoutEffect(() => {
    var _a, _b;
    if (input.name !== "timings" || !dateRangeRef.current) {
      return;
    }
    const newFocused = (_b = (_a = dateRangeRef.current.calendar) == null ? void 0 : _a.state) == null ? void 0 : _b.focusedDate;
    if (focusedDate !== newFocused) {
      setFocusedDate(newFocused);
    }
  }, [dateRangeRef, focusedDate, input.name]);
  (0, import_react3.useEffect)(() => {
    if (!focusedDate) {
      return;
    }
    loadTimingsData(
      {
        timings: focusedDateToTimingsQuery(focusedDate)
      },
      {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    ).then((newData) => setData(newData ?? [])).catch((err) => {
      console.log("Failed to load timings data", err);
    });
  }, [focusedDate]);
  (0, import_react3.useImperativeHandle)(ref, () => ({
    onQueryChange: () => {
      var _a, _b, _c, _d, _e, _f;
      if (focusedDate !== ((_b = (_a = dateRangeRef.current.calendar) == null ? void 0 : _a.state) == null ? void 0 : _b.focusedDate)) {
        setFocusedDate((_d = (_c = dateRangeRef.current.calendar) == null ? void 0 : _c.state) == null ? void 0 : _d.focusedDate);
      } else {
        loadTimingsData(
          {
            timings: focusedDateToTimingsQuery(
              (_f = (_e = dateRangeRef.current.calendar) == null ? void 0 : _e.state) == null ? void 0 : _f.focusedDate
            )
          },
          {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        ).then((newData) => setData(newData ?? [])).catch((err) => {
          console.log("Failed to load timings data", err);
        });
      }
    }
  }));
  const dayContentRenderer = (0, import_react3.useCallback)(
    (day) => {
      const isActive = data.find(
        (d) => (0, import_date_fns.isSameDay)(new Date(d.key), day) && d.timingCount > 0
      );
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          className: isActive ? "rdrDayWithTimings" : "rdrDayWithoutTimings",
          children: (0, import_date_fns.format)(day, "d")
        }
      );
    },
    [data]
  );
  const dateRangePickerProps = {
    showSelectionPreview: true,
    showMonthName: false,
    moveRangeOnFirstSelection: false,
    months: 1,
    ranges,
    direction: "horizontal",
    locale: dateFnsLocale || import_en_US.default,
    staticRanges,
    inputRanges,
    focusedRange,
    onRangeFocusChange: setFocusedRange,
    rangeColors: [rangeColor],
    minDate: minDate ? new Date(minDate) : void 0,
    maxDate: maxDate ? new Date(maxDate) : void 0,
    shownDate: shownDate ? new Date(shownDate) : void 0,
    onShownDateChange,
    dayContentRenderer,
    ...otherProps
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      className: (0, import_classnames.default)("rdrDateRangePickerWrapper", className, { rdrNoSelection }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_react_date_range.DateRange,
          {
            onPreviewChange: onSelectPreviewChange,
            onRangeFocusChange: setFocusedRange,
            ...dateRangePickerProps,
            onChange: onTemporaryChange,
            ref: dateRangeRef,
            className: void 0,
            disabledDay,
            dateDisplayFormat: getDateDisplayFormat(
              dateFormatStyle,
              dateFormat,
              intl.locale
            )
          }
        ),
        staticRanges.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_react_date_range.DefinedRange,
          {
            onPreviewChange: onDefinedPreviewChange,
            ...dateRangePickerProps,
            range: ranges[focusedRange[0]],
            onChange: onDefinedRangeChange,
            className: void 0
          }
        ) : null
      ]
    }
  );
}
var DateRangePicker_default = import_react3.default.forwardRef(DateRangePicker);

// src/components/Title.js
var import_react5 = __toESM(require("react"), 1);
var import_react_final_form = require("react-final-form");

// src/hooks/useFilterTitle.js
var import_react4 = require("react");
var import_react_intl3 = require("react-intl");

// src/utils/getFilterTitle.js
var import_intl2 = require("@openagenda/intl");

// src/messages/filterTitles.js
var import_react_intl2 = require("react-intl");
var filterTitles_default = (0, import_react_intl2.defineMessages)({
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
  const messages11 = providedMessages ?? filterTitles_default;
  if (fieldSchema == null ? void 0 : fieldSchema.label) {
    return (0, import_intl2.getLocaleValue)(fieldSchema.label, intl.locale);
  }
  if (messages11[messageKey]) {
    return intl.formatMessage(messages11[messageKey]);
  }
  return messageKey;
}

// src/hooks/useFilterTitle.js
function useFilterTitle(messageKey, fieldSchema, messages11) {
  const intl = (0, import_react_intl3.useIntl)();
  return (0, import_react4.useMemo)(
    () => getFilterTitle(intl, messages11, messageKey, fieldSchema),
    [intl, messages11, messageKey, fieldSchema]
  );
}

// src/components/Title.js
var import_jsx_runtime2 = require("@emotion/react/jsx-runtime");
var subscription = { value: true };
function Title({ name, filter, component, ...rest }) {
  var _a;
  const title = useFilterTitle(name, filter.fieldSchema);
  const field = (0, import_react_final_form.useField)(name, { subscription });
  const { input } = field;
  if (!((_a = input.value) == null ? void 0 : _a.length) && !(typeof input.value === "object" && input.value !== null)) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { children: title });
  }
  if (!component) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex-auto", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "padding-right-xs", children: title }),
    import_react5.default.createElement(component, {
      name,
      filter,
      className: "oa-filter-value-preview",
      withTitle: false,
      ...rest
    })
  ] });
}

// src/components/Panel.js
var import_react6 = require("react");
var import_classnames2 = __toESM(require("classnames"), 1);
var import_a11yButtonActionHandler = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);
var import_jsx_runtime3 = require("@emotion/react/jsx-runtime");
function Panel({
  collapsed = true,
  setCollapsed,
  header,
  children
}) {
  const internalState = (0, import_react6.useState)(collapsed);
  const value = typeof setCollapsed === "function" ? collapsed : internalState[0];
  const updater = typeof setCollapsed === "function" ? setCollapsed : internalState[1];
  const toggleCollapsed = (0, import_react6.useMemo)(
    () => (0, import_a11yButtonActionHandler.default)((e) => {
      e.preventDefault();
      updater((v) => !v);
    }),
    [updater]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: (0, import_classnames2.default)("oa-collapse-item", { "oa-collapse-item-active": !value }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
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
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "oa-collapse-arrow", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "i",
                {
                  className: (0, import_classnames2.default)("fa fa-lg", {
                    "fa-angle-up": !value,
                    "fa-angle-down": value
                  }),
                  "aria-hidden": "true"
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "div",
          {
            className: (0, import_classnames2.default)("oa-collapse-content", {
              "oa-collapse-content-active": !value,
              "oa-collapse-content-inactive": value
            }),
            role: "tabpanel",
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oa-collapse-content-box", children })
          }
        )
      ]
    }
  );
}

// src/components/ValueBadge.js
var import_classnames3 = __toESM(require("classnames"), 1);
var import_react_intl4 = require("react-intl");
var import_react7 = require("@emotion/react");
var import_intl3 = require("@openagenda/intl");
var import_jsx_runtime4 = require("@emotion/react/jsx-runtime");
var messages = (0, import_react_intl4.defineMessages)({
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
  const intl = (0, import_react_intl4.useIntl)();
  const titleLabel = (title == null ? void 0 : title.length) ? intl.formatMessage(messages.removeFilterWithTitle, { title }) : intl.formatMessage(messages.removeFilter);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "button",
    {
      type: "button",
      title: titleLabel,
      className: (0, import_classnames3.default)("btn badge badge-pill badge-info margin-right-xs", {
        disabled
      }),
      css: import_react7.css`
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
        (0, import_intl3.getLocaleValue)(label, intl.locale),
        "\xA0",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("i", { className: "fa fa-times", "aria-hidden": "true" })
      ]
    }
  );
}

// src/components/FilterPreviewer.js
var import_jsx_runtime5 = require("@emotion/react/jsx-runtime");
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
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_jsx_runtime5.Fragment, { children: valueOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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

// src/components/filters/DateRangeFilter.js
var import_jsx_runtime6 = require("@emotion/react/jsx-runtime");
var messages2 = (0, import_react_intl5.defineMessages)({
  dateRange: {
    id: "ReactFilters.DateRangeFilter.dateRange",
    defaultMessage: "From {startDate} to {endDate}"
  },
  startDate: {
    id: "ReactFilters.DateRangeFilter.startDate",
    defaultMessage: "Start"
  },
  endDate: {
    id: "ReactFilters.DateRangeFilter.endDate",
    defaultMessage: "End"
  },
  until: {
    id: "ReactFilters.DateRangeFilter.until",
    defaultMessage: "Until {date}"
  },
  from: {
    id: "ReactFilters.DateRangeFilter.from",
    defaultMessage: "From {date}"
  }
});
var subscription2 = { value: true };
function formatDateValue(value) {
  if (!value || value === "") {
    return null;
  }
  return typeof value === "string" ? (0, import_date_fns2.parseISO)(value) : value;
}
function formatValue(value) {
  if (value === void 0) {
    return [
      {
        startDate: null,
        endDate: null,
        key: "selection"
      }
    ];
  }
  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzDiff = (0, import_date_fns_tz.getTimezoneOffset)(value.tz, value.gte) - (0, import_date_fns_tz.getTimezoneOffset)(currentTz, value.gte);
  if (Array.isArray(value)) {
    return value.map((v) => {
      const startDate = formatDateValue(v.gte);
      const endDate = formatDateValue(v.lte);
      return {
        ...v,
        startDate: tzDiff && startDate ? (0, import_date_fns_tz.utcToZonedTime)(startDate, v.tz) : startDate,
        endDate: tzDiff && endDate ? (0, import_date_fns_tz.utcToZonedTime)(endDate, v.tz) : endDate
      };
    });
  }
  if (typeof value === "object") {
    const startDate = formatDateValue(value.gte);
    const endDate = formatDateValue(value.lte);
    return [
      {
        startDate: tzDiff && startDate ? (0, import_date_fns_tz.utcToZonedTime)(startDate, value.tz) : startDate,
        endDate: tzDiff && endDate ? (0, import_date_fns_tz.utcToZonedTime)(endDate, value.tz) : endDate,
        key: "selection"
      }
    ];
  }
  return value;
}
function parseValue(value) {
  var _a;
  if (!value) {
    return value;
  }
  const [selection] = value;
  if (selection.startDate === null && selection.endDate === null) {
    return void 0;
  }
  const gte = ((_a = selection.startDate) == null ? void 0 : _a.toISOString()) ?? null;
  const lte = (selection.endDate ? (0, import_date_fns2.endOfDay)(selection.endDate) : selection.endDate).toISOString();
  const result = {};
  if (gte) result.gte = gte;
  if (lte) result.lte = lte;
  result.tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return result;
}
function Preview({
  name,
  staticRanges = [],
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = (0, import_react_intl5.useIntl)();
  const { input } = (0, import_react_final_form2.useField)(name, { subscription: subscription2 });
  const { tz } = input.value;
  const value = formatValue(input.value)[0];
  const selectedStaticRange = (0, import_react8.useMemo)(
    () => value && staticRanges.find((v) => v.isSelected(value, tz)),
    [value, staticRanges, tz]
  );
  const singleDay = (0, import_react8.useMemo)(
    () => (value == null ? void 0 : value.startDate) && (value == null ? void 0 : value.endDate) && (0, import_date_fns2.isSameDay)(value.startDate, value.endDate),
    [value]
  );
  const onRemove = (0, import_react8.useCallback)(
    (e) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      input.onChange(void 0);
    },
    [input, disabled]
  );
  let label;
  if (!(value == null ? void 0 : value.startDate) && !(value == null ? void 0 : value.endDate)) {
    return null;
  }
  const formatDate = (v) => intl.formatDate(
    v
    /* , { timeZone: tz } */
  );
  if (selectedStaticRange) {
    label = selectedStaticRange.label;
  } else if (value.startDate === null) {
    label = intl.formatMessage(messages2.until, {
      date: formatDate(value.endDate)
    });
  } else if (value.endDate === null) {
    label = intl.formatMessage(messages2.from, {
      date: formatDate(value.startDate)
    });
  } else {
    label = singleDay ? formatDate(value.startDate) : intl.formatMessage(messages2.dateRange, {
      startDate: formatDate(value.startDate),
      endDate: formatDate(value.endDate)
    });
  }
  return import_react8.default.createElement(component, {
    name,
    staticRanges,
    label,
    onRemove,
    disabled,
    ...rest
  });
}
var DateRangeFilter = import_react8.default.forwardRef(function DateRangeFilter2({
  name,
  staticRanges,
  inputRanges,
  rangeColor,
  className,
  dateFormatStyle,
  dateFormat,
  minDate,
  maxDate,
  shownDate,
  getQuery
}, ref) {
  const intl = (0, import_react_intl5.useIntl)();
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    import_react_final_form2.Field,
    {
      ref,
      name,
      subscription: subscription2,
      parse: parseValue,
      format: formatValue,
      component: DateRangePicker_default,
      staticRanges,
      inputRanges,
      startDatePlaceholder: intl.formatMessage(messages2.startDate),
      endDatePlaceholder: intl.formatMessage(messages2.endDate),
      rangeColor,
      className,
      dateFormatStyle,
      dateFormat,
      minDate,
      maxDate,
      shownDate,
      getQuery
    }
  );
});
var Collapsable = import_react8.default.forwardRef(function Collapsable2({ name, filter, component, disabled, staticRanges, inputRanges, ...rest }, ref) {
  const [collapsed, setCollapsed] = (0, import_react8.useState)(true);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    Panel,
    {
      header: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        Title,
        {
          name,
          filter,
          component: Preview,
          staticRanges,
          disabled
        }
      ),
      collapsed,
      setCollapsed,
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        DateRangeFilter,
        {
          ref,
          name,
          filter,
          component,
          staticRanges,
          inputRanges,
          disabled,
          collapsed,
          ...rest
        }
      )
    }
  );
});
var exported = import_react8.default.memo(DateRangeFilter);
exported.Preview = Preview;
exported.Collapsable = Collapsable;
var DateRangeFilter_default = exported;

// src/utils/matchQuery.js
var import_isMatch = __toESM(require("lodash/isMatch.js"), 1);
var import_omitBy = __toESM(require("lodash/omitBy.js"), 1);
var import_isEmpty = __toESM(require("lodash/isEmpty.js"), 1);
function matchQuery(a, b) {
  return (0, import_isMatch.default)((0, import_omitBy.default)(a, import_isEmpty.default), (0, import_omitBy.default)(b, import_isEmpty.default));
}

// src/utils/matchFilter.js
function matchFilter(filter, values, entry) {
  const [key, value] = entry;
  if (filter.type === "custom" && filter.activeFilterLabel) {
    return key in filter.query && matchQuery(values, filter.query);
  }
  if (filter.type === "favorites" && filter.activeFilterLabel) {
    return !!values.favorites;
  }
  if (filter.type === "definedRange" && filter.name === key) {
    const formattedValue = formatValue(value)[0];
    return !!filter.staticRanges.find((v) => v.isSelected(formattedValue));
  }
  return filter.name === key;
}

// src/hooks/useActiveFilters.js
function useActiveFilters(filters) {
  const { values } = (0, import_react_final_form3.useFormState)({ subscription: { values: true } });
  const sortedFilters = (0, import_react9.useMemo)(
    () => filters.map(({ destSelector, ...filter }) => filter).sort(staticRangesFirst).sort(customFirst),
    [filters]
  );
  return (0, import_react9.useMemo)(
    () => Object.entries(values).reduce((accu, entry) => {
      const matchingFilter = sortedFilters.find((filter) => matchFilter(filter, values, entry));
      if (matchingFilter && !accu.includes(matchingFilter)) {
        accu.push(matchingFilter);
      }
      return accu;
    }, []),
    [sortedFilters, values]
  );
}

// src/components/Filters.js
var import_react10 = __toESM(require("react"), 1);
var import_react_uid = require("react-uid");
var import_react_portal_ssr = require("@openagenda/react-portal-ssr");
var import_jsx_runtime7 = require("@emotion/react/jsx-runtime");
function Noop() {
  return null;
}
function Filters({
  filters,
  withRef = false,
  choiceComponent: ChoiceComponent = Noop,
  dateRangeComponent: DateRangeComponent = Noop,
  simpleDateRangeComponent: SimpleDateRangeComponent = Noop,
  definedRangeComponent: DefinedRangeComponent = Noop,
  numberRangeComponent: NumberRangeComponent = Noop,
  mapComponent: MapComponent = Noop,
  searchComponent: SearchComponent = Noop,
  customComponent: CustomComponent = Noop,
  favoritesComponent: FavoritesComponent = Noop,
  timelineComponent: TimelineComponent = Noop,
  choiceProps = null,
  dateRangeProps = null,
  numberRangeProps = null,
  definedRangeProps = null,
  mapProps = null,
  searchProps = null,
  customProps = null,
  favoritesProps = null,
  timelineProps = null,
  ...additionnalProps
}) {
  const seed = (0, import_react_uid.useUIDSeed)();
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_jsx_runtime7.Fragment, { children: filters.map((filter) => {
    let elem;
    switch (filter.type) {
      case "dateRange":
        elem = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          DateRangeComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...dateRangeProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      case "simpleDateRange":
        elem = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          SimpleDateRangeComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...dateRangeProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      case "definedRange":
        elem = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          DefinedRangeComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...definedRangeProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      case "numberRange": {
        elem = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          NumberRangeComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...numberRangeProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      }
      case "choice":
        elem = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          ChoiceComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...choiceProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      case "map":
        elem = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          MapComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...mapProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      case "search":
        elem = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          SearchComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...searchProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      case "custom":
        elem = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          CustomComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...customProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      case "favorites":
        elem = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          FavoritesComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...favoritesProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      case "timeline":
        elem = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          TimelineComponent,
          {
            ref: withRef ? filter.elemRef : null,
            filter,
            ...filter,
            ...timelineProps,
            ...additionnalProps
          },
          seed(filter)
        );
        break;
      default:
        elem = null;
        break;
    }
    if (filter.destSelector) {
      return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_react_portal_ssr.Portal, { selector: filter.destSelector, children: elem }, seed(filter));
    }
    return elem;
  }) });
}
var Filters_default = import_react10.default.memo(Filters);

// src/components/filters/SimpleDateRangeFilter.js
var import_react12 = __toESM(require("react"), 1);
var import_react_final_form4 = require("react-final-form");
var import_date_fns3 = require("date-fns");
var import_date_fns_tz2 = require("date-fns-tz");

// src/components/fields/SimpleDateRangeField.js
var import_react11 = __toESM(require("react"), 1);
var import_react_intl6 = require("react-intl");
var import_jsx_runtime8 = require("@emotion/react/jsx-runtime");
var messages3 = (0, import_react_intl6.defineMessages)({
  startDate: {
    id: "ReactFilters.fields.SimpleRangeField.startDate",
    defaultMessage: "Start date"
  },
  endDate: {
    id: "ReactFilters.fields.SimpleRangeField.endDate",
    defaultMessage: "End date"
  }
});
function SimpleDateRangeField({ input }, _ref) {
  const intl = (0, import_react_intl6.useIntl)();
  const { value, onChange } = input;
  const onInputChange = (0, import_react11.useCallback)(
    (k, v) => {
      if (k === "gte") {
        onChange({
          ...value,
          gte: v
        });
      } else {
        onChange({
          ...value,
          lte: v
        });
      }
    },
    [onChange, value]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { children: [
      intl.formatMessage(messages3.startDate),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "input",
        {
          value: (value == null ? void 0 : value.gte) || "",
          type: "date",
          className: "form-control",
          onChange: (e) => onInputChange("gte", e.target.value),
          max: value == null ? void 0 : value.lte
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { children: [
      intl.formatMessage(messages3.endDate),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "input",
        {
          value: (value == null ? void 0 : value.lte) || "",
          type: "date",
          className: "form-control",
          onChange: (e) => onInputChange("lte", e.target.value),
          min: value == null ? void 0 : value.gte
        }
      )
    ] })
  ] });
}
var SimpleDateRangeField_default = import_react11.default.forwardRef(SimpleDateRangeField);

// src/components/filters/SimpleDateRangeFilter.js
var import_jsx_runtime9 = require("@emotion/react/jsx-runtime");
var subscription3 = { value: true };
function formatDateValue2(value, tz) {
  if (!value) return value;
  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzDiff = (0, import_date_fns_tz2.getTimezoneOffset)(tz, value) - (0, import_date_fns_tz2.getTimezoneOffset)(currentTz, value);
  let date = new Date(value);
  if (tzDiff) {
    date = (0, import_date_fns_tz2.utcToZonedTime)(date, tz);
  }
  return date;
}
function formatValue2(value) {
  if (!value) {
    return void 0;
  }
  const gte = formatDateValue2(value.gte, value.tz);
  const lte = formatDateValue2(value.lte, value.tz);
  return {
    gte: gte ? (0, import_date_fns3.format)(gte, "yyyy-MM-dd") : null,
    lte: lte ? (0, import_date_fns3.format)(lte, "yyyy-MM-dd") : null
  };
}
function parseValue2(value) {
  if (!value) {
    return value;
  }
  const gte = value.gte ? (0, import_date_fns3.startOfDay)(new Date(value.gte)).toISOString() : null;
  const lte = value.lte ? (0, import_date_fns3.endOfDay)(new Date(value.lte)).toISOString() : null;
  const result = {};
  if (gte) result.gte = gte;
  if (lte) result.lte = lte;
  if (gte || lte) result.tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return result;
}
var SimpleDateRangeFilter = import_react12.default.forwardRef(function SimpleDateRangeFilter2({ name }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
    import_react_final_form4.Field,
    {
      ref,
      name,
      subscription: subscription3,
      format: formatValue2,
      parse: parseValue2,
      component: SimpleDateRangeField_default
    }
  );
});
var Collapsable3 = import_react12.default.forwardRef(function Collapsable4({ name, filter, component, disabled, staticRanges, inputRanges, ...rest }, ref) {
  const [collapsed, setCollapsed] = (0, import_react12.useState)(true);
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
    Panel,
    {
      header: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
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
      children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        SimpleDateRangeFilter,
        {
          ref,
          name,
          filter,
          component,
          disabled,
          collapsed,
          ...rest
        }
      )
    }
  );
});
var exported2 = import_react12.default.memo(SimpleDateRangeFilter);
exported2.Preview = Preview;
exported2.Collapsable = Collapsable3;
var SimpleDateRangeFilter_default = exported2;

// src/components/filters/NumberRangeFilter.js
var import_react14 = __toESM(require("react"), 1);
var import_react_final_form5 = require("react-final-form");

// src/components/fields/NumberRangeField.js
var import_react13 = __toESM(require("react"), 1);
var import_react_intl7 = require("react-intl");
var import_use_debounce = require("use-debounce");
var import_jsx_runtime10 = require("@emotion/react/jsx-runtime");
var messages4 = (0, import_react_intl7.defineMessages)({
  min: {
    id: "ReactFilters.fields.NumberRangeField.gte",
    defaultMessage: "Min"
  },
  max: {
    id: "ReactFilters.fields.NumberRangeField.lte",
    defaultMessage: "Max"
  }
});
function NumberRangeField({ input }, _ref) {
  const m = (0, import_react_intl7.useIntl)().formatMessage;
  const { value, onChange } = input;
  const [gteString, setGTEString] = (0, import_react13.useState)(value == null ? void 0 : value.gte);
  const [lteString, setLTEString] = (0, import_react13.useState)(value == null ? void 0 : value.lte);
  const [debouncedGTE] = (0, import_use_debounce.useDebounce)(gteString, 500);
  const [debouncedLTE] = (0, import_use_debounce.useDebounce)(lteString, 500);
  const onInputChange = (0, import_react13.useCallback)((k, v) => {
    if (k === "gte") {
      setGTEString(v);
    } else {
      setLTEString(v);
    }
  }, []);
  (0, import_react13.useEffect)(() => {
    setGTEString((value == null ? void 0 : value.gte) ?? "");
    setLTEString((value == null ? void 0 : value.lte) ?? "");
  }, [value]);
  (0, import_react13.useEffect)(() => {
    onChange({
      lte: debouncedLTE,
      gte: debouncedGTE
    });
  }, [debouncedGTE, debouncedLTE, onChange]);
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "row", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "col-xs-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("label", { className: "sr-only", htmlFor: `number-range-${input.name}-gte`, children: m(messages4.min) }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        "input",
        {
          value: gteString,
          type: "number",
          className: "form-control",
          id: `number-range-${input.name}-gte`,
          placeholder: m(messages4.min),
          onChange: (e) => onInputChange("gte", e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "form-group col-xs-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("label", { className: "sr-only", htmlFor: `number-range-${input.name}-lte`, children: m(messages4.max) }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        "input",
        {
          value: lteString,
          type: "number",
          className: "form-control",
          id: `number-range-${input.name}-lte`,
          placeholder: m(messages4.max),
          onChange: (e) => onInputChange("lte", e.target.value)
        }
      )
    ] })
  ] });
}
var NumberRangeField_default = import_react13.default.forwardRef(NumberRangeField);

// src/components/filters/NumberRangeFilter.js
var import_jsx_runtime11 = require("@emotion/react/jsx-runtime");
var subscription4 = { value: true };
var isDefined = (v) => ![void 0, null, ""].includes(v);
function formatPreviewLabel(value) {
  if (!isDefined(value.gte) && isDefined(value.lte)) {
    return `\u2264 ${value.lte}`;
  }
  if (isDefined(value.gte) && !isDefined(value.lte)) {
    return `\u2265 ${value.gte}`;
  }
  if (isDefined(value.gte) && isDefined(value.lte)) {
    return `${value.gte} \u2264 ${value.lte}`;
  }
}
function parseValue3(value) {
  const definedLte = isDefined(value == null ? void 0 : value.lte);
  const definedGte = isDefined(value == null ? void 0 : value.gte);
  if (!definedLte && !definedGte) {
    return void 0;
  }
  const result = {};
  if (definedLte) result.lte = value.lte;
  if (definedGte) result.gte = value.gte;
  return result;
}
function Preview2({ name, component = FilterPreviewer, disabled, ...rest }) {
  var _a, _b;
  const { input } = (0, import_react_final_form5.useField)(name, { subscription: subscription4 });
  const onRemove = (0, import_react14.useCallback)(
    (e) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      input.onChange(void 0);
    },
    [input, disabled]
  );
  if (!((_a = input.value) == null ? void 0 : _a.gte) && !((_b = input.value) == null ? void 0 : _b.lte)) {
    return null;
  }
  return import_react14.default.createElement(component, {
    name,
    label: formatPreviewLabel(input.value),
    onRemove,
    disabled,
    ...rest
  });
}
var NumberRangeFilter = import_react14.default.forwardRef(function NumberRangeFilter2({ name }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
    import_react_final_form5.Field,
    {
      ref,
      name,
      subscription: subscription4,
      parse: parseValue3,
      component: NumberRangeField_default
    }
  );
});
var Collapsable5 = import_react14.default.forwardRef(function Collapsable6({ name, filter, component, disabled, ...rest }, ref) {
  const [collapsed, setCollapsed] = (0, import_react14.useState)(true);
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
    Panel,
    {
      header: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        Title,
        {
          name,
          filter,
          component: Preview2,
          disabled
        }
      ),
      collapsed,
      setCollapsed,
      children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        NumberRangeFilter,
        {
          ref,
          name,
          filter,
          component,
          disabled,
          collapsed,
          ...rest
        }
      )
    }
  );
});
var exported3 = import_react14.default.memo(NumberRangeFilter);
exported3.Preview = Preview2;
exported3.Collapsable = Collapsable5;
var NumberRangeFilter_default = exported3;

// src/components/filters/ChoiceFilter.js
var import_react17 = __toESM(require("react"), 1);
var import_react_final_form6 = require("react-final-form");
var import_react_uid3 = require("react-uid");
var import_react_intl11 = require("react-intl");
var import_usePrevious3 = __toESM(require("react-use/lib/usePrevious.js"), 1);
var import_react18 = require("@emotion/react");

// src/components/fields/ChoiceField.js
var import_react15 = __toESM(require("react"), 1);
var import_react_uid2 = require("react-uid");
var import_react_intl8 = require("react-intl");
var import_classnames4 = __toESM(require("classnames"), 1);
var import_intl4 = require("@openagenda/intl");
var import_a11yButtonActionHandler2 = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);
var import_jsx_runtime12 = require("@emotion/react/jsx-runtime");
function useOnChoiceChange(input, preventDefault) {
  const inputRef = (0, import_react15.useRef)();
  const onChange = (0, import_react15.useMemo)(
    () => (0, import_a11yButtonActionHandler2.default)((e) => {
      if (e.target === inputRef.current) {
        return;
      }
      if (preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.currentTarget.getAttribute("aria-disabled") === "true") {
        return;
      }
      if (e.currentTarget.getAttribute("aria-checked") === "true") {
        input.onChange({
          target: {
            type: input.type,
            value: input.value,
            checked: false
          }
        });
        return;
      }
      input.onChange({
        target: {
          type: input.type,
          value: input.value,
          checked: true
        }
      });
    }),
    [input.onChange, input.type, input.value, preventDefault]
  );
  return {
    inputRef,
    onChange
  };
}
var ChoiceField = import_react15.default.forwardRef(function ChoiceField2({
  input,
  getTotal,
  filter,
  option,
  disabled,
  tag: Tag = "div",
  preventDefault = true
}, ref) {
  const intl = (0, import_react_intl8.useIntl)();
  const seed = (0, import_react_uid2.useUIDSeed)();
  const total = (0, import_react15.useMemo)(
    () => getTotal == null ? void 0 : getTotal(filter, option),
    [filter, getTotal, option]
  );
  const { inputRef, onChange } = useOnChoiceChange(input, preventDefault);
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
    Tag,
    {
      className: (0, import_classnames4.default)(input.type, {
        disabled,
        active: input.checked,
        inactive: !input.checked
      }),
      children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
        "span",
        {
          ref,
          className: "oa-choice-option-label",
          role: "checkbox",
          tabIndex: "0",
          "aria-checked": input.checked,
          "aria-disabled": disabled,
          onClick: onChange,
          onKeyPress: onChange,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
              "input",
              {
                ref: inputRef,
                tabIndex: "-1",
                type: input.type,
                id: seed(input),
                disabled,
                ...input
              }
            ),
            (0, import_intl4.getLocaleValue)(option.label, intl.locale) || /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_jsx_runtime12.Fragment, { children: "\xA0" }),
            Number.isInteger(total) && total !== 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "oa-filter-total", children: total }) : null
          ]
        }
      )
    }
  );
});
var ChoiceField_default = ChoiceField;

// src/hooks/useChoiceState.js
var import_react16 = require("react");
var import_useIsomorphicLayoutEffect2 = __toESM(require("react-use/lib/useIsomorphicLayoutEffect.js"), 1);
var import_usePrevious2 = __toESM(require("react-use/lib/usePrevious.js"), 1);
var import_react_intl9 = require("react-intl");
var import_fuse = __toESM(require("fuse.js"), 1);
var import_useConstant = __toESM(require("@openagenda/react-shared/dist/hooks/useConstant.js"), 1);
var useIsomorphicLayoutEffect2 = import_useIsomorphicLayoutEffect2.default.default || import_useIsomorphicLayoutEffect2.default;
var usePrevious2 = import_usePrevious2.default.default || import_usePrevious2.default;
function getCollator(locale, defaultLocale) {
  try {
    return new Intl.Collator(locale, {
      sensitivity: "base",
      usage: "sort"
    });
  } catch {
    return new Intl.Collator(defaultLocale, {
      sensitivity: "base",
      usage: "sort"
    });
  }
}
function filterOptions({ options, fuse, searchValue, sort, collator }) {
  if (searchValue === "") {
    if (sort === "alphabetical") {
      return [...options].sort((a, b) => collator.compare(a.label, b.label));
    }
    return options;
  }
  return fuse.search(searchValue).map((v) => v.item);
}
function useChoiceState({
  filter,
  getOptions,
  pageSize,
  collapsed = false,
  sort = null
}) {
  const intl = (0, import_react_intl9.useIntl)();
  const [countOptions, setCountOptions] = (0, import_react16.useState)(pageSize);
  const options = (0, import_react16.useMemo)(() => getOptions(filter), [filter, getOptions]);
  const fuse = (0, import_useConstant.default)(
    () => new import_fuse.default(options, {
      threshold: 0.3,
      ignoreLocation: true,
      keys: ["label"]
    })
  );
  const collator = (0, import_react16.useMemo)(
    () => getCollator(intl.locale, intl.defaultLocale),
    [intl.defaultLocale, intl.locale]
  );
  const [searchValue, setSearchValue] = (0, import_react16.useState)("");
  const previousSearchValue = usePrevious2(searchValue);
  const [foundOptions, setFoundOptions] = (0, import_react16.useState)(
    filterOptions({
      options,
      fuse,
      searchValue,
      sort,
      collator
    })
  );
  const moreOptions = (0, import_react16.useCallback)(
    () => setCountOptions((v) => v + pageSize),
    [pageSize]
  );
  const lessOptions = (0, import_react16.useCallback)(() => setCountOptions(pageSize), [pageSize]);
  const previousCollpased = usePrevious2(collapsed);
  useIsomorphicLayoutEffect2(() => {
    if (previousCollpased && !collapsed) {
      lessOptions();
    }
  }, [collapsed, lessOptions, previousCollpased]);
  const hasMoreOptions = countOptions < foundOptions.length;
  const onSearchChange = (0, import_react16.useCallback)((e) => setSearchValue(e.target.value), []);
  useIsomorphicLayoutEffect2(() => {
    if (options !== fuse._docs) {
      fuse.setCollection(options);
      const newOptions = filterOptions({
        options,
        fuse,
        searchValue,
        sort,
        collator
      });
      setFoundOptions(newOptions);
    }
  }, [fuse, searchValue, options, sort, collator]);
  useIsomorphicLayoutEffect2(() => {
    if (previousSearchValue !== void 0 && searchValue !== previousSearchValue) {
      const newOptions = filterOptions({
        options,
        fuse,
        searchValue,
        sort,
        collator
      });
      setFoundOptions(newOptions);
    }
  }, [fuse, searchValue, options, previousSearchValue, sort, collator]);
  return {
    options,
    searchValue,
    onSearchChange,
    foundOptions,
    countOptions,
    hasMoreOptions,
    moreOptions,
    lessOptions
  };
}

// src/messages/choiceFilter.js
var import_react_intl10 = require("react-intl");
var choiceFilter_default = (0, import_react_intl10.defineMessages)({
  noResult: {
    id: "ReactFilters.messages.choiceFilter.noResult",
    defaultMessage: "No result"
  },
  searchPlaceholder: {
    id: "ReactFilters.messages.choiceFilter.searchPlaceholder",
    defaultMessage: "Search"
  },
  moreOptions: {
    id: "ReactFilters.messages.choiceFilter.moreOptions",
    defaultMessage: "More options"
  },
  lessOptions: {
    id: "ReactFilters.messages.choiceFilter.lessOptions",
    defaultMessage: "Less options"
  },
  unrecognizedOption: {
    id: "ReactFilters.messages.choiceFilter.unrecognizedOption",
    defaultMessage: "Unknown filter value ({value})"
  }
});

// src/components/filters/ChoiceFilter.js
var import_jsx_runtime13 = require("@emotion/react/jsx-runtime");
var usePrevious3 = import_usePrevious3.default.default || import_usePrevious3.default;
var subscription5 = { value: true };
function parseValue4(value) {
  if (Array.isArray(value) && !value.length) {
    return void 0;
  }
  return value;
}
function formatValue3(value) {
  return value;
}
function Preview3({
  name,
  filter,
  getOptions,
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = (0, import_react_intl11.useIntl)();
  const { input } = (0, import_react_final_form6.useField)(name, { subscription: subscription5 });
  const options = (0, import_react17.useMemo)(() => getOptions(filter), [filter, getOptions]);
  const valueOptions = (0, import_react17.useMemo)(() => {
    if ([void 0, null, ""].includes(input == null ? void 0 : input.value)) {
      return [];
    }
    if (!options.length) {
      return [];
    }
    return [].concat(input.value).map(
      (v) => options.find((option) => option.value === v) ?? {
        value: v,
        label: intl.formatMessage(choiceFilter_default.unrecognizedOption, { value: v })
      }
    );
  }, [input.value, options, intl]);
  const onRemove = (0, import_react17.useCallback)(
    (option) => (e) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      if (!Array.isArray(input.value)) {
        input.onChange(void 0);
        return;
      }
      const newValue = input.value.filter((v) => v !== option.value);
      input.onChange(newValue.length ? newValue : void 0);
    },
    [input, disabled]
  );
  if (!(valueOptions == null ? void 0 : valueOptions.length)) {
    return null;
  }
  return import_react17.default.createElement(component, {
    name,
    filter,
    getOptions,
    valueOptions,
    onRemove,
    disabled,
    ...rest
  });
}
var ChoiceFilter = import_react17.default.forwardRef(function ChoiceFilter2({
  name,
  filter,
  getTotal,
  searchPlaceholder,
  searchAriaLabel,
  getOptions,
  disabled,
  collapsed,
  inputType = "checkbox",
  pageSize = 10,
  searchMinSize = 2 * pageSize,
  sort,
  tag,
  preventDefault
}, _ref) {
  const intl = (0, import_react_intl11.useIntl)();
  const seed = (0, import_react_uid3.useUIDSeed)();
  const {
    options,
    searchValue,
    onSearchChange,
    foundOptions,
    countOptions,
    hasMoreOptions,
    moreOptions,
    lessOptions
  } = useChoiceState({
    filter,
    getOptions,
    collapsed,
    pageSize,
    sort
  });
  const newOptionRef = (0, import_react17.useRef)(null);
  const previousCountOptions = usePrevious3(countOptions);
  (0, import_react17.useEffect)(() => {
    if (newOptionRef.current && countOptions !== previousCountOptions && countOptions - pageSize === previousCountOptions) {
      newOptionRef.current.focus();
    }
  }, [countOptions, previousCountOptions]);
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
    options.length > searchMinSize ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      "input",
      {
        className: "form-control input-sm margin-top-xs",
        value: searchValue,
        onChange: onSearchChange,
        placeholder: searchPlaceholder || intl.formatMessage(choiceFilter_default.searchPlaceholder),
        "aria-label": searchAriaLabel,
        title: searchAriaLabel,
        css: import_react18.css`
            width: 50%;
          `
      }
    ) : null,
    foundOptions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "text-muted margin-v-xs", children: intl.formatMessage(choiceFilter_default.noResult) }) : null,
    foundOptions.map((option, index) => index < countOptions ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      import_react_final_form6.Field,
      {
        name,
        subscription: subscription5,
        parse: parseValue4,
        format: formatValue3,
        component: ChoiceField_default,
        type: inputType,
        value: option.value,
        option,
        filter,
        getTotal,
        disabled,
        tag,
        preventDefault,
        ref: index === countOptions - pageSize ? newOptionRef : null
      },
      seed(option)
    ) : null),
    hasMoreOptions ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      "button",
      {
        type: "button",
        className: "btn btn-link btn-link-inline",
        onClick: moreOptions,
        children: intl.formatMessage(choiceFilter_default.moreOptions)
      }
    ) : null,
    !hasMoreOptions && countOptions > pageSize ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      "button",
      {
        type: "button",
        className: "btn btn-link btn-link-inline",
        onClick: lessOptions,
        children: intl.formatMessage(choiceFilter_default.lessOptions)
      }
    ) : null
  ] });
});
var Collapsable7 = import_react17.default.forwardRef(function Collapsable8({ name, filter, component, getTotal, getOptions, disabled, ...rest }, ref) {
  const [collapsed, setCollapsed] = (0, import_react17.useState)(filter.defaultCollapsed ?? true);
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
    Panel,
    {
      header: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        Title,
        {
          name,
          filter,
          component: Preview3,
          getOptions,
          disabled
        }
      ),
      collapsed,
      setCollapsed,
      children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        ChoiceFilter,
        {
          ref,
          name,
          filter,
          component,
          getTotal,
          getOptions,
          disabled,
          collapsed,
          ...rest
        }
      )
    }
  );
});
var exported4 = import_react17.default.memo(ChoiceFilter);
exported4.Preview = Preview3;
exported4.Collapsable = Collapsable7;
var ChoiceFilter_default = exported4;

// src/components/filters/DefinedRangeFilter.js
var import_react20 = __toESM(require("react"), 1);
var import_react_final_form7 = require("react-final-form");
var import_react_intl12 = require("react-intl");
var import_date_fns4 = require("date-fns");

// src/components/fields/DefinedRangeField.js
var import_isEqual2 = __toESM(require("lodash/isEqual.js"), 1);
var import_isDate2 = __toESM(require("lodash/isDate.js"), 1);
var import_react19 = __toESM(require("react"), 1);
var import_react_date_range2 = require("@openagenda/react-date-range");
var import_useIsomorphicLayoutEffect3 = __toESM(require("react-use/lib/useIsomorphicLayoutEffect.js"), 1);
var import_useLatest2 = __toESM(require("react-use/lib/useLatest.js"), 1);
var import_usePrevious4 = __toESM(require("react-use/lib/usePrevious.js"), 1);
var import_jsx_runtime14 = require("@emotion/react/jsx-runtime");
var useIsomorphicLayoutEffect3 = import_useIsomorphicLayoutEffect3.default.default || import_useIsomorphicLayoutEffect3.default;
var useLatest2 = import_useLatest2.default.default || import_useLatest2.default;
var usePrevious4 = import_usePrevious4.default.default || import_usePrevious4.default;
var defaultGetInitialValue2 = () => [
  {
    startDate: null,
    endDate: -1,
    key: "selection"
  }
];
function normalizeValue2(value) {
  if (!(value == null ? void 0 : value.length)) {
    return value;
  }
  return value.map((v) => ({
    startDate: (0, import_isDate2.default)(v.startDate) ? v.startDate.getTime() : v.startDate,
    endDate: (0, import_isDate2.default)(v.endDate) ? v.endDate.getTime() : v.endDate,
    key: v.key
  }));
}
function DefinedRangeField({
  input,
  meta,
  staticRanges = [],
  inputRanges = [],
  rangeColor = "#41acdd",
  disabled,
  ...otherProps
}, _ref) {
  const [ranges, setRanges] = (0, import_react19.useState)(
    () => input.value ?? defaultGetInitialValue2()
  );
  const latestRanges = useLatest2(ranges);
  const previousValue = usePrevious4(input.value);
  const { onChange } = input;
  const onDefinedRangeChange = (0, import_react19.useCallback)(
    (item) => {
      const value = [(item == null ? void 0 : item.selection) ? item.selection : item.range1];
      setRanges(value);
      onChange(value);
    },
    [onChange]
  );
  useIsomorphicLayoutEffect3(() => {
    if (previousValue && !(0, import_isEqual2.default)(normalizeValue2(input.value), normalizeValue2(previousValue)) && !(0, import_isEqual2.default)(
      normalizeValue2(input.value),
      normalizeValue2(latestRanges.current)
    )) {
      setRanges(input.value);
    }
  }, [input.value, previousValue, latestRanges]);
  const definedRangePickerProps = {
    ranges,
    staticRanges,
    inputRanges,
    rangeColors: [rangeColor],
    ...otherProps
  };
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "rdrDateRangePickerWrapper", children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
    import_react_date_range2.DefinedRange,
    {
      ...definedRangePickerProps,
      onChange: onDefinedRangeChange,
      className: void 0
    }
  ) });
}
var DefinedRangeField_default = import_react19.default.forwardRef(DefinedRangeField);

// src/components/filters/DefinedRangeFilter.js
var import_jsx_runtime15 = require("@emotion/react/jsx-runtime");
var messages5 = (0, import_react_intl12.defineMessages)({
  singleDate: {
    id: "ReactFilters.DefinedRangeFilter.singleDate",
    defaultMessage: "{date}"
  },
  dateRange: {
    id: "ReactFilters.DefinedRangeFilter.dateRange",
    defaultMessage: "From {startDate} to {endDate}"
  },
  startDate: {
    id: "ReactFilters.DefinedRangeFilter.startDate",
    defaultMessage: "Start"
  },
  endDate: {
    id: "ReactFilters.DefinedRangeFilter.endDate",
    defaultMessage: "End"
  },
  until: {
    id: "ReactFilters.DefinedRangeFilter.until",
    defaultMessage: "Until {date}"
  },
  from: {
    id: "ReactFilters.DefinedRangeFilter.from",
    defaultMessage: "From {date}"
  }
});
var subscription6 = { value: true };
function formatValue4(value) {
  if (value === void 0) {
    return [
      {
        startDate: null,
        endDate: null,
        key: "selection"
      }
    ];
  }
  if (Array.isArray(value)) {
    return value.map((v) => ({
      ...v,
      startDate: typeof v.gte === "string" ? (0, import_date_fns4.parseISO)(v.gte) : v.gte,
      endDate: typeof v.lte === "string" ? (0, import_date_fns4.parseISO)(v.lte) : v.lte
    }));
  }
  if (typeof value === "object") {
    return [
      {
        startDate: typeof value.gte === "string" ? (0, import_date_fns4.parseISO)(value.gte) : value.gte,
        endDate: typeof value.lte === "string" ? (0, import_date_fns4.parseISO)(value.lte) : value.lte,
        key: "selection"
      }
    ];
  }
  return value;
}
function parseValue5(value) {
  if (!value) {
    return value;
  }
  const [selection] = value;
  if (selection.startDate === null && selection.endDate === null) {
    return void 0;
  }
  return {
    gte: selection.startDate.toISOString(),
    lte: (selection.endDate ? (0, import_date_fns4.endOfDay)(selection.endDate) : selection.endDate).toISOString(),
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}
function Preview4({
  name,
  staticRanges = [],
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  var _a;
  const intl = (0, import_react_intl12.useIntl)();
  const { input } = (0, import_react_final_form7.useField)(name, {
    subscription: subscription6,
    parse: parseValue5,
    format: formatValue4
  });
  const value = (_a = input.value) == null ? void 0 : _a[0];
  const selectedStaticRange = (0, import_react20.useMemo)(
    () => value && staticRanges.find((v) => v.isSelected(value)),
    [value, staticRanges]
  );
  const singleDay = (0, import_react20.useMemo)(
    () => (value == null ? void 0 : value.startDate) && (value == null ? void 0 : value.endDate) && (0, import_date_fns4.isSameDay)(value.startDate, value.endDate),
    [value]
  );
  const onRemove = (0, import_react20.useCallback)(
    (e) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      input.onChange(void 0);
    },
    [input, disabled]
  );
  let label;
  if (!(value == null ? void 0 : value.startDate) && !(value == null ? void 0 : value.endDate)) {
    return null;
  }
  if (selectedStaticRange) {
    label = selectedStaticRange.label;
  } else if (value.startDate === null) {
    label = intl.formatMessage(messages5.until, { date: value.endDate });
  } else if (value.endDate === null) {
    label = intl.formatMessage(messages5.from, { date: value.startDate });
  } else {
    label = singleDay ? intl.formatMessage(messages5.singleDate, { date: value.startDate }) : intl.formatMessage(messages5.dateRange, {
      startDate: value.startDate,
      endDate: value.endDate
    });
  }
  return import_react20.default.createElement(component, {
    name,
    staticRanges,
    label,
    onRemove,
    disabled,
    ...rest
  });
}
var DefinedRangeFilter = import_react20.default.forwardRef(function DefinedRangeFilter2({ name, staticRanges, inputRanges }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
    import_react_final_form7.Field,
    {
      ref,
      name,
      subscription: subscription6,
      parse: parseValue5,
      format: formatValue4,
      component: DefinedRangeField_default,
      staticRanges,
      inputRanges
    }
  );
});
var Collapsable9 = import_react20.default.forwardRef(function Collapsable10({ name, filter, component, disabled, staticRanges, inputRanges, ...rest }, ref) {
  const [collapsed, setCollapsed] = (0, import_react20.useState)(true);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
    Panel,
    {
      header: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
        Title,
        {
          name,
          filter,
          component: Preview4,
          staticRanges,
          disabled
        }
      ),
      collapsed,
      setCollapsed,
      children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
        DefinedRangeFilter,
        {
          ref,
          name,
          filter,
          component,
          staticRanges,
          inputRanges,
          disabled,
          collapsed,
          ...rest
        }
      )
    }
  );
});
var exported5 = import_react20.default.memo(DefinedRangeFilter);
exported5.Preview = Preview4;
exported5.Collapsable = Collapsable9;
var DefinedRangeFilter_default = exported5;

// src/components/filters/SearchFilter.js
var import_react22 = __toESM(require("react"), 1);
var import_react_final_form9 = require("react-final-form");
var import_react_uid4 = require("react-uid");
var import_react_intl14 = require("react-intl");

// src/components/fields/SearchInput.js
var import_react21 = __toESM(require("react"), 1);
var import_react_final_form8 = require("react-final-form");
var import_use_debounce2 = require("use-debounce");
var import_react_intl13 = require("react-intl");
init_FiltersAndWidgetsContext();
var import_jsx_runtime16 = require("@emotion/react/jsx-runtime");
var messages6 = (0, import_react_intl13.defineMessages)({
  ariaLabel: {
    id: "ReactFilters.components.fields.SearchInput.ariaLabel",
    defaultMessage: "Search"
  }
});
function Input({ input, placeholder, ariaLabel, onButtonClick, manualSubmit }) {
  const intl = (0, import_react_intl13.useIntl)();
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "input-group mb-3", children: [
    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
      "input",
      {
        className: "form-control",
        autoComplete: "off",
        placeholder,
        "aria-label": ariaLabel,
        title: ariaLabel,
        ...input
      }
    ),
    !manualSubmit ? /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "input-group-append", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
      "button",
      {
        type: "submit",
        className: "btn btn-outline-secondary",
        onClick: onButtonClick,
        "aria-label": intl.formatMessage(messages6.ariaLabel),
        children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("i", { className: "fa fa-search", "aria-hidden": "true" })
      }
    ) }) : null
  ] });
}
function SearchInput({
  inputComponent = Input,
  input,
  onChange,
  // user onChange
  manualSearch,
  ...rest
}) {
  const form = (0, import_react_final_form8.useForm)();
  const [tmpValue, setTmpValue] = (0, import_react21.useState)(input.value);
  const {
    filtersOptions: { manualSubmit }
  } = (0, import_react21.useContext)(FiltersAndWidgetsContext_default);
  const debouncedOnChange = (0, import_use_debounce2.useDebouncedCallback)((e) => {
    if (manualSearch) {
      return;
    }
    input.onChange(e);
    if (typeof onChange === "function") {
      onChange(e.target.value);
    }
  }, 400);
  const inputOnChange = (0, import_react21.useCallback)(
    (e) => {
      e.persist();
      setTmpValue(e.target.value);
      debouncedOnChange(e);
      if (manualSubmit) {
        debouncedOnChange.flush();
      }
    },
    [debouncedOnChange]
  );
  const onButtonClick = (0, import_react21.useCallback)(
    (e) => {
      e.preventDefault();
      if (manualSearch) {
        input.onChange(tmpValue);
        if (typeof onChange === "function") {
          onChange(tmpValue);
        }
      }
      return form.submit();
    },
    [form, input, manualSearch, onChange, tmpValue]
  );
  const wrappedInput = (0, import_react21.useMemo)(
    () => ({
      ...input,
      value: tmpValue,
      onChange: inputOnChange
    }),
    [input, inputOnChange, tmpValue]
  );
  (0, import_react21.useEffect)(() => {
    setTmpValue(input.value);
  }, [input.value]);
  return import_react21.default.createElement(inputComponent, {
    input: wrappedInput,
    onButtonClick,
    manualSubmit,
    ...rest
  });
}

// src/components/filters/SearchFilter.js
var import_jsx_runtime17 = require("@emotion/react/jsx-runtime");
var subscription7 = { value: true };
var messages7 = (0, import_react_intl14.defineMessages)({
  placeholder: {
    id: "ReactFilters.filters.searchFilter.placeholder",
    defaultMessage: "Search"
  },
  previewLabel: {
    id: "ReactFilters.filters.searchFilter.previewLabel",
    defaultMessage: "Search"
  }
});
function Preview5({
  name,
  filter,
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const { input } = (0, import_react_final_form9.useField)(name, { subscription: subscription7 });
  const onRemove = (0, import_react22.useCallback)(
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
  return import_react22.default.createElement(component, {
    name,
    filter,
    label: input.value,
    onRemove,
    disabled,
    ...rest
  });
}
var SearchFilter = import_react22.default.forwardRef(function SearchFilter2({ name, filter, component = SearchInput, placeholder = null, ...rest }, _ref) {
  const seed = (0, import_react_uid4.useUIDSeed)();
  const intl = (0, import_react_intl14.useIntl)();
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
    import_react_final_form9.Field,
    {
      name,
      subscription: subscription7,
      component,
      type: "text",
      filter,
      placeholder: placeholder || intl.formatMessage(messages7.placeholder),
      ...rest
    },
    seed(filter)
  );
});
var exported6 = import_react22.default.memo(SearchFilter);
exported6.Preview = Preview5;
var SearchFilter_default = exported6;

// src/components/filters/MapFilter.js
var import_react27 = __toESM(require("react"), 1);
var import_react_final_form11 = require("react-final-form");
var import_react_intl18 = require("react-intl");

// src/components/fields/MapField/index.js
var import_react25 = __toESM(require("react"), 1);
var import_react26 = require("@emotion/react");
var import_classnames6 = __toESM(require("classnames"), 1);

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
var import_jsx_runtime20 = require("@emotion/react/jsx-runtime");
var mapContainerStyle = import_react26.css`
  position: relative;
`;
var mapStyle = import_react26.css`
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
  return !collapsed ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { css: mapContainerStyle, className: (0, import_classnames6.default)(className, mapClass), children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
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
var MapField_default = import_react25.default.forwardRef(MapField);

// src/components/filters/MapFilter.js
var import_jsx_runtime21 = require("@emotion/react/jsx-runtime");
var subscription8 = { value: true };
var messages8 = (0, import_react_intl18.defineMessages)({
  previewLabel: {
    id: "ReactFilters.filters.MapFilter.previewLabel",
    defaultMessage: "Map"
  }
});
function Preview6({
  name,
  filter,
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = (0, import_react_intl18.useIntl)();
  const { input } = (0, import_react_final_form11.useField)(name, { subscription: subscription8 });
  const onRemove = (0, import_react27.useCallback)(
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
  return import_react27.default.createElement(component, {
    name,
    filter,
    label: intl.formatMessage(messages8.previewLabel),
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
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
    import_react_final_form11.Field,
    {
      collapsed,
      ref,
      name,
      subscription: subscription8,
      component,
      filter,
      disabled,
      className,
      ...rest
    }
  );
}
var Collapsable11 = import_react27.default.forwardRef(function Collapsable12({ name, filter, disabled, ...rest }, ref) {
  const [collapsed, setCollapsed] = (0, import_react27.useState)(true);
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
    Panel,
    {
      header: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
        Title,
        {
          name,
          filter,
          component: Preview6,
          disabled
        }
      ),
      collapsed,
      setCollapsed,
      children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
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
var exported7 = import_react27.default.memo(import_react27.default.forwardRef(MapFilter));
exported7.Preview = Preview6;
exported7.Collapsable = Collapsable11;
var MapFilter_default = exported7;

// src/components/filters/CustomFilter.js
var import_react28 = __toESM(require("react"), 1);
var import_react_final_form12 = require("react-final-form");
var import_a11yButtonActionHandler3 = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);

// src/utils/updateFormValues.js
function updateFormValues(form, query, active = true) {
  form.batch(() => {
    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        if (active) {
          form.change(key, query[key]);
        } else {
          form.change(key, void 0);
        }
      }
    }
  });
}

// src/utils/updateCustomFilter.js
function updateCustomFilter(filter, active) {
  const activeClass = filter.activeClass || "active";
  const inactiveClass = filter.inactiveClass || "inactive";
  const { classList } = filter.activeTargetElem || filter.elem;
  const handlerElem = filter.handlerElem || filter.elem;
  const innerCheckboxes = handlerElem.querySelectorAll(
    'input[type="checkbox"]'
  );
  const checkbox = innerCheckboxes.length === 1 ? innerCheckboxes[0] : null;
  if (active) {
    if (classList.contains(inactiveClass)) classList.remove(inactiveClass);
    if (!classList.contains(activeClass)) classList.add(activeClass);
    if (checkbox && !checkbox.checked) checkbox.checked = true;
  } else {
    if (classList.contains(activeClass)) classList.remove(activeClass);
    if (!classList.contains(inactiveClass)) classList.add(inactiveClass);
    if (checkbox && checkbox.checked) checkbox.checked = false;
  }
}

// src/components/filters/CustomFilter.js
var import_jsx_runtime22 = require("@emotion/react/jsx-runtime");
var subscription9 = { values: true };
function Preview7({
  name,
  component = FilterPreviewer,
  disabled,
  activeFilterLabel,
  filter,
  query,
  ...rest
}) {
  const form = (0, import_react_final_form12.useForm)();
  const onRemove = (0, import_react28.useCallback)(
    (e) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      updateFormValues(form, filter.query, false);
    },
    [disabled, form, filter]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_react_final_form12.FormSpy, { subscription: subscription9, children: ({ values }) => {
    if (!matchQuery(values, query) || !activeFilterLabel) {
      return null;
    }
    return import_react28.default.createElement(component, {
      name,
      label: activeFilterLabel,
      onRemove,
      disabled,
      filter,
      ...rest
    });
  } });
}
function CustomFilter({ filter }) {
  const form = (0, import_react_final_form12.useForm)();
  const firstRender = (0, import_react28.useRef)(true);
  const updateForm = (0, import_react28.useCallback)(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const query = form.getState().values;
      updateFormValues(form, filter.query, !matchQuery(query, filter.query));
    },
    [filter.query, form]
  );
  const onChange = (0, import_react28.useMemo)(
    () => (0, import_a11yButtonActionHandler3.default)(updateForm),
    [updateForm]
  );
  (0, import_react28.useEffect)(() => {
    if (firstRender.current) {
      firstRender.current = false;
      const query = form.getState().values;
      const matchInitialQuery = matchQuery(query, filter.query);
      const registeredFields = form.getRegisteredFields();
      for (const key in filter.query) {
        if (Object.prototype.hasOwnProperty.call(filter.query, key)) {
          if (!registeredFields.includes(key)) {
            form.registerField(
              key,
              () => {
              },
              { value: true },
              {
                initialValue: matchInitialQuery ? filter.query[key] : void 0
              }
            );
          }
        }
      }
    }
    const handlerElem = filter.handlerElem || filter.elem;
    const innerCheckboxes = handlerElem.querySelectorAll(
      'input[type="checkbox"]'
    );
    const handlerIsLabelWithCheckbox = innerCheckboxes.length === 1 && handlerElem.tagName === "LABEL" && handlerElem.contains(innerCheckboxes[0]);
    if (innerCheckboxes.length === 1 && (!filter.handlerElem || handlerIsLabelWithCheckbox)) {
      innerCheckboxes[0].addEventListener("change", updateForm, false);
    } else {
      handlerElem.addEventListener("click", onChange, false);
    }
    handlerElem.addEventListener("keydown", onChange, false);
    const unsubscribe = form.subscribe(
      ({ values }) => updateCustomFilter(filter, matchQuery(values, filter.query)),
      { values: true }
    );
    return () => {
      if (innerCheckboxes.length === 1 && (!filter.handlerElem || handlerIsLabelWithCheckbox)) {
        innerCheckboxes[0].removeEventListener("change", updateForm, false);
      } else {
        handlerElem.removeEventListener("click", onChange, false);
      }
      handlerElem.removeEventListener("keydown", onChange, false);
      unsubscribe();
    };
  }, [filter, form, onChange, updateForm]);
  return null;
}
var exported8 = import_react28.default.memo(CustomFilter);
exported8.Preview = Preview7;
var CustomFilter_default = exported8;

// src/components/filters/FavoritesFilter.js
var import_react31 = __toESM(require("react"), 1);
var import_react_final_form15 = require("react-final-form");
var import_useLatest3 = __toESM(require("react-use/lib/useLatest.js"), 1);
var import_a11yButtonActionHandler4 = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);

// src/hooks/useFavoritesOnChange.js
var import_react29 = require("react");
var import_react_final_form13 = require("react-final-form");
function useFavoritesOnChange(eventUids, { isExclusive } = {}) {
  const form = (0, import_react_final_form13.useForm)();
  return (0, import_react29.useCallback)(
    (e) => {
      var _a;
      e.preventDefault();
      e.stopPropagation();
      const query = form.getState().values;
      const matchingQuery = {
        uid: (eventUids == null ? void 0 : eventUids.length) ? eventUids.map(String) : ["-1"],
        favorites: "1"
      };
      const isMatchQuery = matchQuery(query, matchingQuery);
      const newQuery = isExclusive && !isMatchQuery ? form.getRegisteredFields().reduce((accu, next) => {
        if (next in matchingQuery) {
          accu[next] = matchingQuery[next];
          return accu;
        }
        accu[next] = void 0;
        return accu;
      }, {}) : matchingQuery;
      if (!((_a = newQuery.uid) == null ? void 0 : _a.length)) {
        newQuery.uid = ["-1"];
      }
      updateFormValues(form, newQuery, !isMatchQuery);
    },
    [isExclusive, form, eventUids]
  );
}

// src/hooks/useFavoriteState.js
var import_react30 = require("react");
var import_use_local_storage_state = require("use-local-storage-state");
var useFavoriteLocalStorageState = (0, import_use_local_storage_state.createLocalStorageStateHook)("favorite-events");
function useFavoriteState(agendaUid) {
  const [value, setValue] = useFavoriteLocalStorageState();
  const setAgendaValue = (0, import_react30.useCallback)(
    (fnOrValue) => {
      if (typeof fnOrValue === "function") {
        setValue((prev) => ({
          ...prev,
          [agendaUid]: fnOrValue(prev == null ? void 0 : prev[agendaUid])
        }));
      } else {
        setValue((prev) => ({
          ...prev,
          [agendaUid]: fnOrValue
        }));
      }
    },
    [setValue, agendaUid]
  );
  return [value == null ? void 0 : value[agendaUid], setAgendaValue];
}

// src/hooks/index.js
var import_react_final_form14 = require("react-final-form");

// src/components/filters/FavoritesFilter.js
var import_jsx_runtime23 = require("@emotion/react/jsx-runtime");
var useLatest3 = import_useLatest3.default.default || import_useLatest3.default;
var subscription10 = { values: true };
function Preview8({
  name = "favorites",
  filter,
  component = FilterPreviewer,
  disabled,
  activeFilterLabel,
  agendaUid,
  ...rest
}) {
  const form = (0, import_react_final_form15.useForm)();
  const [value] = useFavoriteState(filter.agendaUid || agendaUid);
  const onRemove = (0, import_react31.useCallback)(
    (e) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      updateFormValues(
        form,
        {
          uid: void 0,
          favorites: void 0
        },
        false
      );
      const handlerElem = filter.handlerElem || filter.elem;
      const innerCheckboxes = handlerElem.querySelectorAll(
        'input[type="checkbox"]'
      );
      if (innerCheckboxes.length === 1 && !filter.handlerElem) {
        innerCheckboxes[0].checked = false;
      }
    },
    [disabled, form, filter]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_react_final_form15.FormSpy, { subscription: subscription10, children: ({ values }) => {
    const query = {
      uid: value,
      favorites: "1"
    };
    if (!matchQuery(values, query) || !activeFilterLabel) {
      return null;
    }
    return import_react31.default.createElement(component, {
      name,
      label: activeFilterLabel,
      onRemove,
      disabled,
      filter,
      ...rest
    });
  } });
}
var FavoritesFilter = import_react31.default.forwardRef(function FavoritesFilter2({ agendaUid, filter }, _ref) {
  const form = (0, import_react_final_form15.useForm)();
  const firstRender = (0, import_react31.useRef)(true);
  const [value] = useFavoriteState(filter.agendaUid || agendaUid);
  const latestValue = useLatest3(value);
  const updateForm = useFavoritesOnChange(value, {
    isExclusive: filter.exclusive
  });
  const onChange = (0, import_react31.useMemo)(
    () => (0, import_a11yButtonActionHandler4.default)(updateForm),
    [updateForm]
  );
  (0, import_react31.useEffect)(() => {
    if (firstRender.current) {
      firstRender.current = false;
      const query = form.getState().values;
      const registeredFields = form.getRegisteredFields();
      if (!registeredFields.includes("uid")) {
        form.registerField(
          "uid",
          () => {
          },
          { value: true },
          {
            initialValue: query.uid
          }
        );
      }
      if (!registeredFields.includes("favorites")) {
        form.registerField(
          "favorites",
          () => {
          },
          { value: true },
          {
            initialValue: query.favorites
          }
        );
      }
    }
    const handlerElem = filter.handlerElem || filter.elem;
    const innerCheckboxes = handlerElem.querySelectorAll(
      'input[type="checkbox"]'
    );
    const handlerIsLabelWithCheckbox = innerCheckboxes.length === 1 && handlerElem.tagName === "LABEL" && handlerElem.contains(innerCheckboxes[0]);
    if (innerCheckboxes.length === 1 && (!filter.handlerElem || handlerIsLabelWithCheckbox)) {
      innerCheckboxes[0].addEventListener("change", updateForm, false);
    } else {
      handlerElem.addEventListener("click", onChange, false);
    }
    handlerElem.addEventListener("keydown", onChange, false);
    const unsubscribe = form.subscribe(
      ({ values }) => updateCustomFilter(
        filter,
        matchQuery(values, {
          uid: latestValue.current || ["-1"],
          favorites: "1"
        })
      ),
      { values: true }
    );
    return () => {
      if (innerCheckboxes.length === 1 && (!filter.handlerElem || handlerIsLabelWithCheckbox)) {
        innerCheckboxes[0].removeEventListener("change", updateForm, false);
      } else {
        handlerElem.removeEventListener("click", onChange, false);
      }
      handlerElem.removeEventListener("keydown", onChange, false);
      unsubscribe();
    };
  }, [filter, form, latestValue, onChange, updateForm]);
  return null;
});
var exported9 = import_react31.default.memo(FavoritesFilter);
exported9.Preview = Preview8;
var FavoritesFilter_default = exported9;

// src/components/filters/TimelineFilter.js
var import_react34 = __toESM(require("react"), 1);
var import_react_intl20 = require("react-intl");
var import_react_final_form16 = require("react-final-form");
var import_date_fns6 = require("date-fns");
var import_date_fns_tz3 = require("date-fns-tz");

// src/components/fields/TimelineField.js
var import_react32 = __toESM(require("react"), 1);
var import_react_intl19 = require("react-intl");
var import_react33 = require("swiper/react");
var import_modules = require("swiper/modules");
var import_date_fns5 = require("date-fns");
var import_classnames7 = __toESM(require("classnames"), 1);
var import_en_US2 = __toESM(require("date-fns/locale/en-US/index.js"), 1);
init_FiltersAndWidgetsContext();
var import_jsx_runtime24 = require("@emotion/react/jsx-runtime");
var messages9 = (0, import_react_intl19.defineMessages)({
  selectMonth: {
    id: "ReactFilters.TimelineField.selectMonth",
    defaultMessage: "Select month"
  },
  selectDay: {
    id: "ReactFilters.TimelineField.selectDay",
    defaultMessage: "Select day"
  }
});
function focusedDateToTimingsQuery2(focusedDate) {
  return {
    gte: (0, import_date_fns5.startOfMonth)(focusedDate),
    lte: (0, import_date_fns5.endOfMonth)(focusedDate),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}
function formatMonthYear(date, dfnLocale) {
  const localeCode = (dfnLocale == null ? void 0 : dfnLocale.code) ?? void 0;
  return new Intl.DateTimeFormat(localeCode, {
    month: "long",
    year: "numeric"
  }).format(date);
}
function TimelineField({
  input,
  // meta,
  // disabled,
  className,
  // minDate,
  // maxDate,
  // shownDate,
  getQuery
  // ...otherProps
}, ref) {
  const intl = (0, import_react_intl19.useIntl)();
  const today = /* @__PURE__ */ new Date();
  const {
    filtersOptions: { dateFnsLocale, searchMethod, res }
  } = (0, import_react32.useContext)(FiltersAndWidgetsContext_default);
  const monthsList = (0, import_react32.useMemo)(
    () => Array.from({ length: 25 }, (_, i) => {
      const d = (0, import_date_fns5.addMonths)(today, i - 12);
      return { month: d.getMonth(), year: d.getFullYear() };
    }),
    []
  );
  const [monthPos, setMonthPos] = (0, import_react32.useState)(() => {
    if (Array.isArray(input.value) && input.value.length) {
      const firstDate = new Date(input.value[0].startDate);
      return monthsList.findIndex(
        (m) => m.month === firstDate.getMonth() && m.year === firstDate.getFullYear()
      );
    }
    return 12;
  });
  const { month: monthIndex, year } = monthsList[monthPos];
  const initialDay = (0, import_react32.useMemo)(() => {
    if (Array.isArray(input.value) && input.value.length) {
      return new Date(input.value[0].startDate).getDate();
    }
    return today.getDate();
  }, [input.value]);
  const [focusedDay, setFocusedDay] = (0, import_react32.useState)(initialDay);
  const [data, setData] = (0, import_react32.useState)(() => null);
  const loadTimingsData = useLoadTimingsData(res, getQuery, { searchMethod });
  (0, import_react32.useEffect)(() => {
    loadTimingsData(
      {
        timings: focusedDateToTimingsQuery2(new Date(year, monthIndex))
      },
      {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    ).then((newData) => setData(newData ?? [])).catch((err) => {
      console.log("Failed to load timings data", err);
    });
  }, [year, monthIndex]);
  (0, import_react32.useImperativeHandle)(ref, () => ({
    onQueryChange: () => {
      loadTimingsData(
        {
          timings: focusedDateToTimingsQuery2(new Date(year, monthIndex))
        },
        {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      ).then((newData) => setData(newData ?? [])).catch((err) => {
        console.log("Failed to load timings data", err);
      });
    }
  }));
  const getDaysArray = () => {
    if (monthIndex === null || year === null) return [];
    const nb = (0, import_date_fns5.lastDayOfMonth)(new Date(year, monthIndex, 1)).getDate();
    return Array.from({ length: nb }, (_, i) => i + 1);
  };
  const toggleDay = (day) => {
    var _a;
    if (monthIndex === null || year === null) return;
    setFocusedDay(day);
    const dateObj = new Date(year, monthIndex, day);
    const current = Array.isArray(input.value) ? input.value : [];
    const next = current.some(({ startDate }) => (0, import_date_fns5.isSameDay)(new Date(startDate), dateObj)) ? current.filter(
      ({ startDate }) => !(0, import_date_fns5.isSameDay)(new Date(startDate), dateObj)
    ) : [
      ...current,
      {
        startDate: (0, import_date_fns5.startOfDay)(dateObj).toISOString(),
        endDate: (0, import_date_fns5.endOfDay)(dateObj).toISOString()
      }
    ];
    next.sort((a, b) => (0, import_date_fns5.compareAsc)(new Date(a.startDate), new Date(b.startDate)));
    if ((_a = current[0]) == null ? void 0 : _a.tz) next[0].tz = current[0].tz;
    input.onChange(next);
  };
  const dayRefs = (0, import_react32.useRef)([]);
  const monthRefs = (0, import_react32.useRef)([]);
  const daysSwiper = (0, import_react32.useRef)(null);
  const monthsSwiper = (0, import_react32.useRef)(null);
  const handleSelectMonth = (pos) => setMonthPos(pos);
  const handleDayKey = (e, day, index) => {
    var _a, _b;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDay(day);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (index + 1) % 31;
      (_a = dayRefs.current[next]) == null ? void 0 : _a.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (index + 30) % 31;
      (_b = dayRefs.current[prev]) == null ? void 0 : _b.focus();
    }
  };
  const handleMonthKey = (e, pos) => {
    var _a, _b;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelectMonth(pos);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      (_a = monthRefs.current[(pos + 1) % monthsList.length]) == null ? void 0 : _a.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      (_b = monthRefs.current[(pos + monthsList.length - 1) % monthsList.length]) == null ? void 0 : _b.focus();
    }
  };
  const days = getDaysArray();
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("div", { ref, className, children: [
    /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)(
      "div",
      {
        role: "listbox",
        "aria-label": intl.formatMessage(messages9.selectMonth),
        style: { display: "flex" },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { className: "swiper-button-prev oa-timeline-swiper-months-prev" }),
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
            import_react33.Swiper,
            {
              slidesPerView: "auto",
              centeredSlides: true,
              centeredSlidesBounds: true,
              freeMode: true,
              navigation: {
                prevEl: ".oa-timeline-swiper-months-prev",
                nextEl: ".oa-timeline-swiper-months-next"
              },
              modules: [import_modules.FreeMode, import_modules.Navigation],
              className: "oa-timeline-swiper-months",
              onSwiper: (sw) => {
                monthsSwiper.current = sw;
                sw.slideTo(monthPos, 0, false);
              },
              children: monthsList.map(({ month, year: monthYear }, pos) => {
                const isSelected = monthPos === pos;
                const isTabStop = isSelected || monthPos === null && pos === 0;
                return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_react33.SwiperSlide, { children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
                  "span",
                  {
                    role: "option",
                    "aria-selected": isSelected,
                    ref: (el) => {
                      monthRefs.current[pos] = el;
                    },
                    tabIndex: isTabStop ? 0 : -1,
                    onClick: () => {
                      if (monthsSwiper.current && !monthsSwiper.current.allowClick) return;
                      handleSelectMonth(pos);
                    },
                    onKeyDown: (e) => handleMonthKey(e, pos),
                    children: monthYear !== today.getFullYear() ? formatMonthYear(
                      new Date(monthYear, month, 15),
                      dateFnsLocale
                    ) : (0, import_date_fns5.format)(new Date(monthYear, month, 15), "MMMM", {
                      locale: dateFnsLocale || import_en_US2.default
                    })
                  }
                ) }, `${monthYear}-${month}`);
              })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { className: "swiper-button-next oa-timeline-swiper-months-next" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)(
      "div",
      {
        role: "listbox",
        "aria-label": intl.formatMessage(messages9.selectDay),
        style: { display: "flex" },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { className: "swiper-button-prev oa-timeline-swiper-days-prev" }),
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
            import_react33.Swiper,
            {
              slidesPerView: "auto",
              centeredSlides: true,
              centeredSlidesBounds: true,
              freeMode: true,
              navigation: {
                prevEl: ".oa-timeline-swiper-days-prev",
                nextEl: ".oa-timeline-swiper-days-next"
              },
              modules: [import_modules.FreeMode, import_modules.Navigation],
              className: "oa-timeline-swiper-days",
              onSwiper: (sw) => {
                daysSwiper.current = sw;
                sw.slideTo(initialDay - 1, 0);
              },
              children: days.map((day, idx) => {
                var _a;
                const dateObj = year !== null ? new Date(year, monthIndex, day) : null;
                const isChecked = dateObj ? (_a = input.value) == null ? void 0 : _a.some((d) => (0, import_date_fns5.isSameDay)(d.startDate, dateObj)) : false;
                const isTabStop = focusedDay === day;
                const isActive = data == null ? void 0 : data.find(
                  (d) => (0, import_date_fns5.isSameDay)(new Date(d.key), dateObj) && d.timingCount > 0
                );
                return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_react33.SwiperSlide, { children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
                  "span",
                  {
                    role: "option",
                    "aria-selected": isChecked,
                    ref: (el) => {
                      dayRefs.current[idx] = el;
                    },
                    tabIndex: isTabStop ? 0 : -1,
                    onClick: () => {
                      if (daysSwiper.current && !daysSwiper.current.allowClick) return;
                      toggleDay(day);
                    },
                    onKeyDown: (e) => handleDayKey(e, day, idx),
                    className: (0, import_classnames7.default)("oa-timeline-swiper-days-day", {
                      "oa-timeline-swiper-days-day-with-timings": data && isActive,
                      "oa-timeline-swiper-days-day-without-timings": data && !isActive
                    }),
                    children: day
                  }
                ) }, day);
              })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { className: "swiper-button-next oa-timeline-swiper-days-next" })
        ]
      }
    )
  ] });
}
var TimelineField_default = import_react32.default.forwardRef(TimelineField);

// src/components/filters/TimelineFilter.js
var import_jsx_runtime25 = require("@emotion/react/jsx-runtime");
var messages10 = (0, import_react_intl20.defineMessages)({
  dateRange: {
    id: "ReactFilters.TimelineFilter.dateRange",
    defaultMessage: "From {startDate} to {endDate}"
  },
  until: {
    id: "ReactFilters.TimelineFilter.until",
    defaultMessage: "Until {date}"
  },
  from: {
    id: "ReactFilters.TimelineFilter.from",
    defaultMessage: "From {date}"
  }
});
var subscription11 = { value: true };
function formatDateValue3(value) {
  if (!value || value === "") {
    return null;
  }
  return typeof value === "string" ? (0, import_date_fns6.parseISO)(value) : value;
}
function formatValue5(value) {
  if (!value || !Array.isArray(value)) {
    return [];
  }
  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzFromStore = value[0].tz ?? currentTz;
  return value.map(({ gte, lte }) => {
    const start = formatDateValue3(gte);
    const end = formatDateValue3(lte);
    const tzDiff = (0, import_date_fns_tz3.getTimezoneOffset)(tzFromStore, start ?? end ?? /* @__PURE__ */ new Date()) - (0, import_date_fns_tz3.getTimezoneOffset)(currentTz, start ?? end ?? /* @__PURE__ */ new Date());
    const convert = (d) => tzDiff && d ? (0, import_date_fns_tz3.utcToZonedTime)(d, tzFromStore) : d;
    return {
      startDate: convert(start),
      endDate: convert(end)
    };
  });
}
function parseValue6(value) {
  if (!value.length) {
    return void 0;
  }
  const toStoreObj = ({ startDate, endDate }) => {
    const start = formatDateValue3(startDate);
    const end = endDate ? (0, import_date_fns6.endOfDay)(formatDateValue3(endDate)) : null;
    return { gte: start, lte: end };
  };
  const result = value.map(toStoreObj);
  if (result.length) {
    result[0].tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return result.length ? result : void 0;
}
function Preview9({
  name,
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = (0, import_react_intl20.useIntl)();
  const { input } = (0, import_react_final_form16.useField)(name, { subscription: subscription11 });
  const ranges = formatValue5(input.value);
  const firstRange = ranges[0];
  const lastRange = ranges[ranges.length - 1];
  const begin = firstRange.startDate;
  const end = lastRange.endDate;
  const singleDay = begin && end && (0, import_date_fns6.isSameDay)(begin, end);
  const onRemove = (0, import_react34.useCallback)(
    (e) => {
      e.stopPropagation();
      if (!disabled) input.onChange(void 0);
    },
    [input, disabled]
  );
  const fmt = (d) => intl.formatDate(d);
  if (!ranges.length) return null;
  let label;
  if (!begin && !end) return null;
  if (begin && !end) {
    label = intl.formatMessage(messages10.from, { date: fmt(begin) });
  } else if (!begin && end) {
    label = intl.formatMessage(messages10.until, { date: fmt(end) });
  } else {
    label = singleDay ? fmt(begin) : intl.formatMessage(messages10.dateRange, {
      startDate: fmt(begin),
      endDate: fmt(end)
    });
  }
  return import_react34.default.createElement(component, {
    name,
    label,
    onRemove,
    disabled,
    ...rest
  });
}
var TimelineFilter = import_react34.default.forwardRef(function TimelineFilter2({ name, className, minDate, maxDate, shownDate, getQuery }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
    import_react_final_form16.Field,
    {
      ref,
      name,
      subscription: subscription11,
      parse: parseValue6,
      format: formatValue5,
      component: TimelineField_default,
      className,
      minDate,
      maxDate,
      shownDate,
      getQuery
    }
  );
});
var exported10 = import_react34.default.memo(TimelineFilter);
exported10.Preview = Preview9;
var TimelineFilter_default = exported10;

// src/components/ActiveFilters.js
var import_jsx_runtime26 = require("@emotion/react/jsx-runtime");
function ActiveFilters({ filters, ...rest }) {
  const activeFilters = useActiveFilters(filters);
  return /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
    Filters_default,
    {
      filters: activeFilters,
      choiceComponent: ChoiceFilter_default.Preview,
      dateRangeComponent: DateRangeFilter_default.Preview,
      simpleDateRangeComponent: SimpleDateRangeFilter_default.Preview,
      numberRangeComponent: NumberRangeFilter_default.Preview,
      definedRangeComponent: DefinedRangeFilter_default.Preview,
      searchComponent: SearchFilter_default.Preview,
      mapComponent: MapFilter_default.Preview,
      customComponent: CustomFilter_default.Preview,
      favoritesComponent: FavoritesFilter_default.Preview,
      timelineComponent: TimelineFilter_default.Preview,
      ...rest
    }
  );
}
//# sourceMappingURL=ActiveFilters.cjs.map