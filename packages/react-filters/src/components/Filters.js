import React from 'react';
import { useUIDSeed } from 'react-uid';

function Filters({
  filters,
  dateRangeComponent: DateRangeComponent,
  checkboxComponent: CheckboxComponent,
  radioComponent: RadioComponent
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
                name={filter.name}
                filter={filter}
              />
            );
          case 'checkbox':
            return (
              <CheckboxComponent
                key={seed(filter.name)}
                name={filter.name}
                options={filter.options}
                filter={filter}
              />
            );
          case 'radio':
            return (
              <RadioComponent
                key={seed(filter.name)}
                name={filter.name}
                options={filter.options}
                filter={filter}
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
