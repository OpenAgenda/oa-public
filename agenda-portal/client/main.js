import '@openagenda/polyfills/web';
import '@openagenda/polyfills/dom';
import '@openagenda/polyfills/intl';
import '@openagenda/polyfills/intl-locales';

import debug from 'debug';
import renderFilters from '@openagenda/react-filters/lib/render';
import handleIFrameLinkEvents from './lib/handleIFrameLinkEvents';
import setListPageHrefFromContext from './lib/setListPageHrefFromContext';
import readPageProps from './lib/readPageProps';
import updateShare from './lib/updateShare';
import trackConsent from './lib/trackConsent';
import addGoogleAnalyticsTracker from './lib/addGoogleAnalyticsTracker';

const log = debug('main');

/* global $ */

const listSelector = '.events';

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

function onFilterController(pageProps, filtersRef, values = {}, aggregations) {
  log('onFilterChange from %s, %j', origin, values);
  nextProgressiveLoadPage = 2;
  rockBottom = false;

  if (pageProps.pageType === 'event') {
    window.location.href = setListPageHrefFromContext(
      window.location.href,
      values
    );
    return;
  }

  loadListContent('/events', { ...values, aggregations }, (err, result) => {
    $(listSelector).html(result.html);

    filtersRef.updateLocation(values);
    filtersRef.updateFiltersAndWidgets(values, result);

    if (pageProps.iframable) {
      handleIFrameLinkEvents($, iframeHandler);
    }

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

$(() => {
  const pageProps = readPageProps($);

  log('page ready', pageProps);

  try {
    renderFilters({
      locale: pageProps.lang,
      locales: pageProps.locales,
      aggregations: pageProps.aggregations,
      total: pageProps.total,
      defaultViewport: pageProps.defaultViewport,
      query: window.location.search,
      onFilterChange(values, aggregations, ref, _form) {
        return onFilterController(pageProps, ref, values, aggregations);
      },
      filtersBase: pageProps.filtersBase
    });
  } catch (e) {
    console.error('ERROR: Cannot render filters:', e);
  }

  $('.js_trigger_spin').on('click', spin);

  updateShare(pageProps);

  if (pageProps.pageType === 'list') {
    progressiveLoad(pageProps, '.js_progressive_load');
  }

  if (pageProps.iframable) {
    handleIFrameLinkEvents($, iframeHandler);
  }

  if (pageProps.gaId) {
    trackConsent(pageProps, {
      onConsentConfirmed: () => addGoogleAnalyticsTracker({ googleAnalyticsID: pageProps.gaId })
    });
  }
});
