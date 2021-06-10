"use strict";

import * as du from '@openagenda/dom-utils';

// remove overflow:hidden from body
export function enable() {

  let bodyElem = du.el('body');

  if (!bodyElem) return;

  let style = _parseStyle(bodyElem.getAttribute('style'));

  style.overflow = undefined;

  const stringifiedStyle = _stringifyStyle(style);

  if (stringifiedStyle.length) {
    bodyElem.setAttribute('style', stringifiedStyle);
  } else {
    bodyElem.removeAttribute('style');
  }

}

// add overflow:hidden to body
export function disable() {

  let bodyElem = du.el('body');

  if (!bodyElem) return;

  let style = _parseStyle(bodyElem.getAttribute('style'));

  style.overflow = 'hidden';

  bodyElem.setAttribute('style', _stringifyStyle(style));

}

function _stringifyStyle(style) {

  return Object.keys(style)
    .filter(k => style[k]?.length)
    .map(k => k + ':' + style[k])
    .join(';');

}

function _parseStyle(style) {

  let parsed = {};

  (style || '').split(';').forEach(part => {

    if (!part.length) return;

    let bits = part.split(':');

    parsed[bits[0]] = bits[1];

  });

  return parsed;

}
