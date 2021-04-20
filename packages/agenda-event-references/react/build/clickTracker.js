"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

require("core-js/modules/es.function.name");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var utils = require('@openagenda/utils');

var du = require('@openagenda/dom-utils');

var _default = utils.extend(create, {
  switchOn: switchOn,
  switchOff: switchOff,
  handler: handler
});

exports.default = _default;
var trackers = []; // { name: 'search', 'selector': '.search', bodyEvent: null, elemEvent: null }

function switchOn(name) {
  var _context;

  if (typeof document == 'undefined') return;
  (0, _forEach.default)(_context = (0, _filter.default)(trackers).call(trackers, function (t) {
    return t.name === name;
  })).call(_context, function (t) {
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
  var _context2;

  if (typeof document == 'undefined') return;
  (0, _forEach.default)(_context2 = (0, _filter.default)(trackers).call(trackers, function (t) {
    return t.name === name;
  })).call(_context2, function (t) {
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
  var matches = (0, _filter.default)(trackers).call(trackers, function (t) {
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
  var _context3;

  (0, _forEach.default)(_context3 = (0, _filter.default)(trackers).call(trackers, function (t) {
    return t.name === name;
  })).call(_context3, function (t) {
    t.handler = handler;
  });
}

function _getElems(selector) {
  return {
    body: document.querySelector('body'),
    elem: document.querySelector(selector)
  };
}

module.exports = exports.default;
//# sourceMappingURL=clickTracker.js.map