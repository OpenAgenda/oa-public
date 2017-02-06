"use strict";

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * makes validator process lists
 */

module.exports = function (validator, options) {

  var params = _utils2.default.extend({
    min: null,
    max: null,
    optional: !!options.optional
  }, options.list);

  return _utils2.default.extend(validate, {
    type: validator.type,
    field: validator.field
  });

  function validate(v) {

    var clean = [],
        errors = [],
        value = v === undefined ? [] : v;

    if (!_utils2.default.isArray(value)) {

      throw [{
        field: validator.field,
        code: 'list.wrongtype',
        message: 'value should be a list',
        origin: value
      }];
    }

    value.forEach(function (item, i) {

      try {

        clean.push(validator(item));
      } catch (errs) {

        errors = errors.concat(errs.map(function (e) {
          return _utils2.default.extend(e, { index: i });
        }));
      }
    });

    if (!params.optional && value.length === 0) {

      errors.push({
        field: validator.field,
        code: 'list.required',
        message: 'list cannot be empty',
        origin: value
      });
    }

    if ((!params.optional || value.length > 0) && params.min !== null && value.length < params.min) {

      errors.push({
        field: validator.field,
        code: 'list.tooshort',
        message: 'list is too short',
        origin: value
      });
    }

    if (params.max !== null && value.length > params.max) {

      errors.push({
        field: validator.field,
        code: 'list.toolong',
        message: 'list is too long',
        origin: value
      });
    }

    if (errors.length) throw errors;

    return clean;
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saXN0aWZ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBOzs7Ozs7QUFFQTs7OztBQUlBLE9BQU8sT0FBUCxHQUFpQixVQUFFLFNBQUYsRUFBYSxPQUFiLEVBQTBCOztBQUV6QyxNQUFNLFNBQVMsZ0JBQU0sTUFBTixDQUFjO0FBQzNCLFNBQUssSUFEc0I7QUFFM0IsU0FBSyxJQUZzQjtBQUczQixjQUFVLENBQUMsQ0FBQyxRQUFRO0FBSE8sR0FBZCxFQUlaLFFBQVEsSUFKSSxDQUFmOztBQU1BLFNBQU8sZ0JBQU0sTUFBTixDQUFjLFFBQWQsRUFBd0I7QUFDN0IsVUFBTSxVQUFVLElBRGE7QUFFN0IsV0FBTyxVQUFVO0FBRlksR0FBeEIsQ0FBUDs7QUFLQSxXQUFTLFFBQVQsQ0FBbUIsQ0FBbkIsRUFBdUI7O0FBRXJCLFFBQUksUUFBUSxFQUFaO0FBQUEsUUFBZ0IsU0FBUyxFQUF6QjtBQUFBLFFBRUEsUUFBUSxNQUFNLFNBQU4sR0FBa0IsRUFBbEIsR0FBdUIsQ0FGL0I7O0FBSUEsUUFBSyxDQUFDLGdCQUFNLE9BQU4sQ0FBZSxLQUFmLENBQU4sRUFBK0I7O0FBRTdCLFlBQU0sQ0FBRTtBQUNOLGVBQU8sVUFBVSxLQURYO0FBRU4sY0FBTSxnQkFGQTtBQUdOLGlCQUFTLHdCQUhIO0FBSU4sZ0JBQVE7QUFKRixPQUFGLENBQU47QUFPRDs7QUFFRCxVQUFNLE9BQU4sQ0FBZSxVQUFFLElBQUYsRUFBUSxDQUFSLEVBQWU7O0FBRTVCLFVBQUk7O0FBRUYsY0FBTSxJQUFOLENBQVksVUFBVyxJQUFYLENBQVo7QUFFRCxPQUpELENBSUUsT0FBTyxJQUFQLEVBQWM7O0FBRWQsaUJBQVMsT0FBTyxNQUFQLENBQWUsS0FBSyxHQUFMLENBQVU7QUFBQSxpQkFBSyxnQkFBTSxNQUFOLENBQWMsQ0FBZCxFQUFpQixFQUFFLE9BQU8sQ0FBVCxFQUFqQixDQUFMO0FBQUEsU0FBVixDQUFmLENBQVQ7QUFFRDtBQUVGLEtBWkQ7O0FBY0EsUUFBSyxDQUFDLE9BQU8sUUFBUixJQUFvQixNQUFNLE1BQU4sS0FBaUIsQ0FBMUMsRUFBOEM7O0FBRTVDLGFBQU8sSUFBUCxDQUFhO0FBQ1gsZUFBTyxVQUFVLEtBRE47QUFFWCxjQUFNLGVBRks7QUFHWCxpQkFBUyxzQkFIRTtBQUlYLGdCQUFRO0FBSkcsT0FBYjtBQU9EOztBQUVELFFBQ0UsQ0FBRSxDQUFDLE9BQU8sUUFBUixJQUFvQixNQUFNLE1BQU4sR0FBZSxDQUFyQyxLQUNHLE9BQU8sR0FBUCxLQUFlLElBRGxCLElBRUcsTUFBTSxNQUFOLEdBQWUsT0FBTyxHQUgzQixFQUlFOztBQUVBLGFBQU8sSUFBUCxDQUFhO0FBQ1gsZUFBTyxVQUFVLEtBRE47QUFFWCxjQUFNLGVBRks7QUFHWCxpQkFBUyxtQkFIRTtBQUlYLGdCQUFRO0FBSkcsT0FBYjtBQU9EOztBQUVELFFBQUssT0FBTyxHQUFQLEtBQWUsSUFBZixJQUF1QixNQUFNLE1BQU4sR0FBZSxPQUFPLEdBQWxELEVBQXdEOztBQUV0RCxhQUFPLElBQVAsQ0FBYTtBQUNYLGVBQU8sVUFBVSxLQUROO0FBRVgsY0FBTSxjQUZLO0FBR1gsaUJBQVMsa0JBSEU7QUFJWCxnQkFBUTtBQUpHLE9BQWI7QUFPRDs7QUFFRCxRQUFLLE9BQU8sTUFBWixFQUFxQixNQUFNLE1BQU47O0FBRXJCLFdBQU8sS0FBUDtBQUVEO0FBRUYsQ0F2RkQiLCJmaWxlIjoibGlzdGlmeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgdXRpbHMgZnJvbSAndXRpbHMnO1xuXG4vKipcbiAqIG1ha2VzIHZhbGlkYXRvciBwcm9jZXNzIGxpc3RzXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSAoIHZhbGlkYXRvciwgb3B0aW9ucyApID0+IHtcblxuICBjb25zdCBwYXJhbXMgPSB1dGlscy5leHRlbmQoIHtcbiAgICBtaW46IG51bGwsXG4gICAgbWF4OiBudWxsLFxuICAgIG9wdGlvbmFsOiAhIW9wdGlvbnMub3B0aW9uYWxcbiAgfSwgb3B0aW9ucy5saXN0ICk7XG5cbiAgcmV0dXJuIHV0aWxzLmV4dGVuZCggdmFsaWRhdGUsIHtcbiAgICB0eXBlOiB2YWxpZGF0b3IudHlwZSxcbiAgICBmaWVsZDogdmFsaWRhdG9yLmZpZWxkXG4gIH0gKTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZSggdiApIHtcblxuICAgIGxldCBjbGVhbiA9IFtdLCBlcnJvcnMgPSBbXSxcblxuICAgIHZhbHVlID0gdiA9PT0gdW5kZWZpbmVkID8gW10gOiB2O1xuXG4gICAgaWYgKCAhdXRpbHMuaXNBcnJheSggdmFsdWUgKSApIHtcblxuICAgICAgdGhyb3cgWyB7XG4gICAgICAgIGZpZWxkOiB2YWxpZGF0b3IuZmllbGQsXG4gICAgICAgIGNvZGU6ICdsaXN0Lndyb25ndHlwZScsXG4gICAgICAgIG1lc3NhZ2U6ICd2YWx1ZSBzaG91bGQgYmUgYSBsaXN0JyxcbiAgICAgICAgb3JpZ2luOiB2YWx1ZVxuICAgICAgfSBdO1xuXG4gICAgfVxuXG4gICAgdmFsdWUuZm9yRWFjaCggKCBpdGVtLCBpICkgPT4ge1xuXG4gICAgICB0cnkge1xuXG4gICAgICAgIGNsZWFuLnB1c2goIHZhbGlkYXRvciggaXRlbSApICk7XG5cbiAgICAgIH0gY2F0Y2goIGVycnMgKSB7XG5cbiAgICAgICAgZXJyb3JzID0gZXJyb3JzLmNvbmNhdCggZXJycy5tYXAoIGUgPT4gdXRpbHMuZXh0ZW5kKCBlLCB7IGluZGV4OiBpIH0gKSApICk7XG5cbiAgICAgIH1cblxuICAgIH0gKTtcblxuICAgIGlmICggIXBhcmFtcy5vcHRpb25hbCAmJiB2YWx1ZS5sZW5ndGggPT09IDAgKSB7XG5cbiAgICAgIGVycm9ycy5wdXNoKCB7XG4gICAgICAgIGZpZWxkOiB2YWxpZGF0b3IuZmllbGQsXG4gICAgICAgIGNvZGU6ICdsaXN0LnJlcXVpcmVkJyxcbiAgICAgICAgbWVzc2FnZTogJ2xpc3QgY2Fubm90IGJlIGVtcHR5JyxcbiAgICAgICAgb3JpZ2luOiB2YWx1ZVxuICAgICAgfSApO1xuXG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgKCAhcGFyYW1zLm9wdGlvbmFsIHx8IHZhbHVlLmxlbmd0aCA+IDAgKVxuICAgICAgJiYgcGFyYW1zLm1pbiAhPT0gbnVsbFxuICAgICAgJiYgdmFsdWUubGVuZ3RoIDwgcGFyYW1zLm1pblxuICAgICkge1xuXG4gICAgICBlcnJvcnMucHVzaCgge1xuICAgICAgICBmaWVsZDogdmFsaWRhdG9yLmZpZWxkLFxuICAgICAgICBjb2RlOiAnbGlzdC50b29zaG9ydCcsXG4gICAgICAgIG1lc3NhZ2U6ICdsaXN0IGlzIHRvbyBzaG9ydCcsXG4gICAgICAgIG9yaWdpbjogdmFsdWVcbiAgICAgIH0gKTtcblxuICAgIH1cblxuICAgIGlmICggcGFyYW1zLm1heCAhPT0gbnVsbCAmJiB2YWx1ZS5sZW5ndGggPiBwYXJhbXMubWF4ICkge1xuXG4gICAgICBlcnJvcnMucHVzaCgge1xuICAgICAgICBmaWVsZDogdmFsaWRhdG9yLmZpZWxkLFxuICAgICAgICBjb2RlOiAnbGlzdC50b29sb25nJyxcbiAgICAgICAgbWVzc2FnZTogJ2xpc3QgaXMgdG9vIGxvbmcnLFxuICAgICAgICBvcmlnaW46IHZhbHVlXG4gICAgICB9ICk7XG5cbiAgICB9XG5cbiAgICBpZiAoIGVycm9ycy5sZW5ndGggKSB0aHJvdyBlcnJvcnM7XG5cbiAgICByZXR1cm4gY2xlYW47XG5cbiAgfVxuXG59Il19