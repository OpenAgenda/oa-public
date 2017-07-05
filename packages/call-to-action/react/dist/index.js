'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createApp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _createBrowserHistory = require('history/lib/createBrowserHistory');

var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);

var _reactRedux = require('react-redux');

var _createStore = require('react-utils/dist/createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _ApiClient = require('react-utils/dist/ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _domUtils = require('dom-utils');

var _domUtils2 = _interopRequireDefault(_domUtils);

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _redux = require('redux');

var _reducer = require('./redux/reducer');

var _reducer2 = _interopRequireDefault(_reducer);

var _callToAction = require('./redux/modules/callToAction');

var actions = _interopRequireWildcard(_callToAction);

var _components2 = require('./components');

var _openRequestForm = require('./openRequestForm');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createApp(options) {

  var params = (0, _merge2.default)({
    state: {
      settings: {
        lang: 'fr',
        prefix: '',
        apiRoot: ''
      },
      res: {
        request: '/request'
      }
    },
    selector: '.js_call_to_action'
  }, options);

  var client = new _ApiClient2.default(params.state.settings.apiRoot);
  var browserHistory = (0, _createBrowserHistory2.default)();
  var store = (0, _createStore2.default)(_reducer2.default)(browserHistory, client, params.state);

  var openRequestForm = (0, _redux.bindActionCreators)(function (data, options) {
    if (data instanceof Event) {
      data.subject = data.target.getAttribute('data-subject');
      data.agenda = data.target.getAttribute('data-agenda');
    }

    return actions.openRequestForm(data, options);
  }, store.dispatch);

  window.openRequestForm = openRequestForm;

  if (params.selector) {
    _domUtils2.default.els(params.selector).map(function (el) {
      return _domUtils2.default.addEvent(el, 'click', openRequestForm);
    });
  }

  if (_openRequestForm.onReady) openRequestForm(_openRequestForm.onReady);

  var appDest = document.createElement('div');
  appDest.className = 'js_call_to_action_canvas';
  window.document.body.insertAdjacentElement('beforeend', appDest);

  return _reactDom2.default.render(_react2.default.createElement(
    _reactRedux.Provider,
    { store: store, key: 'provider' },
    _react2.default.createElement(_components2.Request, null)
  ), _domUtils2.default.el('.js_call_to_action_canvas'));
};
module.exports = exports['default'];