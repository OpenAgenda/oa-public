"use strict";

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var React = require('react');
var ReactDom = require('react-dom');
var du = require('dom-utils');
var utils = require('utils');

var _require = require('react-redux'),
    Provider = _require.Provider;

var _require2 = require('react-router-redux'),
    syncHistoryWithStore = _require2.syncHistoryWithStore;

var _require3 = require('react-router'),
    Router = _require3.Router,
    useRouterHistory = _require3.useRouterHistory;

var _require4 = require('history'),
    createHistory = _require4.createHistory;

var routes = require('./routes');
var createStore = require('./create');
var labels = require('labels/users/settings');
var getLabels = require('labels')(labels);
var actions = require('./actions');
var RelayContainer = require('./containers/RelayContainer');
var App = require('./containers/App');
var SettingsContainer = require('./containers/SettingsContainer');
var DevTools = require('./containers/DevTools');

require('dom-utils/ie8');

module.exports = function (options) {

  var params = utils.extend({
    canvas: '.js_canvas',
    dataTag: 'data-options',
    lang: 'fr',
    prefix: '',
    urls: {
      getMe: '/getMe',
      updateProfile: '/updateUser',
      changeEmail: '/requestChangeEmail',
      changePassword: '/changePassword',
      generateApiKey: '/generateApiKey',
      deleteAccount: '/deleteAccount',
      uploadProfileImageRes: '/uploadProfileImage',
      removeProfileImageRes: '/removeProfileImage',
      listUnsubscriptions: '/u/:userUid/list',
      removeUnsubscription: '/u/:userUid/s/:subject.:identifier/t/:type/remove'
    }
  }, options);

  var settings = (0, _assign2.default)(params, du.parseJsonAttribute('body', params.dataTag));

  var browserHistory = useRouterHistory(createHistory)();
  var store = createStore(browserHistory);
  var history = syncHistoryWithStore(browserHistory, store);

  store.dispatch(actions.setAppSettings(settings));

  ReactDom.render(React.createElement(
    Provider,
    { store: store, key: 'provider' },
    React.createElement(
      'div',
      null,
      React.createElement(
        Router,
        { history: history, createElement: createElement },
        routes(store)
      ),
      process.env.NODE_ENV == 'develoment' && !window.devToolsExtension ? React.createElement(DevTools, null) : null
    )
  ), du.el(params.canvas));

  function createElement(Component, props) {
    return React.createElement(RelayContainer, {
      Component: Component,
      store: store,
      routerProps: props,
      getLabels: getLabels,
      lang: params.lang });
  }
};