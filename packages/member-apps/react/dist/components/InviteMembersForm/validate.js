'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = validate;

var _schema = require('validators/schema');

var _schema2 = _interopRequireDefault(_schema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

_schema2.default.register({
  number: require('validators/number'),
  email: require('validators/email')
});

function validate(values) {

  var errors = {};

  values = _extends({}, values);
  values.emails = values.emails && values.emails.split(',').map(function (v) {
    return v.trim();
  }).filter(function (v) {
    return !!v;
  });

  try {

    // TODO limit to possible credentials

    (0, _schema2.default)({
      credential: {
        type: 'number',
        optional: false,
        min: 1,
        max: 4
      },
      emails: {
        type: 'email',
        optional: false,
        list: true
      }
    })(values);
  } catch (e) {

    Object.assign.apply(Object, [errors].concat(_toConsumableArray(e.map(function (v) {
      return _defineProperty({}, v.field, v.code);
    }))));
  }

  console.log(values);

  if (Object.keys(errors).length) {
    return errors;
  }

  return true;
};
module.exports = exports['default'];