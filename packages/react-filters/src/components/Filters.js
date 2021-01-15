import React from 'react';
import { useUIDSeed } from 'react-uid';

function Filters({
  filters,
  dateRangeComponent: DateRangeComponent,
  checkboxComponent: CheckboxComponent,
  radioComponent: RadioComponent,
  dateRangeProps,
  checkboxProps,
  radioProps,
  ...additionnalProps
}) {
  const seed = useUIDSeed();

  return (
    <>
      {filters.map(filter => {
        switch (filter.type) {
          case 'dateRange':
            return (
              <DateRangeComponent
                key={seed(filter.name)}
                filter={filter}
                {...filter}
                {...dateRangeProps}
                {...additionnalProps}
              />
            );
          case 'checkbox':
            return (
              <CheckboxComponent
                key={seed(filter.name)}
                filter={filter}
                {...filter}
                {...checkboxProps}
                {...additionnalProps}
              />
            );
          case 'radio':
            return (
              <RadioComponent
                key={seed(filter.name)}
                filter={filter}
                {...filter}
                {...radioProps}
                {...additionnalProps}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}

export default React.memo(Filters);
