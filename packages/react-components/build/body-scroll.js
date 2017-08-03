"use strict";

var du = require('dom-utils');

module.exports = {
  enable: enable,
  disable: disable

  // remove overflow:hidden from body
};function enable() {

  var bodyElem = du.el('body');

  if (!bodyElem) return;

  var style = _parseStyle(bodyElem.getAttribute('style'));

  style.overflow = undefined;

  bodyElem.setAttribute('style', _stringifyStyle(style));
}

// add overflow:hidden to body
function disable() {

  var bodyElem = du.el('body');

  if (!bodyElem) return;

  var style = _parseStyle(bodyElem.getAttribute('style'));

  style.overflow = 'hidden';

  bodyElem.setAttribute('style', _stringifyStyle(style));
}

function _stringifyStyle(style) {

  return Object.keys(style).filter(function (k) {
    return !!k.length;
  }).map(function (k) {
    return k + ':' + style[k];
  }).join(';');
}

function _parseStyle(style) {

  var parsed = {};

  (style || '').split(';').forEach(function (part) {

    if (!part.length) return;

    var bits = part.split('=');

    parsed[bits[0]] = bits[1];
  });

  return parsed;
}
//# sourceMappingURL=body-scroll.js.map