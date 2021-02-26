'use strict';

const du = require('@openagenda/dom-utils');

const SYNC_SELECTOR = '.js_sync_checkbox';

module.exports = (elem, onToggle) => {
  du.addEvent(du.el(elem, SYNC_SELECTOR), 'change', e => {
    onToggle()
  });
}