import {
  formatValue
} from "./chunk-MC7YQHTQ.js";
import {
  matchQuery
} from "./chunk-JCQAUF4W.js";

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

export {
  matchFilter
};
//# sourceMappingURL=chunk-KFHSRCJO.js.map