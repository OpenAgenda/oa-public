'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _partialRight2 = require('lodash/partialRight');

var _partialRight3 = _interopRequireDefault(_partialRight2);

var _merge2 = require('lodash/merge');

var _merge3 = _interopRequireDefault(_merge2);

exports.default = renderApp;
exports.expose = expose;

var _domUtils = require('@openagenda/dom-utils');

var _domUtils2 = _interopRequireDefault(_domUtils);

var _createStore = require('@openagenda/react-utils/dist/createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _ApiClient = require('@openagenda/react-utils/dist/ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _createApp = require('@openagenda/react-utils/dist/createApp');

var _createApp2 = _interopRequireDefault(_createApp);

var _createMemoryHistory = require('history/lib/createMemoryHistory');

var _createMemoryHistory2 = _interopRequireDefault(_createMemoryHistory);

var _routes = require('../../routes');

var _routes2 = _interopRequireDefault(_routes);

var _reducer = require('../../redux/reducer');

var _reducer2 = _interopRequireDefault(_reducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function renderApp(options) {

  var params = (0, _merge3.default)({
    selector: '.js_inbox_event',
    state: {
      settings: {
        prefix: '/',
        lang: 'fr',
        perPageLimit: 20
      },
      res: {
        conversations: {
          list: '/agendas/:agendaUid/events/:eventUid/conversations'
        },
        messages: {
          list: '/agendas/:agendaUid/events/:eventUid/conversations/:conversationId/messages',
          create: '/agendas/:agendaUid/events/:eventUid/conversations/:conversationId/messages'
        }
      },
      agenda: {
        //
      },
      event: {
        //
      }
    }
  }, options);

  var app = (0, _createApp2.default)({
    state: params.state,
    createHistory: _createMemoryHistory2.default,
    createStore: (0, _createStore2.default)(_reducer2.default),
    getRoutes: (0, _partialRight3.default)(_routes2.default, params),
    ApiClient: _ApiClient2.default,
    routerScroll: false
  });

  app.match(_domUtils2.default.el(params.selector));

  return app;
};

function expose(name) {

  window[name] = renderApp;
}
//# sourceMappingURL=index.js.map