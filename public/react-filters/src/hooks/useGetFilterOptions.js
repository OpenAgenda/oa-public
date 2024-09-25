import get from 'lodash/get';
import { useCallback } from 'react';
import { defineMessages } from 'react-intl';
import { getLocaleValue } from '@openagenda/intl';

const messages = defineMessages({
  emptyOption: {
    id: 'ReactFilters.useGetFilterOptions.emptyOption',
    defaultMessage: '(Without value)',
  },
});

export default function useGetFilterOptions(intl, filtersBase, aggregations) {
  return useCallback(
    (filter) => {
      const missingLabel = intl.formatMessage(messages.emptyOption);

      if (filter.options) {
        const missingOption = filter.missingValue
          ? filtersBase?.[filter.name]?.find((v) => {
            const dataKey = 'id' in v ? 'id' : 'key';
            return v[dataKey] === filter.missingValue;
          })
          : null;

        return missingOption
          ? [
            {
              label: missingLabel,
              key: filter.missingValue,
              value: filter.missingValue,
            },
          ].concat(filter.options)
          : filter.options;
      }

      if (!filtersBase?.[filter.name]) return [];

      const baseAgg = [...filtersBase[filter.name]];

      const aggregation = aggregations[filter.name];

      if (aggregation) {
        aggregation.forEach((entry) => {
          const dataKey = 'id' in entry ? 'id' : 'key';
          const found = baseAgg.find((v) => v[dataKey] === entry[dataKey]);
          if (!found) baseAgg.push(entry);
        });
      }

      const labelKey = filter.labelKey || 'key';

      return baseAgg.map((entry) => {
        const dataKey = 'id' in entry ? 'id' : 'key';
        const labelValue = get(entry, labelKey);

        return {
          ...entry,
          label:
            labelValue === filter.missingValue
              ? missingLabel
              : getLocaleValue(labelValue, intl.locale),
          value: String(entry[dataKey]),
        };
      });
    },
    [intl, aggregations, filtersBase],
  );
}
