'use strict';

let onHit = false;
let monitoredElem;

if (typeof document !== 'undefined') {
  _addEvent(document, 'scroll', _monitor);
}

module.exports = function (cb) {
  if (typeof document === 'undefined') {
    return;
  }
  monitoredElem = document.getElementsByTagName('body')[0];

  onHit = cb;

  _monitor();
};

module.exports.assess = _monitor;

module.exports.unregister = function () {
  onHit = false;
};

function _monitor() {
  if (!monitoredElem || !onHit || (typeof document === 'undefined')) return;

  const diff = monitoredElem.offsetTop + monitoredElem.offsetHeight
    > Math.ceil(_getScrollOffsets().y + _windowInnerHeight() + 1);

  if (diff) return;

  onHit();
}

function _addEvent(elem, types, eventHandle) {
  if (elem === null || elem === undefined) return;

  if (typeof types === 'string') types = [types];

  types.forEach(type => {
    if (elem.addEventListener) {
      elem.addEventListener(type, eventHandle, false);
    } else if (elem.attachEvent) {
      elem.attachEvent(`on${type}`, eventHandle);
    } else {
      elem[`on${type}`] = eventHandle;
    }
  });
}

function _windowInnerHeight(w, d) {
  if (!w) {
    w = window;
    d = document;
  }

  return (
    w.innerHeight
    || d.documentElement.clientHeight
    || d.getElementsByTagName('body')[0].clientHeight
  );
}

function _getScrollOffsets(w) {
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
  if (document.compatMode === 'CSS1Compat') {
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
