import _ from 'lodash';
import { useCallback } from 'react';

export default function (filterAggs) {
  return useCallback(
    filter => {
      if (filter.options) return filter.options;

      const aggregation = filterAggs[filter.name];

      if (!aggregation) return [];

      const labelKey = filter.labelKey || 'key';

      return aggregation.map(v => ({
        label: _.get(v, labelKey),
        value: v.key,
      }));
    },
    [filterAggs]
  );
}
