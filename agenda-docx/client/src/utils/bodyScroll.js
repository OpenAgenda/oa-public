import * as du from './dom.js';

function _stringifyStyle(style) {
  return Object.keys(style)
    .filter((k) => !!k.length)
    .map((k) => `${k}:${style[k]}`)
    .join(';');
}

function _parseStyle(style) {
  const parsed = {};

  (style || '').split(';').forEach((part) => {
    if (!part.length) return;

    const [key, value] = part.split('=');

    parsed[key] = value;
  });

  return parsed;
}

// remove overflow:hidden from body
export function enable() {
  const bodyElem = du.el('body');

  if (!bodyElem) return;

  const style = _parseStyle(bodyElem.getAttribute('style'));

  style.overflow = undefined;

  bodyElem.setAttribute('style', _stringifyStyle(style));
}

// add overflow:hidden to body
export function disable() {
  const bodyElem = du.el('body');

  if (!bodyElem) return;

  const style = _parseStyle(bodyElem.getAttribute('style'));

  style.overflow = 'hidden';

  bodyElem.setAttribute('style', _stringifyStyle(style));
}
