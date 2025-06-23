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
var import_react5, FiltersAndWidgetsContext, FiltersAndWidgetsContext_default;
var init_FiltersAndWidgetsContext = __esm({
  "src/contexts/FiltersAndWidgetsContext.js"() {
    import_react5 = require("react");
    FiltersAndWidgetsContext = (0, import_react5.createContext)({
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
var import_react_intl16, map_default;
var init_map = __esm({
  "src/messages/map.js"() {
    import_react_intl16 = require("react-intl");
    map_default = (0, import_react_intl16.defineMessages)({
      searchHere: {
        id: "ReactFilters.messages.map.searchHere",
        defaultMessage: "Search here"
      }
    });
  }
});

// src/components/fields/MapField/SearchHereControl.js
function SearchHereControl({ searchHere }) {
  const intl = (0, import_react_intl17.useIntl)();
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
    "div",
    {
      css: import_react13.css`
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        z-index: 400;
      `,
      children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        "button",
        {
          type: "button",
          onClick: searchHere,
          css: import_react13.css`
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
var import_react13, import_react_intl17, import_jsx_runtime10;
var init_SearchHereControl = __esm({
  "src/components/fields/MapField/SearchHereControl.js"() {
    import_react13 = require("@emotion/react");
    import_react_intl17 = require("react-intl");
    init_map();
    import_jsx_runtime10 = require("@emotion/react/jsx-runtime");
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
  const intl = (0, import_react_intl18.useIntl)();
  const map = (0, import_react_leaflet.useMap)();
  const position = (0, import_react14.useMemo)(() => [latitude, longitude], [latitude, longitude]);
  const icon = (0, import_react14.useMemo)(
    () => new import_leaflet.default.DivIcon({
      html: `<div style="pointer-events: none;"><span>${convertToKFormat(intl, eventCount)}</span></div>`,
      className: (0, import_classnames4.default)("marker-cluster leaflet-interactive", {
        "marker-cluster-small": eventCount < 10,
        "marker-cluster-medium": eventCount < 100,
        "marker-cluster-large": eventCount >= 100
      }),
      iconSize: new import_leaflet.default.Point(40, 40)
    }),
    [eventCount]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
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
var import_react14, import_classnames4, import_react_leaflet, import_leaflet, import_react_intl18, import_leaflet_gesture_handling, import_react_final_form5, import_jsx_runtime11, padRatio, unpadRatio, worldViewport, Map, Map_default;
var init_Map = __esm({
  "src/components/fields/MapField/Map.js"() {
    import_react14 = __toESM(require("react"), 1);
    import_classnames4 = __toESM(require("classnames"), 1);
    import_react_leaflet = require("react-leaflet");
    import_leaflet = __toESM(require("leaflet"), 1);
    import_react_intl18 = require("react-intl");
    import_leaflet_gesture_handling = require("@openagenda/leaflet-gesture-handling");
    import_react_final_form5 = require("react-final-form");
    init_FiltersAndWidgetsContext();
    init_SearchHereControl();
    import_jsx_runtime11 = require("@emotion/react/jsx-runtime");
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
    Map = import_react14.default.forwardRef(
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
        const intl = (0, import_react_intl18.useIntl)();
        const form = (0, import_react_final_form5.useForm)();
        const {
          filtersOptions: { manualSubmit }
        } = (0, import_react14.useContext)(FiltersAndWidgetsContext_default);
        const mapRef = (0, import_react14.useRef)();
        const programmaticMoveRef = (0, import_react14.useRef)(false);
        const [viewport] = (0, import_react14.useState)(() => input.value ? valueToViewport(input.value) : initialViewport);
        const skipMoveRef = (0, import_react14.useRef)(true);
        const [data, setData] = (0, import_react14.useState)(() => []);
        const [displayedMarkers, setDisplayedMarkers] = (0, import_react14.useState)(false);
        const [bounds] = (0, import_react14.useState)(() => viewportToBounds(viewport || defaultViewport || worldViewport).pad(
          padRatio
        ));
        (0, import_react14.useImperativeHandle)(ref, () => ({
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
        const onMapReady = (0, import_react14.useCallback)(
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
        const searchHere = (0, import_react14.useCallback)(
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
        const [latestBounds, setLatestBounds] = (0, import_react14.useState)(false);
        const onChange = (0, import_react14.useCallback)(() => {
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
        const disabledMapSearch = (0, import_react14.useMemo)(
          () => !latestBounds || isEqualBounds(input.value, {
            northEast: latestBounds.getNorthEast().wrap(),
            southWest: latestBounds.getSouthWest().wrap()
          }),
          [input.value, latestBounds]
        );
        const gestureHandlingOptions = (0, import_react14.useMemo)(
          () => ({
            locale: intl.locale
          }),
          [intl.locale]
        );
        return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
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
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_react_leaflet.TileLayer, { attribution: tileAttribution, url: tileUrl }),
                displayedMarkers ? data.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                  MarkerClusterIcon,
                  {
                    eventCount: entry.eventCount,
                    latitude: entry.latitude,
                    longitude: entry.longitude
                  },
                  entry.key
                )) : null,
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(OnMapMove, { onChange })
              ]
            }
          ),
          !disabledMapSearch ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(SearchHereControlComponent, { searchHere }) : null
        ] });
      }
    );
    Map_default = Map;
  }
});

// src/components/index.js
var components_exports = {};
__export(components_exports, {
  ActiveFilters: () => ActiveFilters,
  ChoiceFilter: () => ChoiceFilter_default,
  CustomFilter: () => CustomFilter_default,
  DateRangeFilter: () => DateRangeFilter_default,
  DefinedRangeFilter: () => DefinedRangeFilter_default,
  FavoriteToggle: () => FavoriteToggle,
  FavoritesFilter: () => FavoritesFilter_default,
  Field: () => import_react_final_form21.Field,
  Filters: () => Filters_default,
  FiltersManager: () => FiltersManager_default,
  FiltersProvider: () => FiltersProvider_default,
  FormSpy: () => import_react_final_form21.FormSpy,
  IntlProvider: () => IntlProvider,
  MapFilter: () => MapFilter_default,
  NumberRangeFilter: () => NumberRangeFilter_default,
  Panel: () => Panel,
  ReactIntlProvider: () => import_react_intl36.IntlProvider,
  SearchFilter: () => SearchFilter_default,
  SearchInput: () => SearchInput,
  SimpleDateRangeFilter: () => SimpleDateRangeFilter_default,
  Sort: () => Sort,
  Total: () => Total,
  ValueBadge: () => ValueBadge
});
module.exports = __toCommonJS(components_exports);

// src/components/filters/CustomFilter.js
var import_react4 = __toESM(require("react"), 1);
var import_react_final_form = require("react-final-form");
var import_a11yButtonActionHandler = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);

// src/utils/matchQuery.js
var import_isMatch = __toESM(require("lodash/isMatch.js"), 1);
var import_omitBy = __toESM(require("lodash/omitBy.js"), 1);
var import_isEmpty = __toESM(require("lodash/isEmpty.js"), 1);
function matchQuery(a, b) {
  return (0, import_isMatch.default)((0, import_omitBy.default)(a, import_isEmpty.default), (0, import_omitBy.default)(b, import_isEmpty.default));
}

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

// src/hooks/useFilterTitle.js
var import_react2 = require("react");
var import_react_intl11 = require("react-intl");

// src/utils/dateRanges.js
var import_date_fns = require("date-fns");
var import_react_intl = require("react-intl");
var messages = (0, import_react_intl.defineMessages)({
  today: {
    id: "ReactFilters.dateRanges.today",
    defaultMessage: "Today"
  },
  tomorrow: {
    id: "ReactFilters.dateRanges.tomorrow",
    defaultMessage: "Tomorrow"
  },
  thisWeekend: {
    id: "ReactFilters.dateRanges.thisWeekend",
    defaultMessage: "This week-end"
  },
  currentWeek: {
    id: "ReactFilters.dateRanges.currentWeek",
    defaultMessage: "Current week"
  },
  currentMonth: {
    id: "ReactFilters.dateRanges.currentMonth",
    defaultMessage: "Current month"
  }
});
function getClosestDayAfter(dayOfWeek, fromDate = /* @__PURE__ */ new Date()) {
  const dayOfWeekMap = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thur: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7
  };
  const offsetDays = dayOfWeekMap[dayOfWeek] - (0, import_date_fns.getISODay)(fromDate);
  return (0, import_date_fns.addDays)(fromDate, offsetDays);
}
function isSelected(range, _timeZone) {
  const definedRange = this.range();
  return range && ((0, import_date_fns.isSameDay)(range.startDate, definedRange.startDate) || range.startDate === definedRange.startDate) && ((0, import_date_fns.isSameDay)(range.endDate, definedRange.endDate) || range.endDate === definedRange.endDate);
}
function createStaticRanges(ranges) {
  return ranges.map((range) => ({ isSelected, ...range }));
}
function dateRanges(intl, opts = {}) {
  const { dateFnsLocale } = opts;
  const nextSaturday = getClosestDayAfter("Sat");
  const startOfWeekend = (0, import_date_fns.startOfDay)(nextSaturday);
  const endOfWeekend = (0, import_date_fns.endOfDay)((0, import_date_fns.addDays)(nextSaturday, 1));
  const now = /* @__PURE__ */ new Date();
  const defineds = {
    startOfToday: (0, import_date_fns.startOfDay)(now, { locale: dateFnsLocale }),
    endOfToday: (0, import_date_fns.endOfDay)(now, { locale: dateFnsLocale }),
    startOfTomorrow: (0, import_date_fns.startOfDay)((0, import_date_fns.addDays)(now, 1), { locale: dateFnsLocale }),
    endOfTomorrow: (0, import_date_fns.endOfDay)((0, import_date_fns.addDays)(now, 1), { locale: dateFnsLocale }),
    startOfWeek: (0, import_date_fns.startOfWeek)(now, { locale: dateFnsLocale }),
    endOfWeek: (0, import_date_fns.endOfWeek)(now, { locale: dateFnsLocale }),
    startOfMonth: (0, import_date_fns.startOfMonth)(now, { locale: dateFnsLocale }),
    endOfMonth: (0, import_date_fns.endOfMonth)(now, { locale: dateFnsLocale }),
    startOfWeekend,
    endOfWeekend
  };
  const defaults2 = {
    staticRanges: createStaticRanges([
      {
        id: "today",
        label: intl.formatMessage(messages.today),
        range: () => ({
          startDate: defineds.startOfToday,
          endDate: defineds.endOfToday
        })
      },
      {
        id: "tomorrow",
        label: intl.formatMessage(messages.tomorrow),
        range: () => ({
          startDate: defineds.startOfTomorrow,
          endDate: defineds.endOfTomorrow
        })
      },
      {
        id: "thisWeekend",
        label: intl.formatMessage(messages.thisWeekend),
        range: () => ({
          startDate: defineds.startOfWeekend,
          endDate: defineds.endOfWeekend
        })
      },
      {
        id: "currentWeek",
        label: intl.formatMessage(messages.currentWeek),
        range: () => ({
          startDate: defineds.startOfWeek,
          endDate: defineds.endOfWeek
        })
      },
      {
        id: "currentMonth",
        label: intl.formatMessage(messages.currentMonth),
        range: () => ({
          startDate: defineds.startOfMonth,
          endDate: defineds.endOfMonth
        })
      }
    ]),
    inputRanges: []
  };
  return {
    staticRanges: opts.staticRanges ? opts.staticRanges.reduce((accu, next) => {
      if (typeof next === "string") {
        const result = defaults2.staticRanges.find((w) => w.id === next);
        if (result) accu.push(result);
        else console.log(`Cannot found static range "${next}"`);
      } else {
        accu.push(next);
      }
      return accu;
    }, []) : defaults2.staticRanges,
    inputRanges: opts.inputRanges || defaults2.inputRanges
  };
}

// src/utils/minimizeAggregation.js
var shortKeys = [
  {
    short: "m",
    key: "missing"
  },
  {
    short: "s",
    key: "size"
  },
  {
    short: "t",
    key: "type"
  },
  {
    short: "k",
    key: "key"
  },
  {
    short: "f",
    key: "field"
  }
];
var shortValues = [
  {
    key: "type",
    short: "af",
    value: "additionalFields"
  }
];
function minimizeAggregation(aggregation) {
  if (typeof aggregation === "string") {
    return aggregation;
  }
  return Object.keys(aggregation).reduce(
    (carry, key) => {
      var _a, _b;
      return {
        ...carry,
        [((_a = shortKeys.find((shortKey) => shortKey.key === key)) == null ? void 0 : _a.short) ?? key]: ((_b = shortValues.find(
          (shortValue) => shortValue.key === key && aggregation[key] === shortValue.value
        )) == null ? void 0 : _b.short) ?? aggregation[key]
      };
    },
    {}
  );
}

// src/utils/filtersToAggregations.js
function filtersToAggregations(filters, base = false) {
  const usedFilters = base ? filters.filter(
    (filter) => filter.type === "choice" && (!filter.options || filter.missingValue)
  ) : filters;
  const aggregations = usedFilters.map((filter) => {
    if (filter.aggregation === null) {
      return false;
    }
    return {
      key: filter.name,
      type: filter.name,
      missing: filter.missingValue,
      ...filter.aggregation
    };
  }).filter((filter) => filter == null ? void 0 : filter.key);
  const needViewport = usedFilters.some((filter) => filter.type === "map");
  if (needViewport) {
    aggregations.unshift({
      key: "viewport",
      type: "viewport"
    });
  }
  return aggregations.map(minimizeAggregation);
}

// src/utils/extractFiltersFromDom.js
var import_react = __toESM(require("react"), 1);
function extractFiltersFromDom() {
  const filterElems = document.querySelectorAll("[data-oa-filter]");
  return Array.from(filterElems, (elem) => {
    const paramsAttr = elem.getAttribute("data-oa-filter-params");
    const dataSet = JSON.parse(paramsAttr);
    dataSet.destSelector = `[data-oa-filter="${elem.getAttribute("data-oa-filter")}"][data-oa-filter-params="${paramsAttr.replace(
      /["\\]/g,
      "\\$&"
    )}"]`;
    dataSet.elem = elem;
    if (dataSet.type === "custom" || dataSet.type === "favorites") {
      dataSet.handlerElem = dataSet.handlerSelector ? elem.querySelector(dataSet.handlerSelector) : null;
    } else {
      dataSet.elemRef = import_react.default.createRef();
    }
    return dataSet;
  });
}

// src/utils/extractWidgetsFromDom.js
function extractWidgetsFromDom() {
  const widgetElems = document.querySelectorAll("[data-oa-widget]");
  return Array.from(widgetElems, (elem) => {
    const paramsAttr = elem.getAttribute("data-oa-widget-params");
    const dataSet = JSON.parse(paramsAttr);
    dataSet.destSelector = `[data-oa-widget="${elem.getAttribute("data-oa-widget")}"][data-oa-widget-params="${paramsAttr.replace(
      /["\\]/g,
      "\\$&"
    )}"]`;
    dataSet.elem = elem;
    if (dataSet.name === "favorite") {
      dataSet.handlerElem = dataSet.handlerSelector ? elem.querySelector(dataSet.handlerSelector) : null;
      dataSet.activeTargetElem = dataSet.activeTargetSelector ? elem.querySelector(dataSet.activeTargetSelector) : null;
    }
    return dataSet;
  });
}

// src/utils/withDefaultFilterConfig.js
var import_defaults = __toESM(require("lodash/defaults.js"), 1);
var import_intl = require("@openagenda/intl");

// src/messages/relative.js
var import_react_intl2 = require("react-intl");
var relative_default = (0, import_react_intl2.defineMessages)({
  passed: {
    id: "ReactFilters.messages.relative.passed",
    defaultMessage: "Passed"
  },
  current: {
    id: "ReactFilters.messages.relative.current",
    defaultMessage: "Current"
  },
  upcoming: {
    id: "ReactFilters.messages.relative.upcoming",
    defaultMessage: "Upcoming"
  }
});

// src/messages/attendanceMode.js
var import_react_intl3 = require("react-intl");
var attendanceMode_default = (0, import_react_intl3.defineMessages)({
  offline: {
    id: "ReactFilters.messages.attendanceMode.offline",
    defaultMessage: "In situ"
  },
  online: {
    id: "ReactFilters.messages.attendanceMode.online",
    defaultMessage: "Online"
  },
  mixed: {
    id: "ReactFilters.messages.attendanceMode.mixed",
    defaultMessage: "Mixed"
  }
});

// src/messages/provenance.js
var import_react_intl4 = require("react-intl");
var provenance_default = (0, import_react_intl4.defineMessages)({
  contribution: {
    id: "ReactFilters.messages.provenance.contribution",
    defaultMessage: "Contribution"
  },
  aggregation: {
    id: "ReactFilters.messages.provenance.aggregation",
    defaultMessage: "Aggregation"
  },
  share: {
    id: "ReactFilters.messages.provenance.share",
    defaultMessage: "Share"
  }
});

// src/messages/featured.js
var import_react_intl5 = require("react-intl");
var featured_default = (0, import_react_intl5.defineMessages)({
  featured: {
    id: "ReactFilters.messages.featured.featured",
    defaultMessage: "Featured"
  }
});

// src/messages/state.js
var import_react_intl6 = require("react-intl");
var state_default = (0, import_react_intl6.defineMessages)({
  refused: {
    id: "ReactFilters.messages.state.refused",
    defaultMessage: "Refused"
  },
  toModerate: {
    id: "ReactFilters.messages.state.toModerate",
    defaultMessage: "To moderate"
  },
  controlled: {
    id: "ReactFilters.messages.state.controlled",
    defaultMessage: "Controlled"
  },
  published: {
    id: "ReactFilters.messages.state.published",
    defaultMessage: "Published"
  }
});

// src/messages/status.js
var import_react_intl7 = require("react-intl");
var status_default = (0, import_react_intl7.defineMessages)({
  programmed: {
    id: "ReactFilters.messages.status.programmed",
    // 1
    defaultMessage: "Programmed"
  },
  rescheduled: {
    id: "ReactFilters.messages.status.rescheduled",
    // 2
    defaultMessage: "Rescheduled"
  },
  movedOnline: {
    id: "ReactFilters.messages.status.movedOnline",
    // 3
    defaultMessage: "Moved online"
  },
  postponed: {
    id: "ReactFilters.messages.status.postponed",
    // 4
    defaultMessage: "Postponed"
  },
  full: {
    id: "ReactFilters.messages.status.full",
    // 5
    defaultMessage: "Fully booked"
  },
  cancelled: {
    id: "ReactFilters.messages.status.cancelled",
    // 6
    defaultMessage: "Cancelled"
  }
});

// src/messages/boolean.js
var import_react_intl8 = require("react-intl");
var boolean_default = (0, import_react_intl8.defineMessages)({
  selected: {
    id: "ReactFilters.messages.boolean.selected",
    defaultMessage: "Selected"
  },
  notSelected: {
    id: "ReactFilters.messages.boolean.notSelected",
    defaultMessage: "Not selected"
  }
});

// src/messages/accessibilities.js
var import_react_intl9 = require("react-intl");
var accessibilities_default = (0, import_react_intl9.defineMessages)({
  hi: {
    id: "ReactFilters.messages.accessiblities.hi",
    defaultMessage: "Hearing impairment"
  },
  vi: {
    id: "ReactFilters.messages.accessiblities.vi",
    defaultMessage: "Visual impairment"
  },
  pi: {
    id: "ReactFilters.messages.accessiblities.pi",
    defaultMessage: "Psychic impairment"
  },
  mi: {
    id: "ReactFilters.messages.accessiblities.mi",
    defaultMessage: "Motor impairment"
  },
  ii: {
    id: "ReactFilters.messages.accessiblities.ii",
    defaultMessage: "Intellectual impairment"
  }
});

// src/utils/withDefaultFilterConfig.js
function assignDateRanges(filter, intl, dataFnsLocale) {
  if (filter.type === "definedRange") {
    Object.assign(
      filter,
      dateRanges(intl, {
        dataFnsLocale,
        staticRanges: filter.staticRanges,
        inputRanges: filter.inputRanges
      })
    );
  }
}
function withDefaultFilterConfig(filter, intl, opts = {}) {
  const { missingValue, dataFnsLocale } = opts;
  switch (filter.name) {
    case "viewport":
      (0, import_defaults.default)(filter, {
        type: "none"
      });
      break;
    case "geo":
      (0, import_defaults.default)(filter, {
        type: "map",
        aggregation: null,
        // props for MapFilter
        tileAttribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
        tileUrl: opts.mapTiles ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      });
      break;
    case "addMethod":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(provenance_default.contribution),
            value: "contribution"
          },
          {
            label: intl.formatMessage(provenance_default.aggregation),
            value: "aggregation"
          },
          {
            label: intl.formatMessage(provenance_default.share),
            value: "share"
          }
        ],
        aggregation: {
          type: "addMethods"
        }
      });
      break;
    case "accessibility":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(accessibilities_default.hi),
            value: "hi"
          },
          {
            label: intl.formatMessage(accessibilities_default.vi),
            value: "vi"
          },
          {
            label: intl.formatMessage(accessibilities_default.pi),
            value: "pi"
          },
          {
            label: intl.formatMessage(accessibilities_default.mi),
            value: "mi"
          },
          {
            label: intl.formatMessage(accessibilities_default.ii),
            value: "ii"
          }
        ],
        aggregation: {
          type: "accessibilities"
        }
      });
      break;
    case "languages":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null
      });
      break;
    case "memberUid":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        labelKey: "member.name",
        aggregation: {
          type: "members"
        }
      });
      break;
    case "timings":
      (0, import_defaults.default)(filter, {
        type: "dateRange",
        aggregation: null
      });
      assignDateRanges(filter, intl, dataFnsLocale);
      break;
    case "createdAt":
      (0, import_defaults.default)(filter, {
        type: "dateRange",
        aggregation: null
      });
      assignDateRanges(filter, intl, dataFnsLocale);
      break;
    case "updatedAt":
      (0, import_defaults.default)(filter, {
        type: "dateRange",
        aggregation: null
      });
      assignDateRanges(filter, intl, dataFnsLocale);
      break;
    case "state":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(state_default.refused),
            value: "-1"
          },
          {
            label: intl.formatMessage(state_default.toModerate),
            value: "0"
          },
          {
            label: intl.formatMessage(state_default.controlled),
            value: "1"
          },
          {
            label: intl.formatMessage(state_default.published),
            value: "2"
          }
        ],
        aggregation: {
          type: "states"
        }
      });
      break;
    case "search":
      (0, import_defaults.default)(filter, {
        type: "search",
        aggregation: null
      });
      break;
    case "locationUid":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        labelKey: "location.name",
        aggregation: {
          type: "locations"
        }
      });
      break;
    case "sourceAgendaUid":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        labelKey: "agenda.title",
        aggregation: {
          type: "sourceAgendas"
        }
      });
      break;
    case "originAgendaUid":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        labelKey: "agenda.title",
        aggregation: {
          type: "originAgendas"
        }
      });
      break;
    case "featured":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(featured_default.featured),
            value: "true"
          }
        ],
        aggregation: null
      });
      break;
    case "relative":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(relative_default.passed),
            value: "passed"
          },
          {
            label: intl.formatMessage(relative_default.current),
            value: "current"
          },
          {
            label: intl.formatMessage(relative_default.upcoming),
            value: "upcoming"
          }
        ]
      });
      break;
    case "attendanceMode":
      (0, import_defaults.default)(filter, {
        type: "choice",
        aggregation: {
          type: "attendanceModes"
        },
        options: [
          {
            label: intl.formatMessage(attendanceMode_default.offline),
            value: "1"
          },
          {
            label: intl.formatMessage(attendanceMode_default.online),
            value: "2"
          },
          {
            label: intl.formatMessage(attendanceMode_default.mixed),
            value: "3"
          }
        ]
      });
      break;
    case "region":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "regions"
        }
      });
      break;
    case "department":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "departments"
        }
      });
      break;
    case "city":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "cities"
        }
      });
      break;
    case "countryCode":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "countryCodes"
        }
      });
      break;
    case "adminLevel3":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "adminLevels3"
        }
      });
      break;
    case "district":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "districts"
        }
      });
      break;
    case "keyword":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        aggregation: {
          type: "keywords"
        }
      });
      break;
    case "status":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(status_default.programmed),
            value: "1"
          },
          {
            label: intl.formatMessage(status_default.rescheduled),
            value: "2"
          },
          {
            label: intl.formatMessage(status_default.movedOnline),
            value: "3"
          },
          {
            label: intl.formatMessage(status_default.postponed),
            value: "4"
          },
          {
            label: intl.formatMessage(status_default.full),
            value: "5"
          },
          {
            label: intl.formatMessage(status_default.cancelled),
            value: "6"
          }
        ],
        aggregation: {
          type: "status"
        }
      });
      break;
    case "favorites":
      (0, import_defaults.default)(filter, {
        type: "favorites",
        aggregation: null
      });
      break;
    default:
      break;
  }
  const { fieldSchema } = filter;
  if ((fieldSchema == null ? void 0 : fieldSchema.fieldType) === "boolean") {
    (0, import_defaults.default)(filter, {
      name: fieldSchema.field,
      type: "choice",
      fieldSchema,
      options: [
        {
          label: intl.formatMessage(boolean_default.selected),
          value: "true"
        },
        {
          label: intl.formatMessage(boolean_default.notSelected),
          value: "false"
        }
      ],
      missingValue,
      aggregation: {
        type: "additionalFields",
        field: fieldSchema.field
      }
    });
  } else if (["number", "integer"].includes(fieldSchema == null ? void 0 : fieldSchema.fieldType)) {
    (0, import_defaults.default)(filter, {
      type: "numberRange",
      name: fieldSchema.field,
      fieldSchema,
      aggregation: null
    });
  } else if (fieldSchema) {
    (0, import_defaults.default)(filter, {
      name: fieldSchema.field,
      type: "choice",
      fieldSchema,
      options: !filter.aggregationOnly ? fieldSchema.options.map((option) => ({
        ...option,
        label: (0, import_intl.getLocaleValue)(option.label, intl.locale),
        value: String(option.id)
      })) : null,
      missingValue,
      aggregation: {
        type: "additionalFields",
        field: fieldSchema.field
      },
      labelKey: "label"
    });
  }
  return filter;
}

// src/utils/getFilterTitle.js
var import_intl2 = require("@openagenda/intl");

// src/messages/filterTitles.js
var import_react_intl10 = require("react-intl");
var filterTitles_default = (0, import_react_intl10.defineMessages)({
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
  const messages14 = providedMessages ?? filterTitles_default;
  if (fieldSchema == null ? void 0 : fieldSchema.label) {
    return (0, import_intl2.getLocaleValue)(fieldSchema.label, intl.locale);
  }
  if (messages14[messageKey]) {
    return intl.formatMessage(messages14[messageKey]);
  }
  return messageKey;
}

// src/hooks/useFilterTitle.js
function useFilterTitle(messageKey, fieldSchema, messages14) {
  const intl = (0, import_react_intl11.useIntl)();
  return (0, import_react2.useMemo)(
    () => getFilterTitle(intl, messages14, messageKey, fieldSchema),
    [intl, messages14, messageKey, fieldSchema]
  );
}

// src/components/ValueBadge.js
var import_classnames = __toESM(require("classnames"), 1);
var import_react_intl12 = require("react-intl");
var import_react3 = require("@emotion/react");
var import_intl3 = require("@openagenda/intl");
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
var messages2 = (0, import_react_intl12.defineMessages)({
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
  const intl = (0, import_react_intl12.useIntl)();
  const titleLabel = (title == null ? void 0 : title.length) ? intl.formatMessage(messages2.removeFilterWithTitle, { title }) : intl.formatMessage(messages2.removeFilter);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      type: "button",
      title: titleLabel,
      className: (0, import_classnames.default)("btn badge badge-pill badge-info margin-right-xs", {
        disabled
      }),
      css: import_react3.css`
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
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa fa-times", "aria-hidden": "true" })
      ]
    }
  );
}

// src/components/FilterPreviewer.js
var import_jsx_runtime2 = require("@emotion/react/jsx-runtime");
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
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, { children: valueOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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

// src/components/filters/CustomFilter.js
var import_jsx_runtime3 = require("@emotion/react/jsx-runtime");
var subscription = { values: true };
function Preview({
  name,
  component = FilterPreviewer,
  disabled,
  activeFilterLabel,
  filter,
  query,
  ...rest
}) {
  const form = (0, import_react_final_form.useForm)();
  const onRemove = (0, import_react4.useCallback)(
    (e) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      updateFormValues(form, filter.query, false);
    },
    [disabled, form, filter]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react_final_form.FormSpy, { subscription, children: ({ values }) => {
    if (!matchQuery(values, query) || !activeFilterLabel) {
      return null;
    }
    return import_react4.default.createElement(component, {
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
  const form = (0, import_react_final_form.useForm)();
  const firstRender = (0, import_react4.useRef)(true);
  const updateForm = (0, import_react4.useCallback)(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const query = form.getState().values;
      updateFormValues(form, filter.query, !matchQuery(query, filter.query));
    },
    [filter.query, form]
  );
  const onChange = (0, import_react4.useMemo)(
    () => (0, import_a11yButtonActionHandler.default)(updateForm),
    [updateForm]
  );
  (0, import_react4.useEffect)(() => {
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
var exported = import_react4.default.memo(CustomFilter);
exported.Preview = Preview;
var CustomFilter_default = exported;

// src/components/filters/DateRangeFilter.js
var import_react10 = __toESM(require("react"), 1);
var import_react_final_form3 = require("react-final-form");
var import_react_intl14 = require("react-intl");
var import_date_fns3 = require("date-fns");
var import_date_fns_tz = require("date-fns-tz");

// src/components/fields/DateRangePicker.js
var import_isEqual = __toESM(require("lodash/isEqual.js"), 1);
var import_isDate = __toESM(require("lodash/isDate.js"), 1);
var import_react7 = __toESM(require("react"), 1);
var import_react_intl13 = require("react-intl");
var import_useIsomorphicLayoutEffect = __toESM(require("react-use/lib/useIsomorphicLayoutEffect.js"), 1);
var import_useLatest = __toESM(require("react-use/lib/useLatest.js"), 1);
var import_usePrevious = __toESM(require("react-use/lib/usePrevious.js"), 1);
var import_classnames2 = __toESM(require("classnames"), 1);
var import_date_fns2 = require("date-fns");
var import_en_US = __toESM(require("date-fns/locale/en-US/index.js"), 1);
var import_react_date_range = require("@openagenda/react-date-range");
var import_intl4 = require("@openagenda/intl");
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
var import_react6 = require("react");
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
  return (0, import_react6.useCallback)(
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
var import_jsx_runtime4 = require("@emotion/react/jsx-runtime");
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
  const fallbackChain = (0, import_intl4.getFallbackChain)(locale);
  for (const fallback of fallbackChain) {
    if (dateDisplayFormats[fallback]) {
      return dateDisplayFormats[fallback];
    }
  }
  return dateDisplayFormats[Object.keys(dateDisplayFormats).shift()];
}
function focusedDateToTimingsQuery(focusedDate) {
  return {
    gte: (0, import_date_fns2.startOfMonth)(focusedDate),
    lte: (0, import_date_fns2.endOfMonth)(focusedDate),
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
  const intl = (0, import_react_intl13.useIntl)();
  const dateRangeRef = (0, import_react7.useRef)(null);
  const [data, setData] = (0, import_react7.useState)(() => []);
  const {
    filtersOptions: { dateFnsLocale, searchMethod, res }
  } = (0, import_react7.useContext)(FiltersAndWidgetsContext_default);
  const [ranges, setRanges] = (0, import_react7.useState)(
    () => input.value ?? defaultGetInitialValue()
  );
  const [dragStatus, setDragStatus] = (0, import_react7.useState)(false);
  const [focusedRange, setFocusedRange] = (0, import_react7.useState)([0, 0]);
  const latestRanges = useLatest(ranges);
  const latestFocusedRange = useLatest(focusedRange);
  const previousValue = usePrevious(input.value);
  const { onChange } = input;
  const onSelectPreviewChange = (0, import_react7.useCallback)(
    (value) => {
      var _a;
      const dateRange = dateRangeRef.current;
      setDragStatus((_a = dateRangeRef.current) == null ? void 0 : _a.calendar.state.drag.status);
      dateRange.updatePreview(value ? dateRange.calcNewSelection(value) : null);
    },
    [dateRangeRef]
  );
  const onDefinedPreviewChange = (0, import_react7.useCallback)(
    (value) => {
      const dateRange = dateRangeRef.current;
      return dateRange.updatePreview(
        value ? dateRange.calcNewSelection(value, typeof value === "string") : null
      );
    },
    [dateRangeRef]
  );
  const onTemporaryChange = (0, import_react7.useCallback)(
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
  const onDefinedRangeChange = (0, import_react7.useCallback)(
    (item) => {
      const value = [(item == null ? void 0 : item.selection) ? item.selection : item.range1];
      setRanges(value);
      onChange(value);
    },
    [onChange]
  );
  const disabledDay = (0, import_react7.useCallback)(() => disabled, [disabled]);
  const rdrNoSelection = (0, import_react7.useMemo)(() => {
    const range = ranges == null ? void 0 : ranges[0];
    const hasRange = range && range.endDate !== null;
    return !hasRange && !dragStatus;
  }, [ranges, dragStatus]);
  const [focusedDate, setFocusedDate] = (0, import_react7.useState)(null);
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
  (0, import_react7.useEffect)(() => {
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
  (0, import_react7.useImperativeHandle)(ref, () => ({
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
  const dayContentRenderer = (0, import_react7.useCallback)(
    (day) => {
      const isActive = data.find(
        (d) => (0, import_date_fns2.isSameDay)(new Date(d.key), day) && d.timingCount > 0
      );
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "span",
        {
          className: isActive ? "rdrDayWithTimings" : "rdrDayWithoutTimings",
          children: (0, import_date_fns2.format)(day, "d")
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
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "div",
    {
      className: (0, import_classnames2.default)("rdrDateRangePickerWrapper", className, { rdrNoSelection }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
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
        staticRanges.length ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
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
var DateRangePicker_default = import_react7.default.forwardRef(DateRangePicker);

// src/components/Title.js
var import_react8 = __toESM(require("react"), 1);
var import_react_final_form2 = require("react-final-form");
var import_jsx_runtime5 = require("@emotion/react/jsx-runtime");
var subscription2 = { value: true };
function Title({ name, filter, component, ...rest }) {
  var _a;
  const title = useFilterTitle(name, filter.fieldSchema);
  const field = (0, import_react_final_form2.useField)(name, { subscription: subscription2 });
  const { input } = field;
  if (!((_a = input.value) == null ? void 0 : _a.length) && !(typeof input.value === "object" && input.value !== null)) {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { children: title });
  }
  if (!component) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex-auto", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "padding-right-xs", children: title }),
    import_react8.default.createElement(component, {
      name,
      filter,
      className: "oa-filter-value-preview",
      withTitle: false,
      ...rest
    })
  ] });
}

// src/components/Panel.js
var import_react9 = require("react");
var import_classnames3 = __toESM(require("classnames"), 1);
var import_a11yButtonActionHandler2 = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);
var import_jsx_runtime6 = require("@emotion/react/jsx-runtime");
function Panel({
  collapsed = true,
  setCollapsed,
  header,
  children
}) {
  const internalState = (0, import_react9.useState)(collapsed);
  const value = typeof setCollapsed === "function" ? collapsed : internalState[0];
  const updater = typeof setCollapsed === "function" ? setCollapsed : internalState[1];
  const toggleCollapsed = (0, import_react9.useMemo)(
    () => (0, import_a11yButtonActionHandler2.default)((e) => {
      e.preventDefault();
      updater((v) => !v);
    }),
    [updater]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
    "div",
    {
      className: (0, import_classnames3.default)("oa-collapse-item", { "oa-collapse-item-active": !value }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
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
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "oa-collapse-arrow", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "div",
          {
            className: (0, import_classnames3.default)("oa-collapse-content", {
              "oa-collapse-content-active": !value,
              "oa-collapse-content-inactive": value
            }),
            role: "tabpanel",
            children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "oa-collapse-content-box", children })
          }
        )
      ]
    }
  );
}

// src/components/filters/DateRangeFilter.js
var import_jsx_runtime7 = require("@emotion/react/jsx-runtime");
var messages3 = (0, import_react_intl14.defineMessages)({
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
var subscription3 = { value: true };
function formatDateValue(value) {
  if (!value || value === "") {
    return null;
  }
  return typeof value === "string" ? (0, import_date_fns3.parseISO)(value) : value;
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
  const lte = (selection.endDate ? (0, import_date_fns3.endOfDay)(selection.endDate) : selection.endDate).toISOString();
  const result = {};
  if (gte) result.gte = gte;
  if (lte) result.lte = lte;
  result.tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return result;
}
function Preview2({
  name,
  staticRanges = [],
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = (0, import_react_intl14.useIntl)();
  const { input } = (0, import_react_final_form3.useField)(name, { subscription: subscription3 });
  const { tz } = input.value;
  const value = formatValue(input.value)[0];
  const selectedStaticRange = (0, import_react10.useMemo)(
    () => value && staticRanges.find((v) => v.isSelected(value, tz)),
    [value, staticRanges, tz]
  );
  const singleDay = (0, import_react10.useMemo)(
    () => (value == null ? void 0 : value.startDate) && (value == null ? void 0 : value.endDate) && (0, import_date_fns3.isSameDay)(value.startDate, value.endDate),
    [value]
  );
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
    label = intl.formatMessage(messages3.until, {
      date: formatDate(value.endDate)
    });
  } else if (value.endDate === null) {
    label = intl.formatMessage(messages3.from, {
      date: formatDate(value.startDate)
    });
  } else {
    label = singleDay ? formatDate(value.startDate) : intl.formatMessage(messages3.dateRange, {
      startDate: formatDate(value.startDate),
      endDate: formatDate(value.endDate)
    });
  }
  return import_react10.default.createElement(component, {
    name,
    staticRanges,
    label,
    onRemove,
    disabled,
    ...rest
  });
}
var DateRangeFilter = import_react10.default.forwardRef(function DateRangeFilter2({
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
  const intl = (0, import_react_intl14.useIntl)();
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    import_react_final_form3.Field,
    {
      ref,
      name,
      subscription: subscription3,
      parse: parseValue,
      format: formatValue,
      component: DateRangePicker_default,
      staticRanges,
      inputRanges,
      startDatePlaceholder: intl.formatMessage(messages3.startDate),
      endDatePlaceholder: intl.formatMessage(messages3.endDate),
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
var Collapsable = import_react10.default.forwardRef(function Collapsable2({ name, filter, component, disabled, staticRanges, inputRanges, ...rest }, ref) {
  const [collapsed, setCollapsed] = (0, import_react10.useState)(true);
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    Panel,
    {
      header: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        Title,
        {
          name,
          filter,
          component: Preview2,
          staticRanges,
          disabled
        }
      ),
      collapsed,
      setCollapsed,
      children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
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
var exported2 = import_react10.default.memo(DateRangeFilter);
exported2.Preview = Preview2;
exported2.Collapsable = Collapsable;
var DateRangeFilter_default = exported2;

// src/components/filters/DefinedRangeFilter.js
var import_react12 = __toESM(require("react"), 1);
var import_react_final_form4 = require("react-final-form");
var import_react_intl15 = require("react-intl");
var import_date_fns4 = require("date-fns");

// src/components/fields/DefinedRangeField.js
var import_isEqual2 = __toESM(require("lodash/isEqual.js"), 1);
var import_isDate2 = __toESM(require("lodash/isDate.js"), 1);
var import_react11 = __toESM(require("react"), 1);
var import_react_date_range2 = require("@openagenda/react-date-range");
var import_useIsomorphicLayoutEffect2 = __toESM(require("react-use/lib/useIsomorphicLayoutEffect.js"), 1);
var import_useLatest2 = __toESM(require("react-use/lib/useLatest.js"), 1);
var import_usePrevious2 = __toESM(require("react-use/lib/usePrevious.js"), 1);
var import_jsx_runtime8 = require("@emotion/react/jsx-runtime");
var useIsomorphicLayoutEffect2 = import_useIsomorphicLayoutEffect2.default.default || import_useIsomorphicLayoutEffect2.default;
var useLatest2 = import_useLatest2.default.default || import_useLatest2.default;
var usePrevious2 = import_usePrevious2.default.default || import_usePrevious2.default;
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
  const [ranges, setRanges] = (0, import_react11.useState)(
    () => input.value ?? defaultGetInitialValue2()
  );
  const latestRanges = useLatest2(ranges);
  const previousValue = usePrevious2(input.value);
  const { onChange } = input;
  const onDefinedRangeChange = (0, import_react11.useCallback)(
    (item) => {
      const value = [(item == null ? void 0 : item.selection) ? item.selection : item.range1];
      setRanges(value);
      onChange(value);
    },
    [onChange]
  );
  useIsomorphicLayoutEffect2(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "rdrDateRangePickerWrapper", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    import_react_date_range2.DefinedRange,
    {
      ...definedRangePickerProps,
      onChange: onDefinedRangeChange,
      className: void 0
    }
  ) });
}
var DefinedRangeField_default = import_react11.default.forwardRef(DefinedRangeField);

// src/components/filters/DefinedRangeFilter.js
var import_jsx_runtime9 = require("@emotion/react/jsx-runtime");
var messages4 = (0, import_react_intl15.defineMessages)({
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
var subscription4 = { value: true };
function formatValue2(value) {
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
function parseValue2(value) {
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
function Preview3({
  name,
  staticRanges = [],
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  var _a;
  const intl = (0, import_react_intl15.useIntl)();
  const { input } = (0, import_react_final_form4.useField)(name, {
    subscription: subscription4,
    parse: parseValue2,
    format: formatValue2
  });
  const value = (_a = input.value) == null ? void 0 : _a[0];
  const selectedStaticRange = (0, import_react12.useMemo)(
    () => value && staticRanges.find((v) => v.isSelected(value)),
    [value, staticRanges]
  );
  const singleDay = (0, import_react12.useMemo)(
    () => (value == null ? void 0 : value.startDate) && (value == null ? void 0 : value.endDate) && (0, import_date_fns4.isSameDay)(value.startDate, value.endDate),
    [value]
  );
  const onRemove = (0, import_react12.useCallback)(
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
    label = intl.formatMessage(messages4.until, { date: value.endDate });
  } else if (value.endDate === null) {
    label = intl.formatMessage(messages4.from, { date: value.startDate });
  } else {
    label = singleDay ? intl.formatMessage(messages4.singleDate, { date: value.startDate }) : intl.formatMessage(messages4.dateRange, {
      startDate: value.startDate,
      endDate: value.endDate
    });
  }
  return import_react12.default.createElement(component, {
    name,
    staticRanges,
    label,
    onRemove,
    disabled,
    ...rest
  });
}
var DefinedRangeFilter = import_react12.default.forwardRef(function DefinedRangeFilter2({ name, staticRanges, inputRanges }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
    import_react_final_form4.Field,
    {
      ref,
      name,
      subscription: subscription4,
      parse: parseValue2,
      format: formatValue2,
      component: DefinedRangeField_default,
      staticRanges,
      inputRanges
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
          component: Preview3,
          staticRanges,
          disabled
        }
      ),
      collapsed,
      setCollapsed,
      children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
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
var exported3 = import_react12.default.memo(DefinedRangeFilter);
exported3.Preview = Preview3;
exported3.Collapsable = Collapsable3;
var DefinedRangeFilter_default = exported3;

// src/components/filters/MapFilter.js
var import_react17 = __toESM(require("react"), 1);
var import_react_final_form6 = require("react-final-form");
var import_react_intl19 = require("react-intl");

// src/components/fields/MapField/index.js
var import_react15 = __toESM(require("react"), 1);
var import_react16 = require("@emotion/react");
var import_classnames5 = __toESM(require("classnames"), 1);

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
var import_jsx_runtime12 = require("@emotion/react/jsx-runtime");
var mapContainerStyle = import_react16.css`
  position: relative;
`;
var mapStyle = import_react16.css`
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
  return !collapsed ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { css: mapContainerStyle, className: (0, import_classnames5.default)(className, mapClass), children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
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
var MapField_default = import_react15.default.forwardRef(MapField);

// src/components/filters/MapFilter.js
var import_jsx_runtime13 = require("@emotion/react/jsx-runtime");
var subscription5 = { value: true };
var messages5 = (0, import_react_intl19.defineMessages)({
  previewLabel: {
    id: "ReactFilters.filters.MapFilter.previewLabel",
    defaultMessage: "Map"
  }
});
function Preview4({
  name,
  filter,
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = (0, import_react_intl19.useIntl)();
  const { input } = (0, import_react_final_form6.useField)(name, { subscription: subscription5 });
  const onRemove = (0, import_react17.useCallback)(
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
  return import_react17.default.createElement(component, {
    name,
    filter,
    label: intl.formatMessage(messages5.previewLabel),
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
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
    import_react_final_form6.Field,
    {
      collapsed,
      ref,
      name,
      subscription: subscription5,
      component,
      filter,
      disabled,
      className,
      ...rest
    }
  );
}
var Collapsable5 = import_react17.default.forwardRef(function Collapsable6({ name, filter, disabled, ...rest }, ref) {
  const [collapsed, setCollapsed] = (0, import_react17.useState)(true);
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
    Panel,
    {
      header: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        Title,
        {
          name,
          filter,
          component: Preview4,
          disabled
        }
      ),
      collapsed,
      setCollapsed,
      children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
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
var exported4 = import_react17.default.memo(import_react17.default.forwardRef(MapFilter));
exported4.Preview = Preview4;
exported4.Collapsable = Collapsable5;
var MapFilter_default = exported4;

// src/components/filters/ChoiceFilter.js
var import_react20 = __toESM(require("react"), 1);
var import_react_final_form7 = require("react-final-form");
var import_react_uid2 = require("react-uid");
var import_react_intl23 = require("react-intl");
var import_usePrevious4 = __toESM(require("react-use/lib/usePrevious.js"), 1);
var import_react21 = require("@emotion/react");

// src/components/fields/ChoiceField.js
var import_react18 = __toESM(require("react"), 1);
var import_react_uid = require("react-uid");
var import_react_intl20 = require("react-intl");
var import_classnames6 = __toESM(require("classnames"), 1);
var import_intl5 = require("@openagenda/intl");
var import_a11yButtonActionHandler3 = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);
var import_jsx_runtime14 = require("@emotion/react/jsx-runtime");
function useOnChoiceChange(input, preventDefault) {
  const inputRef = (0, import_react18.useRef)();
  const onChange = (0, import_react18.useMemo)(
    () => (0, import_a11yButtonActionHandler3.default)((e) => {
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
var ChoiceField = import_react18.default.forwardRef(function ChoiceField2({
  input,
  getTotal,
  filter,
  option,
  disabled,
  tag: Tag = "div",
  preventDefault = true
}, ref) {
  const intl = (0, import_react_intl20.useIntl)();
  const seed = (0, import_react_uid.useUIDSeed)();
  const total = (0, import_react18.useMemo)(
    () => getTotal == null ? void 0 : getTotal(filter, option),
    [filter, getTotal, option]
  );
  const { inputRef, onChange } = useOnChoiceChange(input, preventDefault);
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
    Tag,
    {
      className: (0, import_classnames6.default)(input.type, {
        disabled,
        active: input.checked,
        inactive: !input.checked
      }),
      children: /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
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
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
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
            (0, import_intl5.getLocaleValue)(option.label, intl.locale) || /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_jsx_runtime14.Fragment, { children: "\xA0" }),
            Number.isInteger(total) && total !== 0 ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "oa-filter-total", children: total }) : null
          ]
        }
      )
    }
  );
});
var ChoiceField_default = ChoiceField;

// src/hooks/useChoiceState.js
var import_react19 = require("react");
var import_useIsomorphicLayoutEffect3 = __toESM(require("react-use/lib/useIsomorphicLayoutEffect.js"), 1);
var import_usePrevious3 = __toESM(require("react-use/lib/usePrevious.js"), 1);
var import_react_intl21 = require("react-intl");
var import_fuse = __toESM(require("fuse.js"), 1);
var import_useConstant = __toESM(require("@openagenda/react-shared/dist/hooks/useConstant.js"), 1);
var useIsomorphicLayoutEffect3 = import_useIsomorphicLayoutEffect3.default.default || import_useIsomorphicLayoutEffect3.default;
var usePrevious3 = import_usePrevious3.default.default || import_usePrevious3.default;
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
  const intl = (0, import_react_intl21.useIntl)();
  const [countOptions, setCountOptions] = (0, import_react19.useState)(pageSize);
  const options = (0, import_react19.useMemo)(() => getOptions(filter), [filter, getOptions]);
  const fuse = (0, import_useConstant.default)(
    () => new import_fuse.default(options, {
      threshold: 0.3,
      ignoreLocation: true,
      keys: ["label"]
    })
  );
  const collator = (0, import_react19.useMemo)(
    () => getCollator(intl.locale, intl.defaultLocale),
    [intl.defaultLocale, intl.locale]
  );
  const [searchValue, setSearchValue] = (0, import_react19.useState)("");
  const previousSearchValue = usePrevious3(searchValue);
  const [foundOptions, setFoundOptions] = (0, import_react19.useState)(
    filterOptions({
      options,
      fuse,
      searchValue,
      sort,
      collator
    })
  );
  const moreOptions = (0, import_react19.useCallback)(
    () => setCountOptions((v) => v + pageSize),
    [pageSize]
  );
  const lessOptions = (0, import_react19.useCallback)(() => setCountOptions(pageSize), [pageSize]);
  const previousCollpased = usePrevious3(collapsed);
  useIsomorphicLayoutEffect3(() => {
    if (previousCollpased && !collapsed) {
      lessOptions();
    }
  }, [collapsed, lessOptions, previousCollpased]);
  const hasMoreOptions = countOptions < foundOptions.length;
  const onSearchChange = (0, import_react19.useCallback)((e) => setSearchValue(e.target.value), []);
  useIsomorphicLayoutEffect3(() => {
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
  useIsomorphicLayoutEffect3(() => {
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
var import_react_intl22 = require("react-intl");
var choiceFilter_default = (0, import_react_intl22.defineMessages)({
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
var import_jsx_runtime15 = require("@emotion/react/jsx-runtime");
var usePrevious4 = import_usePrevious4.default.default || import_usePrevious4.default;
var subscription6 = { value: true };
function parseValue3(value) {
  if (Array.isArray(value) && !value.length) {
    return void 0;
  }
  return value;
}
function formatValue3(value) {
  return value;
}
function Preview5({
  name,
  filter,
  getOptions,
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = (0, import_react_intl23.useIntl)();
  const { input } = (0, import_react_final_form7.useField)(name, { subscription: subscription6 });
  const options = (0, import_react20.useMemo)(() => getOptions(filter), [filter, getOptions]);
  const valueOptions = (0, import_react20.useMemo)(() => {
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
  const onRemove = (0, import_react20.useCallback)(
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
  return import_react20.default.createElement(component, {
    name,
    filter,
    getOptions,
    valueOptions,
    onRemove,
    disabled,
    ...rest
  });
}
var ChoiceFilter = import_react20.default.forwardRef(function ChoiceFilter2({
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
  const intl = (0, import_react_intl23.useIntl)();
  const seed = (0, import_react_uid2.useUIDSeed)();
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
  const newOptionRef = (0, import_react20.useRef)(null);
  const previousCountOptions = usePrevious4(countOptions);
  (0, import_react20.useEffect)(() => {
    if (newOptionRef.current && countOptions !== previousCountOptions && countOptions - pageSize === previousCountOptions) {
      newOptionRef.current.focus();
    }
  }, [countOptions, previousCountOptions]);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(import_jsx_runtime15.Fragment, { children: [
    options.length > searchMinSize ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      "input",
      {
        className: "form-control input-sm margin-top-xs",
        value: searchValue,
        onChange: onSearchChange,
        placeholder: searchPlaceholder || intl.formatMessage(choiceFilter_default.searchPlaceholder),
        "aria-label": searchAriaLabel,
        title: searchAriaLabel,
        css: import_react21.css`
            width: 50%;
          `
      }
    ) : null,
    foundOptions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "text-muted margin-v-xs", children: intl.formatMessage(choiceFilter_default.noResult) }) : null,
    foundOptions.map((option, index) => index < countOptions ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      import_react_final_form7.Field,
      {
        name,
        subscription: subscription6,
        parse: parseValue3,
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
    hasMoreOptions ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      "button",
      {
        type: "button",
        className: "btn btn-link btn-link-inline",
        onClick: moreOptions,
        children: intl.formatMessage(choiceFilter_default.moreOptions)
      }
    ) : null,
    !hasMoreOptions && countOptions > pageSize ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
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
var Collapsable7 = import_react20.default.forwardRef(function Collapsable8({ name, filter, component, getTotal, getOptions, disabled, ...rest }, ref) {
  const [collapsed, setCollapsed] = (0, import_react20.useState)(filter.defaultCollapsed ?? true);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
    Panel,
    {
      header: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
        Title,
        {
          name,
          filter,
          component: Preview5,
          getOptions,
          disabled
        }
      ),
      collapsed,
      setCollapsed,
      children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
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
var exported5 = import_react20.default.memo(ChoiceFilter);
exported5.Preview = Preview5;
exported5.Collapsable = Collapsable7;
var ChoiceFilter_default = exported5;

// src/components/filters/SearchFilter.js
var import_react23 = __toESM(require("react"), 1);
var import_react_final_form9 = require("react-final-form");
var import_react_uid3 = require("react-uid");
var import_react_intl25 = require("react-intl");

// src/components/fields/SearchInput.js
var import_react22 = __toESM(require("react"), 1);
var import_react_final_form8 = require("react-final-form");
var import_use_debounce = require("use-debounce");
var import_react_intl24 = require("react-intl");
init_FiltersAndWidgetsContext();
var import_jsx_runtime16 = require("@emotion/react/jsx-runtime");
var messages6 = (0, import_react_intl24.defineMessages)({
  ariaLabel: {
    id: "ReactFilters.components.fields.SearchInput.ariaLabel",
    defaultMessage: "Search"
  }
});
function Input({ input, placeholder, ariaLabel, onButtonClick, manualSubmit }) {
  const intl = (0, import_react_intl24.useIntl)();
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
  const [tmpValue, setTmpValue] = (0, import_react22.useState)(input.value);
  const {
    filtersOptions: { manualSubmit }
  } = (0, import_react22.useContext)(FiltersAndWidgetsContext_default);
  const debouncedOnChange = (0, import_use_debounce.useDebouncedCallback)((e) => {
    if (manualSearch) {
      return;
    }
    input.onChange(e);
    if (typeof onChange === "function") {
      onChange(e.target.value);
    }
  }, 400);
  const inputOnChange = (0, import_react22.useCallback)(
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
  const onButtonClick = (0, import_react22.useCallback)(
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
  const wrappedInput = (0, import_react22.useMemo)(
    () => ({
      ...input,
      value: tmpValue,
      onChange: inputOnChange
    }),
    [input, inputOnChange, tmpValue]
  );
  (0, import_react22.useEffect)(() => {
    setTmpValue(input.value);
  }, [input.value]);
  return import_react22.default.createElement(inputComponent, {
    input: wrappedInput,
    onButtonClick,
    manualSubmit,
    ...rest
  });
}

// src/components/filters/SearchFilter.js
var import_jsx_runtime17 = require("@emotion/react/jsx-runtime");
var subscription7 = { value: true };
var messages7 = (0, import_react_intl25.defineMessages)({
  placeholder: {
    id: "ReactFilters.filters.searchFilter.placeholder",
    defaultMessage: "Search"
  },
  previewLabel: {
    id: "ReactFilters.filters.searchFilter.previewLabel",
    defaultMessage: "Search"
  }
});
function Preview6({
  name,
  filter,
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const { input } = (0, import_react_final_form9.useField)(name, { subscription: subscription7 });
  const onRemove = (0, import_react23.useCallback)(
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
  return import_react23.default.createElement(component, {
    name,
    filter,
    label: input.value,
    onRemove,
    disabled,
    ...rest
  });
}
var SearchFilter = import_react23.default.forwardRef(function SearchFilter2({ name, filter, component = SearchInput, placeholder = null, ...rest }, _ref) {
  const seed = (0, import_react_uid3.useUIDSeed)();
  const intl = (0, import_react_intl25.useIntl)();
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
var exported6 = import_react23.default.memo(SearchFilter);
exported6.Preview = Preview6;
var SearchFilter_default = exported6;

// src/components/filters/FavoritesFilter.js
var import_react30 = __toESM(require("react"), 1);
var import_react_final_form13 = require("react-final-form");
var import_useLatest3 = __toESM(require("react-use/lib/useLatest.js"), 1);
var import_a11yButtonActionHandler4 = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);

// src/hooks/useActiveFilters.js
var import_react_final_form10 = require("react-final-form");
var import_react24 = require("react");

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
  const { values } = (0, import_react_final_form10.useFormState)({ subscription: { values: true } });
  const sortedFilters = (0, import_react24.useMemo)(
    () => filters.map(({ destSelector, ...filter }) => filter).sort(staticRangesFirst).sort(customFirst),
    [filters]
  );
  return (0, import_react24.useMemo)(
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

// src/hooks/useFavoritesOnChange.js
var import_react25 = require("react");
var import_react_final_form11 = require("react-final-form");
function useFavoritesOnChange(eventUids, { isExclusive } = {}) {
  const form = (0, import_react_final_form11.useForm)();
  return (0, import_react25.useCallback)(
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
var import_react26 = require("react");
var import_use_local_storage_state = require("use-local-storage-state");
var useFavoriteLocalStorageState = (0, import_use_local_storage_state.createLocalStorageStateHook)("favorite-events");
function useFavoriteState(agendaUid) {
  const [value, setValue] = useFavoriteLocalStorageState();
  const setAgendaValue = (0, import_react26.useCallback)(
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

// src/hooks/useGetFilterOptions.js
var import_get = __toESM(require("lodash/get.js"), 1);
var import_react27 = require("react");
var import_react_intl26 = require("react-intl");
var import_intl6 = require("@openagenda/intl");
var messages8 = (0, import_react_intl26.defineMessages)({
  emptyOption: {
    id: "ReactFilters.useGetFilterOptions.emptyOption",
    defaultMessage: "(Without value)"
  }
});
function useGetFilterOptions(intl, filtersBase, aggregations) {
  return (0, import_react27.useCallback)(
    (filter) => {
      var _a;
      const missingLabel = intl.formatMessage(messages8.emptyOption);
      if (filter.options) {
        const missingOption = filter.missingValue ? (_a = filtersBase == null ? void 0 : filtersBase[filter.name]) == null ? void 0 : _a.find((v) => {
          const dataKey = "id" in v ? "id" : "key";
          return v[dataKey] === filter.missingValue;
        }) : null;
        return missingOption ? [
          {
            label: missingLabel,
            key: filter.missingValue,
            value: filter.missingValue
          }
        ].concat(filter.options) : filter.options;
      }
      if (!(filtersBase == null ? void 0 : filtersBase[filter.name])) return [];
      const baseAgg = [...filtersBase[filter.name]];
      const aggregation = aggregations[filter.name];
      if (aggregation) {
        aggregation.forEach((entry) => {
          const dataKey = "id" in entry ? "id" : "key";
          const found = baseAgg.find((v) => v[dataKey] === entry[dataKey]);
          if (!found) baseAgg.push(entry);
        });
      }
      const labelKey = filter.labelKey || "key";
      return baseAgg.map((entry) => {
        const dataKey = "id" in entry ? "id" : "key";
        const labelValue = (0, import_get.default)(entry, labelKey);
        return {
          ...entry,
          label: labelValue === filter.missingValue ? missingLabel : (0, import_intl6.getLocaleValue)(labelValue, intl.locale),
          value: String(entry[dataKey])
        };
      });
    },
    [intl, aggregations, filtersBase]
  );
}

// src/hooks/useGetTotal.js
var import_react28 = require("react");
function useGetTotal(aggregations) {
  return (0, import_react28.useCallback)(
    (filter, option) => {
      const aggregation = aggregations[filter.name];
      if (!aggregation) return null;
      const dataKey = "id" in option ? "id" : "key";
      const optionKey = "id" in option ? "id" : "value";
      const optionValue = aggregation.find(
        (v) => String(v[dataKey]) === String(option[optionKey])
      );
      if (optionValue) {
        return optionValue.eventCount || 0;
      }
      return 0;
    },
    [aggregations]
  );
}

// src/hooks/useLoadGeoData.js
var import_react29 = require("react");
var import_qs2 = __toESM(require("qs"), 1);
function useLoadGeoData(_apiClient, res, queryOrFn, options = {}) {
  const { searchMethod = "get" } = options;
  return (0, import_react29.useCallback)(
    async (bounds, zoom) => {
      const query = typeof queryOrFn === "function" ? queryOrFn() : queryOrFn;
      const northEast = bounds.getNorthEast().wrap();
      const southWest = bounds.getSouthWest().wrap();
      const params = {
        // oaq: { passed: 1 },
        size: 0,
        ...query,
        aggregations: [
          {
            type: "geohash",
            size: 2e3,
            zoom: Math.max(zoom, 1),
            radius: zoom === 0 ? 80 : 40
          }
        ],
        geo: {
          northEast,
          southWest
        }
      };
      const result = await (searchMethod === "get" ? fetch(
        `${res}${getQuerySeparator(res)}${import_qs2.default.stringify(params, {
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
        throw new Error("Can't load geo data");
      });
      return result.aggregations.geohash;
    },
    [res, queryOrFn, searchMethod]
  );
}

// src/hooks/index.js
var import_react_final_form12 = require("react-final-form");

// src/components/filters/FavoritesFilter.js
var import_jsx_runtime18 = require("@emotion/react/jsx-runtime");
var useLatest3 = import_useLatest3.default.default || import_useLatest3.default;
var subscription8 = { values: true };
function Preview7({
  name = "favorites",
  filter,
  component = FilterPreviewer,
  disabled,
  activeFilterLabel,
  agendaUid,
  ...rest
}) {
  const form = (0, import_react_final_form13.useForm)();
  const [value] = useFavoriteState(filter.agendaUid || agendaUid);
  const onRemove = (0, import_react30.useCallback)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(import_react_final_form13.FormSpy, { subscription: subscription8, children: ({ values }) => {
    const query = {
      uid: value,
      favorites: "1"
    };
    if (!matchQuery(values, query) || !activeFilterLabel) {
      return null;
    }
    return import_react30.default.createElement(component, {
      name,
      label: activeFilterLabel,
      onRemove,
      disabled,
      filter,
      ...rest
    });
  } });
}
var FavoritesFilter = import_react30.default.forwardRef(function FavoritesFilter2({ agendaUid, filter }, _ref) {
  const form = (0, import_react_final_form13.useForm)();
  const firstRender = (0, import_react30.useRef)(true);
  const [value] = useFavoriteState(filter.agendaUid || agendaUid);
  const latestValue = useLatest3(value);
  const updateForm = useFavoritesOnChange(value, {
    isExclusive: filter.exclusive
  });
  const onChange = (0, import_react30.useMemo)(
    () => (0, import_a11yButtonActionHandler4.default)(updateForm),
    [updateForm]
  );
  (0, import_react30.useEffect)(() => {
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
var exported7 = import_react30.default.memo(FavoritesFilter);
exported7.Preview = Preview7;
var FavoritesFilter_default = exported7;

// src/components/filters/NumberRangeFilter.js
var import_react32 = __toESM(require("react"), 1);
var import_react_final_form14 = require("react-final-form");

// src/components/fields/NumberRangeField.js
var import_react31 = __toESM(require("react"), 1);
var import_react_intl27 = require("react-intl");
var import_use_debounce2 = require("use-debounce");
var import_jsx_runtime19 = require("@emotion/react/jsx-runtime");
var messages9 = (0, import_react_intl27.defineMessages)({
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
  const m = (0, import_react_intl27.useIntl)().formatMessage;
  const { value, onChange } = input;
  const [gteString, setGTEString] = (0, import_react31.useState)(value == null ? void 0 : value.gte);
  const [lteString, setLTEString] = (0, import_react31.useState)(value == null ? void 0 : value.lte);
  const [debouncedGTE] = (0, import_use_debounce2.useDebounce)(gteString, 500);
  const [debouncedLTE] = (0, import_use_debounce2.useDebounce)(lteString, 500);
  const onInputChange = (0, import_react31.useCallback)((k, v) => {
    if (k === "gte") {
      setGTEString(v);
    } else {
      setLTEString(v);
    }
  }, []);
  (0, import_react31.useEffect)(() => {
    setGTEString((value == null ? void 0 : value.gte) ?? "");
    setLTEString((value == null ? void 0 : value.lte) ?? "");
  }, [value]);
  (0, import_react31.useEffect)(() => {
    onChange({
      lte: debouncedLTE,
      gte: debouncedGTE
    });
  }, [debouncedGTE, debouncedLTE, onChange]);
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "row", children: [
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "col-xs-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("label", { className: "sr-only", htmlFor: `number-range-${input.name}-gte`, children: m(messages9.min) }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        "input",
        {
          value: gteString,
          type: "number",
          className: "form-control",
          id: `number-range-${input.name}-gte`,
          placeholder: m(messages9.min),
          onChange: (e) => onInputChange("gte", e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "form-group col-xs-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("label", { className: "sr-only", htmlFor: `number-range-${input.name}-lte`, children: m(messages9.max) }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        "input",
        {
          value: lteString,
          type: "number",
          className: "form-control",
          id: `number-range-${input.name}-lte`,
          placeholder: m(messages9.max),
          onChange: (e) => onInputChange("lte", e.target.value)
        }
      )
    ] })
  ] });
}
var NumberRangeField_default = import_react31.default.forwardRef(NumberRangeField);

// src/components/filters/NumberRangeFilter.js
var import_jsx_runtime20 = require("@emotion/react/jsx-runtime");
var subscription9 = { value: true };
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
function parseValue4(value) {
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
function Preview8({ name, component = FilterPreviewer, disabled, ...rest }) {
  var _a, _b;
  const { input } = (0, import_react_final_form14.useField)(name, { subscription: subscription9 });
  const onRemove = (0, import_react32.useCallback)(
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
  return import_react32.default.createElement(component, {
    name,
    label: formatPreviewLabel(input.value),
    onRemove,
    disabled,
    ...rest
  });
}
var NumberRangeFilter = import_react32.default.forwardRef(function NumberRangeFilter2({ name }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
    import_react_final_form14.Field,
    {
      ref,
      name,
      subscription: subscription9,
      parse: parseValue4,
      component: NumberRangeField_default
    }
  );
});
var Collapsable9 = import_react32.default.forwardRef(function Collapsable10({ name, filter, component, disabled, ...rest }, ref) {
  const [collapsed, setCollapsed] = (0, import_react32.useState)(true);
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
    Panel,
    {
      header: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
        Title,
        {
          name,
          filter,
          component: Preview8,
          disabled
        }
      ),
      collapsed,
      setCollapsed,
      children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
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
var exported8 = import_react32.default.memo(NumberRangeFilter);
exported8.Preview = Preview8;
exported8.Collapsable = Collapsable9;
var NumberRangeFilter_default = exported8;

// src/components/filters/SimpleDateRangeFilter.js
var import_react34 = __toESM(require("react"), 1);
var import_react_final_form15 = require("react-final-form");
var import_date_fns5 = require("date-fns");
var import_date_fns_tz2 = require("date-fns-tz");

// src/components/fields/SimpleDateRangeField.js
var import_react33 = __toESM(require("react"), 1);
var import_react_intl28 = require("react-intl");
var import_jsx_runtime21 = require("@emotion/react/jsx-runtime");
var messages10 = (0, import_react_intl28.defineMessages)({
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
  const intl = (0, import_react_intl28.useIntl)();
  const { value, onChange } = input;
  const onInputChange = (0, import_react33.useCallback)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("label", { children: [
      intl.formatMessage(messages10.startDate),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("label", { children: [
      intl.formatMessage(messages10.endDate),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
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
var SimpleDateRangeField_default = import_react33.default.forwardRef(SimpleDateRangeField);

// src/components/filters/SimpleDateRangeFilter.js
var import_jsx_runtime22 = require("@emotion/react/jsx-runtime");
var subscription10 = { value: true };
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
function formatValue4(value) {
  if (!value) {
    return void 0;
  }
  const gte = formatDateValue2(value.gte, value.tz);
  const lte = formatDateValue2(value.lte, value.tz);
  return {
    gte: gte ? (0, import_date_fns5.format)(gte, "yyyy-MM-dd") : null,
    lte: lte ? (0, import_date_fns5.format)(lte, "yyyy-MM-dd") : null
  };
}
function parseValue5(value) {
  if (!value) {
    return value;
  }
  const gte = value.gte ? (0, import_date_fns5.startOfDay)(new Date(value.gte)).toISOString() : null;
  const lte = value.lte ? (0, import_date_fns5.endOfDay)(new Date(value.lte)).toISOString() : null;
  const result = {};
  if (gte) result.gte = gte;
  if (lte) result.lte = lte;
  if (gte || lte) result.tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return result;
}
var SimpleDateRangeFilter = import_react34.default.forwardRef(function SimpleDateRangeFilter2({ name }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
    import_react_final_form15.Field,
    {
      ref,
      name,
      subscription: subscription10,
      format: formatValue4,
      parse: parseValue5,
      component: SimpleDateRangeField_default
    }
  );
});
var Collapsable11 = import_react34.default.forwardRef(function Collapsable12({ name, filter, component, disabled, staticRanges, inputRanges, ...rest }, ref) {
  const [collapsed, setCollapsed] = (0, import_react34.useState)(true);
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
    Panel,
    {
      header: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
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
      children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
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
var exported9 = import_react34.default.memo(SimpleDateRangeFilter);
exported9.Preview = Preview2;
exported9.Collapsable = Collapsable11;
var SimpleDateRangeFilter_default = exported9;

// src/components/Filters.js
var import_react35 = __toESM(require("react"), 1);
var import_react_uid4 = require("react-uid");
var import_react_portal_ssr = require("@openagenda/react-portal-ssr");
var import_jsx_runtime23 = require("@emotion/react/jsx-runtime");
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
  const seed = (0, import_react_uid4.useUIDSeed)();
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_jsx_runtime23.Fragment, { children: filters.map((filter) => {
    let elem;
    switch (filter.type) {
      case "dateRange":
        elem = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
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
      return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_react_portal_ssr.Portal, { selector: filter.destSelector, children: elem }, seed(filter));
    }
    return elem;
  }) });
}
var Filters_default = import_react35.default.memo(Filters);

// src/components/filters/TimelineFilter.js
var import_react38 = __toESM(require("react"), 1);
var import_react_intl30 = require("react-intl");
var import_react_final_form16 = require("react-final-form");
var import_date_fns7 = require("date-fns");
var import_date_fns_tz3 = require("date-fns-tz");

// src/components/fields/TimelineField.js
var import_react36 = __toESM(require("react"), 1);
var import_react_intl29 = require("react-intl");
var import_react37 = require("swiper/react");
var import_modules = require("swiper/modules");
var import_date_fns6 = require("date-fns");
var import_classnames7 = __toESM(require("classnames"), 1);
var import_en_US2 = __toESM(require("date-fns/locale/en-US/index.js"), 1);
init_FiltersAndWidgetsContext();
var import_jsx_runtime24 = require("@emotion/react/jsx-runtime");
var messages11 = (0, import_react_intl29.defineMessages)({
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
    gte: (0, import_date_fns6.startOfMonth)(focusedDate),
    lte: (0, import_date_fns6.endOfMonth)(focusedDate),
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
  const intl = (0, import_react_intl29.useIntl)();
  const today = /* @__PURE__ */ new Date();
  const {
    filtersOptions: { dateFnsLocale, searchMethod, res }
  } = (0, import_react36.useContext)(FiltersAndWidgetsContext_default);
  const monthsList = (0, import_react36.useMemo)(
    () => Array.from({ length: 25 }, (_, i) => {
      const d = (0, import_date_fns6.addMonths)(today, i - 12);
      return { month: d.getMonth(), year: d.getFullYear() };
    }),
    []
  );
  const [monthPos, setMonthPos] = (0, import_react36.useState)(() => {
    if (Array.isArray(input.value) && input.value.length) {
      const firstDate = new Date(input.value[0].startDate);
      return monthsList.findIndex(
        (m) => m.month === firstDate.getMonth() && m.year === firstDate.getFullYear()
      );
    }
    return 12;
  });
  const { month: monthIndex, year } = monthsList[monthPos];
  const initialDay = (0, import_react36.useMemo)(() => {
    if (Array.isArray(input.value) && input.value.length) {
      return new Date(input.value[0].startDate).getDate();
    }
    return today.getDate();
  }, [input.value]);
  const [focusedDay, setFocusedDay] = (0, import_react36.useState)(initialDay);
  const [data, setData] = (0, import_react36.useState)(() => null);
  const loadTimingsData = useLoadTimingsData(res, getQuery, { searchMethod });
  (0, import_react36.useEffect)(() => {
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
  (0, import_react36.useImperativeHandle)(ref, () => ({
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
    const nb = (0, import_date_fns6.lastDayOfMonth)(new Date(year, monthIndex, 1)).getDate();
    return Array.from({ length: nb }, (_, i) => i + 1);
  };
  const toggleDay = (day) => {
    var _a;
    if (monthIndex === null || year === null) return;
    setFocusedDay(day);
    const dateObj = new Date(year, monthIndex, day);
    const current = Array.isArray(input.value) ? input.value : [];
    const next = current.some(({ startDate }) => (0, import_date_fns6.isSameDay)(new Date(startDate), dateObj)) ? current.filter(
      ({ startDate }) => !(0, import_date_fns6.isSameDay)(new Date(startDate), dateObj)
    ) : [
      ...current,
      {
        startDate: (0, import_date_fns6.startOfDay)(dateObj).toISOString(),
        endDate: (0, import_date_fns6.endOfDay)(dateObj).toISOString()
      }
    ];
    next.sort((a, b) => (0, import_date_fns6.compareAsc)(new Date(a.startDate), new Date(b.startDate)));
    if ((_a = current[0]) == null ? void 0 : _a.tz) next[0].tz = current[0].tz;
    input.onChange(next);
  };
  const dayRefs = (0, import_react36.useRef)([]);
  const monthRefs = (0, import_react36.useRef)([]);
  const daysSwiper = (0, import_react36.useRef)(null);
  const monthsSwiper = (0, import_react36.useRef)(null);
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
        "aria-label": intl.formatMessage(messages11.selectMonth),
        style: { display: "flex" },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { className: "swiper-button-prev oa-timeline-swiper-months-prev" }),
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
            import_react37.Swiper,
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
                const isSelected2 = monthPos === pos;
                const isTabStop = isSelected2 || monthPos === null && pos === 0;
                return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_react37.SwiperSlide, { children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
                  "span",
                  {
                    role: "option",
                    "aria-selected": isSelected2,
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
                    ) : (0, import_date_fns6.format)(new Date(monthYear, month, 15), "MMMM", {
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
        "aria-label": intl.formatMessage(messages11.selectDay),
        style: { display: "flex" },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { className: "swiper-button-prev oa-timeline-swiper-days-prev" }),
          /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
            import_react37.Swiper,
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
                const isChecked = dateObj ? (_a = input.value) == null ? void 0 : _a.some((d) => (0, import_date_fns6.isSameDay)(d.startDate, dateObj)) : false;
                const isTabStop = focusedDay === day;
                const isActive = data == null ? void 0 : data.find(
                  (d) => (0, import_date_fns6.isSameDay)(new Date(d.key), dateObj) && d.timingCount > 0
                );
                return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(import_react37.SwiperSlide, { children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
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
var TimelineField_default = import_react36.default.forwardRef(TimelineField);

// src/components/filters/TimelineFilter.js
var import_jsx_runtime25 = require("@emotion/react/jsx-runtime");
var messages12 = (0, import_react_intl30.defineMessages)({
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
  return typeof value === "string" ? (0, import_date_fns7.parseISO)(value) : value;
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
    const end = endDate ? (0, import_date_fns7.endOfDay)(formatDateValue3(endDate)) : null;
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
  const intl = (0, import_react_intl30.useIntl)();
  const { input } = (0, import_react_final_form16.useField)(name, { subscription: subscription11 });
  const ranges = formatValue5(input.value);
  const firstRange = ranges[0];
  const lastRange = ranges[ranges.length - 1];
  const begin = firstRange.startDate;
  const end = lastRange.endDate;
  const singleDay = begin && end && (0, import_date_fns7.isSameDay)(begin, end);
  const onRemove = (0, import_react38.useCallback)(
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
    label = intl.formatMessage(messages12.from, { date: fmt(begin) });
  } else if (!begin && end) {
    label = intl.formatMessage(messages12.until, { date: fmt(end) });
  } else {
    label = singleDay ? fmt(begin) : intl.formatMessage(messages12.dateRange, {
      startDate: fmt(begin),
      endDate: fmt(end)
    });
  }
  return import_react38.default.createElement(component, {
    name,
    label,
    onRemove,
    disabled,
    ...rest
  });
}
var TimelineFilter = import_react38.default.forwardRef(function TimelineFilter2({ name, className, minDate, maxDate, shownDate, getQuery }, ref) {
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
var exported10 = import_react38.default.memo(TimelineFilter);
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

// src/components/FavoriteToggle.js
var import_isEqual3 = __toESM(require("lodash/isEqual.js"), 1);
var import_react39 = require("react");
var import_useLatest4 = __toESM(require("react-use/lib/useLatest.js"), 1);
var import_react_final_form17 = require("react-final-form");
var import_a11yButtonActionHandler5 = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);
var useLatest4 = import_useLatest4.default.default || import_useLatest4.default;
function FavoriteToggle({ agendaUid, eventUid, widget }) {
  const form = (0, import_react_final_form17.useForm)();
  const [value, setValue] = useFavoriteState(widget.agendaUid || agendaUid);
  const firstRender = (0, import_react39.useRef)(true);
  const latestValue = useLatest4(value);
  const eventUidStr = String(eventUid);
  const updateForm = (0, import_react39.useCallback)(
    (e) => {
      var _a;
      e.preventDefault();
      e.stopPropagation();
      const active = (_a = latestValue.current) == null ? void 0 : _a.includes(eventUidStr);
      const newValue = active ? latestValue.current.filter((v) => v !== eventUidStr) : [...latestValue.current || [], eventUidStr].filter(
        (v) => v !== "-1"
      );
      setValue(newValue.length ? newValue : void 0);
    },
    [eventUidStr, latestValue, setValue]
  );
  const onChange = (0, import_react39.useMemo)(
    () => (0, import_a11yButtonActionHandler5.default)(updateForm),
    [updateForm]
  );
  (0, import_react39.useEffect)(() => {
    var _a;
    if (firstRender.current) {
      firstRender.current = false;
      if ((_a = latestValue.current) == null ? void 0 : _a.includes(eventUidStr)) {
        updateCustomFilter(widget, true);
      }
    }
    const handlerElem = widget.handlerElem || widget.elem;
    const innerCheckboxes = handlerElem.querySelectorAll(
      'input[type="checkbox"]'
    );
    const handlerIsLabelWithCheckbox = innerCheckboxes.length === 1 && handlerElem.tagName === "LABEL" && handlerElem.contains(innerCheckboxes[0]);
    if (innerCheckboxes.length === 1 && (!widget.handlerElem || handlerIsLabelWithCheckbox)) {
      innerCheckboxes[0].addEventListener("change", updateForm, false);
    } else {
      handlerElem.addEventListener("click", onChange, false);
    }
    handlerElem.addEventListener("keydown", onChange, false);
    return () => {
      if (innerCheckboxes.length === 1 && (!widget.handlerElem || handlerIsLabelWithCheckbox)) {
        innerCheckboxes[0].removeEventListener("change", updateForm, false);
      } else {
        handlerElem.removeEventListener("click", onChange, false);
      }
      handlerElem.removeEventListener("keydown", onChange, false);
    };
  }, [eventUidStr, widget, latestValue, onChange]);
  (0, import_react39.useEffect)(() => {
    const active = value == null ? void 0 : value.includes(eventUidStr);
    updateCustomFilter(widget, active);
    const formValues = form.getState().values;
    if (formValues.favorites && !(0, import_isEqual3.default)(formValues.uid, value)) {
      updateFormValues(form, {
        uid: value || ["-1"]
      });
    }
  }, [form, eventUidStr, value, widget]);
  return null;
}

// src/components/FiltersManager.js
var import_omit = __toESM(require("lodash/omit.js"), 1);
var import_isEqual4 = __toESM(require("lodash/isEqual.js"), 1);
var import_qs4 = __toESM(require("qs"), 1);
var import_react40 = __toESM(require("react"), 1);
var import_react_dom = require("react-dom");
var import_react_intl32 = require("react-intl");
var import_react_final_form18 = require("react-final-form");
var import_react_uid5 = require("react-uid");
var import_react_query = require("react-query");
var import_react_portal_ssr2 = require("@openagenda/react-portal-ssr");
var import_useConstant2 = __toESM(require("@openagenda/react-shared/dist/hooks/useConstant.js"), 1);

// src/api/getEvents.js
var import_qs3 = __toESM(require("qs"), 1);
async function getEvents(_apiClient, jsonExportRes, agenda, filters, query, pageParam, filtersBase, pageSize = 20, searchMethod = "get") {
  const params = {
    aggsSizeLimit: 1500,
    aggs: filtersToAggregations(filters, filtersBase),
    from: pageParam > 1 ? (pageParam - 1) * pageSize : void 0,
    ...query
  };
  const url = jsonExportRes.replace(":slug", agenda.slug).replace(":uid", agenda.uid);
  const p = searchMethod === "get" ? fetch(
    `${url}${getQuerySeparator(url)}${import_qs3.default.stringify(params, {
      skipNulls: true
    })}`
  ) : fetch(url, {
    method: "post",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json"
    }
  });
  return p.then((r) => {
    if (r.ok) return r.json();
    throw new Error("Can't list events");
  });
}

// src/components/FiltersManager.js
init_FiltersAndWidgetsContext();

// src/components/Total.js
var import_react_intl31 = require("react-intl");
function Total({
  message,
  total,
  totalLabel,
  totalLabelPlural
}) {
  const intl = (0, import_react_intl31.useIntl)();
  return intl.formatMessage(message, { total, totalLabel, totalLabelPlural });
}

// src/components/FiltersManager.js
var import_jsx_runtime27 = require("@emotion/react/jsx-runtime");
var FiltersManager = import_react40.default.forwardRef(function FiltersManager2({
  aggregations: initialAggregations = {},
  query: initialQuery = {},
  total: initialTotal = 0,
  defaultViewport,
  filtersBase: initialFiltersBase,
  agendaUid,
  onLoad,
  choiceComponent = ChoiceFilter_default,
  dateRangeComponent = DateRangeFilter_default,
  simpleDateRangeComponent = SimpleDateRangeFilter_default,
  definedRangeComponent = DefinedRangeFilter_default,
  numberRangeComponent = NumberRangeFilter_default,
  searchComponent = SearchFilter_default,
  mapComponent = MapFilter_default,
  customComponent = CustomFilter_default,
  favoritesComponent = FavoritesFilter_default,
  timelineComponent = TimelineFilter_default,
  ...rest
}, ref) {
  const intl = (0, import_react_intl32.useIntl)();
  const form = (0, import_react_final_form18.useForm)();
  const widgetSeed = (0, import_react_uid5.useUIDSeed)();
  const {
    filters,
    widgets,
    setFilters,
    setWidgets,
    filtersOptions,
    searchMethod
  } = (0, import_react40.useContext)(FiltersAndWidgetsContext_default);
  const [total, setTotal] = (0, import_react40.useState)(() => initialTotal);
  const [aggregations, setAggregations] = (0, import_react40.useState)(() => initialAggregations);
  const filtersBaseQuery = (0, import_react_query.useQuery)(
    ["react-filters", "filtersBase", agendaUid],
    async () => {
      const filtersToLoad = filters.filter(
        (filter) => filter.type === "choice" && !filter.options
      );
      if (!filtersToLoad.length) {
        return {};
      }
      return (await getEvents(
        null,
        // apiClient
        filtersOptions.res,
        { uid: agendaUid },
        filters.filter(
          (filter) => filter.type === "choice" && !filter.options
        ),
        { size: 0 },
        null,
        // pageParam
        false,
        // filtersBase
        0,
        searchMethod
      )).aggregations;
    },
    {
      initialData: initialFiltersBase,
      staleTime: 1e3,
      notifyOnChangeProps: ["data", "isLoading", "error"]
    }
  );
  const getOptions = useGetFilterOptions(
    intl,
    filtersBaseQuery.data,
    aggregations
  );
  const getTotal = useGetTotal(aggregations);
  const getQuery = (0, import_react40.useCallback)(() => form.getSubmittedValues(), [form]);
  const loadGeoData = useLoadGeoData(
    null,
    filtersOptions.res,
    () => form.getSubmittedValues(),
    { searchMethod }
  );
  (0, import_react40.useImperativeHandle)(ref, () => ({
    getFilters: () => filters,
    getForm: () => form,
    setAggregations,
    setTotal,
    updateFiltersAndWidgets: (values, result) => {
      var _a, _b, _c;
      const widgetsOnPage = extractWidgetsFromDom();
      const filtersOnPage = extractFiltersFromDom();
      const newFilters = filtersOnPage.map((nextFilter) => {
        const completedNext = withDefaultFilterConfig(
          nextFilter,
          intl,
          filtersOptions
        );
        const found = filters.find(
          (v) => JSON.stringify((0, import_omit.default)(v, "elemRef")) === JSON.stringify((0, import_omit.default)(completedNext, "elemRef"))
        );
        return found && document.body.contains(found.elem) ? found : completedNext;
      });
      const newWidgets = widgetsOnPage.map((nextWidget) => {
        const found = widgets.find(
          (v) => JSON.stringify((0, import_omit.default)(v, "elemRef")) === JSON.stringify((0, import_omit.default)(nextWidget, "elemRef"))
        );
        return found && document.body.contains(found.elem) ? found : nextWidget;
      });
      (0, import_react_dom.unstable_batchedUpdates)(() => {
        if (!(0, import_isEqual4.default)(filters, newFilters)) {
          setFilters(newFilters);
        }
        if (!(0, import_isEqual4.default)(widgets, newWidgets)) {
          setWidgets(newWidgets);
        }
        setAggregations(result.aggregations || {});
        setTotal(result.total || 0);
      });
      const mapFilter = filters.find((v) => v.type === "map");
      const mapElem = (_a = mapFilter == null ? void 0 : mapFilter.elemRef) == null ? void 0 : _a.current;
      const viewport = (_b = result.aggregations) == null ? void 0 : _b.viewport;
      if (mapElem && viewport) {
        mapElem.onQueryChange(viewport);
      }
      const timingsFilter = filters.find((v) => v.name === "timings");
      const timingsElem = (_c = timingsFilter == null ? void 0 : timingsFilter.elemRef) == null ? void 0 : _c.current;
      if (timingsElem) {
        timingsElem.onQueryChange();
      }
    },
    updateLocation: (values) => {
      const queryStr = import_qs4.default.stringify(values, {
        addQueryPrefix: true,
        skipNulls: true
      });
      window.history.pushState(
        {},
        null,
        `${window.location.pathname}${queryStr}`
      );
    }
  }));
  (0, import_react40.useEffect)(() => {
    if (typeof onLoad === "function") {
      const aggs = filtersToAggregations(filters);
      onLoad(initialQuery, aggs, form);
    }
  }, []);
  const widgetElems = widgets.map((widget) => {
    switch (widget.name) {
      case "total":
        return /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(import_react_portal_ssr2.Portal, { selector: widget.destSelector, children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(Total, { total, ...widget }) }) }, widgetSeed(widget));
      case "activeFilters":
        return /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(import_react_portal_ssr2.Portal, { selector: widget.destSelector, children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
          ActiveFilters,
          {
            agendaUid,
            filters,
            getOptions
          }
        ) }) }, widgetSeed(widget));
      case "favorite":
        return /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(import_react_portal_ssr2.Portal, { selector: widget.destSelector, children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
          FavoriteToggle,
          {
            agendaUid,
            widget,
            ...widget
          }
        ) }) }, widgetSeed(widget));
      default:
        return null;
    }
  });
  return /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)(import_jsx_runtime27.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
      Filters_default,
      {
        withRef: true,
        filters,
        getOptions,
        getTotal,
        initialViewport: initialAggregations.viewport,
        defaultViewport,
        getQuery,
        loadGeoData,
        agendaUid,
        missingValue: filtersOptions.missingValue,
        choiceComponent,
        dateRangeComponent,
        simpleDateRangeComponent,
        definedRangeComponent,
        numberRangeComponent,
        searchComponent,
        mapComponent,
        customComponent,
        favoritesComponent,
        timelineComponent,
        ...rest
      }
    ),
    widgetElems
  ] });
});
var Wrapper = (0, import_react40.forwardRef)(function Wrapper2(props, ref) {
  const queryClient = (0, import_useConstant2.default)(
    () => new import_react_query.QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false
        }
      }
    })
  );
  return /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(import_react_query.QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(FiltersManager, { ref, ...props }) });
});
var FiltersManager_default = Wrapper;

// src/components/FiltersProvider.js
var import_react41 = __toESM(require("react"), 1);
var import_react_final_form19 = require("react-final-form");
var import_useConstant3 = __toESM(require("@openagenda/react-shared/dist/hooks/useConstant.js"), 1);
var import_final_form = require("final-form");
var import_react_intl33 = require("react-intl");
init_FiltersAndWidgetsContext();
var import_jsx_runtime28 = require("@emotion/react/jsx-runtime");
var defaultSubscription = {};
var spySubscription = { dirty: true, values: true };
var FiltersForm = import_react41.default.forwardRef(
  ({ onSubmit, initialValues, manualSubmit, subscription: subscription12, children }, ref) => {
    const { filters } = (0, import_react41.useContext)(FiltersAndWidgetsContext_default);
    const submittedValuesRef = (0, import_react41.useRef)();
    const handleSubmit = (0, import_react41.useCallback)(
      (values, form2) => {
        const aggregations = filtersToAggregations(filters);
        submittedValuesRef.current = values;
        return onSubmit(values, aggregations, form2);
      },
      [filters, onSubmit]
    );
    const form = (0, import_useConstant3.default)(() => {
      const finalForm = (0, import_final_form.createForm)({ onSubmit: handleSubmit, initialValues });
      finalForm.getSubmittedValues = () => submittedValuesRef.current;
      return finalForm;
    });
    (0, import_react41.useImperativeHandle)(ref, () => form);
    const onValueChange = (0, import_react41.useCallback)(
      ({ dirty, values }) => {
        if (manualSubmit) {
          return;
        }
        if (dirty) {
          form.submit();
          form.reset(values);
        }
      },
      [form, manualSubmit]
    );
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(import_react_final_form19.Form, { form, subscription: subscription12, children: () => /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)(import_jsx_runtime28.Fragment, { children: [
      children,
      /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(import_react_final_form19.FormSpy, { subscription: spySubscription, onChange: onValueChange })
    ] }) });
  }
);
var IntlProvided = import_react41.default.forwardRef(
  ({
    filters: rawFilters,
    widgets: rawWidgets,
    missingValue,
    mapTiles,
    dateFnsLocale,
    initialValues,
    onSubmit,
    subscription: subscription12,
    searchMethod,
    manualSubmit,
    res,
    children
  }, ref) => {
    const intl = (0, import_react_intl33.useIntl)();
    const filtersOptions = (0, import_react41.useMemo)(
      () => ({
        missingValue,
        mapTiles,
        dateFnsLocale,
        manualSubmit,
        searchMethod,
        res
      }),
      [missingValue, mapTiles, dateFnsLocale, manualSubmit, searchMethod, res]
    );
    const [filters, setFilters] = (0, import_react41.useState)(() => (rawFilters ?? []).map((rawFilter) => withDefaultFilterConfig(rawFilter, intl, filtersOptions)));
    const [widgets, setWidgets] = (0, import_react41.useState)(() => rawWidgets);
    const updateFilters = (0, import_react41.useCallback)(
      (newFilters) => {
        setFilters(
          newFilters.map((rawFilter) => withDefaultFilterConfig(rawFilter, intl, filtersOptions))
        );
      },
      [filtersOptions, intl]
    );
    const filtersAndWidgets = (0, import_react41.useMemo)(
      () => ({
        filters,
        widgets,
        setFilters: updateFilters,
        setWidgets,
        filtersOptions
      }),
      [filters, updateFilters, widgets, filtersOptions]
    );
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(FiltersAndWidgetsContext_default.Provider, { value: filtersAndWidgets, children: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
      FiltersForm,
      {
        ref,
        onSubmit,
        initialValues,
        subscription: subscription12,
        searchMethod,
        manualSubmit,
        children
      }
    ) });
  }
);
function FiltersProvider({
  children = void 0,
  intl = null,
  filters = null,
  widgets = [],
  // filters config
  missingValue = null,
  mapTiles = null,
  dateFnsLocale = void 0,
  // for test
  apiClient = null,
  // form config
  onSubmit = null,
  initialValues = null,
  subscription: subscription12 = defaultSubscription,
  searchMethod = "get",
  manualSubmit = false,
  // to load on-demand aggregations (geo, timings)
  res = null
}, ref) {
  const child = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
    IntlProvided,
    {
      ref,
      filters,
      widgets,
      missingValue,
      mapTiles,
      dateFnsLocale,
      apiClient,
      onSubmit,
      initialValues,
      subscription: subscription12,
      searchMethod,
      manualSubmit,
      res,
      children
    }
  );
  if (intl) {
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(import_react_intl33.RawIntlProvider, { value: intl, children: child });
  }
  return child;
}
var FiltersProvider_default = import_react41.default.forwardRef(FiltersProvider);

// src/components/Sort.js
var import_react42 = require("react");
var import_react_intl34 = require("react-intl");
var import_react_final_form20 = require("react-final-form");
var import_react_final_form_listeners = require("react-final-form-listeners");
var import_ReactSelectField = __toESM(require("@openagenda/react-shared/dist/components/ReactSelectField.js"), 1);
var import_jsx_runtime29 = require("@emotion/react/jsx-runtime");
var { defaultStyles: defaultReactSelectStyles } = import_ReactSelectField.default;
var messages13 = (0, import_react_intl34.defineMessages)({
  relevance: {
    id: "ReactFilters.Sort.relevance",
    defaultMessage: "Relevance"
  },
  chronological: {
    id: "ReactFilters.Sort.chronological",
    defaultMessage: "Chronological order"
  },
  recentlyUpdated: {
    id: "ReactFilters.Sort.recentlyUpdated",
    defaultMessage: "Recently updated"
  },
  publicView: {
    id: "ReactFilters.Sort.publicView",
    defaultMessage: "Public view"
  }
});
var stateSelectStyles = {
  ...defaultReactSelectStyles,
  container: (provided) => ({
    ...provided,
    display: "inline-block",
    width: "180px"
  }),
  control: (provided, state) => ({
    ...defaultReactSelectStyles.control(provided, state),
    cursor: "pointer"
  }),
  valueContainer: (provided, state) => ({
    ...defaultReactSelectStyles.valueContainer(provided, state),
    padding: "0 4px"
  }),
  option: (provided) => ({
    ...provided,
    cursor: "pointer"
  })
};
var defaultOptions = ["score", "timings.asc", "updatedAt.desc"];
function Sort({ options = defaultOptions }) {
  const intl = (0, import_react_intl34.useIntl)();
  const form = (0, import_react_final_form20.useForm)();
  const [userSort, setUserSort] = (0, import_react42.useState)(() => form.getState().values.sort);
  const orderOptions = (0, import_react42.useMemo)(
    () => [
      {
        label: intl.formatMessage(messages13.relevance),
        value: "score"
        // isDisabled: true
      },
      {
        label: intl.formatMessage(messages13.chronological),
        value: "timings.asc"
      },
      {
        label: intl.formatMessage(messages13.recentlyUpdated),
        value: "updatedAt.desc"
      },
      {
        label: intl.formatMessage(messages13.publicView),
        value: "lastTimingWithFeatured.asc"
      }
    ].filter((option) => options.includes(option.value)),
    [intl, options]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)(import_jsx_runtime29.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
      import_ReactSelectField.default,
      {
        Field: import_react_final_form20.Field,
        name: "sort",
        options: orderOptions,
        styles: stateSelectStyles,
        isSearchable: false,
        isClearable: false,
        defaultValue: "updatedAt.desc"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(import_react_final_form_listeners.OnChange, { name: "sort", children: (value) => {
      if (form.getState().active === "sort") {
        setUserSort(value);
      }
    } }),
    /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(import_react_final_form_listeners.OnChange, { name: "search", children: (value, previousValue) => {
      const { sort } = form.getState().values;
      if (previousValue === "" && value !== "") {
        setUserSort(sort);
        form.change("sort", "score");
      } else if (sort === "score" && previousValue !== "" && value === "") {
        form.change(
          "sort",
          userSort && userSort !== "" ? userSort : void 0
        );
      }
    } })
  ] });
}

// src/components/IntlProvider.js
var import_react43 = require("react");
var import_react_intl35 = require("react-intl");
var import_intl7 = require("@openagenda/intl");

// src/locales-compiled/index.js
var locales_compiled_exports = {};
__export(locales_compiled_exports, {
  br: () => br_default,
  ca: () => ca_default,
  de: () => de_default,
  en: () => en_default,
  es: () => es_default,
  eu: () => eu_default,
  fr: () => fr_default,
  io: () => io_default,
  it: () => it_default,
  oc: () => oc_default
});

// src/locales-compiled/br.json with { type: 'json' }
var br_default = {
  "ReactFilters.DateRangeFilter.dateRange": [
    {
      type: 0,
      value: "Du "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " au "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DateRangeFilter.endDate": [
    {
      type: 0,
      value: "Fin"
    }
  ],
  "ReactFilters.DateRangeFilter.from": [
    {
      type: 0,
      value: "\xC0 partir du "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DateRangeFilter.startDate": [
    {
      type: 0,
      value: "D\xE9but"
    }
  ],
  "ReactFilters.DateRangeFilter.until": [
    {
      type: 0,
      value: "Jusqu'au "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.dateRange": [
    {
      type: 0,
      value: "Du "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " au "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DefinedRangeFilter.endDate": [
    {
      type: 0,
      value: "Fin"
    }
  ],
  "ReactFilters.DefinedRangeFilter.from": [
    {
      type: 0,
      value: "\xC0 partir du "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.singleDate": [
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.startDate": [
    {
      type: 0,
      value: "D\xE9but"
    }
  ],
  "ReactFilters.DefinedRangeFilter.until": [
    {
      type: 0,
      value: "Jusqu'au "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.Sort.chronological": [
    {
      type: 0,
      value: "Ordre chronologique"
    }
  ],
  "ReactFilters.Sort.publicView": [
    {
      type: 0,
      value: "Vue publique"
    }
  ],
  "ReactFilters.Sort.recentlyUpdated": [
    {
      type: 0,
      value: "Mise \xE0 jour r\xE9cente"
    }
  ],
  "ReactFilters.Sort.relevance": [
    {
      type: 0,
      value: "Pertinence"
    }
  ],
  "ReactFilters.TimelineField.selectDay": [
    {
      type: 0,
      value: "Choisissez un jour"
    }
  ],
  "ReactFilters.TimelineField.selectMonth": [
    {
      type: 0,
      value: "Choisissez un mois"
    }
  ],
  "ReactFilters.TimelineFilter.dateRange": [
    {
      type: 0,
      value: "Du "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " au "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.TimelineFilter.from": [
    {
      type: 0,
      value: "\xC0 partir du "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.TimelineFilter.until": [
    {
      type: 0,
      value: "Jusqu'au "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.ValueBadge.removeFilter": [
    {
      type: 0,
      value: "Supprimer le filtre"
    }
  ],
  "ReactFilters.ValueBadge.removeFilterWithTitle": [
    {
      type: 0,
      value: "Supprimer le filtre ("
    },
    {
      type: 1,
      value: "title"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.components.fields.SearchInput.ariaLabel": [
    {
      type: 0,
      value: "Rechercher"
    }
  ],
  "ReactFilters.dateRanges.currentMonth": [
    {
      type: 0,
      value: "Ce mois"
    }
  ],
  "ReactFilters.dateRanges.currentWeek": [
    {
      type: 0,
      value: "Cette semaine"
    }
  ],
  "ReactFilters.dateRanges.thisWeekend": [
    {
      type: 0,
      value: "Ce week-end"
    }
  ],
  "ReactFilters.dateRanges.today": [
    {
      type: 0,
      value: "Aujourd'hui"
    }
  ],
  "ReactFilters.dateRanges.tomorrow": [
    {
      type: 0,
      value: "Demain"
    }
  ],
  "ReactFilters.fields.NumberRangeField.gte": [
    {
      type: 0,
      value: "Min"
    }
  ],
  "ReactFilters.fields.NumberRangeField.lte": [
    {
      type: 0,
      value: "Max"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.endDate": [
    {
      type: 0,
      value: "Date de fin"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.startDate": [
    {
      type: 0,
      value: "Date de d\xE9but"
    }
  ],
  "ReactFilters.filters.MapFilter.previewLabel": [
    {
      type: 0,
      value: "Carte"
    }
  ],
  "ReactFilters.filters.searchFilter.placeholder": [
    {
      type: 0,
      value: "Rechercher"
    }
  ],
  "ReactFilters.filters.searchFilter.previewLabel": [
    {
      type: 0,
      value: "Recherche"
    }
  ],
  "ReactFilters.messages.accessiblities.hi": [
    {
      type: 0,
      value: "Handicap auditif"
    }
  ],
  "ReactFilters.messages.accessiblities.ii": [
    {
      type: 0,
      value: "Handicap intellectuel"
    }
  ],
  "ReactFilters.messages.accessiblities.mi": [
    {
      type: 0,
      value: "Handicap moteur"
    }
  ],
  "ReactFilters.messages.accessiblities.pi": [
    {
      type: 0,
      value: "Handicap psychique"
    }
  ],
  "ReactFilters.messages.accessiblities.vi": [
    {
      type: 0,
      value: "Handicap visuel"
    }
  ],
  "ReactFilters.messages.attendanceMode.mixed": [
    {
      type: 0,
      value: "Mixte"
    }
  ],
  "ReactFilters.messages.attendanceMode.offline": [
    {
      type: 0,
      value: "Sur place"
    }
  ],
  "ReactFilters.messages.attendanceMode.online": [
    {
      type: 0,
      value: "En ligne"
    }
  ],
  "ReactFilters.messages.boolean.notSelected": [
    {
      type: 0,
      value: "Non s\xE9lectionn\xE9"
    }
  ],
  "ReactFilters.messages.boolean.selected": [
    {
      type: 0,
      value: "S\xE9lectionn\xE9"
    }
  ],
  "ReactFilters.messages.choiceFilter.lessOptions": [
    {
      type: 0,
      value: "Moins d'options"
    }
  ],
  "ReactFilters.messages.choiceFilter.moreOptions": [
    {
      type: 0,
      value: "Plus d'options"
    }
  ],
  "ReactFilters.messages.choiceFilter.noResult": [
    {
      type: 0,
      value: "Aucun r\xE9sultat"
    }
  ],
  "ReactFilters.messages.choiceFilter.searchPlaceholder": [
    {
      type: 0,
      value: "Rechercher"
    }
  ],
  "ReactFilters.messages.choiceFilter.unrecognizedOption": [
    {
      type: 0,
      value: "Valeur de filtre inconnue ("
    },
    {
      type: 1,
      value: "value"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.messages.featured.featured": [
    {
      type: 0,
      value: "En une"
    }
  ],
  "ReactFilters.messages.filterTitles.accessibility": [
    {
      type: 0,
      value: "Accessibilit\xE9"
    }
  ],
  "ReactFilters.messages.filterTitles.addMethod": [
    {
      type: 0,
      value: "Provenance"
    }
  ],
  "ReactFilters.messages.filterTitles.adminLevel3": [
    {
      type: 0,
      value: "Intercommunalit\xE9"
    }
  ],
  "ReactFilters.messages.filterTitles.attendanceMode": [
    {
      type: 0,
      value: "Doare perzhia\xF1"
    }
  ],
  "ReactFilters.messages.filterTitles.city": [
    {
      type: 0,
      value: "K\xEAr"
    }
  ],
  "ReactFilters.messages.filterTitles.countryCode": [
    {
      type: 0,
      value: "Vro"
    }
  ],
  "ReactFilters.messages.filterTitles.createdAt": [
    {
      type: 0,
      value: "Date de cr\xE9ation"
    }
  ],
  "ReactFilters.messages.filterTitles.department": [
    {
      type: 0,
      value: "Departamant"
    }
  ],
  "ReactFilters.messages.filterTitles.district": [
    {
      type: 0,
      value: "Quartier"
    }
  ],
  "ReactFilters.messages.filterTitles.featured": [
    {
      type: 0,
      value: "Mis en une"
    }
  ],
  "ReactFilters.messages.filterTitles.geo": [
    {
      type: 0,
      value: "G\xE9olocalisation"
    }
  ],
  "ReactFilters.messages.filterTitles.keyword": [
    {
      type: 0,
      value: "Mots cl\xE9s"
    }
  ],
  "ReactFilters.messages.filterTitles.languages": [
    {
      type: 0,
      value: "Langues"
    }
  ],
  "ReactFilters.messages.filterTitles.locationUid": [
    {
      type: 0,
      value: "Lieu"
    }
  ],
  "ReactFilters.messages.filterTitles.memberUid": [
    {
      type: 0,
      value: "Membre"
    }
  ],
  "ReactFilters.messages.filterTitles.originAgendaUid": [
    {
      type: 0,
      value: "Agenda d'origine"
    }
  ],
  "ReactFilters.messages.filterTitles.region": [
    {
      type: 0,
      value: "R\xE9gion"
    }
  ],
  "ReactFilters.messages.filterTitles.relative": [
    {
      type: 0,
      value: "Pass\xE9 / en cours / \xE0 venir"
    }
  ],
  "ReactFilters.messages.filterTitles.search": [
    {
      type: 0,
      value: "Rechercher"
    }
  ],
  "ReactFilters.messages.filterTitles.sourceAgendaUid": [
    {
      type: 0,
      value: "Agenda source"
    }
  ],
  "ReactFilters.messages.filterTitles.state": [
    {
      type: 0,
      value: "Statut"
    }
  ],
  "ReactFilters.messages.filterTitles.status": [
    {
      type: 0,
      value: "\xC9tat"
    }
  ],
  "ReactFilters.messages.filterTitles.timings": [
    {
      type: 0,
      value: "Eurio\xF9"
    }
  ],
  "ReactFilters.messages.filterTitles.updatedAt": [
    {
      type: 0,
      value: "Date de mise \xE0 jour"
    }
  ],
  "ReactFilters.messages.map.searchHere": [
    {
      type: 0,
      value: "Rechercher ici"
    }
  ],
  "ReactFilters.messages.map.searchWithMap": [
    {
      type: 0,
      value: "Rechercher avec la carte"
    }
  ],
  "ReactFilters.messages.provenance.aggregation": [
    {
      type: 0,
      value: "Agr\xE9gation"
    }
  ],
  "ReactFilters.messages.provenance.contribution": [
    {
      type: 0,
      value: "Contribution"
    }
  ],
  "ReactFilters.messages.provenance.share": [
    {
      type: 0,
      value: "Partage"
    }
  ],
  "ReactFilters.messages.relative.current": [
    {
      type: 0,
      value: "En cours"
    }
  ],
  "ReactFilters.messages.relative.passed": [
    {
      type: 0,
      value: "Pass\xE9"
    }
  ],
  "ReactFilters.messages.relative.upcoming": [
    {
      type: 0,
      value: "\xC0 venir"
    }
  ],
  "ReactFilters.messages.state.controlled": [
    {
      type: 0,
      value: "Pr\xEAt \xE0 publier"
    }
  ],
  "ReactFilters.messages.state.published": [
    {
      type: 0,
      value: "Publi\xE9"
    }
  ],
  "ReactFilters.messages.state.refused": [
    {
      type: 0,
      value: "Refus\xE9"
    }
  ],
  "ReactFilters.messages.state.toModerate": [
    {
      type: 0,
      value: "\xC0 mod\xE9rer"
    }
  ],
  "ReactFilters.messages.status.cancelled": [
    {
      type: 0,
      value: "Annul\xE9"
    }
  ],
  "ReactFilters.messages.status.full": [
    {
      type: 0,
      value: "Complet"
    }
  ],
  "ReactFilters.messages.status.movedOnline": [
    {
      type: 0,
      value: "D\xE9plac\xE9 en ligne"
    }
  ],
  "ReactFilters.messages.status.postponed": [
    {
      type: 0,
      value: "Report\xE9"
    }
  ],
  "ReactFilters.messages.status.programmed": [
    {
      type: 0,
      value: "Programm\xE9"
    }
  ],
  "ReactFilters.messages.status.rescheduled": [
    {
      type: 0,
      value: "Reprogramm\xE9"
    }
  ],
  "ReactFilters.useGetFilterOptions.emptyOption": [
    {
      type: 0,
      value: "(Sans valeur)"
    }
  ]
};

// src/locales-compiled/ca.json with { type: 'json' }
var ca_default = {
  "ReactFilters.DateRangeFilter.dateRange": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " to "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DateRangeFilter.endDate": [
    {
      type: 0,
      value: "End"
    }
  ],
  "ReactFilters.DateRangeFilter.from": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DateRangeFilter.startDate": [
    {
      type: 0,
      value: "Inicio"
    }
  ],
  "ReactFilters.DateRangeFilter.until": [
    {
      type: 0,
      value: "Until "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.dateRange": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " to "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DefinedRangeFilter.endDate": [
    {
      type: 0,
      value: "End"
    }
  ],
  "ReactFilters.DefinedRangeFilter.from": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.singleDate": [
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.startDate": [
    {
      type: 0,
      value: "Inicio"
    }
  ],
  "ReactFilters.DefinedRangeFilter.until": [
    {
      type: 0,
      value: "Until "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.Sort.chronological": [
    {
      type: 0,
      value: "Chronological order"
    }
  ],
  "ReactFilters.Sort.publicView": [
    {
      type: 0,
      value: "Public view"
    }
  ],
  "ReactFilters.Sort.recentlyUpdated": [
    {
      type: 0,
      value: "Recently updated"
    }
  ],
  "ReactFilters.Sort.relevance": [
    {
      type: 0,
      value: "Relevance"
    }
  ],
  "ReactFilters.TimelineField.selectDay": [
    {
      type: 0,
      value: "Select day"
    }
  ],
  "ReactFilters.TimelineField.selectMonth": [
    {
      type: 0,
      value: "Select month"
    }
  ],
  "ReactFilters.TimelineFilter.dateRange": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " to "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.TimelineFilter.from": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.TimelineFilter.until": [
    {
      type: 0,
      value: "Until "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.ValueBadge.removeFilter": [
    {
      type: 0,
      value: "Eliminar filtro"
    }
  ],
  "ReactFilters.ValueBadge.removeFilterWithTitle": [
    {
      type: 0,
      value: "Remove filter ("
    },
    {
      type: 1,
      value: "title"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.components.fields.SearchInput.ariaLabel": [
    {
      type: 0,
      value: "Buscar"
    }
  ],
  "ReactFilters.dateRanges.currentMonth": [
    {
      type: 0,
      value: "Este mes"
    }
  ],
  "ReactFilters.dateRanges.currentWeek": [
    {
      type: 0,
      value: "Esta semana"
    }
  ],
  "ReactFilters.dateRanges.thisWeekend": [
    {
      type: 0,
      value: "Este fin de semana"
    }
  ],
  "ReactFilters.dateRanges.today": [
    {
      type: 0,
      value: "Hoy"
    }
  ],
  "ReactFilters.dateRanges.tomorrow": [
    {
      type: 0,
      value: "Ma\xF1ana"
    }
  ],
  "ReactFilters.fields.NumberRangeField.gte": [
    {
      type: 0,
      value: "Min"
    }
  ],
  "ReactFilters.fields.NumberRangeField.lte": [
    {
      type: 0,
      value: "Max"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.endDate": [
    {
      type: 0,
      value: "End date"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.startDate": [
    {
      type: 0,
      value: "Start date"
    }
  ],
  "ReactFilters.filters.MapFilter.previewLabel": [
    {
      type: 0,
      value: "Map"
    }
  ],
  "ReactFilters.filters.searchFilter.placeholder": [
    {
      type: 0,
      value: "Buscar"
    }
  ],
  "ReactFilters.filters.searchFilter.previewLabel": [
    {
      type: 0,
      value: "Buscar"
    }
  ],
  "ReactFilters.messages.accessiblities.hi": [
    {
      type: 0,
      value: "Hearing impairment"
    }
  ],
  "ReactFilters.messages.accessiblities.ii": [
    {
      type: 0,
      value: "Intellectual impairment"
    }
  ],
  "ReactFilters.messages.accessiblities.mi": [
    {
      type: 0,
      value: "Motor impairment"
    }
  ],
  "ReactFilters.messages.accessiblities.pi": [
    {
      type: 0,
      value: "Psychic impairment"
    }
  ],
  "ReactFilters.messages.accessiblities.vi": [
    {
      type: 0,
      value: "Visual impairment"
    }
  ],
  "ReactFilters.messages.attendanceMode.mixed": [
    {
      type: 0,
      value: "Mezclado"
    }
  ],
  "ReactFilters.messages.attendanceMode.offline": [
    {
      type: 0,
      value: "Desconnectad"
    }
  ],
  "ReactFilters.messages.attendanceMode.online": [
    {
      type: 0,
      value: "En linea"
    }
  ],
  "ReactFilters.messages.boolean.notSelected": [
    {
      type: 0,
      value: "Not selected"
    }
  ],
  "ReactFilters.messages.boolean.selected": [
    {
      type: 0,
      value: "Selected"
    }
  ],
  "ReactFilters.messages.choiceFilter.lessOptions": [
    {
      type: 0,
      value: "Less options"
    }
  ],
  "ReactFilters.messages.choiceFilter.moreOptions": [
    {
      type: 0,
      value: "More options"
    }
  ],
  "ReactFilters.messages.choiceFilter.noResult": [
    {
      type: 0,
      value: "No result"
    }
  ],
  "ReactFilters.messages.choiceFilter.searchPlaceholder": [
    {
      type: 0,
      value: "Buscar"
    }
  ],
  "ReactFilters.messages.choiceFilter.unrecognizedOption": [
    {
      type: 0,
      value: "Unknown filter value ("
    },
    {
      type: 1,
      value: "value"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.messages.featured.featured": [
    {
      type: 0,
      value: "Featured"
    }
  ],
  "ReactFilters.messages.filterTitles.accessibility": [
    {
      type: 0,
      value: "Accessibility"
    }
  ],
  "ReactFilters.messages.filterTitles.addMethod": [
    {
      type: 0,
      value: "Provenance"
    }
  ],
  "ReactFilters.messages.filterTitles.adminLevel3": [
    {
      type: 0,
      value: "Administrative level 3"
    }
  ],
  "ReactFilters.messages.filterTitles.attendanceMode": [
    {
      type: 0,
      value: "Modo de asistencia"
    }
  ],
  "ReactFilters.messages.filterTitles.city": [
    {
      type: 0,
      value: "City"
    }
  ],
  "ReactFilters.messages.filterTitles.countryCode": [
    {
      type: 0,
      value: "Pa\xEDs"
    }
  ],
  "ReactFilters.messages.filterTitles.createdAt": [
    {
      type: 0,
      value: "Creation date"
    }
  ],
  "ReactFilters.messages.filterTitles.department": [
    {
      type: 0,
      value: "Department"
    }
  ],
  "ReactFilters.messages.filterTitles.district": [
    {
      type: 0,
      value: "District"
    }
  ],
  "ReactFilters.messages.filterTitles.featured": [
    {
      type: 0,
      value: "Featured"
    }
  ],
  "ReactFilters.messages.filterTitles.geo": [
    {
      type: 0,
      value: "Map"
    }
  ],
  "ReactFilters.messages.filterTitles.keyword": [
    {
      type: 0,
      value: "Keywords"
    }
  ],
  "ReactFilters.messages.filterTitles.languages": [
    {
      type: 0,
      value: "Idiomas"
    }
  ],
  "ReactFilters.messages.filterTitles.locationUid": [
    {
      type: 0,
      value: "Lugar"
    }
  ],
  "ReactFilters.messages.filterTitles.memberUid": [
    {
      type: 0,
      value: "Member"
    }
  ],
  "ReactFilters.messages.filterTitles.originAgendaUid": [
    {
      type: 0,
      value: "Origin agenda"
    }
  ],
  "ReactFilters.messages.filterTitles.region": [
    {
      type: 0,
      value: "Region"
    }
  ],
  "ReactFilters.messages.filterTitles.relative": [
    {
      type: 0,
      value: "Pasados / actuales / pr\xF3ximos"
    }
  ],
  "ReactFilters.messages.filterTitles.search": [
    {
      type: 0,
      value: "Buscar"
    }
  ],
  "ReactFilters.messages.filterTitles.sourceAgendaUid": [
    {
      type: 0,
      value: "Source agenda"
    }
  ],
  "ReactFilters.messages.filterTitles.state": [
    {
      type: 0,
      value: "Estado"
    }
  ],
  "ReactFilters.messages.filterTitles.status": [
    {
      type: 0,
      value: "Estado"
    }
  ],
  "ReactFilters.messages.filterTitles.timings": [
    {
      type: 0,
      value: "Fecha"
    }
  ],
  "ReactFilters.messages.filterTitles.updatedAt": [
    {
      type: 0,
      value: "Date of update"
    }
  ],
  "ReactFilters.messages.map.searchHere": [
    {
      type: 0,
      value: "Search here"
    }
  ],
  "ReactFilters.messages.map.searchWithMap": [
    {
      type: 0,
      value: "Buscar en el mapa"
    }
  ],
  "ReactFilters.messages.provenance.aggregation": [
    {
      type: 0,
      value: "Aggregation"
    }
  ],
  "ReactFilters.messages.provenance.contribution": [
    {
      type: 0,
      value: "Contribuci\xF3n"
    }
  ],
  "ReactFilters.messages.provenance.share": [
    {
      type: 0,
      value: "Share"
    }
  ],
  "ReactFilters.messages.relative.current": [
    {
      type: 0,
      value: "Current"
    }
  ],
  "ReactFilters.messages.relative.passed": [
    {
      type: 0,
      value: "Passed"
    }
  ],
  "ReactFilters.messages.relative.upcoming": [
    {
      type: 0,
      value: "Pr\xF3ximos"
    }
  ],
  "ReactFilters.messages.state.controlled": [
    {
      type: 0,
      value: "Controlled"
    }
  ],
  "ReactFilters.messages.state.published": [
    {
      type: 0,
      value: "Published"
    }
  ],
  "ReactFilters.messages.state.refused": [
    {
      type: 0,
      value: "Refused"
    }
  ],
  "ReactFilters.messages.state.toModerate": [
    {
      type: 0,
      value: "To moderate"
    }
  ],
  "ReactFilters.messages.status.cancelled": [
    {
      type: 0,
      value: "Cancelled"
    }
  ],
  "ReactFilters.messages.status.full": [
    {
      type: 0,
      value: "Fully booked"
    }
  ],
  "ReactFilters.messages.status.movedOnline": [
    {
      type: 0,
      value: "Moved online"
    }
  ],
  "ReactFilters.messages.status.postponed": [
    {
      type: 0,
      value: "Postponed"
    }
  ],
  "ReactFilters.messages.status.programmed": [
    {
      type: 0,
      value: "Programado"
    }
  ],
  "ReactFilters.messages.status.rescheduled": [
    {
      type: 0,
      value: "Rescheduled"
    }
  ],
  "ReactFilters.useGetFilterOptions.emptyOption": [
    {
      type: 0,
      value: "(Without value)"
    }
  ]
};

// src/locales-compiled/de.json with { type: 'json' }
var de_default = {
  "ReactFilters.DateRangeFilter.dateRange": [
    {
      type: 0,
      value: "Von "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " bis "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DateRangeFilter.endDate": [
    {
      type: 0,
      value: "Ende"
    }
  ],
  "ReactFilters.DateRangeFilter.from": [
    {
      type: 0,
      value: "Von "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DateRangeFilter.startDate": [
    {
      type: 0,
      value: "Start"
    }
  ],
  "ReactFilters.DateRangeFilter.until": [
    {
      type: 0,
      value: "Bis "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.dateRange": [
    {
      type: 0,
      value: "Von "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " bis "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DefinedRangeFilter.endDate": [
    {
      type: 0,
      value: "Ende"
    }
  ],
  "ReactFilters.DefinedRangeFilter.from": [
    {
      type: 0,
      value: "Von "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.singleDate": [
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.startDate": [
    {
      type: 0,
      value: "Start"
    }
  ],
  "ReactFilters.DefinedRangeFilter.until": [
    {
      type: 0,
      value: "Bis "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.Sort.chronological": [
    {
      type: 0,
      value: "Chronologische reihenfolge"
    }
  ],
  "ReactFilters.Sort.publicView": [
    {
      type: 0,
      value: "Public view"
    }
  ],
  "ReactFilters.Sort.recentlyUpdated": [
    {
      type: 0,
      value: "K\xFCrzlich aktualisiert"
    }
  ],
  "ReactFilters.Sort.relevance": [
    {
      type: 0,
      value: "Relevanz"
    }
  ],
  "ReactFilters.TimelineField.selectDay": [
    {
      type: 0,
      value: "Select day"
    }
  ],
  "ReactFilters.TimelineField.selectMonth": [
    {
      type: 0,
      value: "Select month"
    }
  ],
  "ReactFilters.TimelineFilter.dateRange": [
    {
      type: 0,
      value: "Von "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " bis "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.TimelineFilter.from": [
    {
      type: 0,
      value: "Von "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.TimelineFilter.until": [
    {
      type: 0,
      value: "Bis "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.ValueBadge.removeFilter": [
    {
      type: 0,
      value: "Filter entfernen"
    }
  ],
  "ReactFilters.ValueBadge.removeFilterWithTitle": [
    {
      type: 0,
      value: "Filter entfernen ("
    },
    {
      type: 1,
      value: "title"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.components.fields.SearchInput.ariaLabel": [
    {
      type: 0,
      value: "Search"
    }
  ],
  "ReactFilters.dateRanges.currentMonth": [
    {
      type: 0,
      value: "Diesen Monat"
    }
  ],
  "ReactFilters.dateRanges.currentWeek": [
    {
      type: 0,
      value: "Diese Woche"
    }
  ],
  "ReactFilters.dateRanges.thisWeekend": [
    {
      type: 0,
      value: "Dieses Wochenende"
    }
  ],
  "ReactFilters.dateRanges.today": [
    {
      type: 0,
      value: "Heute"
    }
  ],
  "ReactFilters.dateRanges.tomorrow": [
    {
      type: 0,
      value: "Morgen"
    }
  ],
  "ReactFilters.fields.NumberRangeField.gte": [
    {
      type: 0,
      value: "Min"
    }
  ],
  "ReactFilters.fields.NumberRangeField.lte": [
    {
      type: 0,
      value: "Max"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.endDate": [
    {
      type: 0,
      value: "End date"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.startDate": [
    {
      type: 0,
      value: "Start date"
    }
  ],
  "ReactFilters.filters.MapFilter.previewLabel": [
    {
      type: 0,
      value: "Karte"
    }
  ],
  "ReactFilters.filters.searchFilter.placeholder": [
    {
      type: 0,
      value: "Suchen"
    }
  ],
  "ReactFilters.filters.searchFilter.previewLabel": [
    {
      type: 0,
      value: "Suchen"
    }
  ],
  "ReactFilters.messages.accessiblities.hi": [
    {
      type: 0,
      value: "Schwerh\xF6rig"
    }
  ],
  "ReactFilters.messages.accessiblities.ii": [
    {
      type: 0,
      value: "Geistige Behinderung"
    }
  ],
  "ReactFilters.messages.accessiblities.mi": [
    {
      type: 0,
      value: "Motorische beeintr\xE4chtigung"
    }
  ],
  "ReactFilters.messages.accessiblities.pi": [
    {
      type: 0,
      value: "Psychische behinderung"
    }
  ],
  "ReactFilters.messages.accessiblities.vi": [
    {
      type: 0,
      value: "Sehbehinderung"
    }
  ],
  "ReactFilters.messages.attendanceMode.mixed": [
    {
      type: 0,
      value: "Gemischt"
    }
  ],
  "ReactFilters.messages.attendanceMode.offline": [
    {
      type: 0,
      value: "Offline"
    }
  ],
  "ReactFilters.messages.attendanceMode.online": [
    {
      type: 0,
      value: "Online"
    }
  ],
  "ReactFilters.messages.boolean.notSelected": [
    {
      type: 0,
      value: "Nicht ausgew\xE4hlt"
    }
  ],
  "ReactFilters.messages.boolean.selected": [
    {
      type: 0,
      value: "Ausw\xE4hlen"
    }
  ],
  "ReactFilters.messages.choiceFilter.lessOptions": [
    {
      type: 0,
      value: "Weniger Optionen"
    }
  ],
  "ReactFilters.messages.choiceFilter.moreOptions": [
    {
      type: 0,
      value: "Mehr Optionen"
    }
  ],
  "ReactFilters.messages.choiceFilter.noResult": [
    {
      type: 0,
      value: "Kein Ergebnis"
    }
  ],
  "ReactFilters.messages.choiceFilter.searchPlaceholder": [
    {
      type: 0,
      value: "Suchen"
    }
  ],
  "ReactFilters.messages.choiceFilter.unrecognizedOption": [
    {
      type: 0,
      value: "Unbekannter Filterwert ("
    },
    {
      type: 1,
      value: "value"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.messages.featured.featured": [
    {
      type: 0,
      value: "ausgew\xE4hlt"
    }
  ],
  "ReactFilters.messages.filterTitles.accessibility": [
    {
      type: 0,
      value: "Zug\xE4nglichkeit"
    }
  ],
  "ReactFilters.messages.filterTitles.addMethod": [
    {
      type: 0,
      value: "Herkunft"
    }
  ],
  "ReactFilters.messages.filterTitles.adminLevel3": [
    {
      type: 0,
      value: "Verwaltungsebene 3"
    }
  ],
  "ReactFilters.messages.filterTitles.attendanceMode": [
    {
      type: 0,
      value: "Anwesenheitsmodus"
    }
  ],
  "ReactFilters.messages.filterTitles.city": [
    {
      type: 0,
      value: "Stadt"
    }
  ],
  "ReactFilters.messages.filterTitles.countryCode": [
    {
      type: 0,
      value: "Land"
    }
  ],
  "ReactFilters.messages.filterTitles.createdAt": [
    {
      type: 0,
      value: "Erstellungsdatum"
    }
  ],
  "ReactFilters.messages.filterTitles.department": [
    {
      type: 0,
      value: "Abteilung"
    }
  ],
  "ReactFilters.messages.filterTitles.district": [
    {
      type: 0,
      value: "Kreis"
    }
  ],
  "ReactFilters.messages.filterTitles.featured": [
    {
      type: 0,
      value: "Ausgew\xE4hlt"
    }
  ],
  "ReactFilters.messages.filterTitles.geo": [
    {
      type: 0,
      value: "Karte"
    }
  ],
  "ReactFilters.messages.filterTitles.keyword": [
    {
      type: 0,
      value: "Schl\xFCsselw\xF6rter"
    }
  ],
  "ReactFilters.messages.filterTitles.languages": [
    {
      type: 0,
      value: "Sprachen"
    }
  ],
  "ReactFilters.messages.filterTitles.locationUid": [
    {
      type: 0,
      value: "Ort"
    }
  ],
  "ReactFilters.messages.filterTitles.memberUid": [
    {
      type: 0,
      value: "Mitglied"
    }
  ],
  "ReactFilters.messages.filterTitles.originAgendaUid": [
    {
      type: 0,
      value: "Origin Kalender"
    }
  ],
  "ReactFilters.messages.filterTitles.region": [
    {
      type: 0,
      value: "Region"
    }
  ],
  "ReactFilters.messages.filterTitles.relative": [
    {
      type: 0,
      value: "Bestanden / aktuell / bevorstehend"
    }
  ],
  "ReactFilters.messages.filterTitles.search": [
    {
      type: 0,
      value: "Search"
    }
  ],
  "ReactFilters.messages.filterTitles.sourceAgendaUid": [
    {
      type: 0,
      value: "Quelle Kalender"
    }
  ],
  "ReactFilters.messages.filterTitles.state": [
    {
      type: 0,
      value: "Zustand"
    }
  ],
  "ReactFilters.messages.filterTitles.status": [
    {
      type: 0,
      value: "Status"
    }
  ],
  "ReactFilters.messages.filterTitles.timings": [
    {
      type: 0,
      value: "Datum"
    }
  ],
  "ReactFilters.messages.filterTitles.updatedAt": [
    {
      type: 0,
      value: "Datum der Aktualisierung"
    }
  ],
  "ReactFilters.messages.map.searchHere": [
    {
      type: 0,
      value: "Search here"
    }
  ],
  "ReactFilters.messages.map.searchWithMap": [
    {
      type: 0,
      value: "Suche mit Karte"
    }
  ],
  "ReactFilters.messages.provenance.aggregation": [
    {
      type: 0,
      value: "Aggregation"
    }
  ],
  "ReactFilters.messages.provenance.contribution": [
    {
      type: 0,
      value: "Beitrag"
    }
  ],
  "ReactFilters.messages.provenance.share": [
    {
      type: 0,
      value: "teilen"
    }
  ],
  "ReactFilters.messages.relative.current": [
    {
      type: 0,
      value: "Aktuell"
    }
  ],
  "ReactFilters.messages.relative.passed": [
    {
      type: 0,
      value: "Bestanden"
    }
  ],
  "ReactFilters.messages.relative.upcoming": [
    {
      type: 0,
      value: "Bevorstehend"
    }
  ],
  "ReactFilters.messages.state.controlled": [
    {
      type: 0,
      value: "Kontrolliert"
    }
  ],
  "ReactFilters.messages.state.published": [
    {
      type: 0,
      value: "Ver\xF6ffentlicht"
    }
  ],
  "ReactFilters.messages.state.refused": [
    {
      type: 0,
      value: "Verweigert"
    }
  ],
  "ReactFilters.messages.state.toModerate": [
    {
      type: 0,
      value: "Moderieren"
    }
  ],
  "ReactFilters.messages.status.cancelled": [
    {
      type: 0,
      value: "Abgesagt"
    }
  ],
  "ReactFilters.messages.status.full": [
    {
      type: 0,
      value: "Ausgebucht"
    }
  ],
  "ReactFilters.messages.status.movedOnline": [
    {
      type: 0,
      value: "Online verschoben"
    }
  ],
  "ReactFilters.messages.status.postponed": [
    {
      type: 0,
      value: "Verschoben"
    }
  ],
  "ReactFilters.messages.status.programmed": [
    {
      type: 0,
      value: "Geplant"
    }
  ],
  "ReactFilters.messages.status.rescheduled": [
    {
      type: 0,
      value: "Verschoben"
    }
  ],
  "ReactFilters.useGetFilterOptions.emptyOption": [
    {
      type: 0,
      value: "(Ohne Wert)"
    }
  ]
};

// src/locales-compiled/en.json with { type: 'json' }
var en_default = {
  "ReactFilters.DateRangeFilter.dateRange": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " to "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DateRangeFilter.endDate": [
    {
      type: 0,
      value: "End"
    }
  ],
  "ReactFilters.DateRangeFilter.from": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DateRangeFilter.startDate": [
    {
      type: 0,
      value: "Start"
    }
  ],
  "ReactFilters.DateRangeFilter.until": [
    {
      type: 0,
      value: "Until "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.dateRange": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " to "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DefinedRangeFilter.endDate": [
    {
      type: 0,
      value: "End"
    }
  ],
  "ReactFilters.DefinedRangeFilter.from": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.singleDate": [
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.startDate": [
    {
      type: 0,
      value: "Start"
    }
  ],
  "ReactFilters.DefinedRangeFilter.until": [
    {
      type: 0,
      value: "Until "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.Sort.chronological": [
    {
      type: 0,
      value: "Chronological order"
    }
  ],
  "ReactFilters.Sort.publicView": [
    {
      type: 0,
      value: "Public view"
    }
  ],
  "ReactFilters.Sort.recentlyUpdated": [
    {
      type: 0,
      value: "Recently updated"
    }
  ],
  "ReactFilters.Sort.relevance": [
    {
      type: 0,
      value: "Relevance"
    }
  ],
  "ReactFilters.TimelineField.selectDay": [
    {
      type: 0,
      value: "Select day"
    }
  ],
  "ReactFilters.TimelineField.selectMonth": [
    {
      type: 0,
      value: "Select month"
    }
  ],
  "ReactFilters.TimelineFilter.dateRange": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " to "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.TimelineFilter.from": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.TimelineFilter.until": [
    {
      type: 0,
      value: "Until "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.ValueBadge.removeFilter": [
    {
      type: 0,
      value: "Remove filter"
    }
  ],
  "ReactFilters.ValueBadge.removeFilterWithTitle": [
    {
      type: 0,
      value: "Remove filter ("
    },
    {
      type: 1,
      value: "title"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.components.fields.SearchInput.ariaLabel": [
    {
      type: 0,
      value: "Search"
    }
  ],
  "ReactFilters.dateRanges.currentMonth": [
    {
      type: 0,
      value: "This month"
    }
  ],
  "ReactFilters.dateRanges.currentWeek": [
    {
      type: 0,
      value: "This week"
    }
  ],
  "ReactFilters.dateRanges.thisWeekend": [
    {
      type: 0,
      value: "This week-end"
    }
  ],
  "ReactFilters.dateRanges.today": [
    {
      type: 0,
      value: "Today"
    }
  ],
  "ReactFilters.dateRanges.tomorrow": [
    {
      type: 0,
      value: "Tomorrow"
    }
  ],
  "ReactFilters.fields.NumberRangeField.gte": [
    {
      type: 0,
      value: "Min"
    }
  ],
  "ReactFilters.fields.NumberRangeField.lte": [
    {
      type: 0,
      value: "Max"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.endDate": [
    {
      type: 0,
      value: "End date"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.startDate": [
    {
      type: 0,
      value: "Start date"
    }
  ],
  "ReactFilters.filters.MapFilter.previewLabel": [
    {
      type: 0,
      value: "Map"
    }
  ],
  "ReactFilters.filters.searchFilter.placeholder": [
    {
      type: 0,
      value: "Search"
    }
  ],
  "ReactFilters.filters.searchFilter.previewLabel": [
    {
      type: 0,
      value: "Search"
    }
  ],
  "ReactFilters.messages.accessiblities.hi": [
    {
      type: 0,
      value: "Hearing impairment"
    }
  ],
  "ReactFilters.messages.accessiblities.ii": [
    {
      type: 0,
      value: "Intellectual impairment"
    }
  ],
  "ReactFilters.messages.accessiblities.mi": [
    {
      type: 0,
      value: "Motor impairment"
    }
  ],
  "ReactFilters.messages.accessiblities.pi": [
    {
      type: 0,
      value: "Psychic impairment"
    }
  ],
  "ReactFilters.messages.accessiblities.vi": [
    {
      type: 0,
      value: "Visual impairment"
    }
  ],
  "ReactFilters.messages.attendanceMode.mixed": [
    {
      type: 0,
      value: "Mixed"
    }
  ],
  "ReactFilters.messages.attendanceMode.offline": [
    {
      type: 0,
      value: "In situ"
    }
  ],
  "ReactFilters.messages.attendanceMode.online": [
    {
      type: 0,
      value: "Online"
    }
  ],
  "ReactFilters.messages.boolean.notSelected": [
    {
      type: 0,
      value: "Not selected"
    }
  ],
  "ReactFilters.messages.boolean.selected": [
    {
      type: 0,
      value: "Selected"
    }
  ],
  "ReactFilters.messages.choiceFilter.lessOptions": [
    {
      type: 0,
      value: "Less options"
    }
  ],
  "ReactFilters.messages.choiceFilter.moreOptions": [
    {
      type: 0,
      value: "More options"
    }
  ],
  "ReactFilters.messages.choiceFilter.noResult": [
    {
      type: 0,
      value: "No result"
    }
  ],
  "ReactFilters.messages.choiceFilter.searchPlaceholder": [
    {
      type: 0,
      value: "Search"
    }
  ],
  "ReactFilters.messages.choiceFilter.unrecognizedOption": [
    {
      type: 0,
      value: "Unknown filter value ("
    },
    {
      type: 1,
      value: "value"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.messages.featured.featured": [
    {
      type: 0,
      value: "Featured"
    }
  ],
  "ReactFilters.messages.filterTitles.accessibility": [
    {
      type: 0,
      value: "Accessibility"
    }
  ],
  "ReactFilters.messages.filterTitles.addMethod": [
    {
      type: 0,
      value: "Provenance"
    }
  ],
  "ReactFilters.messages.filterTitles.adminLevel3": [
    {
      type: 0,
      value: "Administrative level 3"
    }
  ],
  "ReactFilters.messages.filterTitles.attendanceMode": [
    {
      type: 0,
      value: "Attendance mode"
    }
  ],
  "ReactFilters.messages.filterTitles.city": [
    {
      type: 0,
      value: "City"
    }
  ],
  "ReactFilters.messages.filterTitles.countryCode": [
    {
      type: 0,
      value: "Country"
    }
  ],
  "ReactFilters.messages.filterTitles.createdAt": [
    {
      type: 0,
      value: "Creation date"
    }
  ],
  "ReactFilters.messages.filterTitles.department": [
    {
      type: 0,
      value: "Department"
    }
  ],
  "ReactFilters.messages.filterTitles.district": [
    {
      type: 0,
      value: "District"
    }
  ],
  "ReactFilters.messages.filterTitles.featured": [
    {
      type: 0,
      value: "Featured"
    }
  ],
  "ReactFilters.messages.filterTitles.geo": [
    {
      type: 0,
      value: "Map"
    }
  ],
  "ReactFilters.messages.filterTitles.keyword": [
    {
      type: 0,
      value: "Keywords"
    }
  ],
  "ReactFilters.messages.filterTitles.languages": [
    {
      type: 0,
      value: "Languages"
    }
  ],
  "ReactFilters.messages.filterTitles.locationUid": [
    {
      type: 0,
      value: "Location"
    }
  ],
  "ReactFilters.messages.filterTitles.memberUid": [
    {
      type: 0,
      value: "Member"
    }
  ],
  "ReactFilters.messages.filterTitles.originAgendaUid": [
    {
      type: 0,
      value: "Origin agenda"
    }
  ],
  "ReactFilters.messages.filterTitles.region": [
    {
      type: 0,
      value: "Region"
    }
  ],
  "ReactFilters.messages.filterTitles.relative": [
    {
      type: 0,
      value: "Passed / current / upcoming"
    }
  ],
  "ReactFilters.messages.filterTitles.search": [
    {
      type: 0,
      value: "Search"
    }
  ],
  "ReactFilters.messages.filterTitles.sourceAgendaUid": [
    {
      type: 0,
      value: "Source agenda"
    }
  ],
  "ReactFilters.messages.filterTitles.state": [
    {
      type: 0,
      value: "State"
    }
  ],
  "ReactFilters.messages.filterTitles.status": [
    {
      type: 0,
      value: "Status"
    }
  ],
  "ReactFilters.messages.filterTitles.timings": [
    {
      type: 0,
      value: "Date"
    }
  ],
  "ReactFilters.messages.filterTitles.updatedAt": [
    {
      type: 0,
      value: "Date of update"
    }
  ],
  "ReactFilters.messages.map.searchHere": [
    {
      type: 0,
      value: "Search here"
    }
  ],
  "ReactFilters.messages.provenance.aggregation": [
    {
      type: 0,
      value: "Aggregation"
    }
  ],
  "ReactFilters.messages.provenance.contribution": [
    {
      type: 0,
      value: "Contribution"
    }
  ],
  "ReactFilters.messages.provenance.share": [
    {
      type: 0,
      value: "Share"
    }
  ],
  "ReactFilters.messages.relative.current": [
    {
      type: 0,
      value: "Current"
    }
  ],
  "ReactFilters.messages.relative.passed": [
    {
      type: 0,
      value: "Passed"
    }
  ],
  "ReactFilters.messages.relative.upcoming": [
    {
      type: 0,
      value: "Upcoming"
    }
  ],
  "ReactFilters.messages.state.controlled": [
    {
      type: 0,
      value: "Controlled"
    }
  ],
  "ReactFilters.messages.state.published": [
    {
      type: 0,
      value: "Published"
    }
  ],
  "ReactFilters.messages.state.refused": [
    {
      type: 0,
      value: "Refused"
    }
  ],
  "ReactFilters.messages.state.toModerate": [
    {
      type: 0,
      value: "To moderate"
    }
  ],
  "ReactFilters.messages.status.cancelled": [
    {
      type: 0,
      value: "Cancelled"
    }
  ],
  "ReactFilters.messages.status.full": [
    {
      type: 0,
      value: "Fully booked"
    }
  ],
  "ReactFilters.messages.status.movedOnline": [
    {
      type: 0,
      value: "Moved online"
    }
  ],
  "ReactFilters.messages.status.postponed": [
    {
      type: 0,
      value: "Postponed"
    }
  ],
  "ReactFilters.messages.status.programmed": [
    {
      type: 0,
      value: "Scheduled"
    }
  ],
  "ReactFilters.messages.status.rescheduled": [
    {
      type: 0,
      value: "Rescheduled"
    }
  ],
  "ReactFilters.useGetFilterOptions.emptyOption": [
    {
      type: 0,
      value: "(Without value)"
    }
  ]
};

// src/locales-compiled/es.json with { type: 'json' }
var es_default = {
  "ReactFilters.DateRangeFilter.dateRange": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " to "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DateRangeFilter.endDate": [
    {
      type: 0,
      value: "End"
    }
  ],
  "ReactFilters.DateRangeFilter.from": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DateRangeFilter.startDate": [
    {
      type: 0,
      value: "Inicio"
    }
  ],
  "ReactFilters.DateRangeFilter.until": [
    {
      type: 0,
      value: "Until "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.dateRange": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " to "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DefinedRangeFilter.endDate": [
    {
      type: 0,
      value: "End"
    }
  ],
  "ReactFilters.DefinedRangeFilter.from": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.singleDate": [
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.startDate": [
    {
      type: 0,
      value: "Inicio"
    }
  ],
  "ReactFilters.DefinedRangeFilter.until": [
    {
      type: 0,
      value: "Until "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.Sort.chronological": [
    {
      type: 0,
      value: "Chronological order"
    }
  ],
  "ReactFilters.Sort.publicView": [
    {
      type: 0,
      value: "Public view"
    }
  ],
  "ReactFilters.Sort.recentlyUpdated": [
    {
      type: 0,
      value: "Recently updated"
    }
  ],
  "ReactFilters.Sort.relevance": [
    {
      type: 0,
      value: "Relevance"
    }
  ],
  "ReactFilters.TimelineField.selectDay": [
    {
      type: 0,
      value: "Select day"
    }
  ],
  "ReactFilters.TimelineField.selectMonth": [
    {
      type: 0,
      value: "Select month"
    }
  ],
  "ReactFilters.TimelineFilter.dateRange": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " to "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.TimelineFilter.from": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.TimelineFilter.until": [
    {
      type: 0,
      value: "Until "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.ValueBadge.removeFilter": [
    {
      type: 0,
      value: "Eliminar filtro"
    }
  ],
  "ReactFilters.ValueBadge.removeFilterWithTitle": [
    {
      type: 0,
      value: "Remove filter ("
    },
    {
      type: 1,
      value: "title"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.components.fields.SearchInput.ariaLabel": [
    {
      type: 0,
      value: "Buscar"
    }
  ],
  "ReactFilters.dateRanges.currentMonth": [
    {
      type: 0,
      value: "Este mes"
    }
  ],
  "ReactFilters.dateRanges.currentWeek": [
    {
      type: 0,
      value: "Esta semana"
    }
  ],
  "ReactFilters.dateRanges.thisWeekend": [
    {
      type: 0,
      value: "Este fin de semana"
    }
  ],
  "ReactFilters.dateRanges.today": [
    {
      type: 0,
      value: "Hoy"
    }
  ],
  "ReactFilters.dateRanges.tomorrow": [
    {
      type: 0,
      value: "Ma\xF1ana"
    }
  ],
  "ReactFilters.fields.NumberRangeField.gte": [
    {
      type: 0,
      value: "Min"
    }
  ],
  "ReactFilters.fields.NumberRangeField.lte": [
    {
      type: 0,
      value: "Max"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.endDate": [
    {
      type: 0,
      value: "End date"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.startDate": [
    {
      type: 0,
      value: "Start date"
    }
  ],
  "ReactFilters.filters.MapFilter.previewLabel": [
    {
      type: 0,
      value: "Map"
    }
  ],
  "ReactFilters.filters.searchFilter.placeholder": [
    {
      type: 0,
      value: "Buscar"
    }
  ],
  "ReactFilters.filters.searchFilter.previewLabel": [
    {
      type: 0,
      value: "Buscar"
    }
  ],
  "ReactFilters.messages.accessiblities.hi": [
    {
      type: 0,
      value: "Hearing impairment"
    }
  ],
  "ReactFilters.messages.accessiblities.ii": [
    {
      type: 0,
      value: "Intellectual impairment"
    }
  ],
  "ReactFilters.messages.accessiblities.mi": [
    {
      type: 0,
      value: "Motor impairment"
    }
  ],
  "ReactFilters.messages.accessiblities.pi": [
    {
      type: 0,
      value: "Psychic impairment"
    }
  ],
  "ReactFilters.messages.accessiblities.vi": [
    {
      type: 0,
      value: "Visual impairment"
    }
  ],
  "ReactFilters.messages.attendanceMode.mixed": [
    {
      type: 0,
      value: "Mezclado"
    }
  ],
  "ReactFilters.messages.attendanceMode.offline": [
    {
      type: 0,
      value: "Desconnectad"
    }
  ],
  "ReactFilters.messages.attendanceMode.online": [
    {
      type: 0,
      value: "En linea"
    }
  ],
  "ReactFilters.messages.boolean.notSelected": [
    {
      type: 0,
      value: "Not selected"
    }
  ],
  "ReactFilters.messages.boolean.selected": [
    {
      type: 0,
      value: "Selected"
    }
  ],
  "ReactFilters.messages.choiceFilter.lessOptions": [
    {
      type: 0,
      value: "Less options"
    }
  ],
  "ReactFilters.messages.choiceFilter.moreOptions": [
    {
      type: 0,
      value: "More options"
    }
  ],
  "ReactFilters.messages.choiceFilter.noResult": [
    {
      type: 0,
      value: "No result"
    }
  ],
  "ReactFilters.messages.choiceFilter.searchPlaceholder": [
    {
      type: 0,
      value: "Buscar"
    }
  ],
  "ReactFilters.messages.choiceFilter.unrecognizedOption": [
    {
      type: 0,
      value: "Unknown filter value ("
    },
    {
      type: 1,
      value: "value"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.messages.featured.featured": [
    {
      type: 0,
      value: "Featured"
    }
  ],
  "ReactFilters.messages.filterTitles.accessibility": [
    {
      type: 0,
      value: "Accessibility"
    }
  ],
  "ReactFilters.messages.filterTitles.addMethod": [
    {
      type: 0,
      value: "Provenance"
    }
  ],
  "ReactFilters.messages.filterTitles.adminLevel3": [
    {
      type: 0,
      value: "Administrative level 3"
    }
  ],
  "ReactFilters.messages.filterTitles.attendanceMode": [
    {
      type: 0,
      value: "Modo de asistencia"
    }
  ],
  "ReactFilters.messages.filterTitles.city": [
    {
      type: 0,
      value: "City"
    }
  ],
  "ReactFilters.messages.filterTitles.countryCode": [
    {
      type: 0,
      value: "Pa\xEDs"
    }
  ],
  "ReactFilters.messages.filterTitles.createdAt": [
    {
      type: 0,
      value: "Creation date"
    }
  ],
  "ReactFilters.messages.filterTitles.department": [
    {
      type: 0,
      value: "Department"
    }
  ],
  "ReactFilters.messages.filterTitles.district": [
    {
      type: 0,
      value: "District"
    }
  ],
  "ReactFilters.messages.filterTitles.featured": [
    {
      type: 0,
      value: "Featured"
    }
  ],
  "ReactFilters.messages.filterTitles.geo": [
    {
      type: 0,
      value: "Map"
    }
  ],
  "ReactFilters.messages.filterTitles.keyword": [
    {
      type: 0,
      value: "Keywords"
    }
  ],
  "ReactFilters.messages.filterTitles.languages": [
    {
      type: 0,
      value: "Idiomas"
    }
  ],
  "ReactFilters.messages.filterTitles.locationUid": [
    {
      type: 0,
      value: "Lugar"
    }
  ],
  "ReactFilters.messages.filterTitles.memberUid": [
    {
      type: 0,
      value: "Member"
    }
  ],
  "ReactFilters.messages.filterTitles.originAgendaUid": [
    {
      type: 0,
      value: "Origin agenda"
    }
  ],
  "ReactFilters.messages.filterTitles.region": [
    {
      type: 0,
      value: "Region"
    }
  ],
  "ReactFilters.messages.filterTitles.relative": [
    {
      type: 0,
      value: "Pasados / actuales / pr\xF3ximos"
    }
  ],
  "ReactFilters.messages.filterTitles.search": [
    {
      type: 0,
      value: "Buscar"
    }
  ],
  "ReactFilters.messages.filterTitles.sourceAgendaUid": [
    {
      type: 0,
      value: "Source agenda"
    }
  ],
  "ReactFilters.messages.filterTitles.state": [
    {
      type: 0,
      value: "Estado"
    }
  ],
  "ReactFilters.messages.filterTitles.status": [
    {
      type: 0,
      value: "Estado"
    }
  ],
  "ReactFilters.messages.filterTitles.timings": [
    {
      type: 0,
      value: "Fecha"
    }
  ],
  "ReactFilters.messages.filterTitles.updatedAt": [
    {
      type: 0,
      value: "Date of update"
    }
  ],
  "ReactFilters.messages.map.searchHere": [
    {
      type: 0,
      value: "Search here"
    }
  ],
  "ReactFilters.messages.map.searchWithMap": [
    {
      type: 0,
      value: "Buscar en el mapa"
    }
  ],
  "ReactFilters.messages.provenance.aggregation": [
    {
      type: 0,
      value: "Aggregation"
    }
  ],
  "ReactFilters.messages.provenance.contribution": [
    {
      type: 0,
      value: "Contribuci\xF3n"
    }
  ],
  "ReactFilters.messages.provenance.share": [
    {
      type: 0,
      value: "Share"
    }
  ],
  "ReactFilters.messages.relative.current": [
    {
      type: 0,
      value: "Current"
    }
  ],
  "ReactFilters.messages.relative.passed": [
    {
      type: 0,
      value: "Passed"
    }
  ],
  "ReactFilters.messages.relative.upcoming": [
    {
      type: 0,
      value: "Pr\xF3ximos"
    }
  ],
  "ReactFilters.messages.state.controlled": [
    {
      type: 0,
      value: "Controlled"
    }
  ],
  "ReactFilters.messages.state.published": [
    {
      type: 0,
      value: "Published"
    }
  ],
  "ReactFilters.messages.state.refused": [
    {
      type: 0,
      value: "Refused"
    }
  ],
  "ReactFilters.messages.state.toModerate": [
    {
      type: 0,
      value: "To moderate"
    }
  ],
  "ReactFilters.messages.status.cancelled": [
    {
      type: 0,
      value: "Cancelled"
    }
  ],
  "ReactFilters.messages.status.full": [
    {
      type: 0,
      value: "Fully booked"
    }
  ],
  "ReactFilters.messages.status.movedOnline": [
    {
      type: 0,
      value: "Moved online"
    }
  ],
  "ReactFilters.messages.status.postponed": [
    {
      type: 0,
      value: "Postponed"
    }
  ],
  "ReactFilters.messages.status.programmed": [
    {
      type: 0,
      value: "Programado"
    }
  ],
  "ReactFilters.messages.status.rescheduled": [
    {
      type: 0,
      value: "Rescheduled"
    }
  ],
  "ReactFilters.useGetFilterOptions.emptyOption": [
    {
      type: 0,
      value: "(Without value)"
    }
  ]
};

// src/locales-compiled/eu.json with { type: 'json' }
var eu_default = {
  "ReactFilters.DateRangeFilter.dateRange": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " to "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DateRangeFilter.endDate": [
    {
      type: 0,
      value: "End"
    }
  ],
  "ReactFilters.DateRangeFilter.from": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DateRangeFilter.startDate": [
    {
      type: 0,
      value: "Inicio"
    }
  ],
  "ReactFilters.DateRangeFilter.until": [
    {
      type: 0,
      value: "Until "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.dateRange": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " to "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DefinedRangeFilter.endDate": [
    {
      type: 0,
      value: "End"
    }
  ],
  "ReactFilters.DefinedRangeFilter.from": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.singleDate": [
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.startDate": [
    {
      type: 0,
      value: "Inicio"
    }
  ],
  "ReactFilters.DefinedRangeFilter.until": [
    {
      type: 0,
      value: "Until "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.Sort.chronological": [
    {
      type: 0,
      value: "Chronological order"
    }
  ],
  "ReactFilters.Sort.publicView": [
    {
      type: 0,
      value: "Public view"
    }
  ],
  "ReactFilters.Sort.recentlyUpdated": [
    {
      type: 0,
      value: "Recently updated"
    }
  ],
  "ReactFilters.Sort.relevance": [
    {
      type: 0,
      value: "Relevance"
    }
  ],
  "ReactFilters.TimelineField.selectDay": [
    {
      type: 0,
      value: "Select day"
    }
  ],
  "ReactFilters.TimelineField.selectMonth": [
    {
      type: 0,
      value: "Select month"
    }
  ],
  "ReactFilters.TimelineFilter.dateRange": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " to "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.TimelineFilter.from": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.TimelineFilter.until": [
    {
      type: 0,
      value: "Until "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.ValueBadge.removeFilter": [
    {
      type: 0,
      value: "Eliminar filtro"
    }
  ],
  "ReactFilters.ValueBadge.removeFilterWithTitle": [
    {
      type: 0,
      value: "Remove filter ("
    },
    {
      type: 1,
      value: "title"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.components.fields.SearchInput.ariaLabel": [
    {
      type: 0,
      value: "Buscar"
    }
  ],
  "ReactFilters.dateRanges.currentMonth": [
    {
      type: 0,
      value: "Este mes"
    }
  ],
  "ReactFilters.dateRanges.currentWeek": [
    {
      type: 0,
      value: "Esta semana"
    }
  ],
  "ReactFilters.dateRanges.thisWeekend": [
    {
      type: 0,
      value: "Este fin de semana"
    }
  ],
  "ReactFilters.dateRanges.today": [
    {
      type: 0,
      value: "Hoy"
    }
  ],
  "ReactFilters.dateRanges.tomorrow": [
    {
      type: 0,
      value: "Ma\xF1ana"
    }
  ],
  "ReactFilters.fields.NumberRangeField.gte": [
    {
      type: 0,
      value: "Min"
    }
  ],
  "ReactFilters.fields.NumberRangeField.lte": [
    {
      type: 0,
      value: "Max"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.endDate": [
    {
      type: 0,
      value: "End date"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.startDate": [
    {
      type: 0,
      value: "Start date"
    }
  ],
  "ReactFilters.filters.MapFilter.previewLabel": [
    {
      type: 0,
      value: "Map"
    }
  ],
  "ReactFilters.filters.searchFilter.placeholder": [
    {
      type: 0,
      value: "Buscar"
    }
  ],
  "ReactFilters.filters.searchFilter.previewLabel": [
    {
      type: 0,
      value: "Buscar"
    }
  ],
  "ReactFilters.messages.accessiblities.hi": [
    {
      type: 0,
      value: "Hearing impairment"
    }
  ],
  "ReactFilters.messages.accessiblities.ii": [
    {
      type: 0,
      value: "Intellectual impairment"
    }
  ],
  "ReactFilters.messages.accessiblities.mi": [
    {
      type: 0,
      value: "Motor impairment"
    }
  ],
  "ReactFilters.messages.accessiblities.pi": [
    {
      type: 0,
      value: "Psychic impairment"
    }
  ],
  "ReactFilters.messages.accessiblities.vi": [
    {
      type: 0,
      value: "Visual impairment"
    }
  ],
  "ReactFilters.messages.attendanceMode.mixed": [
    {
      type: 0,
      value: "Mezclado"
    }
  ],
  "ReactFilters.messages.attendanceMode.offline": [
    {
      type: 0,
      value: "Desconnectad"
    }
  ],
  "ReactFilters.messages.attendanceMode.online": [
    {
      type: 0,
      value: "En linea"
    }
  ],
  "ReactFilters.messages.boolean.notSelected": [
    {
      type: 0,
      value: "Not selected"
    }
  ],
  "ReactFilters.messages.boolean.selected": [
    {
      type: 0,
      value: "Selected"
    }
  ],
  "ReactFilters.messages.choiceFilter.lessOptions": [
    {
      type: 0,
      value: "Less options"
    }
  ],
  "ReactFilters.messages.choiceFilter.moreOptions": [
    {
      type: 0,
      value: "More options"
    }
  ],
  "ReactFilters.messages.choiceFilter.noResult": [
    {
      type: 0,
      value: "No result"
    }
  ],
  "ReactFilters.messages.choiceFilter.searchPlaceholder": [
    {
      type: 0,
      value: "Buscar"
    }
  ],
  "ReactFilters.messages.choiceFilter.unrecognizedOption": [
    {
      type: 0,
      value: "Unknown filter value ("
    },
    {
      type: 1,
      value: "value"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.messages.featured.featured": [
    {
      type: 0,
      value: "Featured"
    }
  ],
  "ReactFilters.messages.filterTitles.accessibility": [
    {
      type: 0,
      value: "Accessibility"
    }
  ],
  "ReactFilters.messages.filterTitles.addMethod": [
    {
      type: 0,
      value: "Provenance"
    }
  ],
  "ReactFilters.messages.filterTitles.adminLevel3": [
    {
      type: 0,
      value: "Administrative level 3"
    }
  ],
  "ReactFilters.messages.filterTitles.attendanceMode": [
    {
      type: 0,
      value: "Modo de asistencia"
    }
  ],
  "ReactFilters.messages.filterTitles.city": [
    {
      type: 0,
      value: "City"
    }
  ],
  "ReactFilters.messages.filterTitles.countryCode": [
    {
      type: 0,
      value: "Pa\xEDs"
    }
  ],
  "ReactFilters.messages.filterTitles.createdAt": [
    {
      type: 0,
      value: "Creation date"
    }
  ],
  "ReactFilters.messages.filterTitles.department": [
    {
      type: 0,
      value: "Department"
    }
  ],
  "ReactFilters.messages.filterTitles.district": [
    {
      type: 0,
      value: "District"
    }
  ],
  "ReactFilters.messages.filterTitles.featured": [
    {
      type: 0,
      value: "Featured"
    }
  ],
  "ReactFilters.messages.filterTitles.geo": [
    {
      type: 0,
      value: "Map"
    }
  ],
  "ReactFilters.messages.filterTitles.keyword": [
    {
      type: 0,
      value: "Keywords"
    }
  ],
  "ReactFilters.messages.filterTitles.languages": [
    {
      type: 0,
      value: "Idiomas"
    }
  ],
  "ReactFilters.messages.filterTitles.locationUid": [
    {
      type: 0,
      value: "Lugar"
    }
  ],
  "ReactFilters.messages.filterTitles.memberUid": [
    {
      type: 0,
      value: "Member"
    }
  ],
  "ReactFilters.messages.filterTitles.originAgendaUid": [
    {
      type: 0,
      value: "Origin agenda"
    }
  ],
  "ReactFilters.messages.filterTitles.region": [
    {
      type: 0,
      value: "Region"
    }
  ],
  "ReactFilters.messages.filterTitles.relative": [
    {
      type: 0,
      value: "Pasados / actuales / pr\xF3ximos"
    }
  ],
  "ReactFilters.messages.filterTitles.search": [
    {
      type: 0,
      value: "Buscar"
    }
  ],
  "ReactFilters.messages.filterTitles.sourceAgendaUid": [
    {
      type: 0,
      value: "Source agenda"
    }
  ],
  "ReactFilters.messages.filterTitles.state": [
    {
      type: 0,
      value: "Estado"
    }
  ],
  "ReactFilters.messages.filterTitles.status": [
    {
      type: 0,
      value: "Estado"
    }
  ],
  "ReactFilters.messages.filterTitles.timings": [
    {
      type: 0,
      value: "Fecha"
    }
  ],
  "ReactFilters.messages.filterTitles.updatedAt": [
    {
      type: 0,
      value: "Date of update"
    }
  ],
  "ReactFilters.messages.map.searchHere": [
    {
      type: 0,
      value: "Search here"
    }
  ],
  "ReactFilters.messages.map.searchWithMap": [
    {
      type: 0,
      value: "Buscar en el mapa"
    }
  ],
  "ReactFilters.messages.provenance.aggregation": [
    {
      type: 0,
      value: "Aggregation"
    }
  ],
  "ReactFilters.messages.provenance.contribution": [
    {
      type: 0,
      value: "Contribuci\xF3n"
    }
  ],
  "ReactFilters.messages.provenance.share": [
    {
      type: 0,
      value: "Share"
    }
  ],
  "ReactFilters.messages.relative.current": [
    {
      type: 0,
      value: "Current"
    }
  ],
  "ReactFilters.messages.relative.passed": [
    {
      type: 0,
      value: "Passed"
    }
  ],
  "ReactFilters.messages.relative.upcoming": [
    {
      type: 0,
      value: "Pr\xF3ximos"
    }
  ],
  "ReactFilters.messages.state.controlled": [
    {
      type: 0,
      value: "Controlled"
    }
  ],
  "ReactFilters.messages.state.published": [
    {
      type: 0,
      value: "Published"
    }
  ],
  "ReactFilters.messages.state.refused": [
    {
      type: 0,
      value: "Refused"
    }
  ],
  "ReactFilters.messages.state.toModerate": [
    {
      type: 0,
      value: "To moderate"
    }
  ],
  "ReactFilters.messages.status.cancelled": [
    {
      type: 0,
      value: "Cancelled"
    }
  ],
  "ReactFilters.messages.status.full": [
    {
      type: 0,
      value: "Fully booked"
    }
  ],
  "ReactFilters.messages.status.movedOnline": [
    {
      type: 0,
      value: "Moved online"
    }
  ],
  "ReactFilters.messages.status.postponed": [
    {
      type: 0,
      value: "Postponed"
    }
  ],
  "ReactFilters.messages.status.programmed": [
    {
      type: 0,
      value: "Programado"
    }
  ],
  "ReactFilters.messages.status.rescheduled": [
    {
      type: 0,
      value: "Rescheduled"
    }
  ],
  "ReactFilters.useGetFilterOptions.emptyOption": [
    {
      type: 0,
      value: "(Without value)"
    }
  ]
};

// src/locales-compiled/fr.json with { type: 'json' }
var fr_default = {
  "ReactFilters.DateRangeFilter.dateRange": [
    {
      type: 0,
      value: "Du "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " au "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DateRangeFilter.endDate": [
    {
      type: 0,
      value: "Fin"
    }
  ],
  "ReactFilters.DateRangeFilter.from": [
    {
      type: 0,
      value: "\xC0 partir du "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DateRangeFilter.startDate": [
    {
      type: 0,
      value: "D\xE9but"
    }
  ],
  "ReactFilters.DateRangeFilter.until": [
    {
      type: 0,
      value: "Jusqu'au "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.dateRange": [
    {
      type: 0,
      value: "Du "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " au "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DefinedRangeFilter.endDate": [
    {
      type: 0,
      value: "Fin"
    }
  ],
  "ReactFilters.DefinedRangeFilter.from": [
    {
      type: 0,
      value: "\xC0 partir du "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.singleDate": [
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.startDate": [
    {
      type: 0,
      value: "D\xE9but"
    }
  ],
  "ReactFilters.DefinedRangeFilter.until": [
    {
      type: 0,
      value: "Jusqu'au "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.Sort.chronological": [
    {
      type: 0,
      value: "Ordre chronologique"
    }
  ],
  "ReactFilters.Sort.publicView": [
    {
      type: 0,
      value: "Vue publique"
    }
  ],
  "ReactFilters.Sort.recentlyUpdated": [
    {
      type: 0,
      value: "Mise \xE0 jour r\xE9cente"
    }
  ],
  "ReactFilters.Sort.relevance": [
    {
      type: 0,
      value: "Pertinence"
    }
  ],
  "ReactFilters.TimelineField.selectDay": [
    {
      type: 0,
      value: "Choisissez un jour"
    }
  ],
  "ReactFilters.TimelineField.selectMonth": [
    {
      type: 0,
      value: "Choisissez un mois"
    }
  ],
  "ReactFilters.TimelineFilter.dateRange": [
    {
      type: 0,
      value: "Du "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " au "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.TimelineFilter.from": [
    {
      type: 0,
      value: "\xC0 partir du "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.TimelineFilter.until": [
    {
      type: 0,
      value: "Jusqu'au "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.ValueBadge.removeFilter": [
    {
      type: 0,
      value: "Supprimer le filtre"
    }
  ],
  "ReactFilters.ValueBadge.removeFilterWithTitle": [
    {
      type: 0,
      value: "Supprimer le filtre ("
    },
    {
      type: 1,
      value: "title"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.components.fields.SearchInput.ariaLabel": [
    {
      type: 0,
      value: "Rechercher"
    }
  ],
  "ReactFilters.dateRanges.currentMonth": [
    {
      type: 0,
      value: "Ce mois"
    }
  ],
  "ReactFilters.dateRanges.currentWeek": [
    {
      type: 0,
      value: "Cette semaine"
    }
  ],
  "ReactFilters.dateRanges.thisWeekend": [
    {
      type: 0,
      value: "Ce week-end"
    }
  ],
  "ReactFilters.dateRanges.today": [
    {
      type: 0,
      value: "Aujourd'hui"
    }
  ],
  "ReactFilters.dateRanges.tomorrow": [
    {
      type: 0,
      value: "Demain"
    }
  ],
  "ReactFilters.fields.NumberRangeField.gte": [
    {
      type: 0,
      value: "Min"
    }
  ],
  "ReactFilters.fields.NumberRangeField.lte": [
    {
      type: 0,
      value: "Max"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.endDate": [
    {
      type: 0,
      value: "Date de fin"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.startDate": [
    {
      type: 0,
      value: "Date de d\xE9but"
    }
  ],
  "ReactFilters.filters.MapFilter.previewLabel": [
    {
      type: 0,
      value: "Carte"
    }
  ],
  "ReactFilters.filters.searchFilter.placeholder": [
    {
      type: 0,
      value: "Rechercher"
    }
  ],
  "ReactFilters.filters.searchFilter.previewLabel": [
    {
      type: 0,
      value: "Recherche"
    }
  ],
  "ReactFilters.messages.accessiblities.hi": [
    {
      type: 0,
      value: "Handicap auditif"
    }
  ],
  "ReactFilters.messages.accessiblities.ii": [
    {
      type: 0,
      value: "Handicap intellectuel"
    }
  ],
  "ReactFilters.messages.accessiblities.mi": [
    {
      type: 0,
      value: "Handicap moteur"
    }
  ],
  "ReactFilters.messages.accessiblities.pi": [
    {
      type: 0,
      value: "Handicap psychique"
    }
  ],
  "ReactFilters.messages.accessiblities.vi": [
    {
      type: 0,
      value: "Handicap visuel"
    }
  ],
  "ReactFilters.messages.attendanceMode.mixed": [
    {
      type: 0,
      value: "Mixte"
    }
  ],
  "ReactFilters.messages.attendanceMode.offline": [
    {
      type: 0,
      value: "Sur place"
    }
  ],
  "ReactFilters.messages.attendanceMode.online": [
    {
      type: 0,
      value: "En ligne"
    }
  ],
  "ReactFilters.messages.boolean.notSelected": [
    {
      type: 0,
      value: "Non s\xE9lectionn\xE9"
    }
  ],
  "ReactFilters.messages.boolean.selected": [
    {
      type: 0,
      value: "S\xE9lectionn\xE9"
    }
  ],
  "ReactFilters.messages.choiceFilter.lessOptions": [
    {
      type: 0,
      value: "Moins d'options"
    }
  ],
  "ReactFilters.messages.choiceFilter.moreOptions": [
    {
      type: 0,
      value: "Plus d'options"
    }
  ],
  "ReactFilters.messages.choiceFilter.noResult": [
    {
      type: 0,
      value: "Aucun r\xE9sultat"
    }
  ],
  "ReactFilters.messages.choiceFilter.searchPlaceholder": [
    {
      type: 0,
      value: "Rechercher"
    }
  ],
  "ReactFilters.messages.choiceFilter.unrecognizedOption": [
    {
      type: 0,
      value: "Valeur de filtre inconnue ("
    },
    {
      type: 1,
      value: "value"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.messages.featured.featured": [
    {
      type: 0,
      value: "En une"
    }
  ],
  "ReactFilters.messages.filterTitles.accessibility": [
    {
      type: 0,
      value: "Accessibilit\xE9"
    }
  ],
  "ReactFilters.messages.filterTitles.addMethod": [
    {
      type: 0,
      value: "Provenance"
    }
  ],
  "ReactFilters.messages.filterTitles.adminLevel3": [
    {
      type: 0,
      value: "Intercommunalit\xE9"
    }
  ],
  "ReactFilters.messages.filterTitles.attendanceMode": [
    {
      type: 0,
      value: "Mode de participation"
    }
  ],
  "ReactFilters.messages.filterTitles.city": [
    {
      type: 0,
      value: "Ville"
    }
  ],
  "ReactFilters.messages.filterTitles.countryCode": [
    {
      type: 0,
      value: "Pays"
    }
  ],
  "ReactFilters.messages.filterTitles.createdAt": [
    {
      type: 0,
      value: "Date de cr\xE9ation"
    }
  ],
  "ReactFilters.messages.filterTitles.department": [
    {
      type: 0,
      value: "D\xE9partement"
    }
  ],
  "ReactFilters.messages.filterTitles.district": [
    {
      type: 0,
      value: "Quartier"
    }
  ],
  "ReactFilters.messages.filterTitles.featured": [
    {
      type: 0,
      value: "Mis en une"
    }
  ],
  "ReactFilters.messages.filterTitles.geo": [
    {
      type: 0,
      value: "G\xE9olocalisation"
    }
  ],
  "ReactFilters.messages.filterTitles.keyword": [
    {
      type: 0,
      value: "Mots cl\xE9s"
    }
  ],
  "ReactFilters.messages.filterTitles.languages": [
    {
      type: 0,
      value: "Langues"
    }
  ],
  "ReactFilters.messages.filterTitles.locationUid": [
    {
      type: 0,
      value: "Lieu"
    }
  ],
  "ReactFilters.messages.filterTitles.memberUid": [
    {
      type: 0,
      value: "Membre"
    }
  ],
  "ReactFilters.messages.filterTitles.originAgendaUid": [
    {
      type: 0,
      value: "Agenda d'origine"
    }
  ],
  "ReactFilters.messages.filterTitles.region": [
    {
      type: 0,
      value: "R\xE9gion"
    }
  ],
  "ReactFilters.messages.filterTitles.relative": [
    {
      type: 0,
      value: "Pass\xE9 / en cours / \xE0 venir"
    }
  ],
  "ReactFilters.messages.filterTitles.search": [
    {
      type: 0,
      value: "Rechercher"
    }
  ],
  "ReactFilters.messages.filterTitles.sourceAgendaUid": [
    {
      type: 0,
      value: "Agenda source"
    }
  ],
  "ReactFilters.messages.filterTitles.state": [
    {
      type: 0,
      value: "Statut"
    }
  ],
  "ReactFilters.messages.filterTitles.status": [
    {
      type: 0,
      value: "\xC9tat"
    }
  ],
  "ReactFilters.messages.filterTitles.timings": [
    {
      type: 0,
      value: "Date"
    }
  ],
  "ReactFilters.messages.filterTitles.updatedAt": [
    {
      type: 0,
      value: "Date de mise \xE0 jour"
    }
  ],
  "ReactFilters.messages.map.searchHere": [
    {
      type: 0,
      value: "Rechercher ici"
    }
  ],
  "ReactFilters.messages.map.searchWithMap": [
    {
      type: 0,
      value: "Rechercher avec la carte"
    }
  ],
  "ReactFilters.messages.provenance.aggregation": [
    {
      type: 0,
      value: "Agr\xE9gation"
    }
  ],
  "ReactFilters.messages.provenance.contribution": [
    {
      type: 0,
      value: "Contribution"
    }
  ],
  "ReactFilters.messages.provenance.share": [
    {
      type: 0,
      value: "Partage"
    }
  ],
  "ReactFilters.messages.relative.current": [
    {
      type: 0,
      value: "En cours"
    }
  ],
  "ReactFilters.messages.relative.passed": [
    {
      type: 0,
      value: "Pass\xE9"
    }
  ],
  "ReactFilters.messages.relative.upcoming": [
    {
      type: 0,
      value: "\xC0 venir"
    }
  ],
  "ReactFilters.messages.state.controlled": [
    {
      type: 0,
      value: "Pr\xEAt \xE0 publier"
    }
  ],
  "ReactFilters.messages.state.published": [
    {
      type: 0,
      value: "Publi\xE9"
    }
  ],
  "ReactFilters.messages.state.refused": [
    {
      type: 0,
      value: "Refus\xE9"
    }
  ],
  "ReactFilters.messages.state.toModerate": [
    {
      type: 0,
      value: "\xC0 mod\xE9rer"
    }
  ],
  "ReactFilters.messages.status.cancelled": [
    {
      type: 0,
      value: "Annul\xE9"
    }
  ],
  "ReactFilters.messages.status.full": [
    {
      type: 0,
      value: "Complet"
    }
  ],
  "ReactFilters.messages.status.movedOnline": [
    {
      type: 0,
      value: "D\xE9plac\xE9 en ligne"
    }
  ],
  "ReactFilters.messages.status.postponed": [
    {
      type: 0,
      value: "Report\xE9"
    }
  ],
  "ReactFilters.messages.status.programmed": [
    {
      type: 0,
      value: "Programm\xE9"
    }
  ],
  "ReactFilters.messages.status.rescheduled": [
    {
      type: 0,
      value: "Reprogramm\xE9"
    }
  ],
  "ReactFilters.useGetFilterOptions.emptyOption": [
    {
      type: 0,
      value: "(Sans valeur)"
    }
  ]
};

// src/locales-compiled/io.json with { type: 'json' }
var io_default = {
  "ReactFilters.DateRangeFilter.dateRange": [
    {
      type: 0,
      value: "crwdns16546:0"
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: "crwdnd16546:0"
    },
    {
      type: 1,
      value: "endDate"
    },
    {
      type: 0,
      value: "crwdne16546:0"
    }
  ],
  "ReactFilters.DateRangeFilter.endDate": [
    {
      type: 0,
      value: "crwdns16548:0crwdne16548:0"
    }
  ],
  "ReactFilters.DateRangeFilter.from": [
    {
      type: 0,
      value: "crwdns16550:0"
    },
    {
      type: 1,
      value: "date"
    },
    {
      type: 0,
      value: "crwdne16550:0"
    }
  ],
  "ReactFilters.DateRangeFilter.startDate": [
    {
      type: 0,
      value: "crwdns16554:0crwdne16554:0"
    }
  ],
  "ReactFilters.DateRangeFilter.until": [
    {
      type: 0,
      value: "crwdns16556:0"
    },
    {
      type: 1,
      value: "date"
    },
    {
      type: 0,
      value: "crwdne16556:0"
    }
  ],
  "ReactFilters.DefinedRangeFilter.dateRange": [
    {
      type: 0,
      value: "crwdns16558:0"
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: "crwdnd16558:0"
    },
    {
      type: 1,
      value: "endDate"
    },
    {
      type: 0,
      value: "crwdne16558:0"
    }
  ],
  "ReactFilters.DefinedRangeFilter.endDate": [
    {
      type: 0,
      value: "crwdns16560:0crwdne16560:0"
    }
  ],
  "ReactFilters.DefinedRangeFilter.from": [
    {
      type: 0,
      value: "crwdns16562:0"
    },
    {
      type: 1,
      value: "date"
    },
    {
      type: 0,
      value: "crwdne16562:0"
    }
  ],
  "ReactFilters.DefinedRangeFilter.singleDate": [
    {
      type: 0,
      value: "crwdns16564:0"
    },
    {
      type: 1,
      value: "date"
    },
    {
      type: 0,
      value: "crwdne16564:0"
    }
  ],
  "ReactFilters.DefinedRangeFilter.startDate": [
    {
      type: 0,
      value: "crwdns16566:0crwdne16566:0"
    }
  ],
  "ReactFilters.DefinedRangeFilter.until": [
    {
      type: 0,
      value: "crwdns16568:0"
    },
    {
      type: 1,
      value: "date"
    },
    {
      type: 0,
      value: "crwdne16568:0"
    }
  ],
  "ReactFilters.Sort.chronological": [
    {
      type: 0,
      value: "crwdns17304:0crwdne17304:0"
    }
  ],
  "ReactFilters.Sort.publicView": [
    {
      type: 0,
      value: "crwdns33908:0crwdne33908:0"
    }
  ],
  "ReactFilters.Sort.recentlyUpdated": [
    {
      type: 0,
      value: "crwdns17306:0crwdne17306:0"
    }
  ],
  "ReactFilters.Sort.relevance": [
    {
      type: 0,
      value: "crwdns17308:0crwdne17308:0"
    }
  ],
  "ReactFilters.TimelineField.selectDay": [
    {
      type: 0,
      value: "crwdns34401:0crwdne34401:0"
    }
  ],
  "ReactFilters.TimelineField.selectMonth": [
    {
      type: 0,
      value: "crwdns34403:0crwdne34403:0"
    }
  ],
  "ReactFilters.TimelineFilter.dateRange": [
    {
      type: 0,
      value: "crwdns34405:0"
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: "crwdnd34405:0"
    },
    {
      type: 1,
      value: "endDate"
    },
    {
      type: 0,
      value: "crwdne34405:0"
    }
  ],
  "ReactFilters.TimelineFilter.from": [
    {
      type: 0,
      value: "crwdns34407:0"
    },
    {
      type: 1,
      value: "date"
    },
    {
      type: 0,
      value: "crwdne34407:0"
    }
  ],
  "ReactFilters.TimelineFilter.until": [
    {
      type: 0,
      value: "crwdns34409:0"
    },
    {
      type: 1,
      value: "date"
    },
    {
      type: 0,
      value: "crwdne34409:0"
    }
  ],
  "ReactFilters.ValueBadge.removeFilter": [
    {
      type: 0,
      value: "crwdns16572:0crwdne16572:0"
    }
  ],
  "ReactFilters.ValueBadge.removeFilterWithTitle": [
    {
      type: 0,
      value: "crwdns16870:0"
    },
    {
      type: 1,
      value: "title"
    },
    {
      type: 0,
      value: "crwdne16870:0"
    }
  ],
  "ReactFilters.components.fields.SearchInput.ariaLabel": [
    {
      type: 0,
      value: "crwdns34411:0crwdne34411:0"
    }
  ],
  "ReactFilters.dateRanges.currentMonth": [
    {
      type: 0,
      value: "crwdns16574:0crwdne16574:0"
    }
  ],
  "ReactFilters.dateRanges.currentWeek": [
    {
      type: 0,
      value: "crwdns16576:0crwdne16576:0"
    }
  ],
  "ReactFilters.dateRanges.thisWeekend": [
    {
      type: 0,
      value: "crwdns16578:0crwdne16578:0"
    }
  ],
  "ReactFilters.dateRanges.today": [
    {
      type: 0,
      value: "crwdns16580:0crwdne16580:0"
    }
  ],
  "ReactFilters.dateRanges.tomorrow": [
    {
      type: 0,
      value: "crwdns16582:0crwdne16582:0"
    }
  ],
  "ReactFilters.fields.NumberRangeField.gte": [
    {
      type: 0,
      value: "crwdns33910:0crwdne33910:0"
    }
  ],
  "ReactFilters.fields.NumberRangeField.lte": [
    {
      type: 0,
      value: "crwdns33912:0crwdne33912:0"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.endDate": [
    {
      type: 0,
      value: "crwdns34413:0crwdne34413:0"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.startDate": [
    {
      type: 0,
      value: "crwdns34415:0crwdne34415:0"
    }
  ],
  "ReactFilters.filters.MapFilter.previewLabel": [
    {
      type: 0,
      value: "crwdns16584:0crwdne16584:0"
    }
  ],
  "ReactFilters.filters.searchFilter.placeholder": [
    {
      type: 0,
      value: "crwdns16586:0crwdne16586:0"
    }
  ],
  "ReactFilters.filters.searchFilter.previewLabel": [
    {
      type: 0,
      value: "crwdns16588:0crwdne16588:0"
    }
  ],
  "ReactFilters.messages.accessiblities.hi": [
    {
      type: 0,
      value: "crwdns32422:0crwdne32422:0"
    }
  ],
  "ReactFilters.messages.accessiblities.ii": [
    {
      type: 0,
      value: "crwdns32424:0crwdne32424:0"
    }
  ],
  "ReactFilters.messages.accessiblities.mi": [
    {
      type: 0,
      value: "crwdns32426:0crwdne32426:0"
    }
  ],
  "ReactFilters.messages.accessiblities.pi": [
    {
      type: 0,
      value: "crwdns32428:0crwdne32428:0"
    }
  ],
  "ReactFilters.messages.accessiblities.vi": [
    {
      type: 0,
      value: "crwdns32430:0crwdne32430:0"
    }
  ],
  "ReactFilters.messages.attendanceMode.mixed": [
    {
      type: 0,
      value: "crwdns16872:0crwdne16872:0"
    }
  ],
  "ReactFilters.messages.attendanceMode.offline": [
    {
      type: 0,
      value: "crwdns16874:0crwdne16874:0"
    }
  ],
  "ReactFilters.messages.attendanceMode.online": [
    {
      type: 0,
      value: "crwdns16876:0crwdne16876:0"
    }
  ],
  "ReactFilters.messages.boolean.notSelected": [
    {
      type: 0,
      value: "crwdns17310:0crwdne17310:0"
    }
  ],
  "ReactFilters.messages.boolean.selected": [
    {
      type: 0,
      value: "crwdns17312:0crwdne17312:0"
    }
  ],
  "ReactFilters.messages.choiceFilter.lessOptions": [
    {
      type: 0,
      value: "crwdns32809:0crwdne32809:0"
    }
  ],
  "ReactFilters.messages.choiceFilter.moreOptions": [
    {
      type: 0,
      value: "crwdns32811:0crwdne32811:0"
    }
  ],
  "ReactFilters.messages.choiceFilter.noResult": [
    {
      type: 0,
      value: "crwdns32813:0crwdne32813:0"
    }
  ],
  "ReactFilters.messages.choiceFilter.searchPlaceholder": [
    {
      type: 0,
      value: "crwdns32815:0crwdne32815:0"
    }
  ],
  "ReactFilters.messages.choiceFilter.unrecognizedOption": [
    {
      type: 0,
      value: "crwdns32817:0"
    },
    {
      type: 1,
      value: "value"
    },
    {
      type: 0,
      value: "crwdne32817:0"
    }
  ],
  "ReactFilters.messages.featured.featured": [
    {
      type: 0,
      value: "crwdns16878:0crwdne16878:0"
    }
  ],
  "ReactFilters.messages.filterTitles.accessibility": [
    {
      type: 0,
      value: "crwdns32434:0crwdne32434:0"
    }
  ],
  "ReactFilters.messages.filterTitles.addMethod": [
    {
      type: 0,
      value: "crwdns16596:0crwdne16596:0"
    }
  ],
  "ReactFilters.messages.filterTitles.adminLevel3": [
    {
      type: 0,
      value: "crwdns16598:0crwdne16598:0"
    }
  ],
  "ReactFilters.messages.filterTitles.attendanceMode": [
    {
      type: 0,
      value: "crwdns16600:0crwdne16600:0"
    }
  ],
  "ReactFilters.messages.filterTitles.city": [
    {
      type: 0,
      value: "crwdns16602:0crwdne16602:0"
    }
  ],
  "ReactFilters.messages.filterTitles.countryCode": [
    {
      type: 0,
      value: "crwdns33337:0crwdne33337:0"
    }
  ],
  "ReactFilters.messages.filterTitles.createdAt": [
    {
      type: 0,
      value: "crwdns16604:0crwdne16604:0"
    }
  ],
  "ReactFilters.messages.filterTitles.department": [
    {
      type: 0,
      value: "crwdns16606:0crwdne16606:0"
    }
  ],
  "ReactFilters.messages.filterTitles.district": [
    {
      type: 0,
      value: "crwdns16608:0crwdne16608:0"
    }
  ],
  "ReactFilters.messages.filterTitles.featured": [
    {
      type: 0,
      value: "crwdns16610:0crwdne16610:0"
    }
  ],
  "ReactFilters.messages.filterTitles.geo": [
    {
      type: 0,
      value: "crwdns16612:0crwdne16612:0"
    }
  ],
  "ReactFilters.messages.filterTitles.keyword": [
    {
      type: 0,
      value: "crwdns16614:0crwdne16614:0"
    }
  ],
  "ReactFilters.messages.filterTitles.languages": [
    {
      type: 0,
      value: "crwdns32825:0crwdne32825:0"
    }
  ],
  "ReactFilters.messages.filterTitles.locationUid": [
    {
      type: 0,
      value: "crwdns16616:0crwdne16616:0"
    }
  ],
  "ReactFilters.messages.filterTitles.memberUid": [
    {
      type: 0,
      value: "crwdns16618:0crwdne16618:0"
    }
  ],
  "ReactFilters.messages.filterTitles.originAgendaUid": [
    {
      type: 0,
      value: "crwdns16620:0crwdne16620:0"
    }
  ],
  "ReactFilters.messages.filterTitles.region": [
    {
      type: 0,
      value: "crwdns16622:0crwdne16622:0"
    }
  ],
  "ReactFilters.messages.filterTitles.relative": [
    {
      type: 0,
      value: "crwdns16624:0crwdne16624:0"
    }
  ],
  "ReactFilters.messages.filterTitles.search": [
    {
      type: 0,
      value: "crwdns34417:0crwdne34417:0"
    }
  ],
  "ReactFilters.messages.filterTitles.sourceAgendaUid": [
    {
      type: 0,
      value: "crwdns16626:0crwdne16626:0"
    }
  ],
  "ReactFilters.messages.filterTitles.state": [
    {
      type: 0,
      value: "crwdns16628:0crwdne16628:0"
    }
  ],
  "ReactFilters.messages.filterTitles.status": [
    {
      type: 0,
      value: "crwdns16630:0crwdne16630:0"
    }
  ],
  "ReactFilters.messages.filterTitles.timings": [
    {
      type: 0,
      value: "crwdns16632:0crwdne16632:0"
    }
  ],
  "ReactFilters.messages.filterTitles.updatedAt": [
    {
      type: 0,
      value: "crwdns16634:0crwdne16634:0"
    }
  ],
  "ReactFilters.messages.map.searchHere": [
    {
      type: 0,
      value: "crwdns34419:0crwdne34419:0"
    }
  ],
  "ReactFilters.messages.map.searchWithMap": [
    {
      type: 0,
      value: "crwdns32827:0crwdne32827:0"
    }
  ],
  "ReactFilters.messages.provenance.aggregation": [
    {
      type: 0,
      value: "crwdns16880:0crwdne16880:0"
    }
  ],
  "ReactFilters.messages.provenance.contribution": [
    {
      type: 0,
      value: "crwdns16882:0crwdne16882:0"
    }
  ],
  "ReactFilters.messages.provenance.share": [
    {
      type: 0,
      value: "crwdns16884:0crwdne16884:0"
    }
  ],
  "ReactFilters.messages.relative.current": [
    {
      type: 0,
      value: "crwdns16886:0crwdne16886:0"
    }
  ],
  "ReactFilters.messages.relative.passed": [
    {
      type: 0,
      value: "crwdns16888:0crwdne16888:0"
    }
  ],
  "ReactFilters.messages.relative.upcoming": [
    {
      type: 0,
      value: "crwdns16890:0crwdne16890:0"
    }
  ],
  "ReactFilters.messages.state.controlled": [
    {
      type: 0,
      value: "crwdns16892:0crwdne16892:0"
    }
  ],
  "ReactFilters.messages.state.published": [
    {
      type: 0,
      value: "crwdns16894:0crwdne16894:0"
    }
  ],
  "ReactFilters.messages.state.refused": [
    {
      type: 0,
      value: "crwdns16896:0crwdne16896:0"
    }
  ],
  "ReactFilters.messages.state.toModerate": [
    {
      type: 0,
      value: "crwdns16898:0crwdne16898:0"
    }
  ],
  "ReactFilters.messages.status.cancelled": [
    {
      type: 0,
      value: "crwdns16900:0crwdne16900:0"
    }
  ],
  "ReactFilters.messages.status.full": [
    {
      type: 0,
      value: "crwdns16902:0crwdne16902:0"
    }
  ],
  "ReactFilters.messages.status.movedOnline": [
    {
      type: 0,
      value: "crwdns16904:0crwdne16904:0"
    }
  ],
  "ReactFilters.messages.status.postponed": [
    {
      type: 0,
      value: "crwdns16906:0crwdne16906:0"
    }
  ],
  "ReactFilters.messages.status.programmed": [
    {
      type: 0,
      value: "crwdns16908:0crwdne16908:0"
    }
  ],
  "ReactFilters.messages.status.rescheduled": [
    {
      type: 0,
      value: "crwdns16910:0crwdne16910:0"
    }
  ],
  "ReactFilters.useGetFilterOptions.emptyOption": [
    {
      type: 0,
      value: "crwdns16912:0crwdne16912:0"
    }
  ]
};

// src/locales-compiled/it.json with { type: 'json' }
var it_default = {
  "ReactFilters.DateRangeFilter.dateRange": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " to "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DateRangeFilter.endDate": [
    {
      type: 0,
      value: "Fine"
    }
  ],
  "ReactFilters.DateRangeFilter.from": [
    {
      type: 0,
      value: "Da "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DateRangeFilter.startDate": [
    {
      type: 0,
      value: "Iniziare"
    }
  ],
  "ReactFilters.DateRangeFilter.until": [
    {
      type: 0,
      value: "Until "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.dateRange": [
    {
      type: 0,
      value: "Da "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " a "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DefinedRangeFilter.endDate": [
    {
      type: 0,
      value: "Fine"
    }
  ],
  "ReactFilters.DefinedRangeFilter.from": [
    {
      type: 0,
      value: "Da "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.singleDate": [
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.startDate": [
    {
      type: 0,
      value: "Iniziare"
    }
  ],
  "ReactFilters.DefinedRangeFilter.until": [
    {
      type: 0,
      value: "Until "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.Sort.chronological": [
    {
      type: 0,
      value: "Ordine cronologico"
    }
  ],
  "ReactFilters.Sort.publicView": [
    {
      type: 0,
      value: "Vista pubblica"
    }
  ],
  "ReactFilters.Sort.recentlyUpdated": [
    {
      type: 0,
      value: "Aggiornamento recente"
    }
  ],
  "ReactFilters.Sort.relevance": [
    {
      type: 0,
      value: "Rilevanza"
    }
  ],
  "ReactFilters.TimelineField.selectDay": [
    {
      type: 0,
      value: "Select day"
    }
  ],
  "ReactFilters.TimelineField.selectMonth": [
    {
      type: 0,
      value: "Select month"
    }
  ],
  "ReactFilters.TimelineFilter.dateRange": [
    {
      type: 0,
      value: "From "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " to "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.TimelineFilter.from": [
    {
      type: 0,
      value: "Da "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.TimelineFilter.until": [
    {
      type: 0,
      value: "Until "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.ValueBadge.removeFilter": [
    {
      type: 0,
      value: "Rimuovere il filtro"
    }
  ],
  "ReactFilters.ValueBadge.removeFilterWithTitle": [
    {
      type: 0,
      value: "Remove filter ("
    },
    {
      type: 1,
      value: "title"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.components.fields.SearchInput.ariaLabel": [
    {
      type: 0,
      value: "Cerca"
    }
  ],
  "ReactFilters.dateRanges.currentMonth": [
    {
      type: 0,
      value: "Mese corrente"
    }
  ],
  "ReactFilters.dateRanges.currentWeek": [
    {
      type: 0,
      value: "Settimana corrente"
    }
  ],
  "ReactFilters.dateRanges.thisWeekend": [
    {
      type: 0,
      value: "Questo week end"
    }
  ],
  "ReactFilters.dateRanges.today": [
    {
      type: 0,
      value: "Oggi"
    }
  ],
  "ReactFilters.dateRanges.tomorrow": [
    {
      type: 0,
      value: "Domani"
    }
  ],
  "ReactFilters.fields.NumberRangeField.gte": [
    {
      type: 0,
      value: "Min"
    }
  ],
  "ReactFilters.fields.NumberRangeField.lte": [
    {
      type: 0,
      value: "Max"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.endDate": [
    {
      type: 0,
      value: "End date"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.startDate": [
    {
      type: 0,
      value: "Start date"
    }
  ],
  "ReactFilters.filters.MapFilter.previewLabel": [
    {
      type: 0,
      value: "Mappa"
    }
  ],
  "ReactFilters.filters.searchFilter.placeholder": [
    {
      type: 0,
      value: "Cerca"
    }
  ],
  "ReactFilters.filters.searchFilter.previewLabel": [
    {
      type: 0,
      value: "Cerca"
    }
  ],
  "ReactFilters.messages.accessiblities.hi": [
    {
      type: 0,
      value: "Disabilit\xE0 uditiva"
    }
  ],
  "ReactFilters.messages.accessiblities.ii": [
    {
      type: 0,
      value: "Disabilit\xE0 cognitiva"
    }
  ],
  "ReactFilters.messages.accessiblities.mi": [
    {
      type: 0,
      value: "Disabilit\xE0 motoria"
    }
  ],
  "ReactFilters.messages.accessiblities.pi": [
    {
      type: 0,
      value: "Disabilit\xE0 psichica"
    }
  ],
  "ReactFilters.messages.accessiblities.vi": [
    {
      type: 0,
      value: "Disabilit\xE0 visiva"
    }
  ],
  "ReactFilters.messages.attendanceMode.mixed": [
    {
      type: 0,
      value: "Mista"
    }
  ],
  "ReactFilters.messages.attendanceMode.offline": [
    {
      type: 0,
      value: "In presenza"
    }
  ],
  "ReactFilters.messages.attendanceMode.online": [
    {
      type: 0,
      value: "Evento online"
    }
  ],
  "ReactFilters.messages.boolean.notSelected": [
    {
      type: 0,
      value: "Non selezionato"
    }
  ],
  "ReactFilters.messages.boolean.selected": [
    {
      type: 0,
      value: "Selezionato"
    }
  ],
  "ReactFilters.messages.choiceFilter.lessOptions": [
    {
      type: 0,
      value: "Less options"
    }
  ],
  "ReactFilters.messages.choiceFilter.moreOptions": [
    {
      type: 0,
      value: "More options"
    }
  ],
  "ReactFilters.messages.choiceFilter.noResult": [
    {
      type: 0,
      value: "Nessun risultato"
    }
  ],
  "ReactFilters.messages.choiceFilter.searchPlaceholder": [
    {
      type: 0,
      value: "Cerca"
    }
  ],
  "ReactFilters.messages.choiceFilter.unrecognizedOption": [
    {
      type: 0,
      value: "Unknown filter value ("
    },
    {
      type: 1,
      value: "value"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.messages.featured.featured": [
    {
      type: 0,
      value: "Fissato"
    }
  ],
  "ReactFilters.messages.filterTitles.accessibility": [
    {
      type: 0,
      value: "Accessibilit\xE0"
    }
  ],
  "ReactFilters.messages.filterTitles.addMethod": [
    {
      type: 0,
      value: "Origine"
    }
  ],
  "ReactFilters.messages.filterTitles.adminLevel3": [
    {
      type: 0,
      value: "Citt\xE0 metropolitane"
    }
  ],
  "ReactFilters.messages.filterTitles.attendanceMode": [
    {
      type: 0,
      value: "Modalit\xE0 di partecipazione"
    }
  ],
  "ReactFilters.messages.filterTitles.city": [
    {
      type: 0,
      value: "Citt\xE0"
    }
  ],
  "ReactFilters.messages.filterTitles.countryCode": [
    {
      type: 0,
      value: "Paese"
    }
  ],
  "ReactFilters.messages.filterTitles.createdAt": [
    {
      type: 0,
      value: "Creazione del record"
    }
  ],
  "ReactFilters.messages.filterTitles.department": [
    {
      type: 0,
      value: "Provincia"
    }
  ],
  "ReactFilters.messages.filterTitles.district": [
    {
      type: 0,
      value: "Quartiere"
    }
  ],
  "ReactFilters.messages.filterTitles.featured": [
    {
      type: 0,
      value: "Fissato"
    }
  ],
  "ReactFilters.messages.filterTitles.geo": [
    {
      type: 0,
      value: "Mappa"
    }
  ],
  "ReactFilters.messages.filterTitles.keyword": [
    {
      type: 0,
      value: "Parole Chiave"
    }
  ],
  "ReactFilters.messages.filterTitles.languages": [
    {
      type: 0,
      value: "Lingue"
    }
  ],
  "ReactFilters.messages.filterTitles.locationUid": [
    {
      type: 0,
      value: "Luogo"
    }
  ],
  "ReactFilters.messages.filterTitles.memberUid": [
    {
      type: 0,
      value: "Membro"
    }
  ],
  "ReactFilters.messages.filterTitles.originAgendaUid": [
    {
      type: 0,
      value: "Origin agenda"
    }
  ],
  "ReactFilters.messages.filterTitles.region": [
    {
      type: 0,
      value: "Regione"
    }
  ],
  "ReactFilters.messages.filterTitles.relative": [
    {
      type: 0,
      value: "Passati / in corso / futuri"
    }
  ],
  "ReactFilters.messages.filterTitles.search": [
    {
      type: 0,
      value: "Cerca"
    }
  ],
  "ReactFilters.messages.filterTitles.sourceAgendaUid": [
    {
      type: 0,
      value: "Source agenda"
    }
  ],
  "ReactFilters.messages.filterTitles.state": [
    {
      type: 0,
      value: "Stato"
    }
  ],
  "ReactFilters.messages.filterTitles.status": [
    {
      type: 0,
      value: "Stato"
    }
  ],
  "ReactFilters.messages.filterTitles.timings": [
    {
      type: 0,
      value: "Orari"
    }
  ],
  "ReactFilters.messages.filterTitles.updatedAt": [
    {
      type: 0,
      value: "Data di aggiornamento"
    }
  ],
  "ReactFilters.messages.map.searchHere": [
    {
      type: 0,
      value: "Search here"
    }
  ],
  "ReactFilters.messages.map.searchWithMap": [
    {
      type: 0,
      value: "Cercare con la carta"
    }
  ],
  "ReactFilters.messages.provenance.aggregation": [
    {
      type: 0,
      value: "Aggregazione"
    }
  ],
  "ReactFilters.messages.provenance.contribution": [
    {
      type: 0,
      value: "Contribuzione"
    }
  ],
  "ReactFilters.messages.provenance.share": [
    {
      type: 0,
      value: "Condividere"
    }
  ],
  "ReactFilters.messages.relative.current": [
    {
      type: 0,
      value: "Attuale"
    }
  ],
  "ReactFilters.messages.relative.passed": [
    {
      type: 0,
      value: "Passato"
    }
  ],
  "ReactFilters.messages.relative.upcoming": [
    {
      type: 0,
      value: "Futuro"
    }
  ],
  "ReactFilters.messages.state.controlled": [
    {
      type: 0,
      value: "Controllato"
    }
  ],
  "ReactFilters.messages.state.published": [
    {
      type: 0,
      value: "Pubblicato"
    }
  ],
  "ReactFilters.messages.state.refused": [
    {
      type: 0,
      value: "Rifiutato"
    }
  ],
  "ReactFilters.messages.state.toModerate": [
    {
      type: 0,
      value: "Da moderare"
    }
  ],
  "ReactFilters.messages.status.cancelled": [
    {
      type: 0,
      value: "Cancellato"
    }
  ],
  "ReactFilters.messages.status.full": [
    {
      type: 0,
      value: "Completo"
    }
  ],
  "ReactFilters.messages.status.movedOnline": [
    {
      type: 0,
      value: "Oramai online"
    }
  ],
  "ReactFilters.messages.status.postponed": [
    {
      type: 0,
      value: "Riprogrammato"
    }
  ],
  "ReactFilters.messages.status.programmed": [
    {
      type: 0,
      value: "Programmato"
    }
  ],
  "ReactFilters.messages.status.rescheduled": [
    {
      type: 0,
      value: "Riprogrammato"
    }
  ],
  "ReactFilters.useGetFilterOptions.emptyOption": [
    {
      type: 0,
      value: "(Nessun valore)"
    }
  ]
};

// src/locales-compiled/oc.json with { type: 'json' }
var oc_default = {
  "ReactFilters.DateRangeFilter.dateRange": [
    {
      type: 0,
      value: "Del "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " al "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DateRangeFilter.endDate": [
    {
      type: 0,
      value: "Fin"
    }
  ],
  "ReactFilters.DateRangeFilter.from": [
    {
      type: 0,
      value: "A comptar del "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DateRangeFilter.startDate": [
    {
      type: 0,
      value: "Comen\xE7ar"
    }
  ],
  "ReactFilters.DateRangeFilter.until": [
    {
      type: 0,
      value: "Fins al "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.dateRange": [
    {
      type: 0,
      value: "Del "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " al "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.DefinedRangeFilter.endDate": [
    {
      type: 0,
      value: "Fin"
    }
  ],
  "ReactFilters.DefinedRangeFilter.from": [
    {
      type: 0,
      value: "A comptar del "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.singleDate": [
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.DefinedRangeFilter.startDate": [
    {
      type: 0,
      value: "Comen\xE7ar"
    }
  ],
  "ReactFilters.DefinedRangeFilter.until": [
    {
      type: 0,
      value: "Fins al "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.Sort.chronological": [
    {
      type: 0,
      value: "\xD2rdre cronologic"
    }
  ],
  "ReactFilters.Sort.publicView": [
    {
      type: 0,
      value: "Vue publique"
    }
  ],
  "ReactFilters.Sort.recentlyUpdated": [
    {
      type: 0,
      value: "Mes a jorn recentament"
    }
  ],
  "ReactFilters.Sort.relevance": [
    {
      type: 0,
      value: "Pertin\xE9ncia"
    }
  ],
  "ReactFilters.TimelineField.selectDay": [
    {
      type: 0,
      value: "Choisissez un jour"
    }
  ],
  "ReactFilters.TimelineField.selectMonth": [
    {
      type: 0,
      value: "Choisissez un mois"
    }
  ],
  "ReactFilters.TimelineFilter.dateRange": [
    {
      type: 0,
      value: "Del "
    },
    {
      type: 1,
      value: "startDate"
    },
    {
      type: 0,
      value: " al "
    },
    {
      type: 1,
      value: "endDate"
    }
  ],
  "ReactFilters.TimelineFilter.from": [
    {
      type: 0,
      value: "A comptar del "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.TimelineFilter.until": [
    {
      type: 0,
      value: "Fins al "
    },
    {
      type: 1,
      value: "date"
    }
  ],
  "ReactFilters.ValueBadge.removeFilter": [
    {
      type: 0,
      value: "Tirar lo filtre"
    }
  ],
  "ReactFilters.ValueBadge.removeFilterWithTitle": [
    {
      type: 0,
      value: "Tirar lo filtre ("
    },
    {
      type: 1,
      value: "title"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.components.fields.SearchInput.ariaLabel": [
    {
      type: 0,
      value: "Cercar"
    }
  ],
  "ReactFilters.dateRanges.currentMonth": [
    {
      type: 0,
      value: "Mes en cors"
    }
  ],
  "ReactFilters.dateRanges.currentWeek": [
    {
      type: 0,
      value: "Setmana en cors"
    }
  ],
  "ReactFilters.dateRanges.thisWeekend": [
    {
      type: 0,
      value: "Aquesta dimenjada"
    }
  ],
  "ReactFilters.dateRanges.today": [
    {
      type: 0,
      value: "U\xE8i"
    }
  ],
  "ReactFilters.dateRanges.tomorrow": [
    {
      type: 0,
      value: "Deman"
    }
  ],
  "ReactFilters.fields.NumberRangeField.gte": [
    {
      type: 0,
      value: "Min"
    }
  ],
  "ReactFilters.fields.NumberRangeField.lte": [
    {
      type: 0,
      value: "Max"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.endDate": [
    {
      type: 0,
      value: "Date de fin"
    }
  ],
  "ReactFilters.fields.SimpleRangeField.startDate": [
    {
      type: 0,
      value: "Date de d\xE9but"
    }
  ],
  "ReactFilters.filters.MapFilter.previewLabel": [
    {
      type: 0,
      value: "Mapa"
    }
  ],
  "ReactFilters.filters.searchFilter.placeholder": [
    {
      type: 0,
      value: "Cercar"
    }
  ],
  "ReactFilters.filters.searchFilter.previewLabel": [
    {
      type: 0,
      value: "Cercar"
    }
  ],
  "ReactFilters.messages.accessiblities.hi": [
    {
      type: 0,
      value: "Handicap auditiu"
    }
  ],
  "ReactFilters.messages.accessiblities.ii": [
    {
      type: 0,
      value: "Handicap intellectual"
    }
  ],
  "ReactFilters.messages.accessiblities.mi": [
    {
      type: 0,
      value: "Handicap motor"
    }
  ],
  "ReactFilters.messages.accessiblities.pi": [
    {
      type: 0,
      value: "Handicap psiquic"
    }
  ],
  "ReactFilters.messages.accessiblities.vi": [
    {
      type: 0,
      value: "Handicap visual"
    }
  ],
  "ReactFilters.messages.attendanceMode.mixed": [
    {
      type: 0,
      value: "Mesclat"
    }
  ],
  "ReactFilters.messages.attendanceMode.offline": [
    {
      type: 0,
      value: "Sus pla\xE7a"
    }
  ],
  "ReactFilters.messages.attendanceMode.online": [
    {
      type: 0,
      value: "En linha"
    }
  ],
  "ReactFilters.messages.boolean.notSelected": [
    {
      type: 0,
      value: "Pas seleccionat"
    }
  ],
  "ReactFilters.messages.boolean.selected": [
    {
      type: 0,
      value: "Seleccionat"
    }
  ],
  "ReactFilters.messages.choiceFilter.lessOptions": [
    {
      type: 0,
      value: "Mens d'opcions"
    }
  ],
  "ReactFilters.messages.choiceFilter.moreOptions": [
    {
      type: 0,
      value: "Mai d'opcions"
    }
  ],
  "ReactFilters.messages.choiceFilter.noResult": [
    {
      type: 0,
      value: "Pas cap resultat"
    }
  ],
  "ReactFilters.messages.choiceFilter.searchPlaceholder": [
    {
      type: 0,
      value: "Cercar"
    }
  ],
  "ReactFilters.messages.choiceFilter.unrecognizedOption": [
    {
      type: 0,
      value: "Valor de filtre desconeguda ("
    },
    {
      type: 1,
      value: "value"
    },
    {
      type: 0,
      value: ")"
    }
  ],
  "ReactFilters.messages.featured.featured": [
    {
      type: 0,
      value: "Meses en avant"
    }
  ],
  "ReactFilters.messages.filterTitles.accessibility": [
    {
      type: 0,
      value: "Accessibilitat"
    }
  ],
  "ReactFilters.messages.filterTitles.addMethod": [
    {
      type: 0,
      value: "Origina"
    }
  ],
  "ReactFilters.messages.filterTitles.adminLevel3": [
    {
      type: 0,
      value: "Administrative level 3"
    }
  ],
  "ReactFilters.messages.filterTitles.attendanceMode": [
    {
      type: 0,
      value: "M\xF2de de participacion"
    }
  ],
  "ReactFilters.messages.filterTitles.city": [
    {
      type: 0,
      value: "Vila"
    }
  ],
  "ReactFilters.messages.filterTitles.countryCode": [
    {
      type: 0,
      value: "Pa\xEDs"
    }
  ],
  "ReactFilters.messages.filterTitles.createdAt": [
    {
      type: 0,
      value: "Data de creacion"
    }
  ],
  "ReactFilters.messages.filterTitles.department": [
    {
      type: 0,
      value: "Departament"
    }
  ],
  "ReactFilters.messages.filterTitles.district": [
    {
      type: 0,
      value: "Districte"
    }
  ],
  "ReactFilters.messages.filterTitles.featured": [
    {
      type: 0,
      value: "Meses en avant"
    }
  ],
  "ReactFilters.messages.filterTitles.geo": [
    {
      type: 0,
      value: "Mapa"
    }
  ],
  "ReactFilters.messages.filterTitles.keyword": [
    {
      type: 0,
      value: "Mots claus"
    }
  ],
  "ReactFilters.messages.filterTitles.languages": [
    {
      type: 0,
      value: "Lengas"
    }
  ],
  "ReactFilters.messages.filterTitles.locationUid": [
    {
      type: 0,
      value: "L\xF2c"
    }
  ],
  "ReactFilters.messages.filterTitles.memberUid": [
    {
      type: 0,
      value: "Membre"
    }
  ],
  "ReactFilters.messages.filterTitles.originAgendaUid": [
    {
      type: 0,
      value: "Agenda d'origina"
    }
  ],
  "ReactFilters.messages.filterTitles.region": [
    {
      type: 0,
      value: "Region"
    }
  ],
  "ReactFilters.messages.filterTitles.relative": [
    {
      type: 0,
      value: "Passat / en cors / a venir"
    }
  ],
  "ReactFilters.messages.filterTitles.search": [
    {
      type: 0,
      value: "Cercar"
    }
  ],
  "ReactFilters.messages.filterTitles.sourceAgendaUid": [
    {
      type: 0,
      value: "Agenda sorsa"
    }
  ],
  "ReactFilters.messages.filterTitles.state": [
    {
      type: 0,
      value: "Estatut"
    }
  ],
  "ReactFilters.messages.filterTitles.status": [
    {
      type: 0,
      value: "Estat"
    }
  ],
  "ReactFilters.messages.filterTitles.timings": [
    {
      type: 0,
      value: "Data"
    }
  ],
  "ReactFilters.messages.filterTitles.updatedAt": [
    {
      type: 0,
      value: "Data de mesa a jorn"
    }
  ],
  "ReactFilters.messages.map.searchHere": [
    {
      type: 0,
      value: "Rechercher ici"
    }
  ],
  "ReactFilters.messages.map.searchWithMap": [
    {
      type: 0,
      value: "Cercar sus la mapa"
    }
  ],
  "ReactFilters.messages.provenance.aggregation": [
    {
      type: 0,
      value: "Agregacion"
    }
  ],
  "ReactFilters.messages.provenance.contribution": [
    {
      type: 0,
      value: "Contribucion"
    }
  ],
  "ReactFilters.messages.provenance.share": [
    {
      type: 0,
      value: "Partatjar"
    }
  ],
  "ReactFilters.messages.relative.current": [
    {
      type: 0,
      value: "Actual"
    }
  ],
  "ReactFilters.messages.relative.passed": [
    {
      type: 0,
      value: "Passat"
    }
  ],
  "ReactFilters.messages.relative.upcoming": [
    {
      type: 0,
      value: "A venir"
    }
  ],
  "ReactFilters.messages.state.controlled": [
    {
      type: 0,
      value: "Revisat"
    }
  ],
  "ReactFilters.messages.state.published": [
    {
      type: 0,
      value: "Publicat"
    }
  ],
  "ReactFilters.messages.state.refused": [
    {
      type: 0,
      value: "Refusat"
    }
  ],
  "ReactFilters.messages.state.toModerate": [
    {
      type: 0,
      value: "De moderar"
    }
  ],
  "ReactFilters.messages.status.cancelled": [
    {
      type: 0,
      value: "Anullat"
    }
  ],
  "ReactFilters.messages.status.full": [
    {
      type: 0,
      value: "Totalament compl\xE8t"
    }
  ],
  "ReactFilters.messages.status.movedOnline": [
    {
      type: 0,
      value: "Transferit en linha"
    }
  ],
  "ReactFilters.messages.status.postponed": [
    {
      type: 0,
      value: "Remandat"
    }
  ],
  "ReactFilters.messages.status.programmed": [
    {
      type: 0,
      value: "Previst"
    }
  ],
  "ReactFilters.messages.status.rescheduled": [
    {
      type: 0,
      value: "Tornat planificar"
    }
  ],
  "ReactFilters.useGetFilterOptions.emptyOption": [
    {
      type: 0,
      value: "(Sens valor)"
    }
  ]
};

// src/components/IntlProvider.js
var import_jsx_runtime30 = require("@emotion/react/jsx-runtime");
function IntlProvider({ locale, userLocales = null, children }) {
  const locales = (0, import_react43.useMemo)(
    () => (0, import_intl7.mergeLocales)(locales_compiled_exports, userLocales || {}),
    [userLocales]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
    import_react_intl35.IntlProvider,
    {
      locale,
      messages: locales[locale],
      defaultLocale: (0, import_intl7.getSupportedLocale)(locale),
      children
    },
    locale
  );
}

// src/components/index.js
var import_react_intl36 = require("react-intl");
var import_react_final_form21 = require("react-final-form");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ActiveFilters,
  ChoiceFilter,
  CustomFilter,
  DateRangeFilter,
  DefinedRangeFilter,
  FavoriteToggle,
  FavoritesFilter,
  Field,
  Filters,
  FiltersManager,
  FiltersProvider,
  FormSpy,
  IntlProvider,
  MapFilter,
  NumberRangeFilter,
  Panel,
  ReactIntlProvider,
  SearchFilter,
  SearchInput,
  SimpleDateRangeFilter,
  Sort,
  Total,
  ValueBadge
});
//# sourceMappingURL=index.cjs.map