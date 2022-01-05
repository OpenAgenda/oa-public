import React from 'react';
import ReactDOM from 'react-dom';
import { useUIDSeed } from 'react-uid';
import { Portal } from '@openagenda/react-portal-ssr';

function Noop() {
  return null;
}

function Filters({
  filters,
  withRef = false,
  choiceComponent: ChoiceComponent = Noop,
  dateRangeComponent: DateRangeComponent = Noop,
  definedRangeComponent: DefinedRangeComponent = Noop,
  mapComponent: MapComponent = Noop,
  searchComponent: SearchComponent = Noop,
  customComponent: CustomComponent = Noop,
  choiceProps,
  dateRangeProps,
  definedRangeProps,
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
          case 'definedRange':
            elem = (
              <DefinedRangeComponent
                key={seed(filter)}
                ref={withRef ? filter.elemRef : null}
                filter={filter}
                {...filter}
                {...definedRangeProps}
                {...additionnalProps}
              />
            );
            break;
          case 'choice':
            elem = (
              <ChoiceComponent
                key={seed(filter)}
                ref={withRef ? filter.elemRef : null}
                filter={filter}
                {...filter}
                {...choiceProps}
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
