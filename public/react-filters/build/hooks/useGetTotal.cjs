var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/hooks/useGetTotal.js
var useGetTotal_exports = {};
__export(useGetTotal_exports, {
  default: () => useGetTotal
});
module.exports = __toCommonJS(useGetTotal_exports);
var import_react = require("react");
function useGetTotal(aggregations) {
  return (0, import_react.useCallback)(
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
//# sourceMappingURL=useGetTotal.cjs.map