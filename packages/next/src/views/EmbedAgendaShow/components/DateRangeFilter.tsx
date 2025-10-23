import React from 'react';
import {
  DateRangeFilter as ReactFiltersDateRangeFilter,
  useFilterTitle,
} from '@openagenda/react-filters';
import { Button, useToken } from '@openagenda/uikit';
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from '@openagenda/uikit/snippets';
import wrapFilter from 'views/AgendaShow/wrapFilter';
import { FaIcon } from 'icons';
import { faCalendar } from 'icons/light';

// import '@openagenda/react-shared/css/react-date-range.css';

const StyledDateRangeFilter = wrapFilter(ReactFiltersDateRangeFilter);

const DateRangeFilter = React.forwardRef<'div', any>(function DateRangeFilter(
  { name, filter, ...props },
  ref,
) {
  const title = useFilterTitle(name, filter.fieldSchema);

  const primary500 = useToken('colors', 'primary.500');

  return (
    <PopoverRoot
      positioning={{
        sameWidth: true,
        gutter: 0,
        overflowPadding: 0,
        fitViewport: true,
      }}
    >
      <PopoverTrigger asChild>
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
          textAlign="start"
          whiteSpace="normal"
          h="unset"
          minH="9"
        >
          <FaIcon size="xl" icon={faCalendar} />
          {title}
        </Button>
      </PopoverTrigger>
      <PopoverContent borderTopRadius="0" width="inherit">
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
    </PopoverRoot>
  );
});

export default DateRangeFilter;
