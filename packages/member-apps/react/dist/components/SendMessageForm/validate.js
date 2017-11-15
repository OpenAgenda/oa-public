'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.default = validate;

var _schema = require('@openagenda/validators/schema');

var _schema2 = _interopRequireDefault(_schema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_schema2.default.register({
  text: require('@openagenda/validators/text'),
  email: require('@openagenda/validators/email')
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

    _assign2.default.apply(Object, [errors].concat((0, _toConsumableArray3.default)(e.map(function (v) {
      return (0, _defineProperty3.default)({}, v.field, v.code);
    }))));
  }

  if ((0, _keys2.default)(errors).length) {
    return errors;
  }

  return true;
};
module.exports = exports['default'];
//# sourceMappingURL=validate.js.map