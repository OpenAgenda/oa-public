import omit from 'lodash/omit.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import qs from 'qs';
import * as dateFnsLocales from 'date-fns/locale/index.js';
import { prepareClientPortals } from '@openagenda/react-portal-ssr';
import Provider from './components/FiltersProvider.js';
import IntlProvider from './components/IntlProvider.js';
import FiltersManager from './components/FiltersManager.js';
import { extractFiltersFromDom, extractWidgetsFromDom } from './utils/index.js';

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
  missingValue = 'null',
  onLoad,
  filtersBase,
  apiClient,
  manualSubmit,
  ...rest
} = {}) {
  const container = createContainer();
  document.body.appendChild(container);

  const filters = extractFiltersFromDom();
  const widgets = extractWidgetsFromDom();

  // Empty divs when there is a server-side rendering
  prepareClientPortals();

  const initialValues = typeof query === 'string'
    ? qs.parse(query, { ignoreQueryPrefix: true })
    : query;

  function bindRef() {
    return Object.keys(ref.current).reduce(
      (accu, key) => ({
        ...accu,
        [key]: (...args) => ref.current[key](...args),
      }),
      {},
    );
  }

  function wrapCallback(fn) {
    if (typeof fn !== 'function') {
      return fn;
    }

    return (values, aggs, form) => fn(values, aggs, bindRef(), form);
  }

  const root = ReactDOM.createRoot(container);

  root.render(
    <IntlProvider locale={locale} userLocales={userLocales}>
      <Provider
        filters={filters}
        widgets={widgets}
        onSubmit={wrapCallback(onFilterChange)}
        initialValues={omit(initialValues, 'sort')}
        apiClient={apiClient}
        res={res}
        dateFnsLocale={dateFnsLocales[locale]}
        missingValue={missingValue}
        manualSubmit={manualSubmit}
      >
        <FiltersManager
          ref={ref}
          aggregations={aggregations}
          total={total}
          query={initialValues}
          defaultViewport={defaultViewport}
          filtersBase={filtersBase}
          onLoad={wrapCallback(onLoad)}
          {...rest}
        />
      </Provider>
    </IntlProvider>,
  );
}
