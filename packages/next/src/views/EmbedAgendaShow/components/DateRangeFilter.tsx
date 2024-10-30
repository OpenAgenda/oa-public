import React from 'react';
import {
  DateRangeFilter as ReactFiltersDateRangeFilter,
  useFilterTitle,
} from '@openagenda/react-filters';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useToken,
} from '@openagenda/uikit';
import wrapFilter from 'views/AgendaShow/wrapFilter';
import { FaIcon } from 'icons';
import { faCalendar } from 'icons/light';

import '@openagenda/react-shared/css/react-date-range.css';

const StyledDateRangeFilter = wrapFilter(ReactFiltersDateRangeFilter);

const DateRangeFilter = React.forwardRef<'div', any>(function DateRangeFilter(
  { name, filter, ...props },
  ref,
) {
  const title = useFilterTitle(name, filter.fieldSchema);

  const primary500 = useToken('colors', 'primary.500');

  return (
    <Popover matchWidth>
      <PopoverTrigger>
        <Button
          bg="white"
          borderColor="oaGray.300"
          color="blackAlpha.800"
          _hover={{
            bg: 'oaGray.100',
            color: 'blackAlpha.900',
          }}
          borderRadius="none"
          justifyContent="start"
          leftIcon={<FaIcon size="xl" icon={faCalendar} />}
        >
          {title}
        </Button>
      </PopoverTrigger>
      <PopoverContent width="inherit">
        <StyledDateRangeFilter
          ref={ref}
          forwardedFilter={filter}
          flexDirection="column"
          name={name}
          {...props}
          rangeColor={primary500}
          sx={{
            '--rdr-border-color': 'colors.primary.500',
            '--rdr-body-selected-bg': 'colors.primary.500',
            '--rdr-today-content-bg': 'colors.primary.500',
          }}
        />
      </PopoverContent>
    </Popover>
  );
});

export default DateRangeFilter;
