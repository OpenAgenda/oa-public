"use strict";

var utils = require('utils');

/**
 * processes an array of values of potentially different
 * types. Throws a concatenation of all errors with
 * an index.
 */

module.exports = function (config, validates) {

  if (arguments.length == 1 && utils.isArray(arguments[0])) {

    validates = config;
    config = {};
  }

  var params = utils.extend({
    field: null,
    optional: true,
    types: false,
    validators: false,
    validates: []
  }, config);

  utils.extend(validate, {
    type: 'list',
    clean: clean,
    decorate: decorate,
    validateItem: validateItem,
    decorateItem: decorateItem
  });

  if (validates) {

    params.validates = validates;
  } else {

    if (!params.types || !params.validators) {

      throw new Error('if list validators are not given, validators and types must be provided in config');
    }

    params.types.forEach(function (type) {

      if (params.validators[type] === undefined) {

        throw new Error('list validator requires ' + type + ' validator to function');
      }

      params.validates.push(params.validators[type]());
    });
  }

  return utils.extend(validate, {
    type: 'list',
    field: params.field
  });

  function validate(value, cleanOnly) {

    var clean = [],
        errors = [];

    if (params.optional && !value) {

      return clean;
    }

    if (params.optional && utils.isArray(value) && !value.length) {

      return clean;
    }

    if (!utils.isArray(value)) {

      throw [{
        field: params.field,
        code: 'list.wrongtype',
        message: 'value should be a list',
        origin: value
      }];
    }

    value.forEach(function (item, i) {

      try {

        clean.push(validateItem(item));
      } catch (errs) {

        errors = errors.concat(errs.map(function (e) {
          return utils.extend({}, e, { index: i, field: params.field });
        }));
      }
    });

    if (!cleanOnly && errors.length) throw errors;

    return clean;
  }

  function clean(value) {

    return validate(value, true);
  }

  function decorate(value) {

    return (value || []).map(decorateItem);
  }

  /**
   * process item against validators and
   * throw errors or return clean
   */

  function validateItem(item, decorated) {

    var clean,
        errors = [],
        type;

    params.validates.forEach(function (v) {

      if (clean) return;

      try {

        type = v.type;

        clean = v(item);
      } catch (e) {

        errors = errors.concat(e);
      }
    });

    if (clean !== undefined) {

      return decorated ? {
        value: clean,
        type: type
      } : clean;
    }

    if (decorated) {

      return {
        value: item,
        errors: errors
      };
    }

    throw errors;
  }

  function decorateItem(item) {

    return validateItem(item, true);
  }
};
//# sourceMappingURL=data:application/json;base64,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Z0IsS0FBaEIsRUFBd0I7O0FBRXRCLFdBQU8sU0FBVSxLQUFWLEVBQWlCLElBQWpCLENBQVA7QUFFRDs7QUFHRCxXQUFTLFFBQVQsQ0FBbUIsS0FBbkIsRUFBMkI7O0FBRXpCLFdBQU8sQ0FBRSxTQUFTLEVBQVgsRUFBZ0IsR0FBaEIsQ0FBcUIsWUFBckIsQ0FBUDtBQUVEOztBQUdEOzs7OztBQUtBLFdBQVMsWUFBVCxDQUF1QixJQUF2QixFQUE2QixTQUE3QixFQUF5Qzs7QUFFdkMsUUFBSSxLQUFKO0FBQUEsUUFBVyxTQUFTLEVBQXBCO0FBQUEsUUFBd0IsSUFBeEI7O0FBRUEsV0FBTyxTQUFQLENBQWlCLE9BQWpCLENBQTBCLGFBQUs7O0FBRTdCLFVBQUssS0FBTCxFQUFhOztBQUViLFVBQUk7O0FBRUYsZUFBTyxFQUFFLElBQVQ7O0FBRUEsZ0JBQVEsRUFBRyxJQUFILENBQVI7QUFFRCxPQU5ELENBTUUsT0FBTyxDQUFQLEVBQVc7O0FBRVgsaUJBQVMsT0FBTyxNQUFQLENBQWUsQ0FBZixDQUFUO0FBRUQ7QUFFRixLQWhCRDs7QUFrQkEsUUFBSyxVQUFVLFNBQWYsRUFBMkI7O0FBRXpCLGFBQU8sWUFBWTtBQUNqQixlQUFPLEtBRFU7QUFFakIsY0FBTTtBQUZXLE9BQVosR0FHSCxLQUhKO0FBS0Q7O0FBRUQsUUFBSyxTQUFMLEVBQWlCOztBQUVmLGFBQU87QUFDTCxlQUFPLElBREY7QUFFTCxnQkFBUTtBQUZILE9BQVA7QUFLRDs7QUFFRCxVQUFNLE1BQU47QUFFRDs7QUFFRCxXQUFTLFlBQVQsQ0FBdUIsSUFBdkIsRUFBOEI7O0FBRTVCLFdBQU8sYUFBYyxJQUFkLEVBQW9CLElBQXBCLENBQVA7QUFFRDtBQUVGLENBN0tEIiwiZmlsZSI6Imxpc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxudmFyIHV0aWxzID0gcmVxdWlyZSggJ3V0aWxzJyApO1xuXG4vKipcbiAqIHByb2Nlc3NlcyBhbiBhcnJheSBvZiB2YWx1ZXMgb2YgcG90ZW50aWFsbHkgZGlmZmVyZW50XG4gKiB0eXBlcy4gVGhyb3dzIGEgY29uY2F0ZW5hdGlvbiBvZiBhbGwgZXJyb3JzIHdpdGhcbiAqIGFuIGluZGV4LlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIGNvbmZpZywgdmFsaWRhdGVzICkge1xuXG4gIGlmICggYXJndW1lbnRzLmxlbmd0aCA9PSAxICYmIHV0aWxzLmlzQXJyYXkoIGFyZ3VtZW50c1sgMCBdICkgKSB7XG5cbiAgICB2YWxpZGF0ZXMgPSBjb25maWc7XG4gICAgY29uZmlnID0ge307XG5cbiAgfVxuXG4gIHZhciBwYXJhbXMgPSB1dGlscy5leHRlbmQoIHtcbiAgICBmaWVsZDogbnVsbCxcbiAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICB0eXBlczogZmFsc2UsXG4gICAgdmFsaWRhdG9yczogZmFsc2UsXG4gICAgdmFsaWRhdGVzOiBbXVxuICB9LCBjb25maWcgKTtcblxuICB1dGlscy5leHRlbmQoIHZhbGlkYXRlLCB7XG4gICAgdHlwZTogJ2xpc3QnLFxuICAgIGNsZWFuLFxuICAgIGRlY29yYXRlLFxuICAgIHZhbGlkYXRlSXRlbSxcbiAgICBkZWNvcmF0ZUl0ZW1cbiAgfSApO1xuXG4gIGlmICggdmFsaWRhdGVzICkge1xuXG4gICAgcGFyYW1zLnZhbGlkYXRlcyA9IHZhbGlkYXRlcztcblxuICB9IGVsc2Uge1xuXG4gICAgaWYgKCAhcGFyYW1zLnR5cGVzIHx8ICFwYXJhbXMudmFsaWRhdG9ycyApIHtcblxuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnaWYgbGlzdCB2YWxpZGF0b3JzIGFyZSBub3QgZ2l2ZW4sIHZhbGlkYXRvcnMgYW5kIHR5cGVzIG11c3QgYmUgcHJvdmlkZWQgaW4gY29uZmlnJyApO1xuXG4gICAgfVxuXG4gICAgcGFyYW1zLnR5cGVzLmZvckVhY2goIHR5cGUgPT4ge1xuXG4gICAgICBpZiAoIHBhcmFtcy52YWxpZGF0b3JzWyB0eXBlIF0gPT09IHVuZGVmaW5lZCApIHtcblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdsaXN0IHZhbGlkYXRvciByZXF1aXJlcyAnICsgdHlwZSArICcgdmFsaWRhdG9yIHRvIGZ1bmN0aW9uJyApO1xuXG4gICAgICB9XG5cbiAgICAgIHBhcmFtcy52YWxpZGF0ZXMucHVzaCggcGFyYW1zLnZhbGlkYXRvcnNbIHR5cGUgXSgpICk7XG5cbiAgICB9ICk7XG5cbiAgfVxuXG4gIHJldHVybiB1dGlscy5leHRlbmQoIHZhbGlkYXRlLCB7XG4gICAgdHlwZTogJ2xpc3QnLFxuICAgIGZpZWxkOiBwYXJhbXMuZmllbGRcbiAgfSApO1xuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlKCB2YWx1ZSwgY2xlYW5Pbmx5ICkge1xuXG4gICAgdmFyIGNsZWFuID0gW10sIGVycm9ycyA9IFtdO1xuXG4gICAgaWYgKCBwYXJhbXMub3B0aW9uYWwgJiYgIXZhbHVlICkge1xuXG4gICAgICByZXR1cm4gY2xlYW47XG5cbiAgICB9XG5cbiAgICBpZiAoIHBhcmFtcy5vcHRpb25hbCAmJiB1dGlscy5pc0FycmF5KCB2YWx1ZSApICYmICF2YWx1ZS5sZW5ndGggKSB7XG5cbiAgICAgIHJldHVybiBjbGVhbjtcblxuICAgIH1cblxuICAgIGlmICggIXV0aWxzLmlzQXJyYXkoIHZhbHVlICkgKSB7XG5cbiAgICAgIHRocm93IFsge1xuICAgICAgICBmaWVsZDogcGFyYW1zLmZpZWxkLFxuICAgICAgICBjb2RlOiAnbGlzdC53cm9uZ3R5cGUnLFxuICAgICAgICBtZXNzYWdlOiAndmFsdWUgc2hvdWxkIGJlIGEgbGlzdCcsXG4gICAgICAgIG9yaWdpbjogdmFsdWVcbiAgICAgIH0gXVxuXG4gICAgfVxuXG4gICAgdmFsdWUuZm9yRWFjaCggKCBpdGVtLCBpICkgPT4ge1xuXG4gICAgICB0cnkge1xuXG4gICAgICAgIGNsZWFuLnB1c2goIHZhbGlkYXRlSXRlbSggaXRlbSApICk7XG5cbiAgICAgIH0gY2F0Y2goIGVycnMgKSB7XG5cbiAgICAgICAgZXJyb3JzID0gZXJyb3JzLmNvbmNhdCggZXJycy5tYXAoIGUgPT4gdXRpbHMuZXh0ZW5kKCB7fSwgZSwgeyBpbmRleDogaSwgZmllbGQ6IHBhcmFtcy5maWVsZCB9ICkgKSApO1xuXG4gICAgICB9XG5cbiAgICB9ICk7XG5cbiAgICBpZiAoICFjbGVhbk9ubHkgJiYgZXJyb3JzLmxlbmd0aCApIHRocm93IGVycm9ycztcblxuICAgIHJldHVybiBjbGVhbjtcblxuICB9XG5cblxuICBmdW5jdGlvbiBjbGVhbiggdmFsdWUgKSB7XG5cbiAgICByZXR1cm4gdmFsaWRhdGUoIHZhbHVlLCB0cnVlICk7XG5cbiAgfVxuXG5cbiAgZnVuY3Rpb24gZGVjb3JhdGUoIHZhbHVlICkge1xuXG4gICAgcmV0dXJuICggdmFsdWUgfHwgW10gKS5tYXAoIGRlY29yYXRlSXRlbSApO1xuICAgIFxuICB9XG5cblxuICAvKipcbiAgICogcHJvY2VzcyBpdGVtIGFnYWluc3QgdmFsaWRhdG9ycyBhbmRcbiAgICogdGhyb3cgZXJyb3JzIG9yIHJldHVybiBjbGVhblxuICAgKi9cblxuICBmdW5jdGlvbiB2YWxpZGF0ZUl0ZW0oIGl0ZW0sIGRlY29yYXRlZCApIHtcblxuICAgIHZhciBjbGVhbiwgZXJyb3JzID0gW10sIHR5cGU7XG5cbiAgICBwYXJhbXMudmFsaWRhdGVzLmZvckVhY2goIHYgPT4ge1xuXG4gICAgICBpZiAoIGNsZWFuICkgcmV0dXJuO1xuXG4gICAgICB0cnkge1xuXG4gICAgICAgIHR5cGUgPSB2LnR5cGU7XG5cbiAgICAgICAgY2xlYW4gPSB2KCBpdGVtICk7XG5cbiAgICAgIH0gY2F0Y2goIGUgKSB7XG5cbiAgICAgICAgZXJyb3JzID0gZXJyb3JzLmNvbmNhdCggZSApO1xuXG4gICAgICB9XG5cbiAgICB9ICk7XG5cbiAgICBpZiAoIGNsZWFuICE9PSB1bmRlZmluZWQgKSB7XG5cbiAgICAgIHJldHVybiBkZWNvcmF0ZWQgPyB7XG4gICAgICAgIHZhbHVlOiBjbGVhbixcbiAgICAgICAgdHlwZTogdHlwZVxuICAgICAgfSA6IGNsZWFuO1xuXG4gICAgfVxuXG4gICAgaWYgKCBkZWNvcmF0ZWQgKSB7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiBpdGVtLFxuICAgICAgICBlcnJvcnM6IGVycm9yc1xuICAgICAgfVxuXG4gICAgfVxuXG4gICAgdGhyb3cgZXJyb3JzO1xuXG4gIH1cblxuICBmdW5jdGlvbiBkZWNvcmF0ZUl0ZW0oIGl0ZW0gKSB7XG5cbiAgICByZXR1cm4gdmFsaWRhdGVJdGVtKCBpdGVtLCB0cnVlICk7XG5cbiAgfVxuXG59Il19