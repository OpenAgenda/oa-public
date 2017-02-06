"use strict";

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
  field: false, // optional, name of associated field
  min: undefined, // optional - min allowed date
  max: undefined, // optional - max allowed date
  default: undefined, // if set, no input cleans to this
  optional: true // do I have to spell this out for you?
};

module.exports = function (config) {

  var params = _utils2.default.extend({}, defaults, config || {});

  return _utils2.default.extend(validate, {
    type: 'date',
    field: params.field
  });

  function validate(value) {

    var clean = void 0,
        errorDefaults = {
      origin: value
    };

    if (validate.field) {

      errorDefaults.field = validate.field;
    }

    // if its a string, attempt a conversion to date
    if (typeof value === 'string') {

      clean = new Date(value);

      if (clean.toString() === 'Invalid Date') {

        throw [_utils2.default.extend({
          code: 'date.invalid',
          message: 'not a date'
        }, errorDefaults)];
      }
    } else if (typeof value === 'undefined' || value === null) {

      if (!params.default && !params.optional) {

        throw [_utils2.default.extend({
          code: 'date.required',
          message: 'a date is required'
        }, errorDefaults)];
      }

      if (params.default === 'now') {

        clean = new Date();
      } else if (params.default) {

        clean = new Date(params.default.getTime());
      } else if (value === null) {

        clean = null;
      }
    } else {

      // if it not a string, it must be a date
      if (!(value instanceof Date)) {

        throw [_utils2.default.extend({
          code: 'date.invalid',
          message: 'not a date'
        }, errorDefaults)];
      }

      clean = new Date(value.getTime());
    }

    // if is bounded, test bounds

    if (clean && params.min && clean < params.min) {

      throw [_utils2.default.extend({
        code: 'date.toosmall',
        message: 'date is too small',
        values: {
          min: params.min
        }
      }, errorDefaults)];
    }

    if (clean && params.max && clean > params.max) {

      throw [_utils2.default.extend({
        code: 'date.toobig',
        message: 'date is too big',
        values: {
          max: params.max
        }
      }, errorDefaults)];
    }

    return clean;
  }
};
//# sourceMappingURL=data:application/json;base64,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QVFEOztBQUVELFdBQU8sS0FBUDtBQUVEO0FBRUYsQ0E3R0QiLCJmaWxlIjoiZGF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgdXRpbHMgZnJvbSAndXRpbHMnXG5cbmNvbnN0IGRlZmF1bHRzID0ge1xuICBmaWVsZDogZmFsc2UsIC8vIG9wdGlvbmFsLCBuYW1lIG9mIGFzc29jaWF0ZWQgZmllbGRcbiAgbWluOiB1bmRlZmluZWQsIC8vIG9wdGlvbmFsIC0gbWluIGFsbG93ZWQgZGF0ZVxuICBtYXg6IHVuZGVmaW5lZCwgLy8gb3B0aW9uYWwgLSBtYXggYWxsb3dlZCBkYXRlXG4gIGRlZmF1bHQ6IHVuZGVmaW5lZCwgLy8gaWYgc2V0LCBubyBpbnB1dCBjbGVhbnMgdG8gdGhpc1xuICBvcHRpb25hbDogdHJ1ZSAvLyBkbyBJIGhhdmUgdG8gc3BlbGwgdGhpcyBvdXQgZm9yIHlvdT9cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb25maWcgPT4ge1xuXG4gIGxldCBwYXJhbXMgPSB1dGlscy5leHRlbmQoIHt9LCBkZWZhdWx0cywgY29uZmlnIHx8IHt9ICk7XG5cbiAgcmV0dXJuIHV0aWxzLmV4dGVuZCggdmFsaWRhdGUsIHtcbiAgICB0eXBlOiAnZGF0ZScsXG4gICAgZmllbGQ6IHBhcmFtcy5maWVsZFxuICB9ICk7XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGUoIHZhbHVlICkge1xuXG4gICAgbGV0IGNsZWFuLFxuXG4gICAgZXJyb3JEZWZhdWx0cyA9IHtcbiAgICAgIG9yaWdpbjogdmFsdWVcbiAgICB9O1xuXG4gICAgaWYgKCB2YWxpZGF0ZS5maWVsZCApIHtcblxuICAgICAgZXJyb3JEZWZhdWx0cy5maWVsZCA9IHZhbGlkYXRlLmZpZWxkO1xuXG4gICAgfVxuXG4gICAgLy8gaWYgaXRzIGEgc3RyaW5nLCBhdHRlbXB0IGEgY29udmVyc2lvbiB0byBkYXRlXG4gICAgaWYgKCB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICkge1xuXG4gICAgICBjbGVhbiA9IG5ldyBEYXRlKCB2YWx1ZSApO1xuXG4gICAgICBpZiAoIGNsZWFuLnRvU3RyaW5nKCkgPT09ICdJbnZhbGlkIERhdGUnICkge1xuXG4gICAgICAgIHRocm93IFsgdXRpbHMuZXh0ZW5kKCB7XG4gICAgICAgICAgY29kZTogJ2RhdGUuaW52YWxpZCcsXG4gICAgICAgICAgbWVzc2FnZTogJ25vdCBhIGRhdGUnXG4gICAgICAgIH0sIGVycm9yRGVmYXVsdHMgKSBdO1xuXG4gICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKCB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnIHx8IHZhbHVlID09PSBudWxsICkge1xuXG4gICAgICBpZiAoICFwYXJhbXMuZGVmYXVsdCAmJiAhcGFyYW1zLm9wdGlvbmFsICkge1xuXG4gICAgICAgIHRocm93IFsgdXRpbHMuZXh0ZW5kKCB7XG4gICAgICAgICAgY29kZTogJ2RhdGUucmVxdWlyZWQnLFxuICAgICAgICAgIG1lc3NhZ2U6ICdhIGRhdGUgaXMgcmVxdWlyZWQnXG4gICAgICAgIH0sIGVycm9yRGVmYXVsdHMgKSBdO1xuXG4gICAgICB9XG5cbiAgICAgIGlmICggcGFyYW1zLmRlZmF1bHQgPT09ICdub3cnICkge1xuXG4gICAgICAgIGNsZWFuID0gbmV3IERhdGUoKTtcblxuICAgICAgfSBlbHNlIGlmICggcGFyYW1zLmRlZmF1bHQgKSB7XG5cbiAgICAgICAgY2xlYW4gPSBuZXcgRGF0ZSggcGFyYW1zLmRlZmF1bHQuZ2V0VGltZSgpICk7XG5cbiAgICAgIH0gZWxzZSBpZiAoIHZhbHVlID09PSBudWxsICkge1xuXG4gICAgICAgIGNsZWFuID0gbnVsbDtcblxuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcblxuICAgICAgLy8gaWYgaXQgbm90IGEgc3RyaW5nLCBpdCBtdXN0IGJlIGEgZGF0ZVxuICAgICAgaWYgKCAhICggdmFsdWUgaW5zdGFuY2VvZiBEYXRlICkgKSB7XG5cbiAgICAgICAgdGhyb3cgWyB1dGlscy5leHRlbmQoIHtcbiAgICAgICAgICBjb2RlOiAnZGF0ZS5pbnZhbGlkJyxcbiAgICAgICAgICBtZXNzYWdlOiAnbm90IGEgZGF0ZScsXG4gICAgICAgIH0sIGVycm9yRGVmYXVsdHMgKSBdO1xuXG4gICAgICB9XG5cbiAgICAgIGNsZWFuID0gbmV3IERhdGUoIHZhbHVlLmdldFRpbWUoKSApO1xuXG4gICAgfVxuXG5cbiAgICAvLyBpZiBpcyBib3VuZGVkLCB0ZXN0IGJvdW5kc1xuICAgIFxuICAgIGlmICggY2xlYW4gJiYgcGFyYW1zLm1pbiAmJiBjbGVhbiA8IHBhcmFtcy5taW4gKSB7XG5cbiAgICAgIHRocm93IFsgdXRpbHMuZXh0ZW5kKCB7XG4gICAgICAgIGNvZGU6ICdkYXRlLnRvb3NtYWxsJyxcbiAgICAgICAgbWVzc2FnZTogJ2RhdGUgaXMgdG9vIHNtYWxsJyxcbiAgICAgICAgdmFsdWVzOiB7XG4gICAgICAgICAgbWluOiBwYXJhbXMubWluXG4gICAgICAgIH1cbiAgICAgIH0sIGVycm9yRGVmYXVsdHMgKSBdO1xuXG4gICAgfVxuXG4gICAgaWYgKCBjbGVhbiAmJiBwYXJhbXMubWF4ICYmIGNsZWFuID4gcGFyYW1zLm1heCApIHtcblxuICAgICAgdGhyb3cgWyB1dGlscy5leHRlbmQoIHtcbiAgICAgICAgY29kZTogJ2RhdGUudG9vYmlnJyxcbiAgICAgICAgbWVzc2FnZTogJ2RhdGUgaXMgdG9vIGJpZycsXG4gICAgICAgIHZhbHVlczoge1xuICAgICAgICAgIG1heDogcGFyYW1zLm1heFxuICAgICAgICB9XG4gICAgICB9LCBlcnJvckRlZmF1bHRzICkgXTtcblxuICAgIH1cblxuICAgIHJldHVybiBjbGVhbjtcblxuICB9XG5cbn0iXX0=