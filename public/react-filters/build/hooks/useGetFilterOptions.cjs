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

// src/hooks/useGetFilterOptions.js
var useGetFilterOptions_exports = {};
__export(useGetFilterOptions_exports, {
  default: () => useGetFilterOptions
});
module.exports = __toCommonJS(useGetFilterOptions_exports);
var import_get = __toESM(require("lodash/get.js"), 1);
var import_react = require("react");
var import_react_intl = require("react-intl");
var import_intl = require("@openagenda/intl");
var messages = (0, import_react_intl.defineMessages)({
  emptyOption: {
    id: "ReactFilters.useGetFilterOptions.emptyOption",
    defaultMessage: "(Without value)"
  }
});
function useGetFilterOptions(intl, filtersBase, aggregations) {
  return (0, import_react.useCallback)(
    (filter) => {
      var _a;
      const missingLabel = intl.formatMessage(messages.emptyOption);
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
          label: labelValue === filter.missingValue ? missingLabel : (0, import_intl.getLocaleValue)(labelValue, intl.locale),
          value: String(entry[dataKey])
        };
      });
    },
    [intl, aggregations, filtersBase]
  );
}
//# sourceMappingURL=useGetFilterOptions.cjs.map