import React from 'react';
import ReactDOM from 'react-dom';
import { useUIDSeed } from 'react-uid';
import { Portal } from '@stefanoruth/react-portal-ssr';

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
  searchComponent: SearchComponent = Noop,
  customComponent: CustomComponent = Noop,
  dateRangeProps,
  checkboxProps,
  radioProps,
  mapProps,
  searchProps,
  customProps,
  ...additionnalProps
}) {
  const seed = useUIDSeed();

  return (
    <>
      {filters.map(filter => {
        let elem;

        switch (filter.type) {
          case 'dateRange':
            elem = (
              <DateRangeComponent
                key={seed(filter)}
                ref={withRef ? filter.elemRef : null}
                filter={filter}
                {...filter}
                {...dateRangeProps}
                {...additionnalProps}
              />
            );
            break;
          case 'checkbox':
            elem = (
              <CheckboxComponent
                key={seed(filter)}
                ref={withRef ? filter.elemRef : null}
                filter={filter}
                {...filter}
                {...checkboxProps}
                {...additionnalProps}
              />
            );
            break;
          case 'map':
            elem = (
              <MapComponent
                key={seed(filter)}
                ref={withRef ? filter.elemRef : null}
                filter={filter}
                {...filter}
                {...mapProps}
                {...additionnalProps}
              />
            );
            break;
          case 'radio':
            elem = (
              <RadioComponent
                key={seed(filter)}
                ref={withRef ? filter.elemRef : null}
                filter={filter}
                {...filter}
                {...radioProps}
                {...additionnalProps}
              />
            );
            break;
          case 'search':
            elem = (
              <SearchComponent
                key={seed(filter)}
                ref={withRef ? filter.elemRef : null}
                filter={filter}
                {...filter}
                {...searchProps}
                {...additionnalProps}
              />
            );
            break;
          case 'custom':
            elem = (
              <CustomComponent
                key={seed(filter)}
                ref={withRef ? filter.elemRef : null}
                filter={filter}
                {...filter}
                {...customProps}
                {...additionnalProps}
              />
            );
            break;
          default:
            elem = null;
            break;
        }

        if (filter.destSelector) {
          return (
            <Portal key={seed(filter)} selector={filter.destSelector}>
              {elem}
            </Portal>
          );
        }

        return filter.destContainer
          ? ReactDOM.createPortal(elem, filter.destContainer)
          : elem;
      })}
    </>
  );
}

export default React.memo(Filters);
