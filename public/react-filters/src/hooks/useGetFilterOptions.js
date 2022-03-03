import _ from 'lodash';
import { useCallback } from 'react';
import { defineMessages } from 'react-intl';
import getLocaleValue from '@openagenda/react-shared/lib/utils/getLocaleValue';

const messages = defineMessages({
  emptyOption: {
    id: 'ReactFilters.useGetFilterOptions.emptyOption',
    defaultMessage: '(Without value)'
  }
});

export default function useGetFilterOptions(intl, filtersBase, aggregations) {
  return useCallback(
    filter => {
      if (filter.options) return filter.options;

      if (!filtersBase?.[filter.name]) return [];

      const baseAgg = [...filtersBase[filter.name]];

      const aggregation = aggregations[filter.name];

      if (aggregation) {
        aggregation.forEach(entry => {
          const dataKey = 'id' in entry ? 'id' : 'key';
          const found = baseAgg.find(v => v[dataKey] === entry[dataKey]);
          if (!found) baseAgg.push(entry);
        });
      }

      const labelKey = filter.labelKey || 'key';
      const missingLabel = intl.formatMessage(messages.emptyOption);

      return baseAgg.map(entry => {
        const dataKey = 'id' in entry ? 'id' : 'key';
        const labelValue = _.get(entry, labelKey);

        return {
          ...entry,
          label: labelValue === 'null' ? missingLabel : getLocaleValue(labelValue),
          value: entry[dataKey]
        };
      });
    },
    [intl, aggregations, filtersBase]
  );
}
