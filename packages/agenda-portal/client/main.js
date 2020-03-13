'use strict';

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
  }
});

function spin() {
  spin.spinning = true;
  $('body').spin({
    width: 1,
    length: 6,
    radius: 10,
    opacity: 6,
    color: '#333',
    bgColor: 'white'
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
  spin();

  $.ajax({
    url,
    data,
    success(result) {
      spin.stop();
      cb(null, result);
    }
  });
}

function updateTotal(total) {
  if (!$('.js_total').length) {
    return;
  }

  let result;

  if (typeof total === 'undefined') {
    result = parseInt($('.js_total').attr('data-total'), 10);
  }

  let attr;

  if (total === 0) {
    attr = 'data-label-none';
  } else if (total === 1) {
    attr = 'data-label-one';
  } else {
    attr = 'data-label-plural';
  }


  $('.js_total').html($('.js_total').attr(attr).replace('%total%', total));

  return result;
}

function progressiveLoad(canvasSelector) {
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

    loadListContent(`/events/p/${nextProgressiveLoadPage}${queryPart}`, null, (err, result) => {
      const eventItemsHTML = $(result.html).filter(canvasSelector).get(0).innerHTML.trim();

      if (eventItemsHTML.length) {
        $(canvasSelector).first().append(eventItemsHTML);
      } else {
        rockBottom = true;
      }
    });
  });
}

window.oa = {
  onWidgetUpdate(widget, query) {
    nextProgressiveLoadPage = 2;
    rockBottom = false;

    loadListContent('/events', { oaq: query }, (err, result) => {
      $(listSelector).html(result.html);
      result.total = updateTotal(result.total);

      const pageMatch = window.location.href.match(/\/p\/[0-9]+/);

      if (pageMatch) {
        window.history.pushState({}, '', window.location.href.replace(pageMatch[0], '/p/1'));
      }

      iframeHandler.sendNavUpdate();
    });
  },
  onWidgetReady() {
  }
};

$(() => {
  $('.js_trigger_spin').on('click', spin);

  progressiveLoad('.js_progressive_load');

  updateTotal();
});
