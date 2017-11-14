'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

exports.default = validate;

var _Stakeholder = require('@openagenda/agenda-stakeholders/iso/Stakeholder');

var _Stakeholder2 = _interopRequireDefault(_Stakeholder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validate(values) {

  var flatErrors = function flatErrors(e) {
    return e.reduce(function (prev, next) {
      return (0, _extends4.default)({}, prev, (0, _defineProperty3.default)({}, next.field, next.code));
    }, {});
  };

  var errors = new _Stakeholder2.default(values).getErrors(true);

  if (errors.length) {
    return flatErrors(errors);
  }

  return true;
}
module.exports = exports['default'];
//# sourceMappingURL=validate.js.map