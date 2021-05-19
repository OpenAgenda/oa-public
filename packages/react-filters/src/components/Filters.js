import React from 'react';
import { useUIDSeed } from 'react-uid';

function Noop() {
  return null;
}

function Filters({
  filters,
  withRef = false,
  dateRangeComponent: DateRangeComponent = Noop,
  checkboxComponent: CheckboxComponent = Noop,
  radioComponent: RadioComponent = Noop,
  mapComponent: MapComponent = Noop,
  dateRangeProps,
  checkboxProps,
  radioProps,
  mapProps,
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
                ref={withRef ? filter.elemRef : null}
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
                ref={withRef ? filter.elemRef : null}
                filter={filter}
                {...filter}
                {...checkboxProps}
                {...additionnalProps}
              />
            );
          case 'map':
            return (
              <MapComponent
                key={seed(filter.name)}
                ref={withRef ? filter.elemRef : null}
                filter={filter}
                {...filter}
                {...mapProps}
                {...additionnalProps}
              />
            );
          case 'radio':
            return (
              <RadioComponent
                key={seed(filter.name)}
                ref={withRef ? filter.elemRef : null}
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
