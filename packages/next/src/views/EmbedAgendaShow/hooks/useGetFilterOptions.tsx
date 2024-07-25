import { useGetFilterOptions as useReactFiltersGetFilterOptions } from '@openagenda/react-filters';
import { useCallback } from 'react';

export default function useGetFilterOptions({ intl, filtersBase, aggregations, prefilter }) {
  const originGetOptions = useReactFiltersGetFilterOptions(intl, filtersBase, aggregations);

  const getOptions = useCallback(
    filter => {
      const options = originGetOptions(filter);

      if (filter?.type === 'choice') {
        if (prefilter[filter.name]) {
          return options.filter(v => {
            const dataKey = 'id' in v ? 'id' : 'key';
            return prefilter[filter.name].findIndex(preValue => preValue === String(v[dataKey])) !== -1;
          });
        }
      }

      return options;
    },
    [originGetOptions],
  );

  return getOptions;
}
