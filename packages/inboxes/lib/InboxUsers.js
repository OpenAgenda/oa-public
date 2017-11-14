'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _InboxUser = require('./InboxUser');

var _InboxUser2 = _interopRequireDefault(_InboxUser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var InboxUsers = function () {
  function InboxUsers(options) {
    (0, _classCallCheck3.default)(this, InboxUsers);

    this.inbox = options.inbox;
  }

  (0, _createClass3.default)(InboxUsers, [{
    key: 'add',
    value: function add(data, options) {
      return new _InboxUser2.default(null, { inbox: this.inbox }).create(data, options);
    }
  }, {
    key: 'get',
    value: function get(identifiers, options) {
      return new _InboxUser2.default(identifiers, { inbox: this.inbox }).get(options);
    }
  }, {
    key: 'remove',
    value: function remove(identifiers) {
      return new _InboxUser2.default(identifiers, { inbox: this.inbox }).remove();
    }
  }]);
  return InboxUsers;
}();

exports.default = InboxUsers;
module.exports = exports['default'];
//# sourceMappingURL=InboxUsers.js.map