import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import qs from 'qs';
import { prepareClientPortals } from '@openagenda/react-portal-ssr';
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
  aggregations,
  total,
  query,
  defaultViewport,
  onFilterChange = defaultFilterChange,
  onLoad,
  filtersBase,
  apiClient,
  ...rest
} = {}) {
  const container = createContainer();
  document.body.appendChild(container);

  const filters = getFilters();
  const widgets = getWidgets();

  // Empty divs when there is a server-side rendering
  prepareClientPortals();

  const initialValues = typeof query === 'string'
    ? qs.parse(query, { ignoreQueryPrefix: true })
    : query;

  function bindRef() {
    return Object.keys(ref.current)
      .reduce((accu, key) => ({
        ...accu,
        [key]: (...args) => ref.current[key](...args)
      }), {});
  }

  function wrapCallback(fn) {
    if (typeof fn !== 'function') {
      return fn;
    }

    return (values, aggs, form) => fn(values, aggs, bindRef(), form);
  }

  ReactDOM.render(
    <Provider
      locale={locale}
      locales={userLocales}
      filters={filters}
      onSubmit={wrapCallback(onFilterChange)}
      initialValues={_.omit(initialValues, 'sort')}
      apiClient={apiClient}
    >
      <FiltersManager
        ref={ref}
        res={res}
        filters={filters}
        widgets={widgets}
        aggregations={aggregations}
        total={total}
        query={initialValues}
        defaultViewport={defaultViewport}
        filtersBase={filtersBase}
        onLoad={wrapCallback(onLoad)}
        {...rest}
      />
    </Provider>,
    container
  );
}
