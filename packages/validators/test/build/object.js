"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

var _listify = require('./listify');

var _listify2 = _interopRequireDefault(_listify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MODES = {
  KEYED: 'keyed',
  LIST: 'list'
};

module.exports = function (options, validators) {

  if (arguments.length === 1) {

    validators = options;
    options = {};
  }

  var params = _utils2.default.extend({
    field: null,
    list: false
  }, options),
      validator = _utils2.default.extend(validate, {
    type: 'object',
    field: params.field
  });

  return params.list ? (0, _listify2.default)(validator) : validator;

  function validate(values) {

    var clean = [],
        errors = [];

    validators.forEach(function (validator) {

      var matchingValue = (values || []).filter(function (v) {
        return v.field === validator.field;
      });

      matchingValue = matchingValue.length ? matchingValue[0] : {
        field: validator.field,
        value: validator.type === 'object' ? [] : undefined
      };

      if (validator.type !== 'object') {

        try {

          clean.push({
            field: matchingValue.field,
            value: validator(matchingValue.value)
          });
        } catch (e) {

          errors = errors.concat(e);
        }
      } else if (_typeof(matchingValue.value) !== 'object') {

        errors = errors.concat([{
          field: matchingValue.field,
          origin: matchingValue.value,
          code: 'object.invalidtype',
          message: 'not an object'
        }]);
      } else {

        try {

          clean = clean.concat(validator(matchingValue.value).map(function (c) {
            return _utils2.default.extend(c, {
              field: matchingValue.field + '.' + c.field
            });
          }));
        } catch (e) {

          errors = errors.concat(e.map(function (objErr) {
            return _utils2.default.extend(objErr, {
              field: matchingValue.field + '.' + objErr.field
            });
          }));
        }
      }
    });

    if (errors.length) {

      throw errors;
    }

    return clean;
  }
};
//# sourceMappingURL=data:application/json;base64,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cG9ydCB1dGlscyBmcm9tICd1dGlscyc7XG5pbXBvcnQgbGlzdGlmeSBmcm9tICcuL2xpc3RpZnknO1xuXG5jb25zdCBNT0RFUyA9IHtcbiAgS0VZRUQ6ICdrZXllZCcsXG4gIExJU1Q6ICdsaXN0J1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBvcHRpb25zLCB2YWxpZGF0b3JzICkge1xuXG4gIGlmICggYXJndW1lbnRzLmxlbmd0aCA9PT0gMSApIHtcblxuICAgIHZhbGlkYXRvcnMgPSBvcHRpb25zO1xuICAgIG9wdGlvbnMgPSB7fTtcblxuICB9XG5cbiAgY29uc3QgcGFyYW1zID0gdXRpbHMuZXh0ZW5kKCB7XG4gICAgZmllbGQ6IG51bGwsXG4gICAgbGlzdDogZmFsc2VcbiAgfSwgb3B0aW9ucyApLFxuXG4gIHZhbGlkYXRvciA9IHV0aWxzLmV4dGVuZCggdmFsaWRhdGUsIHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBmaWVsZDogcGFyYW1zLmZpZWxkLFxuICB9ICk7XG5cbiAgcmV0dXJuIHBhcmFtcy5saXN0ID8gbGlzdGlmeSggdmFsaWRhdG9yICkgOiB2YWxpZGF0b3I7XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGUoIHZhbHVlcyApIHtcblxuICAgIHZhciBjbGVhbiA9IFtdLCBlcnJvcnMgPSBbXTtcblxuICAgIHZhbGlkYXRvcnMuZm9yRWFjaCggdmFsaWRhdG9yID0+IHtcblxuICAgICAgbGV0IG1hdGNoaW5nVmFsdWUgPSAoIHZhbHVlcyB8fCBbXSApLmZpbHRlciggdiA9PiB2LmZpZWxkID09PSB2YWxpZGF0b3IuZmllbGQgKTtcblxuICAgICAgbWF0Y2hpbmdWYWx1ZSA9IG1hdGNoaW5nVmFsdWUubGVuZ3RoID8gbWF0Y2hpbmdWYWx1ZVsgMCBdIDoge1xuICAgICAgICBmaWVsZDogdmFsaWRhdG9yLmZpZWxkLCBcbiAgICAgICAgdmFsdWU6IHZhbGlkYXRvci50eXBlID09PSAnb2JqZWN0JyA/IFtdIDogdW5kZWZpbmVkXG4gICAgICB9O1xuXG4gICAgICBpZiAoIHZhbGlkYXRvci50eXBlICE9PSAnb2JqZWN0JyApIHtcblxuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgY2xlYW4ucHVzaCgge1xuICAgICAgICAgICAgZmllbGQ6IG1hdGNoaW5nVmFsdWUuZmllbGQsXG4gICAgICAgICAgICB2YWx1ZTogdmFsaWRhdG9yKCBtYXRjaGluZ1ZhbHVlLnZhbHVlIClcbiAgICAgICAgICB9ICk7XG5cbiAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG5cbiAgICAgICAgICBlcnJvcnMgPSBlcnJvcnMuY29uY2F0KCBlICk7XG5cbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2UgaWYgKCB0eXBlb2YgbWF0Y2hpbmdWYWx1ZS52YWx1ZSAhPT0gJ29iamVjdCcgKSB7XG5cbiAgICAgICAgZXJyb3JzID0gZXJyb3JzLmNvbmNhdCggWyB7XG4gICAgICAgICAgZmllbGQ6IG1hdGNoaW5nVmFsdWUuZmllbGQsXG4gICAgICAgICAgb3JpZ2luOiBtYXRjaGluZ1ZhbHVlLnZhbHVlLFxuICAgICAgICAgIGNvZGU6ICdvYmplY3QuaW52YWxpZHR5cGUnLFxuICAgICAgICAgIG1lc3NhZ2U6ICdub3QgYW4gb2JqZWN0J1xuICAgICAgICB9IF0gKTtcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgY2xlYW4gPSBjbGVhbi5jb25jYXQoIFxuXG4gICAgICAgICAgICB2YWxpZGF0b3IoIG1hdGNoaW5nVmFsdWUudmFsdWUgKS5tYXAoIGMgPT4gdXRpbHMuZXh0ZW5kKCBjLCB7XG4gICAgICAgICAgICAgIGZpZWxkOiBtYXRjaGluZ1ZhbHVlLmZpZWxkICsgJy4nICsgYy5maWVsZFxuICAgICAgICAgICAgfSApIClcblxuICAgICAgICAgICk7XG5cbiAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG5cbiAgICAgICAgICBlcnJvcnMgPSBlcnJvcnMuY29uY2F0KCBcblxuICAgICAgICAgICAgZS5tYXAoIG9iakVyciA9PiB1dGlscy5leHRlbmQoIG9iakVyciwge1xuICAgICAgICAgICAgICBmaWVsZDogbWF0Y2hpbmdWYWx1ZS5maWVsZCArICcuJyArIG9iakVyci5maWVsZFxuICAgICAgICAgICAgfSApIClcblxuICAgICAgICAgICk7XG5cbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICB9ICk7XG5cbiAgICBpZiAoIGVycm9ycy5sZW5ndGggKSB7XG5cbiAgICAgIHRocm93IGVycm9ycztcblxuICAgIH1cblxuICAgIHJldHVybiBjbGVhbjtcblxuICB9XG5cbn0iXX0=