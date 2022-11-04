"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _objectSpread3 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));

var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _reactRedux = require("react-redux");

var _default = function _default(agenda) {
  var _context;

  var APIRoot = (0, _reactRedux.useSelector)(function (state) {
    return state.settings.apiRoot;
  });
  var res = (0, _reactRedux.useSelector)(function (state) {
    return state.res;
  });
  return (0, _reduce.default)(_context = (0, _keys.default)(res)).call(_context, function (carry, key) {
    var _context2;

    return (0, _objectSpread3.default)((0, _objectSpread3.default)({}, carry), {}, (0, _defineProperty2.default)({}, key, (0, _concat.default)(_context2 = "".concat(APIRoot)).call(_context2, res[key].replace(':agendaUid', agenda.uid).replace(':agendaSlug', agenda.slug))));
  }, {});
};

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=useRes.js.map