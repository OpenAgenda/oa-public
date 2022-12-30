import React from 'react';
import { DateRangeFilter as ReactFiltersDateRangeFilter } from '@openagenda/react-filters';
import wrapFilter from '../wrapFilter';

import '@openagenda/react-shared/css/react-date-range.css';

const StyledDateRangeFilter = wrapFilter(ReactFiltersDateRangeFilter);

const DateRangeFilter = React.forwardRef<'div', any>(function DateRangeFilter({ filter, ...props }, ref) {
  return (
    <StyledDateRangeFilter
      ref={ref}
      forwardedFilter={filter}
      flexDirection="column"
      {...props}
    />
  );
});

export default DateRangeFilter;
