'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (options, routes, fn) {

  var params = (0, _deepExtend2.default)({
    state: {
      settings: {
        lang: 'fr',
        prefix: ''
      },
      res: {}
    }
  }, options);

  var client = new _ApiClient2.default(params.state.settings.apiRoot);
  var browserHistory = (0, _reactRouter.useRouterHistory)(_history.createHistory)({ basename: params.state.settings.prefix });
  var store = (0, _create2.default)(browserHistory, client, params.state);
  var history = (0, _reactRouterRedux.syncHistoryWithStore)(browserHistory, store);

  var renderRouter = function renderRouter(props) {
    return _react2.default.createElement(_reduxConnect.ReduxAsyncConnect, _extends({}, props, { helpers: { client: client }, filter: function filter(item) {
        return !item.deferred;
      } }));
  };

  if (process.env.NODE_ENV == 'dev' && !window.devToolsExtension) {
    var devToolsDest = document.createElement('div');
    window.document.body.insertBefore(devToolsDest, null);
    var DevTools = require('./containers');
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
      { history: history, render: renderRouter },
      routes(store)
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

var _history = require('history');

var _reduxConnect = require('redux-connect');

var _create = require('./redux/create');

var _create2 = _interopRequireDefault(_create);

var _ApiClient = require('../../helpers/ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _deepExtend = require('deep-extend');

var _deepExtend2 = _interopRequireDefault(_deepExtend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('dom-utils/ie8');
require('dom-utils/ie9');

;
module.exports = exports['default'];