'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (defaultState, createStore, getRoutes, ApiClient, fn) {

  var state = (0, _deepExtend2.default)({
    settings: {
      lang: 'fr',
      prefix: '',
      apiRoot: ''
    },
    res: {}
  }, defaultState);

  var client = new ApiClient(state.settings.apiRoot);
  var browserHistory = (0, _reactRouter.useRouterHistory)(_createBrowserHistory2.default)();
  var store = createStore(browserHistory, client, state);
  var history = (0, _reactRouterRedux.syncHistoryWithStore)(browserHistory, store);

  var renderRouter = function renderRouter(props) {
    return _react2.default.createElement(_reduxConnect.ReduxAsyncConnect, _extends({}, props, { helpers: { client: client }, filter: function filter(item) {
        return !item.deferred;
      } }));
  };

  if (typeof window !== 'undefined') {
    window.React = _react2.default;
  }

  if (process.env.NODE_ENV == 'development' && !window.devToolsExtension) {
    var devToolsDest = document.createElement('div');
    window.document.body.insertBefore(devToolsDest, null);
    var DevTools = require('./ReduxDevTools');
    _server2.default.render(_react2.default.createElement(
      _reactRedux.Provider,
      { store: store, key: 'provider' },
      _react2.default.createElement(DevTools, null)
    ), devToolsDest);
  }

  if (fn) fn({ client: client, store: store, history: history });

  return _react2.default.createElement(
    _reactRedux.Provider,
    { store: store, key: 'provider' },
    _react2.default.createElement(
      _reactRouter.Router,
      { history: history },
      getRoutes(store)
    )
  );
};

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _reactRedux = require('react-redux');

var _reactRouterRedux = require('react-router-redux');

var _reactRouter = require('react-router');

var _createBrowserHistory = require('history/createBrowserHistory');

var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);

var _reduxConnect = require('redux-connect');

var _deepExtend = require('deep-extend');

var _deepExtend2 = _interopRequireDefault(_deepExtend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;
module.exports = exports['default'];