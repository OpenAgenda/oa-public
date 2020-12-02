import debug from 'debug';

const log = debug('updateTotal');

/* global $ */

export default total => {
  log('updating');
  if (!$('.js_total').length) {
    return;
  }

  let result;

  const cleanTotal = total === undefined
    ? parseInt($('.js_total').attr('data-total'), 10)
    : total;

  let attr;

  if (total === 0) {
    attr = 'data-label-none';
  } else if (total === 1) {
    attr = 'data-label-one';
  } else {
    attr = 'data-label-plural';
  }

  $('.js_total').html(
    $('.js_total')
      .attr(attr)
      .replace('%total%', cleanTotal)
  );

  return result;
};
