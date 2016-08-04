"use strict";

var du = require('dom-utils');

module.exports = function (selector, cb) {

  if (typeof window === 'undefined' || typeof document === 'undefined') return; // server!

  var elem = du.el(selector);

  if (!elem) return;

  du.addEvent(elem, 'keyup', function (e) {

    if (e.keyCode !== 13) return;

    cb(e.target.value);
  });
};