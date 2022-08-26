import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom/client';
import qs from 'qs';
import { prepareClientPortals } from '@openagenda/react-portal-ssr';
import Provider from './components/FiltersProvider';
import FiltersManager from './components/FiltersManager';
import { getFilters, getWidgets } from './utils';

function createContainer() {
  const container = document.createElement('div');
  container.setAttribute('data-oa-filters-root', '');
  return container;
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

  const root = ReactDOM.createRoot(container);

  root.render(
    <Provider
      locale={locale}
      locales={userLocales}
      filters={filters}
      widgets={widgets}
      onSubmit={wrapCallback(onFilterChange)}
      initialValues={_.omit(initialValues, 'sort')}
      apiClient={apiClient}
    >
      <FiltersManager
        ref={ref}
        res={res}
        aggregations={aggregations}
        total={total}
        query={initialValues}
        defaultViewport={defaultViewport}
        filtersBase={filtersBase}
        onLoad={wrapCallback(onLoad)}
        {...rest}
      />
    </Provider>
  );
}
