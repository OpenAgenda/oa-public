/* eslint-disable */

export function isSafari() {
  return (
    navigator.vendor &&
    navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    !navigator.userAgent.match('CriOS')
  );
}

export function isElement(o) {
  return typeof HTMLElement === 'object'
    ? o instanceof HTMLElement // DOM2
    : o &&
        typeof o === 'object' &&
        o !== null &&
        o.nodeType === 1 &&
        typeof o.nodeName === 'string';
}

export function preventDefault(event) {
  event.preventDefault ? event.preventDefault() : (event.returnValue = false);
}

export function childObject(elem, index) {
  let i = 0;
  let realI = 0;

  while (elem.childNodes[i]) {
    if (elem.childNodes[i].nodeType == 1) {
      if (realI == index) return elem.childNodes[i];

      realI++;
    }

    i++;
  }

  return false;
}

export function hasClass(element, cls) {
  return ` ${element.className} `.indexOf(` ${cls} `) > -1;
}

export function addClass(element, className) {
  if (!hasClass(element, className))
    element.className = `${element.className} ${className}`;
}

export function removeClass(element, cls) {
  if (hasClass(element, cls)) {
    const regex = new RegExp(cls, 'g');

    element.className = element.className.replace(regex, '');
  }
}

export function els(node, selector) {
  if (typeof node === 'string') {
    selector = node;
    node = document;
  }

  const prefix = selector.substr(0, 1);

  if ('.#,'.indexOf(prefix) !== -1) {
    selector = selector.substr(1);
  }

  if (prefix == '.') {
    return getElementsByClassName(node, selector);
  }
  if (prefix == '#') {
    const result = node.getElementById(selector);

    if (result) {
      return [result];
    }

    return [];
  }

  return node.getElementsByTagName(selector);
}

export function el(node, selector) {
  const results = els(node, selector);

  return results.length ? results[0] : null;
}

export function whenReady(cb) {
  if (document.readyState === 'complete') {
    cb();
  } else {
    addEvent(window, 'load', cb);
  }
}

export function asapReady(selector, timeout, cb) {
  if (arguments.length == 1) {
    cb = selector;

    timeout = 0;

    selector = 'body';
  } else if (arguments.length == 2) {
    cb = timeout;

    timeout = 0;
  }

  if (el(selector)) return cb();

  setTimeout(() => {
    asapReady(selector, Math.min((timeout + 10) * 2, 10000), cb);
  }, timeout);
}

/**
 * cross browser add event
 */

export function addEvent(elem, types, eventHandle) {
  if (elem == null || elem == undefined) return;

  if (typeof types === 'string') types = [types];

  forEach(types, type => {
    if (elem.addEventListener) {
      elem.addEventListener(type, eventHandle, false);
    } else if (elem.attachEvent) {
      elem.attachEvent(`on${type}`, eventHandle);
    } else {
      elem[`on${type}`] = eventHandle;
    }
  });
}

export function removeEvent(elem, types, eventHandle) {
  if (elem === null || elem === undefined) return;

  if (typeof types === 'string') types = [types];

  forEach(types, type => {
    if (elem.removeEventListener) {
      elem.removeEventListener(type, eventHandle, false);
    } else if (elem.detachEvent) {
      elem.detachEvent(`on${type}`, eventHandle);
    } else {
      elem[`on${type}`] = null;
    }
  });
}

export function forEach(array, action) {
  for (let i = 0; i < array.length; i++) {
    action(array[i], i);
  }
}

export function getElementsByClassName(node, className) {
  if (typeof node === 'string') {
    className = node;
    node = document;
  }

  const a = [];

  const re = new RegExp(`(^| )${className}( |$)`);

  const els = node.getElementsByTagName('*');

  for (let i = 0, j = els.length; i < j; i++) {
    if (re.test(els[i].className)) {
      a.push(els[i]);
    }
  }

  return a;
}

export function windowInnerHeight(w, d) {
  if (!w) {
    w = window;
    d = document;
  }

  return (
    w.innerHeight ||
    d.documentElement.clientHeight ||
    d.getElementsByTagName('body')[0].clientHeight
  );
}

export function scrollTo(elem, position) {
  if (arguments.length === 1) {
    position = elem;
    elem = document.body;
  }

  if (typeof position === 'undefined') {
    position = 'top';
  }

  if (typeof position === 'string') {
    switch (position) {
      case 'top':
        position = 0;
        break;

      case 'bottom':
        position = elem.scrollHeight;
        break;
    }
  }

  window.scrollTo(0, position);
}

export function getScrollOffsets(w) {
  // Use the specified window or the current window if no argument
  w = w || window;

  // This works for all browsers except IE versions 8 and before
  if (typeof w.pageXOffset !== 'undefined') {
    return {
      x: w.pageXOffset,
      y: w.pageYOffset,
    };
  }

  // For IE (or any browser) in Standards mode
  const d = w.document;
  if (document.compatMode == 'CSS1Compat') {
    return {
      x: d.documentElement.scrollLeft,
      y: d.documentElement.scrollTop,
    };
  }

  // For browsers in Quirks mode
  return {
    x: d.body.scrollLeft,
    y: d.body.scrollTop,
  };
}
