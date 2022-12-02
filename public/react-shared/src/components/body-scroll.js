function parseStyle(style) {
  const parsed = {};

  (style || '').split(';').forEach(part => {
    if (!part.length) return;

    const [name, value] = part.split(':');

    parsed[name] = value;
  });

  return parsed;
}

function stringifyStyle(style) {
  return Object.keys(style)
    .filter(k => style[k]?.length)
    .map(k => `${k}:${style[k]}`)
    .join(';');
}

// remove overflow:hidden from body
export function enable() {
  const bodyElem = document.querySelector('body');

  if (!bodyElem) return;

  const style = parseStyle(bodyElem.getAttribute('style'));

  style.overflow = undefined;

  const stringifiedStyle = stringifyStyle(style);

  if (stringifiedStyle.length) {
    bodyElem.setAttribute('style', stringifiedStyle);
  } else {
    bodyElem.removeAttribute('style');
  }
}

// add overflow:hidden to body
export function disable() {
  const bodyElem = document.querySelector('body');

  if (!bodyElem) return;

  const style = parseStyle(bodyElem.getAttribute('style'));

  style.overflow = 'hidden';

  bodyElem.setAttribute('style', stringifyStyle(style));
}
