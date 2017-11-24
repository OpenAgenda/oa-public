'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _merge2 = require('lodash/merge');

var _merge3 = _interopRequireDefault(_merge2);

exports.default = function (options) {
  var params = (0, _merge3.default)({
    selector: '.js_inbox',
    res: {
      haveUnread: '/inbox/have-unread'
    },
    classes: {
      hide: 'hide'
    }
  }, options);

  var user = _client2.default.getUser();

  if (!user) return;

  if ([75052324, 99999999, 31046551, 7339049, 71438739].indexOf(user.uid) === -1) {
    return;
  }

  var anchorElem = document.querySelector(params.selector);

  if (!anchorElem) return;

  // get haveUnread flag
  // add new icon on link if needed

  if (_domUtils2.default.hasClass(anchorElem, params.classes.hide)) {
    _domUtils2.default.removeClass(anchorElem, params.classes.hide);
  }
};

var _client = require('@openagenda/sessions/client');

var _client2 = _interopRequireDefault(_client);

var _domUtils = require('@openagenda/dom-utils');

var _domUtils2 = _interopRequireDefault(_domUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];
//# sourceMappingURL=index.js.map