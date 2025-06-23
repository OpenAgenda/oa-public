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

// src/components/fields/DefinedRangeField.js
var DefinedRangeField_exports = {};
__export(DefinedRangeField_exports, {
  default: () => DefinedRangeField_default
});
module.exports = __toCommonJS(DefinedRangeField_exports);
var import_isEqual = __toESM(require("lodash/isEqual.js"), 1);
var import_isDate = __toESM(require("lodash/isDate.js"), 1);
var import_react = __toESM(require("react"), 1);
var import_react_date_range = require("@openagenda/react-date-range");
var import_useIsomorphicLayoutEffect = __toESM(require("react-use/lib/useIsomorphicLayoutEffect.js"), 1);
var import_useLatest = __toESM(require("react-use/lib/useLatest.js"), 1);
var import_usePrevious = __toESM(require("react-use/lib/usePrevious.js"), 1);
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
var useIsomorphicLayoutEffect = import_useIsomorphicLayoutEffect.default.default || import_useIsomorphicLayoutEffect.default;
var useLatest = import_useLatest.default.default || import_useLatest.default;
var usePrevious = import_usePrevious.default.default || import_usePrevious.default;
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
function DefinedRangeField({
  input,
  meta,
  staticRanges = [],
  inputRanges = [],
  rangeColor = "#41acdd",
  disabled,
  ...otherProps
}, _ref) {
  const [ranges, setRanges] = (0, import_react.useState)(
    () => input.value ?? defaultGetInitialValue()
  );
  const latestRanges = useLatest(ranges);
  const previousValue = usePrevious(input.value);
  const { onChange } = input;
  const onDefinedRangeChange = (0, import_react.useCallback)(
    (item) => {
      const value = [(item == null ? void 0 : item.selection) ? item.selection : item.range1];
      setRanges(value);
      onChange(value);
    },
    [onChange]
  );
  useIsomorphicLayoutEffect(() => {
    if (previousValue && !(0, import_isEqual.default)(normalizeValue(input.value), normalizeValue(previousValue)) && !(0, import_isEqual.default)(
      normalizeValue(input.value),
      normalizeValue(latestRanges.current)
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rdrDateRangePickerWrapper", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_react_date_range.DefinedRange,
    {
      ...definedRangePickerProps,
      onChange: onDefinedRangeChange,
      className: void 0
    }
  ) });
}
var DefinedRangeField_default = import_react.default.forwardRef(DefinedRangeField);
//# sourceMappingURL=DefinedRangeField.cjs.map