import debug from 'debug';
import copy from 'copy-to-clipboard';

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

export default pageProps => {
  log('updating');
  if (!$('.js_share').length) {
    return;
  }

  $('.js_share').val(shareCode(pageProps));

  handleCopyShare();
};
