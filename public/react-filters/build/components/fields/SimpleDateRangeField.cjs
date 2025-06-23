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

// src/components/fields/SimpleDateRangeField.js
var SimpleDateRangeField_exports = {};
__export(SimpleDateRangeField_exports, {
  default: () => SimpleDateRangeField_default
});
module.exports = __toCommonJS(SimpleDateRangeField_exports);
var import_react = __toESM(require("react"), 1);
var import_react_intl = require("react-intl");
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
var messages = (0, import_react_intl.defineMessages)({
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
  const intl = (0, import_react_intl.useIntl)();
  const { value, onChange } = input;
  const onInputChange = (0, import_react.useCallback)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
      intl.formatMessage(messages.startDate),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
      intl.formatMessage(messages.endDate),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
var SimpleDateRangeField_default = import_react.default.forwardRef(SimpleDateRangeField);
//# sourceMappingURL=SimpleDateRangeField.cjs.map