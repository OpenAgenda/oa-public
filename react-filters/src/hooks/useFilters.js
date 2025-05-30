import { createRef, useMemo } from 'react';
import { useUIDSeed } from 'react-uid';
import { getFilters } from '../utils/index.js';

export default function useFilters(intl, fields, opts = {}) {
  const seed = useUIDSeed();

  // linter is not happy but entire opts should not directly be a dependency of useMemo
  return useMemo(
    () =>
      getFilters(intl, fields, opts).map((filter) => ({
        ...filter,
        id: seed(filter),
        elemRef: createRef(),
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
      opts.include,
    ],
  );
}
