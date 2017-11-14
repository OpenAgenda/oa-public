"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reducers = require('./reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _containers = require('./containers');

var _containers2 = _interopRequireDefault(_containers);

var _utils = require('@openagenda/utils');

var _utils2 = _interopRequireDefault(_utils);

var _redux = require('redux');

var _actions = require('./actions');

var _actions2 = _interopRequireDefault(_actions);

var _configure = require('./store/configure');

var _configure2 = _interopRequireDefault(_configure);

var _clickTracker = require('../clickTracker');

var _clickTracker2 = _interopRequireDefault(_clickTracker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var store = void 0;

exports.default = function (options) {

  if (!store) {

    var initialState = _utils2.default.extend({
      initUids: [],
      lang: 'fr',
      res: {
        events: '/events'
      },
      loading: false,
      error: false,
      info: null,
      events: [],
      search: {
        display: false
      }
    }, options || {}),
        onChange = options.onChange;

    store = (0, _redux.createStore)(_reducers2.default, initialState, _configure2.default);

    store.dispatch(_actions2.default.eventsLoad());

    (0, _clickTracker2.default)('search', '.search', function () {

      store.dispatch(_actions2.default.searchHide());
    });

    if (onChange) {

      store.subscribe(function () {

        onChange(store.getState().events.map(function (e) {
          return e.uid;
        }));
      });
    }
  }

  return _react2.default.createElement(
    _reactRedux.Provider,
    { store: store },
    _react2.default.createElement(_containers2.default, null)
  );
};

module.exports = exports['default'];