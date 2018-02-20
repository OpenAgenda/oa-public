'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _bluebird = require('bluebird');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _config = require('../config');

var _Messages = require('../Messages');

var _Messages2 = _interopRequireDefault(_Messages);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee(entities, inbox) {
    var messages;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(entities === null)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt('return', null);

          case 2:
            if (Array.isArray(entities)) {
              _context.next = 6;
              break;
            }

            _context.next = 5;
            return (0, _bluebird.resolve)(populateLatestMessage([entities], inbox));

          case 5:
            return _context.abrupt('return', _context.sent[0]);

          case 6:
            _context.next = 8;
            return (0, _bluebird.resolve)(new _Messages2.default({ inbox: inbox }).list({ id: _lodash2.default.uniq(entities.map(function (v) {
                return v.latestMessageId;
              })) }, { latest: true }));

          case 8:
            messages = _context.sent;
            return _context.abrupt('return', entities.map(function (row) {
              var id = row.latestMessageId;
              delete row.latestMessageId;

              return (0, _extends3.default)({}, row, {
                latestMessage: _lodash2.default.find(messages.data, { id: id }) || null
              });
            }));

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function populateLatestMessage(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return populateLatestMessage;
}();

module.exports = exports['default'];
//# sourceMappingURL=populateLatestMessage.js.map