'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _noop2 = require('lodash/noop');

var _noop3 = _interopRequireDefault(_noop2);

var _merge2 = require('lodash/merge');

var _merge3 = _interopRequireDefault(_merge2);

var _jsxFileName = 'src/routes.js';

exports.default = function (store, options) {

  var params = (0, _merge3.default)({
    selectMenuItem: false
  }, options);

  var onEnter = params.selectMenuItem ? selectItem('inbox') : _noop3.default;

  var state = store.getState();
  var prefix = state.settings.prefix;


  return _react2.default.createElement(
    _reactRouter.Route,
    {
      path: prefix,
      component: _containers.App,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 40
      }
    },
    _react2.default.createElement(_reactRouter.IndexRoute, {
      component: _containers.Inbox,
      onEnter: onEnter,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 44
      }
    }),
    _react2.default.createElement(_reactRouter.Route, {
      path: 'conversation/create',
      component: _containers.ConversationCreate,
      onEnter: onEnter,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 48
      }
    }),
    _react2.default.createElement(_reactRouter.Route, {
      path: 'conversation/:conversationId',
      component: _containers.Conversation,
      onEnter: onEnter,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 53
      }
    })
  );
};

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _domUtils = require('@openagenda/dom-utils');

var _domUtils2 = _interopRequireDefault(_domUtils);

var _containers = require('./containers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function selectItem(item) {

  return function () {
    if (typeof document !== 'undefined') {
      var elems = _domUtils2.default.els('.js_menu_item');
      var elem = _domUtils2.default.el('.js_menu_item_' + item);

      elems.forEach(function (e) {
        _domUtils2.default.removeClass(e, 'selected');
        _domUtils2.default.removeClass(_domUtils2.default.el(e, 'a'), 'active');
      });

      if (elem) {
        _domUtils2.default.addClass(elem, 'selected');
        _domUtils2.default.addClass(_domUtils2.default.el(elem, 'a'), 'active');
      }
    }
  };
}

;
module.exports = exports['default'];
//# sourceMappingURL=routes.js.map