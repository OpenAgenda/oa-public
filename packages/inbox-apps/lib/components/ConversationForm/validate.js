'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

exports.default = validate;

var _schema = require('@openagenda/validators/schema');

var _schema2 = _interopRequireDefault(_schema);

var _text = require('@openagenda/validators/text');

var _text2 = _interopRequireDefault(_text);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_schema2.default.register({
  text: _text2.default
});

function validate(data) {
  try {
    var _validate = (0, _schema2.default)({
      message: {
        type: 'text',
        // min: 2,
        // max: 10000,
        optional: false
      }
    });

    _validate(data);
  } catch (errors) {
    return errors.reduce(function (result, v) {
      return (0, _extends4.default)({}, result, (0, _defineProperty3.default)({}, v.field, v.code));
    }, {});
  }
}
module.exports = exports['default'];
//# sourceMappingURL=validate.js.map