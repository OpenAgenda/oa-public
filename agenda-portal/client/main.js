import '@openagenda/polyfills/web.js';
import '@openagenda/polyfills/dom.js';
import '@openagenda/polyfills/intl.js';
import '@openagenda/polyfills/intl-locales.js';

import debug from 'debug';
import qs from 'qs';
import renderFilters from '@openagenda/react-filters/render';
import handleIFrameLinkEvents from './lib/handleIFrameLinkEvents.js';
import setListPageHrefFromContext from './lib/setListPageHrefFromContext.js';
import readPageProps from './lib/readPageProps.js';
import updateShare from './lib/updateShare.js';
import trackConsent from './lib/trackConsent.js';
import addGoogleAnalyticsTracker from './lib/addGoogleAnalyticsTracker.js';
import iframeChild from './lib/iframe.child.js';

const log = debug('main');

/* global $ */

const listSelector = '.events';

let nextProgressiveLoadPage = 2;
let rockBottom;

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}

const iframeHandler = iframeChild({
  onParentNavUpdate: (updatedHref) => {
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

    if (scrollHeight - scrollPosition > 10) {
      return;
    }

    const queryPart = window.location.href.split('?').length === 2
      ? `?${window.location.href.split('?').pop()}`
      : '';

    loadListContent(
      `/events/p/${nextProgressiveLoadPage}${queryPart}`,
      null,
      (err, result) => {
        const eventItemsHTML = $(canvasSelector, result.html).html().trim();

        nextProgressiveLoadPage += 1;

        console.log(eventItemsHTML);
        // console.log(result.html);

        if (eventItemsHTML.length) {
          $(canvasSelector).first().append(eventItemsHTML);

          if (pageProps.iframable) {
            handleIFrameLinkEvents($, iframeHandler);
          }
        } else {
          rockBottom = true;
        }
      },
    );
  });
}

function onFilterController(
  pageProps,
  filtersRef,
  values = {},
  aggregations = null,
) {
  log('onFilterChange from %s, %j', origin, values);
  nextProgressiveLoadPage = 2;
  rockBottom = false;

  if (pageProps.pageType === 'event') {
    window.location.href = setListPageHrefFromContext(
      window.location.href,
      values,
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

    updateShare(pageProps, values);

    const pageMatch = window.location.href.match(/\/p\/[0-9]+/);

    if (pageMatch) {
      window.history.pushState(
        {},
        '',
        window.location.href.replace(pageMatch[0], '/p/1'),
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
      agendaUid: pageProps.agendaUid,
      manualSubmit: pageProps.manualSubmit,
      query: window.location.search,
      onLoad(values, aggregations, ref, form) {
        if (!pageProps.filtersFormSelector) return;

        const formElems = document.querySelectorAll(
          pageProps.filtersFormSelector,
        );

        for (const formElem of formElems) {
          formElem.addEventListener('submit', (event) => {
            event.preventDefault();
            form.submit();
          });
        }
      },
      onFilterChange(values, aggregations, ref, _form) {
        onFilterController(pageProps, ref, values, aggregations);

        if (typeof window.onFilterChange === 'function') {
          window.onFilterChange(values, pageProps, aggregations);
        }
      },
      filtersBase: pageProps.filtersBase,
    });
  } catch (e) {
    console.error('ERROR: Cannot render filters:', e);
  }

  $('.js_trigger_spin').on('click', spin);

  updateShare(
    pageProps,
    qs.parse(window.location.search, { ignoreQueryPrefix: true }),
  );

  if (pageProps.pageType === 'list') {
    progressiveLoad(pageProps, '.js_progressive_load');
  }

  if (pageProps.iframable) {
    handleIFrameLinkEvents($, iframeHandler);
  }

  if (pageProps.gaId) {
    if (pageProps.requireConsent) {
      trackConsent(pageProps, {
        onConsentConfirmed: () =>
          addGoogleAnalyticsTracker({ googleAnalyticsID: pageProps.gaId }),
      });
    } else {
      addGoogleAnalyticsTracker({ googleAnalyticsID: pageProps.gaId });
    }
  }
});
