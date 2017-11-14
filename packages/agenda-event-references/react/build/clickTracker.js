"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var utils = require('@openagenda/utils');
var du = require('@openagenda/dom-utils');

exports.default = utils.extend(create, {
  switchOn: switchOn, switchOff: switchOff, handler: handler
});


var trackers = []; // { name: 'search', 'selector': '.search', bodyEvent: null, elemEvent: null }

function switchOn(name) {

  if (typeof document == 'undefined') return;

  trackers.filter(function (t) {
    return t.name === name;
  }).forEach(function (t) {
    var _getElems2 = _getElems(t.selector),
        body = _getElems2.body,
        elem = _getElems2.elem;

    switchOff(name);

    if (!body || !elem) return;

    t.onElemClick = function (e) {

      t.clicked = true;
    };

    t.onBodyClick = function (e) {

      if (t.clicked) {

        t.clicked = false;

        return;
      }

      t.clicked = false;

      switchOff(name);

      t.handler ? t.handler() : null;
    };

    du.addEvent(elem, 'click', t.onElemClick);
    du.addEvent(body, 'click', t.onBodyClick);
  });
}

function switchOff(name) {

  if (typeof document == 'undefined') return;

  trackers.filter(function (t) {
    return t.name === name;
  }).forEach(function (t) {
    var _getElems3 = _getElems(t.selector),
        body = _getElems3.body,
        elem = _getElems3.elem;

    if (!elem) return;

    du.removeEvent(body, 'click', t.onBodyClick);
    du.removeEvent(elem, 'click', t.onElemClick);
  });
}

function create(name, selector) {
  var handler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


  var matches = trackers.filter(function (t) {
    return t.name === name;
  });

  if (matches.length) {

    matches[0].selector = selector;

    switchOn(name);

    return;
  }

  trackers.push({
    name: name,
    selector: selector,
    onBodyClick: null,
    onElemClick: null,
    handler: handler
  });

  switchOn(name);
}

function handler(name, handler) {

  trackers.filter(function (t) {
    return t.name === name;
  }).forEach(function (t) {

    t.handler = handler;
  });
}

function _getElems(selector) {

  return {
    body: document.querySelector('body'),
    elem: document.querySelector(selector)
  };
}
module.exports = exports['default'];