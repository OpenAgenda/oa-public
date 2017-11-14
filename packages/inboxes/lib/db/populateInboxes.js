"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(entities) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(entities === null)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return", null);

          case 2:
            if (Array.isArray(entities)) {
              _context.next = 6;
              break;
            }

            _context.next = 5;
            return populateInboxes([entities]);

          case 5:
            return _context.abrupt("return", _context.sent[0]);

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function populateInboxes(_x) {
    return _ref.apply(this, arguments);
  }

  return populateInboxes;
}();

module.exports = exports["default"];
//# sourceMappingURL=populateInboxes.js.map