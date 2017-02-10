'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = validate;

var _Stakeholder = require('agenda-stakeholders/iso/Stakeholder');

var _Stakeholder2 = _interopRequireDefault(_Stakeholder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function validate(values) {

  var flatErrors = function flatErrors(e) {
    return e.reduce(function (prev, next) {
      return _extends({}, prev, _defineProperty({}, next.field, next.code));
    }, {});
  };

  var errors = new _Stakeholder2.default(values).getErrors();

  if (errors.length) {
    return flatErrors(errors);
  }

  return true;
}
module.exports = exports['default'];