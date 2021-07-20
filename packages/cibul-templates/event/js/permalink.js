'use strict'

const copy = require('copy-to-clipboard');
const du = require('@openagenda/dom-utils');

module.exports = (selector = '.js_permalink') => {
  const el = du.el(selector);

  du.addEvent(el, 'click', e => {
    e.preventDefault();

    copy(el.getAttribute('href'));
  });
}
