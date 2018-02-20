'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.default = getAjvFormErrors;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getAjvFormErrors(errors) {
  if (!Array.isArray(errors) || errors === null) {
    return errors;
  }

  return errors.reduce(function (result, err) {
    var path = getErrorPath(getErrors(err)).replace(/^\//, '');

    if (!path || result.path) {
      return result;
    }

    if (['errorMessage', 'type', 'required', 'additionalProperties'].includes(err.keyword)) {
      result[path] = (0, _assign2.default)(err, {
        message: err.message,
        code: getErrorCode(err)
      });
    }

    return result;
  }, {});
}

function getErrorPath(errors) {
  return errors.map(function (error) {
    if (error.dataPath) {
      return error.dataPath;
    }

    if (error.params && error.params.missingProperty) {
      return error.params.missingProperty;
    }

    if (error.params && error.params.additionalProperty) {
      return error.params.additionalProperty;
    }

    return '';
  })[0];
}

function getErrors(error) {
  return error.params && error.params.errors ? error.params.errors : [error];
}

function getErrorCode(error) {
  var err = getErrors(error)[0];
  return err.keyword === 'type' ? 'type.' + err.params.type : err.keyword;
}
module.exports = exports['default'];
//# sourceMappingURL=getAjvFormErrors.js.map