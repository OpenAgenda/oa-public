// src/hooks/useGetFilterOptions.js
import get from "lodash/get.js";
import { useCallback } from "react";
import { defineMessages } from "react-intl";
import { getLocaleValue } from "@openagenda/intl";
var messages = defineMessages({
  emptyOption: {
    id: "ReactFilters.useGetFilterOptions.emptyOption",
    defaultMessage: "(Without value)"
  }
});
function useGetFilterOptions(intl, filtersBase, aggregations) {
  return useCallback(
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
        const labelValue = get(entry, labelKey);
        return {
          ...entry,
          label: labelValue === filter.missingValue ? missingLabel : getLocaleValue(labelValue, intl.locale),
          value: String(entry[dataKey])
        };
      });
    },
    [intl, aggregations, filtersBase]
  );
}

export {
  useGetFilterOptions
};
//# sourceMappingURL=chunk-IPLH7FAS.js.map