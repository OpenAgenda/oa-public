'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = validate;

var _verror = require('verror');

var _verror2 = _interopRequireDefault(_verror);

var _getAjvFormErrors = require('./getAjvFormErrors');

var _getAjvFormErrors2 = _interopRequireDefault(_getAjvFormErrors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validate(ajv, schemaId, data) {
  var valid = ajv.validate(schemaId, data);

  if (!valid) {
    throw new _verror2.default({
      name: 'ValidationError',
      info: {
        errors: (0, _getAjvFormErrors2.default)(ajv.errors.slice())
      }
    });
  }

  return true;
}
module.exports = exports['default'];
//# sourceMappingURL=validate.js.map