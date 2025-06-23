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

// src/components/Filters.js
var Filters_exports = {};
__export(Filters_exports, {
  default: () => Filters_default
});
module.exports = __toCommonJS(Filters_exports);
var import_react = __toESM(require("react"), 1);
var import_react_uid = require("react-uid");
var import_react_portal_ssr = require("@openagenda/react-portal-ssr");
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: filters.map((filter) => {
    let elem;
    switch (filter.type) {
      case "dateRange":
        elem = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
        elem = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_portal_ssr.Portal, { selector: filter.destSelector, children: elem }, seed(filter));
    }
    return elem;
  }) });
}
var Filters_default = import_react.default.memo(Filters);
//# sourceMappingURL=Filters.cjs.map