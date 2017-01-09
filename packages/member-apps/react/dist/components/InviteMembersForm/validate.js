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
  number: require('validators/number')
});

function validate(values) {

  try {

    (0, _schema2.default)({
      credentialType: {
        type: 'number',
        optional: false,
        min: 1,
        max: 4
      }
    })(values);
  } catch (e) {

    return Object.assign.apply(Object, _toConsumableArray(e.map(function (v) {
      return _defineProperty({}, v.field, v.code);
    })));
  }

  return true;
};
module.exports = exports['default'];