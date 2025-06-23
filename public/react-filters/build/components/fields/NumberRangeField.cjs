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

// src/components/fields/NumberRangeField.js
var NumberRangeField_exports = {};
__export(NumberRangeField_exports, {
  default: () => NumberRangeField_default
});
module.exports = __toCommonJS(NumberRangeField_exports);
var import_react = __toESM(require("react"), 1);
var import_react_intl = require("react-intl");
var import_use_debounce = require("use-debounce");
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
var messages = (0, import_react_intl.defineMessages)({
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
  const m = (0, import_react_intl.useIntl)().formatMessage;
  const { value, onChange } = input;
  const [gteString, setGTEString] = (0, import_react.useState)(value == null ? void 0 : value.gte);
  const [lteString, setLTEString] = (0, import_react.useState)(value == null ? void 0 : value.lte);
  const [debouncedGTE] = (0, import_use_debounce.useDebounce)(gteString, 500);
  const [debouncedLTE] = (0, import_use_debounce.useDebounce)(lteString, 500);
  const onInputChange = (0, import_react.useCallback)((k, v) => {
    if (k === "gte") {
      setGTEString(v);
    } else {
      setLTEString(v);
    }
  }, []);
  (0, import_react.useEffect)(() => {
    setGTEString((value == null ? void 0 : value.gte) ?? "");
    setLTEString((value == null ? void 0 : value.lte) ?? "");
  }, [value]);
  (0, import_react.useEffect)(() => {
    onChange({
      lte: debouncedLTE,
      gte: debouncedGTE
    });
  }, [debouncedGTE, debouncedLTE, onChange]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "row", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "col-xs-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "sr-only", htmlFor: `number-range-${input.name}-gte`, children: m(messages.min) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          value: gteString,
          type: "number",
          className: "form-control",
          id: `number-range-${input.name}-gte`,
          placeholder: m(messages.min),
          onChange: (e) => onInputChange("gte", e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "form-group col-xs-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "sr-only", htmlFor: `number-range-${input.name}-lte`, children: m(messages.max) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          value: lteString,
          type: "number",
          className: "form-control",
          id: `number-range-${input.name}-lte`,
          placeholder: m(messages.max),
          onChange: (e) => onInputChange("lte", e.target.value)
        }
      )
    ] })
  ] });
}
var NumberRangeField_default = import_react.default.forwardRef(NumberRangeField);
//# sourceMappingURL=NumberRangeField.cjs.map