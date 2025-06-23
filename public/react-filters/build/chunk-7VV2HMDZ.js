import {
  getFilters
} from "./chunk-OCSZ7TMG.js";

// src/hooks/useFilters.js
import { createRef, useMemo } from "react";
import { useUIDSeed } from "react-uid";
function useFilters(intl, fields, opts = {}) {
  const seed = useUIDSeed();
  return useMemo(
    () => getFilters(intl, fields, opts).map((filter) => ({
      ...filter,
      id: seed(filter),
      elemRef: createRef()
    })),
    [
      intl,
      fields,
      seed,
      opts.dateFnsLocale,
      opts.staticRanges,
      opts.inputRanges,
      opts.missingValue,
      opts.mapTiles,
      opts.exclude,
      opts.include
    ]
  );
}

export {
  useFilters
};
//# sourceMappingURL=chunk-7VV2HMDZ.js.map