import { createRef, useMemo } from 'react';
import { useUIDSeed } from 'react-uid';
import { getFilters } from '../utils';

export default function useFilters(intl, fields, opts = {}) {
  const seed = useUIDSeed();

  return useMemo(() => getFilters(intl, fields, opts)
    .map(filter => ({
      ...filter,
      id: seed(filter),
      elemRef: createRef(),
    })), [
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
  ]);
}
