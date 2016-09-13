'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _domUtils = require('dom-utils');

var _domUtils2 = _interopRequireDefault(_domUtils);

var _reactRedux = require('react-redux');

var _reactRouterRedux = require('react-router-redux');

var _reactRouter = require('react-router');

var _history = require('history');

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _create = require('./redux/create');

var _create2 = _interopRequireDefault(_create);

var _ApiClient = require('./helpers/ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _agendaCreation = require('labels/agenda-settings/agendaCreation');

var _agendaCreation2 = _interopRequireDefault(_agendaCreation);

var _labels = require('labels');

var _labels2 = _interopRequireDefault(_labels);

var _containers = require('./containers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('dom-utils/ie8');
// import actions from './actions';

require('dom-utils/ie9');

module.exports = function (options) {

  var params = Object.assign({
    canvas: '.js_canvas',
    lang: 'fr',
    prefix: ''
  }, options);

  var client = new _ApiClient2.default();
  var browserHistory = (0, _reactRouter.useRouterHistory)(_history.createHistory)({ basename: params.prefix });
  var store = (0, _create2.default)(browserHistory, client);
  var history = (0, _reactRouterRedux.syncHistoryWithStore)(browserHistory, store);

  // const settings = Object.assign( params, du.parseJsonAttribute( 'body', params.dataTag ) );
  // store.dispatch( actions.setAppSettings( settings ) );

  var createElement = function createElement(component, props) {
    return _react2.default.createElement(_containers.RelayContainer, {
      component: component,
      routerProps: props,
      getLabel: (0, _labels2.default)(_agendaCreation2.default),
      lang: params.lang });
  };

  _reactDom2.default.render(_react2.default.createElement(
    _reactRedux.Provider,
    { store: store, key: 'provider' },
    _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        _reactRouter.Router,
        { history: history, createElement: createElement },
        (0, _routes2.default)(store)
      ),
      ' ',
      process.env.NODE_ENV == 'development' && !window.devToolsExtension ? _react2.default.createElement(_containers.DevTools, null) : null
    )
  ), _domUtils2.default.el(params.canvas));
};