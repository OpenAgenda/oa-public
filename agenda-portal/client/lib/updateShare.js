import debug from 'debug';
import copy from 'copy-to-clipboard';
import qs from 'qs';

import shareCode from './shareCode';

const log = debug('updateShare');

/* global $ */

function displayCopiedLabel(buttonElem) {
  buttonElem.html(buttonElem.attr('data-copied-label'));
  buttonElem.removeClass(buttonElem.attr('data-copy-class'));
  buttonElem.addClass(buttonElem.attr('data-copied-class'));
  setTimeout(() => {
    buttonElem.removeClass(buttonElem.attr('data-copied-class'));
    buttonElem.addClass(buttonElem.attr('data-copy-class'));
    buttonElem.html(buttonElem.attr('data-copy-label'));
  }, 1000);
}

function handleCopyShare() {
  log('handleCopyShare');

  if ($('.js_share').attr('data-flag')) {
    return;
  }
  $('.js_share').attr('data-flag', '1');

  const buttonElem = $('[data-copy-share]');

  buttonElem.addClass(buttonElem.attr('data-copy-class'));
  buttonElem.html(buttonElem.attr('data-copy-label'));

  buttonElem.click(() => {
    copy($('.js_share').val());
    displayCopiedLabel(buttonElem);
  });
}

export default (pageProps, values) => {
  log('updating');

  if ($('.js_share').length) {
    $('.js_share').val(shareCode(pageProps));

    handleCopyShare();
  }

  const shareMailElems = $('[data-share="mail"]');

  if (shareMailElems.length) {
    shareMailElems.each(function () {
      try {
        const shareMailElem = $(this);
        const url = new URL(shareMailElem.attr('href'));
        const bodyUrl = new URL(url.searchParams.get('body'));

        bodyUrl.search = qs.stringify(values, { addQueryPrefix: true });

        url.search = qs.stringify(
          {
            ...qs.parse(url.search, { ignoreQueryPrefix: true }),
            body: bodyUrl.toString(),
          },
          { addQueryPrefix: true },
        );

        shareMailElem.attr('href', url);
      } catch (e) {
        console.log(e);
      }
    });
  }

  const shareExportElems = $('[data-share="export"]');

  if (shareExportElems.length) {
    shareExportElems.each(function () {
      try {
        const shareExportElem = $(this);
        const url = new URL(shareExportElem.attr('href'));

        url.search = qs.stringify(values, { addQueryPrefix: true });

        shareExportElem.attr('href', url);
      } catch (e) {
        console.log(e);
      }
    });
  }
};
