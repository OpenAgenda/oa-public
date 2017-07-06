'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = validate;

var _schema = require('validators/schema');

var _schema2 = _interopRequireDefault(_schema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

_schema2.default.register({
  text: require('validators/text'),
  email: require('validators/email')
});

function validate(values) {

  var errors = {};

  try {

    (0, _schema2.default)({
      message: {
        type: 'text',
        optional: false
      },
      replyTo: {
        type: 'email',
        optional: true
      }
    })(values);
  } catch (e) {

    Object.assign.apply(Object, [errors].concat(_toConsumableArray(e.map(function (v) {
      return _defineProperty({}, v.field, v.code);
    }))));
  }

  if (Object.keys(errors).length) {
    return errors;
  }

  return true;
};
module.exports = exports['default'];