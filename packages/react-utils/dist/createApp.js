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

  var _bindActionCreators = (0, _redux.bindActionCreators)({ replace: _reactRouterRedux.replace }, store.dispatch),
      redirect = _bindActionCreators.replace;

  var renderRouter = function renderRouter(props) {
    return _react2.default.createElement(_reduxConnect.ReduxAsyncConnect, _extends({}, props, {
      helpers: { client: client, redirect: redirect },
      filter: function filter(item) {
        return !item.deferred;
      },
      history: history,
      render: (0, _reactRouter.applyRouterMiddleware)((0, _reactRouterScroll.useScroll)())
    }));
  };

  if (typeof window !== 'undefined') {
    window.React = _react2.default;
  }

  if (process.env.NODE_ENV === 'development' && !window.devToolsExtension) {
    var devToolsDest = document.createElement('div');
    window.document.body.insertBefore(devToolsDest, null);
    var DevTools = require('./ReduxDevTools');
    _reactDom2.default.render(_react2.default.createElement(DevTools, { store: store }), devToolsDest);
  }

  if (fn) fn({ client: client, store: store, history: history });

  var routes = getRoutes(store);

  var match = function match(elem) {
    (0, _reactRouter.match)({ history: history, routes: routes }, function (error, redirectLocation, renderProps) {
      _reactDom2.default.render(_react2.default.createElement(
        _reactRedux.Provider,
        { store: store, key: 'provider' },
        _react2.default.createElement(
          _reactRouter.Router,
          _extends({}, renderProps, { history: history, render: renderRouter }),
          routes
        )
      ), elem);
    });
  };

  return Object.assign({}, _react2.default.createElement(
    _reactRedux.Provider,
    { store: store, key: 'provider' },
    _react2.default.createElement(
      _reactRouter.Router,
      { history: history, render: renderRouter },
      routes
    )
  ), { match: match });
};

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _redux = require('redux');

var _reactRedux = require('react-redux');

var _reactRouterRedux = require('react-router-redux');

var _reactRouter = require('react-router');

var _reactRouterScroll = require('react-router-scroll');

var _createBrowserHistory = require('history/lib/createBrowserHistory');

var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);

var _reduxConnect = require('redux-connect');

var _deepExtend = require('deep-extend');

var _deepExtend2 = _interopRequireDefault(_deepExtend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;
module.exports = exports['default'];