import {
  minimizeAggregation
} from "./chunk-32BG4YMI.js";

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

export {
  filtersToAggregations
};
//# sourceMappingURL=chunk-TWJ2L7HC.js.map