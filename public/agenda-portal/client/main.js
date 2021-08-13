import '@openagenda/polyfills/web';
import '@openagenda/polyfills/dom';
import '@openagenda/polyfills/intl';
import '@openagenda/polyfills/intl-locales';

import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import debug from 'debug';
import qs from 'qs';
import { prepareClientPortals } from '@stefanoruth/react-portal-ssr';
import handleIFrameLinkEvents from './lib/handleIFrameLinkEvents';
import setListPageHrefFromContext from './lib/setListPageHrefFromContext';
import readPageProps from './lib/readPageProps';
import updateTotal from './lib/updateTotal';
import updateShare from './lib/updateShare';
import Provider from './components/Provider';
import FiltersRoot from './components/FiltersRoot';
import extractAttrs from './lib/extractAttrs';
import parseFilterAttrs from './lib/parseFilterAttrs';

const log = debug('main');

/* global $ */

const listSelector = '.events';
const activeFiltersSelector = '[data-oa-widget="activeFilters"]';

let nextProgressiveLoadPage = 2;
let rockBottom;

if (module.hot) {
  module.hot.accept();
}

const iframeHandler = require('./lib/iframe.child')({
  onParentNavUpdate: updatedHref => {
    window.location.href = updatedHref;
  },
});

function spin() {
  spin.spinning = true;
  $('body').spin({
    width: 1,
    length: 6,
    radius: 10,
    opacity: 6,
    color: '#333',
    bgColor: 'white',
  }); // show the spinner
}

spin.stop = function stop() {
  spin.spinning = false;
  $('body').spin(false);
};

spin.isSpinning = function isSpinning() {
  return spin.spinning;
};

function loadListContent(url, data, cb) {
  log('loadListContent');
  spin();

  $.ajax({
    url,
    data,
    success(result) {
      spin.stop();
      cb(null, result);
    },
  });
}

function progressiveLoad(pageProps, canvasSelector) {
  log('progressiveLoad');

  if (!$(canvasSelector).first().length) return;

  $(window).on('scroll', () => {
    if (spin.isSpinning() || rockBottom) return;

    const scrollHeight = $(document).height();
    const scrollPosition = $(window).height() + $(window).scrollTop();

    if ((scrollHeight - scrollPosition) / scrollHeight !== 0) {
      return;
    }

    const queryPart = window.location.href.split('?').length === 2
      ? `?${window.location.href.split('?').pop()}`
      : '';

    nextProgressiveLoadPage += 1;

    loadListContent(
      `/events/p/${nextProgressiveLoadPage}${queryPart}`,
      null,
      (err, result) => {
        const eventItemsHTML = $(result.html)
          .filter(canvasSelector)
          .get(0)
          .innerHTML.trim();

        if (eventItemsHTML.length) {
          $(canvasSelector).first().append(eventItemsHTML);

          if (pageProps.iframable) {
            handleIFrameLinkEvents($, iframeHandler);
          }
        } else {
          rockBottom = true;
        }
      }
    );
  });
}

function onWidgetController({ origin, pageProps }, widget, update, query = {}) {
  log('onWidgetUpdate from %s, %j', origin, query);
  nextProgressiveLoadPage = 2;
  rockBottom = false;

  if (pageProps.pageType === 'event') {
    window.location.href = setListPageHrefFromContext(
      window.location.href,
      query
    );
    return;
  }

  loadListContent('/events', { oaq: query }, (err, result) => {
    $(listSelector).html(result.html);

    if (pageProps.iframable) {
      handleIFrameLinkEvents($, iframeHandler);
    }

    result.total = updateTotal(result.total);
    updateShare(pageProps);

    const pageMatch = window.location.href.match(/\/p\/[0-9]+/);

    if (pageMatch) {
      window.history.pushState(
        {},
        '',
        window.location.href.replace(pageMatch[0], '/p/1')
      );
    }

    iframeHandler.sendNavUpdate();
  });
}

function onFilterController(pageProps, filtersRef, values = {}) {
  log('onFilterChange from %s, %j', origin, values);
  nextProgressiveLoadPage = 2;
  rockBottom = false;

  const filtersRoot = filtersRef.current;
  const filters = filtersRoot.getFilters();
  const aggregations = filters
    .map(filter => {
      if (filter.aggregation === null) {
        return false;
      }

      return {
        key: filter.name,
        type: filter.name,
        ...filter.aggregation,
      };
    })
    .filter(Boolean);

  const needViewport = filters.some(filter => filter.type === 'map');

  if (needViewport) {
    aggregations.unshift({
      key: 'viewport',
      type: 'viewport'
    });
  }

  loadListContent('/events', { ...values, aggregations }, (err, result) => {
    $(listSelector).html(result.html);

    filtersRoot.setAggregations(result.aggregations);
    filtersRoot.setQuery(values);

    // TODO
    // if (pageProps.iframable) {
    //   handleIFrameLinkEvents($, iframeHandler);
    // }

    result.total = updateTotal(result.total);
    updateShare(pageProps);

    const queryStr = qs.stringify(values, {
      addQueryPrefix: true,
      arrayFormat: 'brackets',
      skipNulls: true,
    });

    window.history.pushState(
      {},
      null,
      `${window.location.pathname}${queryStr}`
    );

    const mapFilter = filters.find(v => v.type === 'map');
    const mapElem = mapFilter?.elemRef?.current;

    if (mapElem) {
      mapElem.onQueryChange(result.aggregations.viewport);
    }

    iframeHandler.sendNavUpdate();
  });
}

async function renderFilters(pageProps) {
  const filtersRef = React.createRef();
  const container = document.querySelector('[data-oa-filters-root]');

  if (!container) {
    log('There is no container (.oa-filters-root) to render the filters');
    return;
  }

  const filterElems = document.querySelectorAll('[data-oa-filter]');
  const activeFilterWidget = document.querySelector(activeFiltersSelector);

  const filters = Array.from(
    filterElems,
    elem => {
      const { id, ...dataSet } = parseFilterAttrs(extractAttrs(elem));

      if (dataSet.type === 'custom') {
        dataSet.elem = elem;
        dataSet.handlerElem = dataSet.handlerSelector ? elem.querySelector(dataSet.handlerSelector) : null;
      } else {
        dataSet.elemRef = React.createRef();
        dataSet.destSelector = id ? `[data-oa-filter-id="${id}"]` : `[data-oa-filter="${dataSet.name}"]`;
      }

      return dataSet;
    }
  );

  const initialQuery = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });

  prepareClientPortals();

  ReactDOM.render(
    <Provider
      lang={pageProps.lang}
      initialValues={_.omit(initialQuery, 'sort')}
      onFilterChange={values => onFilterController(pageProps, filtersRef, values)}
    >
      <FiltersRoot
        ref={filtersRef}
        filters={filters}
        activeFiltersSelector={activeFilterWidget ? activeFiltersSelector : null}
        initialAggregations={pageProps.aggregations}
        initialQuery={initialQuery}
        defaultViewport={pageProps.defaultViewport}
        res="/events"
      />
    </Provider>,
    container
  );
}

$(() => {
  const pageProps = readPageProps($);

  window.oa = {
    onReloadWithPassed: onWidgetController.bind(
      null,
      {
        origin: 'onReloadWithPassed',
        pageProps,
      },
      null
    ),
    onWidgetUpdate: onWidgetController.bind(null, {
      origin: 'onWidgetUpdate',
      pageProps,
    }),
  };

  renderFilters(pageProps)
    .catch(err => console.error('ERROR: Cannot render filters:', err));

  log('page ready', pageProps);

  $('.js_trigger_spin').on('click', spin);

  updateShare(pageProps);

  if (pageProps.pageType === 'list') {
    progressiveLoad(pageProps, '.js_progressive_load');
  }

  if (pageProps.iframable) {
    handleIFrameLinkEvents($, iframeHandler);
  }

  updateTotal();
});
