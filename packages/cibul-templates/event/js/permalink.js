'use strict'

const copy = require('copy-to-clipboard');
const du = require('../../js/lib/domUtils');

module.exports = (selector = '.js_permalink') => {
  const el = document.querySelector(selector);

  du.addEvent(el, 'click', e => {
    e.preventDefault();

    copy(el.getAttribute('href'));
  });
}
