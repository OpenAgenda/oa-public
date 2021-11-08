import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { prepareClientPortals } from '@stefanoruth/react-portal-ssr';
import Provider from './components/FiltersProvider';
import FiltersManager from './components/FiltersManager';
import { parseFilterAttrs, extractAttrs } from './utils';

function createContainer() {
  const container = document.createElement('div');
  container.setAttribute('data-oa-filters-root', '');
  return container;
}

function getFilters() {
  const filterElems = document.querySelectorAll('[data-oa-filter]');

  return Array.from(
    filterElems,
    elem => {
      const { id, ...dataSet } = parseFilterAttrs(extractAttrs(elem));

      dataSet.destSelector = `[data-oa-filter="${elem.getAttribute('data-oa-filter')}"]`;

      if (dataSet.type === 'custom') {
        dataSet.elem = elem;
        dataSet.handlerElem = dataSet.handlerSelector ? elem.querySelector(dataSet.handlerSelector) : null;
      } else {
        dataSet.elemRef = React.createRef();
      }

      return dataSet;
    }
  );
}

function getWidgets() {
  const widgetElems = document.querySelectorAll('[data-oa-widget]');

  return Array.from(widgetElems, elem => {
    const dataSet = parseFilterAttrs(extractAttrs(elem, 'data-oa-widget-'));
    dataSet.destSelector = `[data-oa-widget="${elem.getAttribute('data-oa-widget')}"]`;
    return dataSet;
  });
}

function defaultFilterChange(values, aggregations, ref, form) {
  console.log('Filters changed, but there is no onFilterChange !');
  console.log(values, aggregations, ref, form);
}

export default function renderFiltersAndWidgets({
  ref = React.createRef(),
  res = '/events',
  locale = 'en',
  locales: userLocales,
  initialAggregations,
  total,
  defaultViewport,
  initialQuery,
  onFilterChange = defaultFilterChange,
  apiClient,
  ...rest
} = {}) {
  const container = createContainer();
  document.body.appendChild(container);

  const filters = getFilters();
  const widgets = getWidgets();

  // Empty divs when there is a server-side rendering
  prepareClientPortals();

  ReactDOM.render(
    <Provider
      locale={locale}
      locales={userLocales}
      filters={filters}
      onSubmit={(values, aggregations, form) => onFilterChange(values, aggregations, ref, form)}
      initialValues={_.omit(initialQuery, 'sort')}
      apiClient={apiClient}
    >
      <FiltersManager
        ref={ref}
        res={res}
        filters={filters}
        widgets={widgets}
        initialAggregations={initialAggregations}
        initialTotal={total}
        initialQuery={initialQuery}
        defaultViewport={defaultViewport}
        {...rest}
      />
    </Provider>,
    container
  );
}
