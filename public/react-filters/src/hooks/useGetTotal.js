import { useCallback } from 'react';

export default function useGetTotal(aggregations) {
  return useCallback(
    (filter, option) => {
      const aggregation = aggregations[filter.name];

      if (!aggregation) return null;

      const dataKey = 'id' in option ? 'id' : 'key';
      const optionKey = 'id' in option ? 'id' : 'value';

      const optionValue = aggregation.find(v => String(v[dataKey]) === String(option[optionKey]));

      if (optionValue) {
        return optionValue.eventCount || 0;
      }

      return 0;
    },
    [aggregations]
  );
}
