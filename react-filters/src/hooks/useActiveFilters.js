import { useFormState } from 'react-final-form';
import { useMemo } from 'react';
import staticRangesFirst from '../utils/staticRangesFirst';
import customFirst from '../utils/customFirst';
import matchFilter from '../utils/matchFilter';

export default function useActiveFilters(filters) {
  const { values } = useFormState({ subscription: { values: true } });

  const sortedFilters = useMemo(() => filters
    .map(({ destSelector, ...filter }) => filter)
    .sort(staticRangesFirst)
    .sort(customFirst), [filters]);

  return useMemo(() => Object.entries(values)
    .reduce((accu, entry) => {
      const matchingFilter = sortedFilters.find(filter => matchFilter(filter, values, entry));

      if (matchingFilter && !accu.includes(matchingFilter)) {
        accu.push(matchingFilter);
      }

      return accu;
    }, []), [sortedFilters, values]);
}
