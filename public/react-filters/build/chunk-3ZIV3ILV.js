import {
  staticRangesFirst
} from "./chunk-AC72QCZA.js";
import {
  matchFilter
} from "./chunk-KFHSRCJO.js";
import {
  customFirst
} from "./chunk-4WHWSG76.js";

// src/hooks/useActiveFilters.js
import { useFormState } from "react-final-form";
import { useMemo } from "react";
function useActiveFilters(filters) {
  const { values } = useFormState({ subscription: { values: true } });
  const sortedFilters = useMemo(
    () => filters.map(({ destSelector, ...filter }) => filter).sort(staticRangesFirst).sort(customFirst),
    [filters]
  );
  return useMemo(
    () => Object.entries(values).reduce((accu, entry) => {
      const matchingFilter = sortedFilters.find((filter) => matchFilter(filter, values, entry));
      if (matchingFilter && !accu.includes(matchingFilter)) {
        accu.push(matchingFilter);
      }
      return accu;
    }, []),
    [sortedFilters, values]
  );
}

export {
  useActiveFilters
};
//# sourceMappingURL=chunk-3ZIV3ILV.js.map