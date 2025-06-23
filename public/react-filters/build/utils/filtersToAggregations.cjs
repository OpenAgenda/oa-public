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

// src/utils/filtersToAggregations.js
var filtersToAggregations_exports = {};
__export(filtersToAggregations_exports, {
  default: () => filtersToAggregations
});
module.exports = __toCommonJS(filtersToAggregations_exports);

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
//# sourceMappingURL=filtersToAggregations.cjs.map